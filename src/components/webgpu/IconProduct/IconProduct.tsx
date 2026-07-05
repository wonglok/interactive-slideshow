import {
    Box,
    Center,
    Float,
    PerspectiveCamera,
    RoundedBox,
    Text3D,
    useTexture,
    useVideoTexture,
} from '@react-three/drei'
import { KinematicCollider } from 'bvhecctrl'
import { useEffect, useMemo, useState } from 'react'
import { PlaneGeometry, RepeatWrapping, Texture } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js'
import {
    emissive,
    Fn,
    metalness,
    roughness,
    screenUV,
    texture,
    uv,
    viewportSafeUV,
    viewportSharedTexture,
} from 'three/tsl'
import { MeshStandardNodeMaterial } from 'three/webgpu'
import tunnel from 'tunnel-rat'
import { Helvetica } from './helvetica'

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

let t = tunnel()

export const IconProductHTML = () => {
    return (
        <>
            {/*  */}

            <t.Out></t.Out>
            {/*  */}
        </>
    )
}

export function IconProduct({
    color = '#036013',
    title = 'Demo video',
    videoURL = `/products/lambo/lambo-genie.mp4`,
    qrLink = '',
}) {
    // let images = {
    //     tvWood: useTexture(`/assets/texture/7fec2fef-0329-4920-a531-4c925c67f2ea.png`, repeat(1)),
    //     motherboard1: useTexture(`/assets/texture/f29f5990-bd71-4832-8e75-6448b46b231c.png`, repeat(10)),
    //     wood1: useTexture(`/assets/texture/dfc787ef-9c4b-40d7-a885-d689f4aac5d0.png`, repeat(20)),
    //     wood3: useTexture(`/assets/texture/bc956b52-b8d6-418e-a111-81c61aceb3c7.png`, repeat(20)),
    //     grid1: useTexture(`/assets/texture/grid.png`, repeat(20)),
    //     grid2: useTexture(`/assets/texture/grid2.png`, repeat(20)),
    // }

    // let wood1 = {
    //     map: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Color.jpg`, repeat(1)),
    //     emissive: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Color.jpg`, repeat(1)),
    //     aoMap: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Displacement.jpg`, repeat(1)),
    //     normalMap: useTexture(`/assets/texture/wood/Wood094_1K-JPG_NormalGL.jpg`, repeat(1)),
    //     roughnessMap: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Roughness.jpg`, repeat(1)),
    // }

    // let motherBoard4 = {
    //     map: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Color.jpg`, repeat(5.5)),
    //     emissiveMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Color.jpg`, repeat(5.5)),
    //     metealnessMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Metalness.jpg`, repeat(5.5)),
    //     normalMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_NormalGL.jpg`, repeat(5.5)),
    //     roughnessMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Roughness.jpg`, repeat(5.5)),
    // }

    // let motherBoard3 = {
    //     map: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Color.jpg`, repeat(5)),
    //     metalnessMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Metalness.jpg`, repeat(5)),
    //     normalMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_NormalGL.jpg`, repeat(5)),
    //     roughnessMap: useTexture(`/assets/texture/Chip004_1K-JPG/Chip004_1K-JPG_Roughness.jpg`, repeat(5)),
    // }

    //
    //
    //

    let adsVideo = useVideoTexture(videoURL)

    let [modalOpen, setModalOpen] = useState(false)
    let [aspect, setAspect] = useState(1)
    useEffect(() => {
        if (!adsVideo?.image) return
        adsVideo.image.loop = true
        adsVideo.image.muted = true
        adsVideo.image.playsInline = true
        adsVideo.image.crossOrigin = 'credentails'
        adsVideo.image.play()
        let aspectLocal = adsVideo.image.videoWidth / adsVideo.image.videoHeight
        setAspect(aspectLocal)
    }, [adsVideo])

    useEffect(() => {
        if (!modalOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setModalOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [modalOpen])

    //

    let motherBoard1 = {
        // emissiveMap: useTexture(`/assets/texture/wood/Wood094_1K-JPG_Color.jpg`, repeat(1)),

        // emissiveMap: useTexture(`/assets/texture/Chip001_1K-JPG/Chip001_1K-JPG_Color.jpg`, repeat(1)),

        // metealnessMap: useTexture(`/assets/texture/Chip001_1K-JPG/Chip001_1K-JPG_Metalness.jpg`, repeat(1)),
        // roughnessMap: useTexture(`/assets/texture/Chip001_1K-JPG/Chip001_1K-JPG_Roughness.jpg`, repeat(1)),
        normalMap: useTexture(`/assets/texture/Chip001_1K-JPG/Chip001_1K-JPG_NormalGL.jpg`, repeat(1)),
        // aoMap: useTexture(`/assets/texture/Chip001_1K-JPG/Chip001_1K-JPG_Displacement.jpg`, repeat(1)),
    }

    let tvBack = useMemo(() => {
        let back = new RoundedBoxGeometry(1.1 * aspect, 1.1, 0.1, 2, 0.1 / 2)
        back.translate(0, 0, (0.1 / 2) * -1)

        return back
    }, [aspect])

    let tvScreen = useMemo(() => {
        return new PlaneGeometry(1 * aspect, 1)
    }, [aspect])

    let tvCube = useMemo(() => {
        let back = new RoundedBoxGeometry(0.6 * aspect, 0.1, 0.1, 2, 0.1 / 2)

        back.translate(0, 0.1, (0.1 / 2) * -1)

        return back
    }, [aspect])

    // const noise = texture(motherBoard1.normalMap, uv())
    // const refractorUV = screenUV.add(noise.rgb)
    // const verticalRefractor = viewportSharedTexture(viewportSafeUV(refractorUV))

    const emissiveNode = useMemo(() => {
        return Fn(() => {
            return texture(adsVideo, uv())
        })()
    }, [adsVideo])

    return (
        <>
            <t.In>
                {/* fullscreen modal */}
                {modalOpen && (
                    <div
                        className='absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'
                        onClick={() => setModalOpen(false)}
                    >
                        <div
                            className='relative w-full max-w-[90vw] h-[80vh] sm:h-auto aspect-video rounded-lg overflow-hidden shadow-2xl'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {qrLink && (
                                <div className='bg-[#ffffff] py-3 text-center  text-blue-500 mb-4 underline rounded-lg'>
                                    <a href={qrLink} target='_blank'>
                                        {qrLink}
                                    </a>
                                </div>
                            )}

                            <video src={videoURL} className='w-full h-full object-contain bg-black' controls autoPlay />
                            <button
                                className='absolute top-1 right-1 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-red-500/50 hover:bg-red/20 text-white transition-colors cursor-pointer'
                                onClick={() => setModalOpen(false)}
                            >
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                >
                                    <line x1='18' y1='6' x2='6' y2='18' />
                                    <line x1='6' y1='6' x2='18' y2='18' />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                {/*  */}
            </t.In>
            {/*  */}
            <group
                onClick={() => {
                    setModalOpen(true)
                }}
                onPointerEnter={() => {
                    document.body.style.cursor = 'pointer'
                }}
                onPointerLeave={() => {
                    document.body.style.cursor = ''
                }}
            >
                <Float rotationIntensity={0} floatIntensity={1} floatingRange={[0, 2]}>
                    <>
                        <Center position={[0, 1, 0]}>
                            <Text3D font={Helvetica as any}>
                                {title}
                                <meshPhysicalMaterial
                                    color={color}
                                    roughness={0.0}
                                    metalness={0.0}
                                    transmission={1}
                                    thickness={2}
                                ></meshPhysicalMaterial>
                            </Text3D>
                        </Center>

                        <group scale={7}>
                            <group rotation={[0, 0, 0]} position={[0, 0.0, 0]}>
                                <group position={[0, 0.8, 0]} rotation={[0.0, 0, 0]}>
                                    <mesh geometry={tvBack} position={[0, 0, 0]} scale={[1, 1, 1]}>
                                        <meshPhysicalMaterial
                                            color={'#ffffff'}
                                            roughness={0.0}
                                            metalness={0.0}
                                            transmission={1}
                                            thickness={2}
                                            normalMap={motherBoard1.normalMap}
                                            normalScale={[5, -5]}
                                            // backdropNode={verticalRefractor}
                                        ></meshPhysicalMaterial>
                                    </mesh>

                                    <mesh geometry={tvScreen} position={[0, 0, 0.025]} scale={[1, 1, 1]}>
                                        <meshStandardNodeMaterial
                                            roughness={1}
                                            metalness={0}
                                            color={'#000000'}
                                            emissive={'#ffffff'}
                                            emissiveNode={emissiveNode}
                                            // colorNode={Fn(() => {
                                            //     return texture(adsVideo, uv())
                                            // })()}
                                        ></meshStandardNodeMaterial>
                                    </mesh>
                                </group>
                            </group>

                            {/* <group position={[0, -0.1, 0]}>
                                <mesh geometry={tvCube} position={[0, 0.0, 0]}>
                                    <meshPhysicalMaterial
                                        color={'#ffffff'}
                                        roughness={0.0}
                                        metalness={0.0}
                                        transmission={1}
                                        thickness={2}
                                        normalMap={motherBoard1.normalMap}
                                        normalScale={[2, -2]}
                                        // backdropNode={verticalRefractor}
                                    ></meshPhysicalMaterial>
                                </mesh>
                            </group> */}
                        </group>
                    </>
                </Float>
            </group>
        </>
    )
}
