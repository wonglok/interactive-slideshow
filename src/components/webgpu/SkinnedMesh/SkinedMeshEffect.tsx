import { Box } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimationMixer, Clock, Mesh, Object3D, Sprite, Vector3 } from 'three'
import { float, Fn, hash, If, instancedArray, instanceIndex, mix, shapeCircle, uniform, uv, vec3 } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js'
import { setupSkinMesh } from '../SkinnedMesh/SkinnedMeshParticles'
import { useGame } from '../WASDGame/useGame'

export function SkinedMeshEffect() {
    let [api, setAPI] = useState<any>({
        glb: false,
        isReady: false,
        update: (st: any, dt: number) => {},
        hit: (evt?: any) => {},
        clickPosition: uniform(new Vector3()),
        display: <group></group>,
        o3d: new Object3D(),
    })
    let gl: WebGPURenderer = useThree((r) => r.gl) as any

    let gp = useRef<Mesh>(null)
    let player = useGame((r) => r.player)
    let v3 = new Vector3()
    useFrame((st, dt) => {
        if (api.isReady) {
            if (gp.current) {
                st.raycaster.setFromCamera(st.pointer, st.camera)

                let res = st.raycaster.intersectObject(gp.current, false)

                if (res[0]) {
                    api.clickPosition.value.copy(res[0].point)
                    api.hit()
                }
            }
            api.update(st, dt)
        }

        if (player && api.glb) {
            //
            player.getWorldPosition(api.glb.scene.position)
            player.getWorldQuaternion(api.glb.scene.quaternion)

            v3.set(0, 0, -0.25)
            v3.applyQuaternion(api.glb.scene.quaternion)
            api.glb.scene.position.add(v3)

            //

            api.glb.scene.rotation.y += Math.PI * 0.0

            api.glb.scene.position.y += 2
            api.glb.scene.scale.setScalar(0.05)
        }
    })

    useEffect(() => {
        let clean = () => {}

        let run = async () => {
            const clickPosition = uniform(new Vector3())
            let tasks: any[] = []
            let onLoop = (fn: any) => {
                tasks.push(fn)
            }
            let mounter = new Object3D()

            let draco = new DRACOLoader()
            draco.setDecoderPath('/assets/draco/')
            let loader = new GLTFLoader()
            loader.setDRACOLoader(draco)

            loader.loadAsync(`/skin/wing1.glb`).then((glb) => {
                //

                glb.scene.traverse((it: any) => {
                    if (it.isSkinnedMesh) {
                        setupSkinMesh({
                            skinnedMesh: it,
                            mounter: mounter,
                            renderer: gl,
                            onLoop: onLoop,
                        })
                        //
                        //
                        if (it.material) {
                            it.material.depthWrite = false
                            it.material.depthTest = false
                            it.material.opacity = 0
                            it.material.wireframe = true
                        }
                    }
                })
                //

                mounter.add(glb.scene)

                let mixer = new AnimationMixer(glb.scene)

                let anim = mixer.clipAction(glb.animations[0])
                anim.play()
                let clock = new Clock()
                onLoop(() => {
                    mixer.update(clock.getDelta())
                })

                setAPI({
                    glb: glb as any,
                    isReady: true,

                    clickPosition: clickPosition,
                    o3d: mounter,
                    update: (st: any, dt: number) => {
                        tasks.forEach((t) => t(st, dt))
                    },
                    hit: () => {},
                    display: <primitive object={mounter}></primitive>,
                })
            })

            //
            // public/skin/wing1.glb

            return () => {
                setAPI((r: any) => {
                    return { ...r, isReady: false }
                })
            }
        }

        run().then((v) => {
            clean = v
        })

        return () => {
            clean()
        }
    }, [setupSkinMesh])

    return (
        <>
            <group position={[0, 0, 0]}>
                {api.display}
                <Box
                    ref={gp}
                    visible={false}
                    scale={[100, -0.1, 100]}
                    position={[0, 0, 0]}
                    onPointerMove={(evt) => {
                        // api.clickPosition.value.copy(evt.point)
                    }}
                ></Box>
            </group>
        </>
    )
}
