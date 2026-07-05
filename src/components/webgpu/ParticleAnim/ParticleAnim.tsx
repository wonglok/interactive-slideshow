import { Box } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Mesh, Object3D, Sprite, Vector3 } from 'three'
import { float, Fn, hash, If, instancedArray, instanceIndex, shapeCircle, uniform, uv, vec3 } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import { InstanceObject } from './InstanceObject'

export function ParticleAnim() {
    let [api, setAPI] = useState({
        isReady: false,
        update: (st: any, dt: number) => {},
        hit: (evt?: any) => {},
        clickPosition: uniform(new Vector3()),
        display: <group></group>,
        o3d: new Object3D(),
    })
    let gl: WebGPURenderer = useThree((r) => r.gl) as any

    let gp = useRef<Mesh>(null)
    useFrame((st, dt) => {
        if (api.isReady) {
            if (gp.current) {
                let res = st.raycaster.intersectObject(gp.current, false)

                if (res[0]) {
                    api.clickPosition.value.copy(res[0].point)
                    api.hit()
                }
            }
            api.update(st, dt)
        }
    })

    useEffect(() => {
        let clean = () => {}

        let run = async () => {
            const clickPosition = uniform(new Vector3())

            InstanceObject.load({ clickPosition }).then((modu) => {
                setAPI({
                    isReady: true,

                    clickPosition: clickPosition,
                    o3d: modu.mesh,
                    update: (st, dt) => {
                        modu.update(st, dt)
                    },
                    hit: () => {},
                    display: <primitive object={modu.mesh}></primitive>,
                })
            })

            return () => {
                //
            }
        }

        run().then((v) => {
            clean = v
        })

        return () => {
            clean()
        }
    }, [InstanceObject.toString()])

    return (
        <>
            {api.display}
            <Box
                ref={gp}
                visible={false}
                scale={[100, -0.1, 100]}
                position={[0, 0, 0]}
                onPointerMove={(evt) => {
                    api.clickPosition.value.copy(evt.point)
                }}
            ></Box>
        </>
    )
}
