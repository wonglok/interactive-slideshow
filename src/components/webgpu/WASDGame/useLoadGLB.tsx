import { useEffect, useMemo, useState } from 'react';
import { meshBounds, useGLTF } from '@react-three/drei';

export const useLoadGLB = ({ url = `/game-asset/scene/place1.glb`, clipNames = [] }: { enableCache?: boolean; url: string; clipNames?: string[] }) => {
    let glb = useGLTF(`${url}`);

    let [stuff, setStuff] = useState<any>(false);

    useEffect(() => {
        glb.scene.traverse((it: any) => {
            it.frustumCulled = false;
            if (it.geometry) {
                it.castShadow = true;
                it.receiveShadow = true;
            }
        });

        glb.scene.traverse((it: any) => {
            let hideList = ['roof', 'glass', 'window', 'plastic', 'transparent']; // , 'planks', 'ceiling'

            for (let eachHide of hideList) {
                if (it.material?.name?.toLowerCase().includes(eachHide)) {
                    // it.visible = true;
                    it.castShadow = false;
                    it.receiveShadow = false;
                }

                if (it?.name?.toLowerCase().includes(eachHide)) {
                    // it.visible = true;
                    it.castShadow = false;
                    it.receiveShadow = false;
                }

                if (it.name === 'Floor' || it.name === 'G-__558732') {
                    if (it.material) {
                        it.material.roughness = 0.0;
                        it.material.metalness = 1.0;
                    }
                }

                // if (!it.userData.originalMaterial) {
                //     if (it.material) {
                //         it.userData.originalMaterial = it.material.clone();
                //     }
                // }
            }

            if (it.isLight) {
                if (!it.userData.originalIntensity) {
                    it.userData.originalIntensity = it.intensity;
                }
            }
        });

        glb.scene.userData.isEnv = true;
        setStuff({
            glb,
            o3d: glb.scene,
            firstClip: glb.animations[0],
            clips: glb.animations,
            display: (
                <group raycast={meshBounds}>
                    <primitive object={glb.scene}></primitive>
                </group>
            ),
        });
    }, [glb]);

    let clipNamesMemo = useMemo(() => {
        return clipNames;
    }, []);

    useEffect(() => {
        let glb = stuff?.glb;
        if (!glb) {
            return;
        }
        glb.animations = glb.animations.map((clip: any, idx: number) => {
            let newName = clipNamesMemo[idx];

            if (newName) {
                clip.name = newName;
            }

            return clip;
        });
    }, [stuff.glb, clipNamesMemo]);

    return stuff;
};
