import { TransformControls as DT, useTexture } from '@react-three/drei'
import { StaticCollider } from 'bvhecctrl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CatmullRomCurve3, Object3D, RepeatWrapping, TubeGeometry, Vector3 } from 'three'
import { TransformControls } from 'three/examples/jsm/Addons.js'
import { float, Fn, mix, texture, time, uv, vec2, vec3, vec4 } from 'three/tsl'

const Init = [
    [7.024483152838165, 0, 1.0813201991599186],
    [18.622739224732452, 0, -2.188010859141997],
    [28.140321245577834, 0, 1.0147048305262665],
    [30.709176929822217, 0, 12.995697274670551],
    [25.14018981028405, 0, 22.362114356380665],
    [14.933085481320267, 0, 25.644118205071624],
    [3.1157525470195906, 0, 33.946924888598545],
    [-10.552921269103466, 0, 26.459789248024222],
    [-12.939579382393363, 0, 13.291962884649857],
    [-23.18770447673031, 0, 4.779928456674959],
    [-27.726392926951917, 0, -5.064648884191087],
    [-21.09752276322849, 0, -15.658950672204881],
]
    //
    .map((r) => {
        let oo = new Object3D()
        oo.position.fromArray(r)
        oo.position.y = 0
        return oo
    })

export function LineGuide() {
    const [objects, setObjs] = useState(Init)

    console.log(objects.map((r: any) => r.position.toArray()))

    const path3d = useMemo(() => {
        const curve = new CatmullRomCurve3(
            objects.map((r, ii) => {
                return r.position
            }),
            false,
            'catmullrom',
            0.5,
        )
        return curve
    }, [objects])

    const geometry = useMemo(() => {
        const sizeW = 2.5
        const scaleH = 0.35
        const segments = 10

        const geo = new TubeGeometry(path3d, objects.length * 50, sizeW, segments, false)

        geo.scale(1, scaleH, 1)

        geo.translate(0.0, sizeW * scaleH * -1.0 * 0.5, 0.0)

        return geo
    }, [path3d, objects])

    const normalMap = useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_NormalGL.jpg`, (tex) => {
        tex.repeat.set(objects.length / 2.5, 5.0 / objects.length)
        tex.wrapS = tex.wrapT = RepeatWrapping
    })

    const arrowTexture = useTexture(`/assets/texture/arrow/round@1x.png`)

    const patternNode = useMemo(() => {
        return Fn(() => {
            //
            const arrowColor = texture(
                arrowTexture,
                uv()
                    .mul(vec2(objects.length * 1.0, 1.0))
                    .add(vec2(0, 0.5))
                    .add(vec2(time.mul(-0.5), 0.0))
                    .mod(1),
            )

            return float(1).sub(arrowColor.r)
        })()
    }, [objects, arrowTexture])

    const colorNode = useMemo(() => {
        return Fn(() => {
            return mix(vec4(1.0, 1.0, 1.0, 1.0), vec4(vec4(0.0, 1.0, 1.0, 1.0)), float(1.0).sub(patternNode))
        })()
    }, [objects, patternNode])

    return (
        <>
            {/*  */}
            <StaticCollider key={geometry.uuid}>
                <mesh geometry={geometry}>
                    <meshPhysicalNodeMaterial
                        metalnessNode={float(0.0)}
                        roughnessNode={float(0.2)}
                        transmission={1}
                        thickness={2}
                        normalMap={normalMap}
                        normalScale={[3, -3]}
                        colorNode={colorNode}
                    ></meshPhysicalNodeMaterial>
                </mesh>
            </StaticCollider>

            {process.env.NODE_ENV === 'development' &&
                objects.map((obj) => {
                    return (
                        <group key={obj.uuid + 'gp'}>
                            <MyTransformControls
                                object={obj}
                                onUpdate={(val: Vector3) => {
                                    //
                                    console.log(val)

                                    //
                                    setObjs((r) => {
                                        return r.map((r) => {
                                            if (r.id === obj.id) {
                                                obj.position.copy(val)
                                                return obj.clone()
                                            }
                                            return r
                                        })
                                    })
                                }}
                            ></MyTransformControls>
                        </group>
                    )
                })}

            {objects.map((obj) => {
                return (
                    <group key={obj.uuid + 'gp'}>
                        <primitive object={obj}></primitive>
                    </group>
                )
            })}
        </>
    )
}

function MyTransformControls({ object, onUpdate }: any) {
    //
    let ref = useRef<TransformControls | any>(null)

    useEffect(() => {
        let ee = (ev: any) => {
            if (ev.value === false) {
                // console.log(ev, object.position)

                onUpdate(object.position.clone())
            }
        }
        ref.current.addEventListener('dragging-changed', ee)
        return () => {
            ref?.current?.removeEventListener('dragging-changed', ee)
        }
    }, [])

    return <DT ref={ref} object={object} showY={false}></DT>
}
