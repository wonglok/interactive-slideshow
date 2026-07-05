'use client'

import { Bvh, CameraControls, KeyboardControls, meshBounds, Sphere } from '@react-three/drei'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import BVHEcctrl, {
    Joystick,
    StaticCollider,
    useEcctrlStore,
    VirtualButton,
    type BVHEcctrlApi,
    type StoreState,
} from 'bvhecctrl'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useLoadGLB } from './useLoadGLB'
import { useLoadFBXActions } from './useLoadFBXActions'
import { useGame } from './useGame'
import {
    Matrix4,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    RepeatWrapping,
    Spherical,
    SRGBColorSpace,
    TextureLoader,
    Vector3,
} from 'three/webgpu'
import { useCollider } from './Interactives'
import { getHashIDFromObject3D, useStoreOfApp } from '../CanvasEditor/AppContext'
// import { annotateGLTFWithHashes } from '../PatchTSL/GLBHasher';
// import { onClickTreeNode } from '../SceneGraph/SceneGraphGUI';
import tunnel from 'tunnel-rat'
import { useAnimationStore, useButtonStore } from 'bvhecctrl'
import { float, Fn, rangeFogFactor, reflector, sample, texture, textureBicubic, uniform, uv, vec4 } from 'three/tsl'
// import { hashBlur } from 'three/addons/tsl/display/hashBlur.js'

export interface GameInterface {
    avatarURL?: string
    placeURL?: string
    cameraStart?: number[]
    playerStart?: number[]
    onChangeAvatarPosition?: (v: any) => void
}

const t = tunnel()

export const GameHTML = () => {
    return (
        <>
            <t.Out></t.Out>
        </>
    )
}

export function Game({ ...props }: GameInterface) {
    return (
        <>
            <Suspense fallback={null}>
                <GameCore {...props}></GameCore>
            </Suspense>
        </>
    )
}

