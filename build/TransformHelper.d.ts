import { Quaternion, Mesh, Vector3 } from 'three';
import { AnyCameraType } from './core/ControlsBase.js';
import { ControlsHelper } from './core/ControlsHelper.js';
export declare class TransformHelper extends ControlsHelper {
    static readonly isTransformHelper = true;
    static readonly type = "TransformHelper";
    enabled: boolean;
    size: number;
    space: 'world' | 'local';
    activeMode: string;
    activeAxis: string;
    showX: boolean;
    showY: boolean;
    showZ: boolean;
    showE: boolean;
    showTranslate: boolean;
    showRotate: boolean;
    showScale: boolean;
    showOffset: boolean;
    dithering: boolean;
    readonly positionOffset: Vector3;
    readonly quaternionOffset: Quaternion;
    readonly scaleOffset: Vector3;
    dampingFactor: number;
    AXIS_HIDE_TRESHOLD: number;
    PLANE_HIDE_TRESHOLD: number;
    AXIS_FLIP_TRESHOLD: number;
    private readonly _tempMatrix;
    private readonly _dirVector;
    private readonly _tempQuaternion;
    private readonly _tempQuaternion2;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    changed(): void;
    updateHandle(handle: Mesh): void;
    _animate(timestep: number): void;
    updateMatrixWorld(): void;
}
//# sourceMappingURL=TransformHelper.d.ts.map