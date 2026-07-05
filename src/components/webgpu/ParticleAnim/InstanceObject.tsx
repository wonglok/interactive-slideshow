// GaussianSplatLoader.ts
import * as THREE from 'three/webgpu'
import {
    Fn,
    attribute,
    cameraProjectionMatrix,
    cameraViewMatrix,
    deltaTime,
    dot,
    exp,
    instanceIndex,
    modelWorldMatrix,
    normalLocal,
    positionGeometry,
    positionLocal,
    sin,
    storage,
    time,
    uniform,
    uv,
    vec3,
    vertexStage,
} from 'three/tsl'
import { InstancedBufferGeometry } from 'three/webgpu'

import {
    textureSize,
    uint,
    ivec2,
    vec4,
    modelViewMatrix,
    mul,
    If,
    mat3,
    transpose,
    vec2,
    length,
    max,
    normalize,
    sqrt,
    min,
    float,
    viewport,
} from 'three/tsl'

const createBuffer = ({ itemSize = 3, type = 'vec3', vertexCount = 1024 }) => {
    let bufferAttr = new THREE.StorageInstancedBufferAttribute(vertexCount, itemSize)
    let node = storage(bufferAttr, type, vertexCount)
    let materialAttr = node.toAttribute()
    return {
        bufferAttr, // for js init data
        node, // for shader func
        materialAttr, // for material
    }
}

export class InstanceObject {
    static version = `${Math.random()}`
    static createGeometry({ sizeX, sizeY, vertexCount }: { vertexCount: number; sizeX: number; sizeY: number }) {
        // Pack data into textures
        const positionArray = new Float32Array(vertexCount * 3)
        const opacityArray = new Float32Array(vertexCount * 1)
        const colorArray = new Float32Array(vertexCount * 3)
        const scaleArray = new Float32Array(vertexCount * 3)
        const rotationArray = new Float32Array(vertexCount * 4)
        // const quaternion = new THREE.Quaternion()

        const positionBuffer = createBuffer({ itemSize: 3, type: 'vec3', vertexCount: vertexCount })
        const accelerationBuffer = createBuffer({ itemSize: 3, type: 'vec3', vertexCount: vertexCount })

        const color = new THREE.Color()
        let i = 0
        for (let yy = 0; yy < sizeY; yy++) {
            for (let xx = 0; xx < sizeX; xx++) {
                positionArray[i * 3 + 0] = ((xx - sizeX / 2) / sizeX) * 100
                positionArray[i * 3 + 1] = 0
                positionArray[i * 3 + 2] = ((yy - sizeY / 2) / sizeY) * 100

                positionBuffer.bufferAttr.setX(i * 3 + 0, ((xx - sizeX / 2) / sizeX) * 10)
                positionBuffer.bufferAttr.setY(i * 3 + 0, 0)
                positionBuffer.bufferAttr.setZ(i * 3 + 0, ((yy - sizeY / 2) / sizeY) * 10)

                accelerationBuffer.bufferAttr.setX(i * 3 + 0, 0)
                accelerationBuffer.bufferAttr.setY(i * 3 + 0, 0)
                accelerationBuffer.bufferAttr.setZ(i * 3 + 0, 0)

                // const SH_C0 = 0.28209479177387814

                const colorArr = [1, 1, 1]

                // Convert SH DC to color
                color.setRGB(
                    //
                    colorArr[0],
                    colorArr[1],
                    colorArr[2],
                    THREE.NoColorSpace,
                )
                color.convertSRGBToLinear()

                colorArray[i * 3 + 0] = color.r // / 255
                colorArray[i * 3 + 1] = color.g // / 255
                colorArray[i * 3 + 2] = color.b // / 255

                opacityArray[i * 1] = 1
                // opacityArray[i * 1] = 1.0 / splatData.opacity[i]

                scaleArray[i * 3] = 1.0 //
                scaleArray[i * 3 + 1] = 1.0 //
                scaleArray[i * 3 + 2] = 1.0 //

                // Directly use all components
                let quaternion = [
                    0, // w
                    0, // x
                    0, // y
                    1, // z
                ]

                // // Normalize and enforce w >= 0 convention
                // const norm = Math.sqrt(
                //     quaternion[0] ** 2 + quaternion[1] ** 2 + quaternion[2] ** 2 + quaternion[3] ** 2,
                // )

                // if (norm > 0) {
                //     quaternion = quaternion.map((q) => q / norm)

                //     // Ensure positive w for consistency
                //     if (quaternion[0] < 0) {
                //         quaternion = quaternion.map((q) => -q)
                //     }
                // }

                rotationArray[i * 4 + 0] = quaternion[0] //splatData.rot_0[i]
                rotationArray[i * 4 + 1] = quaternion[1] //splatData.rot_1[i]
                rotationArray[i * 4 + 2] = quaternion[2] //splatData.rot_2[i]
                rotationArray[i * 4 + 3] = quaternion[3] //splatData.rot_3[i]

                i++
            }
        }

        positionBuffer.bufferAttr.needsUpdate = true

        const geometry = new InstancedBufferGeometry()
        geometry.instanceCount = vertexCount

        const example = new THREE.BoxGeometry(1, 1, 1)

        geometry.setAttribute('position', new THREE.BufferAttribute(example.attributes.position.array, 3))
        geometry.setAttribute('normal', new THREE.BufferAttribute(example.attributes.normal.array, 3))
        geometry.setAttribute('uv', new THREE.BufferAttribute(example.attributes.uv.array, 2))
        geometry.setIndex(example.index)

        geometry.setAttribute('instancePos', new THREE.InstancedBufferAttribute(positionArray, 3))
        geometry.setAttribute('instanceQuat', new THREE.InstancedBufferAttribute(rotationArray, 4))
        geometry.setAttribute('instanceScale', new THREE.InstancedBufferAttribute(scaleArray, 3))
        geometry.setAttribute('instanceColor', new THREE.InstancedBufferAttribute(colorArray, 3))
        geometry.setAttribute('instanceOpacity', new THREE.InstancedBufferAttribute(opacityArray, 1))

        return { geometry, positionBuffer, accelerationBuffer }
    }

