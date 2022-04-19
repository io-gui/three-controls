import { Vector3, Vector4, Euler, Mesh, LineSegments } from 'three';
import { ControlsBase, AnyCameraType } from './ControlsBase.js';
import { HelperMaterial } from './HelperMaterial.js';
export declare const helperMaterial: HelperMaterial;
export interface HelperGeometrySpec {
    type: string;
    axis: string;
    color: Vector4;
    position?: Vector3;
    rotation?: Euler;
    scale?: Vector3;
    thickness?: number;
    outlineThickness?: number;
    tag?: string;
}
export declare class ControlsHelper extends ControlsBase {
    sizeAttenuation: number;
    constructor(camera: AnyCameraType, domElement: HTMLElement, helperMap?: [Mesh | LineSegments, HelperGeometrySpec][]);
    dispose(): void;
    decomposeMatrices(): void;
}
//# sourceMappingURL=ControlsHelper.d.ts.map