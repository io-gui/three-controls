import { MOUSE } from 'three';
import { ControlsCamera } from './core/ControlsCamera.js';
import { PointerTracker } from './core/Pointers.js';
import { AnyCameraType } from './core/ControlsBase.js';
declare class TrackballControls extends ControlsCamera {
    rotateSpeed: number;
    zoomSpeed: number;
    panSpeed: number;
    noRotate: boolean;
    noZoom: boolean;
    noPan: boolean;
    minDistance: number;
    maxDistance: number;
    keys: number[];
    mouseButtons: {
        LEFT: MOUSE;
        MIDDLE: MOUSE;
        RIGHT: MOUSE;
    };
    private _keyState;
    private _offset;
    private _rotationMagnitude;
    private _zoomMagnitude;
    private _panMagnitude;
    private _rotateAxis;
    private _rotateQuaternion;
    private _cameraUpDirection;
    private _cameraSidewaysDirection;
    private _moveDirection;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    _onContextMenu(event: Event): void;
    _onWheel(event: WheelEvent): void;
    onTrackedPointerDown(pointer: PointerTracker, pointers: PointerTracker[]): void;
    onTrackedPointerMove(pointer: PointerTracker, pointers: PointerTracker[]): void;
    onTrackedPointerUp(pointer: PointerTracker, pointers: PointerTracker[]): void;
    onTrackedKeyChange(code: number, codes: number[]): void;
    update(): void;
    handleResize(): void;
}
export { TrackballControls };
//# sourceMappingURL=TrackballControls.d.ts.map