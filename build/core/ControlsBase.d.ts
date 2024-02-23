import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera, Camera, Object3D, BaseEvent, Object3DEventMap } from 'three';
export type Callback = (callbackValue?: any, callbackOldValue?: any) => void;
export type AnyCameraType = Camera | PerspectiveCamera | OrthographicCamera | Object3D;
export declare const UNIT: {
    ZERO: Readonly<Vector3>;
    X: Readonly<Vector3>;
    Y: Readonly<Vector3>;
    Z: Readonly<Vector3>;
};
export interface ControlsEventMap extends Object3DEventMap {
    start: object;
    end: object;
    drag: object;
    dragstart: object;
    dragend: object;
    change: object;
    hoveron: object;
    hoveroff: object;
    dispose: object;
    selectstart: object;
    selectend: object;
    controllermove: object;
    transform: object;
}
export interface ControlsEvent extends BaseEvent {
    type: keyof ControlsEventMap;
    target?: any;
    [attachment: string]: any;
}
/**
 * `ControlsBase`: Base class for Objects with observable properties, change events and animation.
 */
export declare class ControlsBase extends Object3D<ControlsEventMap> {
    camera: AnyCameraType;
    domElement: HTMLElement;
    readonly eye: Vector3;
    protected readonly cameraPosition: Vector3;
    protected readonly cameraQuaternion: Quaternion;
    protected readonly cameraScale: Vector3;
    protected readonly cameraOffset: Vector3;
    protected readonly worldPosition: Vector3;
    protected readonly worldQuaternion: Quaternion;
    protected readonly worldQuaternionInv: Quaternion;
    protected readonly worldScale: Vector3;
    private readonly _animations;
    private _eventTimeout;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    /**
     * Adds property observing mechanism via getter and setter.
     * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
     */
    observeProperty(propertyKey: string): void;
    private _invokeChangeHandlers;
    dispatchEvent(event: ControlsEvent): void;
    changed(): void;
    startAnimation(callback: Callback): void;
    stopAnimation(callback: Callback): void;
    stopAllAnimations(): void;
    dispose(): void;
    decomposeMatrices(): void;
    updateMatrixWorld(): void;
}
//# sourceMappingURL=ControlsBase.d.ts.map