    static async load({ clickPosition }: { clickPosition: THREE.UniformNode<THREE.Vector3> }) {
        const sizeX = 256
        const sizeY = 256

        const vertexCount = sizeX * sizeY
        const { geometry, positionBuffer, accelerationBuffer } = InstanceObject.createGeometry({
            sizeX,
            sizeY,
            vertexCount,
        })

        //

        const splatColor = attribute('instanceColor', 'vec3')
        const splatOpacity = attribute('instanceOpacity', 'float')

        const splatPosition = attribute('instancePos', 'vec3')
        const splatScale = attribute('instanceScale', 'vec3')
        const splatRotation = attribute('instanceQuat', 'vec4')

        // const rotateVectorByQuaternion = Fn(([v, q]: any) => {
        //     const qvec = q.xyz
        //     const uv = qvec.cross(v).mul(2.0)
        //     const uuv = qvec.cross(uv)

        //     return v.add(uv.mul(q.w)).add(uuv)
        // })

        // const rotatedGeometry = rotateVectorByQuaternion(positionGeometry, splatRotation);

        // const rotatedGeometrySize = rotatedGeometry.mul(1)

        // const particlePosition = splatPosition.mul(1)

        // const originalScale = splatScale

        // const unifiedScale = originalScale.length()
        // const scaledOriginalGeometry = positionGeometry.mul(50);

        const vCenter = vertexStage(positionGeometry)

        const fadeCenter = float(1).sub(length(vCenter))

        const colorOut = splatColor

        const alphaOut = splatOpacity.mul(fadeCenter)

        const material = new THREE.MeshPhysicalNodeMaterial()

        const accelerationCompute = Fn(() => {
            const accelerationElement = accelerationBuffer.node.element(instanceIndex)
            const motionElement = positionBuffer.node.element(instanceIndex)

            const dist = motionElement
                .sub(clickPosition)
                .normalize()
                .mul(-0.01 * 30)
                .mul(deltaTime)

            const add = accelerationElement.add(dist)

            accelerationElement.assign(add)

            //
        })().compute(vertexCount)

        const positionCompute = Fn(() => {
            const motionElement = positionBuffer.node.element(instanceIndex)
            const acclerationElement = accelerationBuffer.node.element(instanceIndex)

            const delta = motionElement.add(acclerationElement)

            motionElement.assign(delta)
            //
        })().compute(vertexCount)

        material.vertexNode = Fn(() => {
            const centerPositionCetner = vec4(positionLocal.add(positionBuffer.node.element(instanceIndex)), 1.0)
            const cameraSpaceCetner = modelViewMatrix.mul(centerPositionCetner)
            const screenCoordCetner = cameraProjectionMatrix.mul(cameraSpaceCetner)

            // return vec4(
            //     screenCoordCetner.x.add(positionGeometry.x.mul(0.5).x.mul(originalScale.x)),
            //     screenCoordCetner.y.add(positionGeometry.y.mul(0.5).y.mul(originalScale.y)),
            //     screenCoordCetner.z.add(positionGeometry.z.mul(0.5).z.mul(originalScale.z)),
            //     screenCoordCetner.w,
            // )

            return vec4(screenCoordCetner)
        })()

        material.colorNode = Fn(() => {
            const diffuseColor = vec4(colorOut, alphaOut)
            // fadeCenter.lessThanEqual(0.5).discard()

            return diffuseColor
        })()

        material.side = THREE.FrontSide

        material.transparent = false

        // material.blending = THREE.CustomBlending
        // material.blendSrcAlpha = THREE.OneFactor
        // material.toneMapped = true

        const mesh = new THREE.Mesh(geometry, material)
        mesh.frustumCulled = false
        mesh.castShadow = false
        mesh.receiveShadow = false

        const update = (st: any, dt: number) => {
            //
            st.gl.compute(accelerationCompute)
            st.gl.compute(positionCompute)
            //
        }
        return { mesh, update }
    }
}