export function GameCore({
    playerStart = [0, 1, 0],
    cameraStart = [0, 1, 3],
    onChangeAvatarPosition = (a: any) => {},

    avatarURL = `/assets/non-rpm/ava/robocop-2k.glb`,
    placeURL = `/assets/place/church2.glb`,
}: GameInterface) {
    //
    //
    let useMyStore = useStoreOfApp()
    let avatarScale = useMyStore((r) => r.avatarScale)
    let avatarOffsetY = useMyStore((r) => r.avatarOffsetY)
    let avatarBoneFix = useMyStore((r) => r.avatarBoneFix)
    let playerRotY = useMyStore((r) => r.playerRotY)
    let avatarRotX = useMyStore((r) => r.avatarRotX)

    const animationStatus = useAnimationStore((state: any) => state.animationStatus)
    // "IDLE" | "WALK" | "RUN" | "JUMP_START" | "JUMP_IDLE" | "JUMP_FALL" | "JUMP_LAND"

    const { buttons } = useButtonStore()

    const characterAPI = useLoadGLB({
        enableCache: false,
        url: avatarURL,
    })

    const sceneAPI = useLoadGLB({
        enableCache: false,
        url: placeURL,
    })

    // const sceneAPI2 = useLoadGLB({
    //     enableCache: false,
    //     url: `${placeURL}${placeURL.includes('?') ? '&' : '?'}r=source`,
    // })

    useEffect(() => {
        if (!sceneAPI?.o3d) {
            return
        }

        const textureLoader = new TextureLoader()

        const textureURL = `/assets/texture/rgb-256x256.png`

        const perlinMap = textureLoader.load(textureURL)

        perlinMap.wrapS = RepeatWrapping
        perlinMap.wrapT = RepeatWrapping
        perlinMap.colorSpace = SRGBColorSpace

        const reflection = reflector({ resolutionScale: 0.333 })
        reflection.target.rotateX(-Math.PI / 2)
        sceneAPI.o3d.add(reflection.target)

        const floorMaterial = new MeshStandardMaterial()

        floorMaterial.transparent = false

        const roughnessTex = texture(perlinMap, uv().mul(5)).normalize()

        const roughness = roughnessTex.r.saturate().abs()

        floorMaterial.roughnessNode = float(0.0)

        floorMaterial.emissiveNode = Fn(() => {
            const dirtyReflection = textureBicubic(reflection, float(roughness))

            return vec4(dirtyReflection.rgb.mul(0.5), 1.0)
        })()

        sceneAPI?.o3d.traverse((it: any) => {
            //

            if (it.name === 'inner') {
                it.material = floorMaterial
            }

            //
        })

        // annotateGLTFWithHashes({ scene: sceneAPI.o3d })
        // annotateGLTFWithHashes({ scene: sceneAPI2.o3d })

        useMyStore.setState({
            renderTree: sceneAPI.o3d,
            // sourceTree: sceneAPI2.o3d,
        })

        return () => {
            reflection.target.removeFromParent()
        }
    }, [sceneAPI])

    const actions = useLoadFBXActions({
        o3d: characterAPI.o3d,

        avatarBoneFix: avatarBoneFix,

        //

        //
        // jump1: `/assets/non-rpm/p-jump-up.fbx`,
        // jump2: `/assets/non-rpm/p-jump-idle.fbx`,
        // jump3: `/assets/non-rpm/p-jump-land.fbx`,
        jump1: `/assets/non-rpm/p-jump-up.fbx`,
        jump2: `/assets/non-rpm/p-jump-up.fbx`,
        jump3: `/assets/non-rpm/p-jump-up.fbx`,

        fight: `/assets/non-rpm/mma-idle.fbx`,

        idle: `/assets/non-rpm/idle-natural.fbx`,
        walk: `/assets/non-rpm/walking-rpm.fbx`,
        jump: `/assets/non-rpm/jump-rpm.fbx`,
        run: `/assets/non-rpm/run2-rpm.fbx`,

        //
    })

    let refFight = useRef<boolean>(false)

    useEffect(() => {
        if (!actions) {
            return
        }
        let keydown = ({ key }: { key: string }) => {
            // console.log(key);
            if (key === 'x') {
                refFight.current = !refFight.current

                if (refFight.current) {
                    actions.idle.reset().play()
                    actions.idle.canRun = false
                    actions.fight.reset().play()
                    actions.fight.canRun = true
                } else {
                    actions.idle.reset().play()
                    actions.idle.canRun = true
                    actions.fight.reset().play()
                    actions.fight.canRun = false
                }
            }
        }

        //

        window.addEventListener('keydown', keydown)
        return () => {
            window.addEventListener('keydown', keydown)
        }
    }, [actions])

    const collider = useCollider({ glbScene: sceneAPI?.glb?.scene })

    const ecctrlRef = useRef<(BVHEcctrlApi & null) | any>(null)
    const camControlRef = useRef<CameraControls | null>(null)
    const colliderMeshesArray = useEcctrlStore((state: StoreState) => state.colliderMeshesArray)

    const gl = useThree((r) => r.gl)

    const resetPlayer = () => {
        if (ecctrlRef?.current) {
            ecctrlRef?.current?.group?.position.set(playerStart[0], playerStart[1] + 1, playerStart[2])
            ecctrlRef?.current?.group.rotation.set(0, 0, 0)
            ecctrlRef?.current?.resetLinVel()
            ecctrlRef?.current?.setLinVel(new Vector3(0, 2.5, 0))
        }

        if (camControlRef.current) {
            if (cameraStart && playerStart) {
                camControlRef.current.setLookAt(
                    cameraStart[0],
                    cameraStart[1],
                    cameraStart[2],
                    playerStart[0],
                    playerStart[1] + 1,
                    playerStart[2],
                    true,
                )

                camControlRef.current.camera.position.set(cameraStart[0], cameraStart[1], cameraStart[2])
                camControlRef.current.camera.lookAt(playerStart[0], playerStart[1] + 1, playerStart[2])
            }
        }
    }

    useEffect(() => {
        resetPlayer()
        setTimeout(() => {
            resetPlayer()
        }, 1000)
    }, [collider])

    const v3 = useMemo(() => {
        return new Vector3()
    }, [])

    useFrame(() => {
        let player = characterAPI.o3d

        if (player) {
            player.getWorldPosition(v3)
        }
        if (player && v3.y <= -150) {
            resetPlayer()
        }
    })

    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
        { name: 'run', keys: ['Shift'] },
    ]

    useFrame(() => {
        if (ecctrlRef.current && ecctrlRef.current.group && camControlRef.current) {
            camControlRef.current.moveTo(
                ecctrlRef.current.group.position.x,
                ecctrlRef.current.group.position.y + 0.8,
                ecctrlRef.current.group.position.z,
                true,
            )
        }
    })

    useEffect(() => {
        if (ecctrlRef.current && ecctrlRef.current.group && camControlRef.current) {
            const start = () => {
                // useMyStore.setState({
                //     isScreenMotion: true,
                // });
            }

            let wheelTimer: any = 0
            const wheel = () => {
                // useMyStore.setState({
                //     isScreenMotion: true,
                // });
                // clearTimeout(wheelTimer);
                // wheelTimer = setTimeout(() => {
                //     useMyStore.setState({
                //         isScreenMotion: false,
                //     });
                // }, 1000);
            }

            const end = () => {
                // useMyStore.setState({
                //     isScreenMotion: false,
                // });
            }
            const el = camControlRef.current

            el.addEventListener('controlstart', start)
            el.addEventListener('controlend', end)

            gl.domElement.addEventListener('wheel', wheel)

            ecctrlRef?.current?.group?.position.set(playerStart[0], playerStart[1], playerStart[2])
            ecctrlRef?.current?.model?.rotation.set(0, playerRotY, 0)
            ecctrlRef?.current?.resetLinVel()
            ecctrlRef?.current?.setLinVel(new Vector3(0, 5.5, 0))

            if (cameraStart && playerStart) {
                camControlRef.current.setLookAt(
                    //
                    cameraStart[0],
                    cameraStart[1],
                    cameraStart[2],

                    playerStart[0],
                    playerStart[1],
                    playerStart[2],
                    true,
                )
                camControlRef.current.camera.updateProjectionMatrix()
                camControlRef.current.camera.position.set(cameraStart[0], cameraStart[1], cameraStart[2])
                camControlRef.current.camera.lookAt(playerStart[0], playerStart[1], playerStart[2])
            }

            ;(camControlRef.current.camera as PerspectiveCamera).fov = 60
            camControlRef.current.camera.updateProjectionMatrix()
            //
            // camControlRef.current.moveTo(ecctrlRef.current.group.position.x, ecctrlRef.current.group.position.y + 0.3, ecctrlRef.current.group.position.z, true);
            //

            return () => {
                gl.domElement.removeEventListener('wheel', wheel)
                el.removeEventListener('controlstart', start)
                el.removeEventListener('controlend', end)
            }
        }
    }, [
        sceneAPI,
        playerRotY,
        actions,
        placeURL,
        avatarURL,
        cameraStart,
        cameraStart[0],
        cameraStart[1],
        cameraStart[2],
        playerStart,
        playerStart[0],
        playerStart[1],
        playerStart[2],
    ])

    useEffect(() => {
        if (!actions) {
            return
        }

        if (refFight.current) {
            actions.fight.reset().play()
            actions.fight.canRun = true
        } else {
            actions.idle.reset().play()
            actions.idle.canRun = true
        }
        setTimeout(() => {
            useGame.setState({
                keyboard: {
                    forward: false,
                    backward: false,
                    leftward: false,
                    rightward: false,
                    jump: false,
                    run: false,
                },
            })
        })

        let walkRun = (now: any) => {
            // useMyStore.setState({
            //     isScreenMotion: true,
            // });

            actions.idle.reset().stop()
            actions.idle.canRun = false
            actions.jump.reset().stop()
            actions.jump.canRun = false

            if (now?.keyboard?.run) {
                actions.run.reset().play()
                actions.run.canRun = true
                actions.walk.reset().stop()
                actions.walk.canRun = false
            } else {
                actions.walk.reset().play()
                actions.walk.canRun = true
                actions.run.reset().stop()
                actions.run.canRun = false
            }
        }

        return useGame.subscribe((now, before) => {
            //

            if (now?.keyboard || before?.keyboard) {
                if (
                    now?.keyboard?.forward !== before?.keyboard?.forward ||
                    now?.keyboard?.run !== before?.keyboard?.run
                ) {
                    if (now?.keyboard?.forward) {
                        walkRun(now)
                    }
                }

                if (
                    now?.keyboard?.backward !== before?.keyboard?.backward ||
                    now?.keyboard?.run !== before?.keyboard?.run
                ) {
                    if (now?.keyboard?.backward) {
                        walkRun(now)
                    }
                }

                if (
                    now?.keyboard?.leftward !== before?.keyboard?.leftward ||
                    now?.keyboard?.run !== before?.keyboard?.run
                ) {
                    if (now?.keyboard?.leftward) {
                        walkRun(now)
                    }
                }

                if (
                    now?.keyboard?.rightward !== before?.keyboard?.rightward ||
                    now?.keyboard?.run !== before?.keyboard?.run
                ) {
                    if (now?.keyboard?.rightward) {
                        walkRun(now)
                    }
                }

                if (now?.keyboard?.jump) {
                    actions.jump.canRun = false
                    actions.walk.canRun = false
                    actions.run.canRun = false

                    actions.walk.reset().stop()
                    actions.run.reset().stop()
                    actions.jump.reset().stop()

                    actions.idle.canRun = false
                    actions.idle.stop()

                    actions.jump.reset().play()
                    actions.jump.canRun = true
                }

                //

                if (
                    !now?.keyboard?.forward &&
                    !now?.keyboard?.backward &&
                    !now?.keyboard?.leftward &&
                    !now?.keyboard?.rightward &&
                    !now?.keyboard?.shift &&
                    !now?.keyboard?.jump
                ) {
                    actions.jump.canRun = false
                    actions.walk.canRun = false
                    actions.run.canRun = false

                    actions.walk.reset().stop()
                    actions.run.reset().stop()
                    actions.jump.reset().stop()

                    if (refFight.current) {
                        actions.fight.reset().play()
                        actions.fight.canRun = true
                    } else {
                        actions.idle.reset().play()
                        actions.idle.canRun = true
                    }

                    // useMyStore.setState({
                    //     isScreenMotion: false,
                    // });
                }

                if (!now?.keyboard?.jump && before?.keyboard?.jump) {
                    actions.jump.reset().stop()
                    actions.jump.canRun = false
                }

                if (!now?.keyboard?.jump) {
                    actions.jump.reset().stop()
                    actions.jump.canRun = false

                    if (
                        now?.keyboard?.forward ||
                        now?.keyboard?.backward ||
                        now?.keyboard?.leftward ||
                        now?.keyboard?.rightward
                    ) {
                        walkRun(now)
                    }
                }
            }
        })
    }, [actions])

    let last = useMemo(() => {
        return new Matrix4()
    }, [])

    useFrame((st) => {
        //

        if (ecctrlRef.current?.group) {
            let nowSig =
                ecctrlRef.current?.group.matrixWorld.toArray().join('-') + st.camera.matrixWorld.toArray().join('-')
            let lastSig = last.toArray().join('-')
            if (nowSig !== lastSig) {
                last.copy(ecctrlRef.current?.group.matrixWorld)

                onChangeAvatarPosition({
                    cameraLocation: st.camera.position.toArray(),
                    position: ecctrlRef.current?.group.position.toArray(),
                    rotateY: ecctrlRef.current?.model.rotation.y,
                })
            }
        }
    })

    useEffect(() => {
        if (!actions) {
            return
        }

        if (animationStatus) {
            actions.idle.reset().stop()
            actions.idle.canRun = false
            actions.walk.reset().stop()
            actions.walk.canRun = false
            actions.run.reset().stop()
            actions.run.canRun = false
            actions.jump.reset().stop()
            actions.jump.canRun = false
            actions.fight.reset().stop()
            actions.fight.canRun = false

            actions.jump1.reset().stop()
            actions.jump1.canRun = false
            actions.jump2.reset().stop()
            actions.jump2.canRun = false
            actions.jump3.reset().stop()
            actions.jump3.canRun = false

            if (animationStatus === 'IDLE') {
                // actions.idle.reset().play();
                // actions.idle.canRun = true;

                if (refFight.current) {
                    actions.fight.reset().play()
                    actions.fight.canRun = true
                } else {
                    actions.idle.reset().play()
                    actions.idle.canRun = true
                }
            }
            if (animationStatus === 'WALK') {
                actions.walk.reset().play()
                actions.walk.canRun = true
            }
            if (animationStatus === 'RUN') {
                actions.run.reset().play()
                actions.run.canRun = true
            }

            if (animationStatus === 'JUMP_IDLE') {
                actions.jump.reset().play()
                actions.jump.canRun = true
            }
            if (animationStatus === 'JUMP_FALL') {
                actions.jump.reset().play()
                actions.jump.canRun = true
            }
            if (animationStatus === 'JUMP_LAND') {
                actions.idle.reset().play()
                actions.idle.canRun = true
            }

            return () => {}
        }
    }, [actions, animationStatus])

    useEffect(() => {
        useGame.setState({
            player: characterAPI?.o3d,
        })
    }, [characterAPI?.o3d])
    //buttons,

    // useEffect(() => {
    //     if (!actions) {
    //         return;
    //     }
    //     if (!buttons?.fight) {
    //         return;
    //     }
    //     if (refFight) {
    //         refFight.current = !refFight.current;
    //     }

    //     actions.idle.reset().stop();
    //     actions.idle.canRun = false;
    //     actions.walk.reset().stop();
    //     actions.walk.canRun = false;
    //     actions.run.reset().stop();
    //     actions.run.canRun = false;
    //     actions.jump.reset().stop();
    //     actions.jump.canRun = false;
    //     actions.fight.reset().stop();
    //     actions.fight.canRun = false;
    //     if (buttons.walk) {
    //         actions.walk.reset().play();
    //         actions.walk.canRun = true;
    //     } else if (buttons.run) {
    //         actions.run.reset().play();
    //         actions.run.canRun = true;
    //     } else if (buttons.idle) {
    //         if (refFight.current) {
    //             actions.fight.reset().play();
    //             actions.fight.canRun = true;
    //         } else {
    //             actions.idle.reset().play();
    //             actions.idle.canRun = true;
    //         }
    //     }
    // }, [actions, buttons]);

    // console.log('buttons', buttons);

    let map = useMemo(() => {
        return new Map()
    }, [])
    let tttime = useRef<any>(0)
    return (
        <>
            <t.In>
                <Joystick joystickMaxRadius={100} joystickWrapperStyle={{ position: 'absolute', left: `calc(0px)` }} />
                {/* <VirtualButton id='fight' label='FIGHT' buttonWrapperStyle={{ position: 'absolute', right: 'calc(80px)', bottom: 'calc(125px)' }} /> */}
                <VirtualButton
                    id='run'
                    label='RUN'
                    buttonWrapperStyle={{ position: 'absolute', right: 'calc(80px)', bottom: 'calc(25px)' }}
                />
                <VirtualButton
                    id='jump'
                    label='JUMP'
                    buttonWrapperStyle={{
                        position: 'absolute',
                        right: 'calc(80px - 50px)',
                        bottom: 'calc(25px + 50px)',
                    }}
                />
            </t.In>

            {sceneAPI && (
                <CameraControls
                    //

                    // minAzimuthAngle={0 * Math.PI}
                    // maxAzimuthAngle={0 * Math.PI}
                    // minPolarAngle={0.25 * Math.PI}
                    // maxPolarAngle={0.25 * Math.PI}
                    //
                    key={sceneAPI.o3d.uuid + 'camera'}
                    ref={camControlRef}
                    colliderMeshes={colliderMeshesArray}
                    polarRotateSpeed={1.0}
                    azimuthRotateSpeed={1.0}
                    smoothTime={0.125}
                    minDistance={1}
                    maxDistance={25}
                    // {...(process.env.NODE_ENV === 'development'
                    //     ? {
                    //           maxDistance: 180,
                    //       }
                    //     : {
                    //           maxDistance: 55,
                    //       })}
                    makeDefault
                />
            )}

            {actions && actions.all.map((r: any) => r.display)}

            {sceneAPI && collider && (
                <>
                    <group
                        onClick={(ev) => {
                            if (ev.object.type === 'Mesh') {
                                map.set(ev.object.uuid, {
                                    object: ev.object,
                                    distance: ev.distance,
                                })
                            }

                            clearTimeout(tttime.current)
                            tttime.current = setTimeout(() => {
                                let arr = []
                                for (let item of map.values()) {
                                    arr.push(item)
                                }
                                map.clear()

                                arr = arr.sort((a, b) => {
                                    return a.distance - b.distance
                                })

                                console.log(arr[0]?.object?.name)

                                // onClickTreeNode({
                                //     tree: arr[0].object,
                                //     patches: useMyStore.getState().patches || [],
                                //     useMyStore,
                                // })()
                                useMyStore.setState({
                                    query: arr[0]?.object?.name,
                                    activeNodeHash: getHashIDFromObject3D(arr[0].object),
                                })
                            }, 50)
                        }}
                        userData={{
                            isEnv: true,
                        }}
                    >
                        {sceneAPI.display}
                    </group>

                    <StaticCollider key={collider.o3d.uuid}>
                        <group raycast={meshBounds} visible={false}>
                            <>{collider.show}</>
                        </group>
                    </StaticCollider>
                </>
            )}

            {sceneAPI && (
                <>
                    <KeyboardControls
                        onChange={(name, activated, state) => {
                            useGame.setState({
                                keyboard: state,
                            })
                        }}
                        map={keyboardMap}
                    >
                        <BVHEcctrl
                            //
                            ref={ecctrlRef}
                            turnSpeed={15}
                            maxRunSpeed={10}
                            delay={0}
                            position={[0, 0, 0]}
                        >
                            {actions && characterAPI && (
                                <group
                                    position={[0, avatarOffsetY, 0]}
                                    rotation={[avatarRotX, 0, 0]}
                                    scale={avatarScale}
                                >
                                    <group scale={1}>{characterAPI.display}</group>
                                </group>
                            )}
                        </BVHEcctrl>
                    </KeyboardControls>
                </>
            )}

            <group>
                <AttachTo
                    scan={{
                        get parent() {
                            return (characterAPI?.o3d as Object3D)?.getObjectByName('RightHand')
                        },
                        get target() {
                            return (characterAPI?.o3d as Object3D)?.getObjectByName('RightHand')
                        },
                    }}
                    show={(api: any) => {
                        return (
                            <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
                                {/* {api.parent && createPortal(<pointLight color='#ffffff' intensity={1} position={[0, 0.25, 0]}></pointLight>, api.parent)} */}
                            </group>
                        )
                    }}
                ></AttachTo>
            </group>
            <group>
                <AttachTo
                    scan={{
                        get parent() {
                            return (characterAPI?.o3d as Object3D)?.getObjectByName('LeftHand')
                        },
                        get target() {
                            return (characterAPI?.o3d as Object3D)?.getObjectByName('LeftHand')
                        },
                    }}
                    show={(api: any) => {
                        return (
                            <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
                                {/* {api.parent && createPortal(<spotLight color='#ffffff' intensity={1} position={[0, 0.25, 0]}></spotLight>, api.parent)} */}
                            </group>
                        )
                    }}
                ></AttachTo>
            </group>
        </>
    )
}

function AttachTo({ show, scan }: any) {
    let [api, setAPI] = useState<ReturnType<typeof scan> | null>(null)

    useEffect(() => {
        let tt = setInterval(() => {
            if (!Object.values(scan).some((r) => !r)) {
                clearInterval(tt)
                setAPI(scan)
            }
        })

        return () => {
            clearInterval(tt)
        }
    }, [scan])

    return <group>{api && show(api)}</group>
}
