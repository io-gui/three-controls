import { MOUSE, TOUCH, Vector3, PerspectiveCamera, OrthographicCamera } from 'three';
import { ControlsCamera } from './core/ControlsCamera.js';
import { PointerTracker } from './core/Pointers.js';
import { Callback } from './core/ControlsBase.js';
declare class OrbitControls extends ControlsCamera {
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableKeys: boolean;
    keys: {
        LEFT: number;
        UP: number;
        RIGHT: number;
        BOTTOM: number;
    };
    mouseButtons: {
        LEFT: MOUSE;
        MIDDLE: MOUSE;
        RIGHT: MOUSE;
    };
    touches: {
        ONE: TOUCH;
        TWO: TOUCH;
    };
    private readonly _spherical;
    private _autoRotationMagnitude;
    private _interacting;
    constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement);
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    addEventListener(type: string, listener: Callback): void;
    _onContextMenu(event: Event): void;
    _onWheel(event: WheelEvent): void;
    _onKeyDown(event: KeyboardEvent): void;
    onTrackedPointerDown(pointer: PointerTracker, pointers: PointerTracker[]): void;
    onTrackedPointerMove(pointer: PointerTracker, pointers: PointerTracker[], center: PointerTracker): void;
    onTrackedPointerUp(pointer: PointerTracker, pointers: PointerTracker[]): void;
    _pointerDolly(pointer: PointerTracker): void;
    _twoPointerDolly(pointers: PointerTracker[]): void;
    _applyDollyMovement(dollyMovement: number): void;
    _pointerPan(pointer: PointerTracker): void;
    _keydownPan(deltaX: number, deltaY: number): void;
    _applyPanMovement(movement: Vector3): void;
    _pointerRotate(pointer: PointerTracker): void;
    autoRotateChanged(): void;
    _autoRotateAnimation(timestep: number): void;
    _applyRotateMovement(movement: Vector3): void;
    update(): void;
}
export { OrbitControls };
//# sourceMappingURL=OrbitControls.d.ts.map