'use client'

import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import { RepeatWrapping, Texture } from 'three'
import { Fn } from 'three/src/nodes/TSL.js'
import { color, cos, float, If, sin, texture, time, uv, vec3, vec4 } from 'three/tsl'
import { fbm4, fbm6, pattern } from './fbm'
import { StaticCollider } from 'bvhecctrl'

export function FloorContent() {
    let repeat =
        (repeat = 1) =>
        (tex: Texture) => {
            if (!tex) {
                return
            }
            tex.repeat.set(repeat, repeat)
            tex.wrapS = RepeatWrapping
            tex.wrapT = RepeatWrapping
        }

    // let motherBoard2 = {
    //     map: useTexture(`/assets/texture/Chip005_1K-JPG/Chip005_1K-JPG_Color.jpg`, repeat(3.5)),
    //     emissiveMap: useTexture(`/assets/texture/Chip005_1K-JPG/Chip005_1K-JPG_Color.jpg`, repeat(3.5)),
    //     normalMap: useTexture(`/assets/texture/Chip005_1K-JPG/Chip005_4K-JPG_NormalGL_compress.jpg`, repeat(3.5)),
    //     roughnessMap: useTexture(`/assets/texture/Chip005_1K-JPG/Chip005_1K-JPG_Roughness.jpg`, repeat(3.5)),
    //     metalnessMap: useTexture(`/assets/texture/Chip005_1K-JPG/Chip005_1K-JPG_Metalness.jpg`, repeat(3.5)),
    // }

    //

    let motherBoard1 = {
        // emissiveMap: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Color.jpg`, repeat(5.5)),
        map: useTexture(`/assets/texture/Grass006_2K-JPG/Grass006_2K-JPG_Color.jpg`, repeat(3.5)),
        // emissiveMap: useTexture(`/assets/texture/Chip006_4K-PNG/Chip006_4K-PNG_Metalness.png`, repeat(3.5)),
        metalnessMap: useTexture(`/assets/texture/Chip006_4K-PNG/Chip006_4K-PNG_Metalness.png`, repeat(3.5)),
        roughnessMap: useTexture(`/assets/texture/Chip006_4K-PNG/Chip006_4K-PNG_Roughness.png`, repeat(3.5)),
        normalMap: useTexture(`/assets/texture/Grass006_2K-JPG/Grass006_2K-JPG_NormalGL.jpg`, repeat(3.5)),
        aoMap: useTexture(`/assets/texture/Chip006_4K-PNG/Chip006_4K-PNG_Displacement.png`, repeat(3.5)),
    }

    let rand = useMemo(() => {
        return Math.random()
    }, [])

    //

    return (
        <>
            {/*  */}
            <StaticCollider>
                <mesh position={[0, -0.25, 0]}>
                    <boxGeometry args={[100, 0.01, 100]}></boxGeometry>
                    <meshStandardNodeMaterial
                        key={rand}
                        roughness={0.5}
                        metalness={0.75}
                        normalScale={[5.0, -5.0]}
                        //
                        // color={'#383838'}
                        // emissive={'#242424'}
                        // emissiveIntensity={1.0}
                        // roughnessMap={motherBoard1.roughnessMap}
                        map={motherBoard1.map}
                        metalnessMap={motherBoard1.metalnessMap}
                        normalMap={motherBoard1.normalMap}
                    ></meshStandardNodeMaterial>
                </mesh>
            </StaticCollider>
            {/*  */}
        </>
    )
}

//

//

//

//
