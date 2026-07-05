import { useEffect, useState } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export const useCollider = ({ glbScene }: { glbScene?: any }) => {
    let [collider, setCollider] = useState<any>(false);

    useEffect(() => {
        if (!glbScene) {
            return;
        }
        let cloned = clone(glbScene);

        let removeList: any[] = [];

        cloned.traverse((it: any) => {
            //

            if (it?.geometry && it.name.includes('door')) {
                it.visible = false;
                removeList.push(it);
            }
        });

        removeList.forEach((it) => {
            it.removeFromParent();
        });

        let api = {
            o3d: cloned,
            show: <primitive object={cloned}></primitive>,
        };

        setCollider(api);
        return () => {
            setCollider(false);
        };
    }, [glbScene]);

    return collider;
};
