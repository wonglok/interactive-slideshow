import { useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { AnimationMixer, Bone, Object3D } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export const useLoadFBXActions = ({ avatarBoneFix = false, o3d, ...actionsMap }: any) => {
    const [stuff, setStuff] = useState<any>(false);

    useEffect(() => {
        if (!o3d) {
            return;
        }

        let all: any = [];
        let actionsAPI: any = {};
        let mixer = new AnimationMixer(new Object3D());

        let run = async () => {
            for (let key in actionsMap) {
                let url = actionsMap[key];
                const res = await fetch(url, {
                    mode: 'cors',
                });
                let buffer = await res.arrayBuffer();

                let fbxLoader = new FBXLoader();
                let fbx: any = await fbxLoader.parse(buffer, '/');

                let action: any = mixer.clipAction(fbx.animations[0], fbx);

                actionsAPI[key] = action;

                fbx.traverse((it: any) => {
                    it.name = it.name.replace('mixamorig', '');
                });

                o3d.traverse((it: any) => {
                    if (it.isBone) {
                        it.name = it.name.split('_')[0];
                    }
                    it.name = it.name.replace('mixamorig', '');
                });

                all.push({
                    display: <primitive key={`_${fbx.uuid}`} object={fbx}></primitive>,
                    fnc: (st: any) => {
                        mixer.setTime(st.clock.elapsedTime);

                        //
                        o3d.traverse((it: any) => {
                            if (it.isBone && action.canRun) {
                                //
                                let fbxBone = fbx.getObjectByName(it.name);

                                //
                                // if (avatarBoneFix) {
                                //     if (fbxBone) {
                                //         if (it.name.toLowerCase().includes('hips')) {
                                //             it.quaternion.copy(fbxBone.quaternion);
                                //             it.position.copy(fbxBone.position);
                                //             it.position.multiplyScalar(1 / 100);
                                //         } else {
                                //             it.quaternion.copy(fbxBone.quaternion);
                                //         }
                                //     }
                                // } else {
                                //     if (fbxBone) {
                                //         if (it.name.toLowerCase().includes('hips')) {
                                //             it.quaternion.copy(fbxBone.quaternion);
                                //             it.position.copy(fbxBone.position);
                                //         } else {
                                //             it.quaternion.copy(fbxBone.quaternion);
                                //         }
                                //     }
                                // }

                                if (fbxBone) {
                                    if (it.name.toLowerCase().includes('hips')) {
                                        // it.quaternion.copy();
                                        fbxBone.getWorldQuaternion(it.quaternion);
                                        fbxBone.getWorldPosition(it.position);
                                        // it.position.copy(fbxBone.position);
                                        if (fbxBone.position.length() >= 40) {
                                            it.position.multiplyScalar(1 / 100);
                                        }
                                    } else {
                                        it.quaternion.copy(fbxBone.quaternion);
                                    }
                                }
                            }
                        });

                        //
                    },
                });
            }

            setStuff({
                all,
                ...actionsAPI,
            });
        };

        run();
    }, [o3d?.uuid, avatarBoneFix]);

    useFrame((st, dt) => {
        if (stuff?.all) {
            stuff.all
                .map((r: any) => r.fnc)
                .forEach((work: (a: any, b: any) => void) => {
                    work(st, dt);
                });
        }
    });

    return stuff;
};
