import { Plane, WebXRManager } from 'three';
import { PointerTracker, CenterPointerTracker } from './Pointers.js';
import { ControlsBase, Callback, AnyCameraType, ControlsEvent } from './ControlsBase.js';
/**
 * `ControlsInteractive`: Generic class for interactive threejs viewport controls. It solves some of the most common and complex problems in threejs control designs.
 *
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "keydown", "keyup"
 * - Tracks active pointer gestures and evokes pointer event handler functions with tracked pointer data:
 *   `onTrackedPointerDown`, `onTrackedPointerMove`, `onTrackedPointerHover`, `onTrackedPointerUp`
 * - Enables inertial behaviours via simmulated pointer with framerate-independent damping.
 * - Tracks active key presses and evokes key event handler functions with currently pressed key data:
 *   `onTrackedKeyDown`, `onTrackedKeyUp`, `onTrackedKeyChange`
 *
 * ### Internal Update and Animation Loop ###
 *
 * - Removes the necessity to call `.update()` method externally from external animation loop for damping calculations.
 * - Developers can start and stop per-frame function invocations via `private startAnimation(callback)` and `stopAnimation(callback)`.
 *
 * ### ControlsInteractive Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export declare class ControlsInteractive extends ControlsBase {
    xr?: WebXRManager;
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    private _hoverPointer;
    private _centerPointer;
    private _simulatedPointer;
    private _pointers;
    private _xrControllers;
    private _xrPointers;
    private _keys;
    protected readonly _plane: Plane;
    protected readonly _viewports: HTMLElement[];
    protected readonly _viewportCameras: WeakMap<HTMLElement, AnyCameraType>;
    constructor(camera: AnyCameraType, domElement: HTMLElement);
    enabledChanged(value: boolean): void;
    xrChanged(value: boolean): void;
    registerViewport(camera: AnyCameraType, domElement: HTMLElement): void;
    _connectViewport(domElement: HTMLElement): void;
    _disconnectViewport(domElement: HTMLElement): void;
    _connect(): void;
    _disconnect(): void;
    _connectXR(): void;
    _disconnectXR(): void;
    _onXRControllerMove(controllerEvent: ControlsEvent): void;
    _onXRControllerDown(controllerEvent: ControlsEvent): void;
    _onXRControllerUp(controllerEvent: ControlsEvent): void;
    dispose(): void;
    addEventListener(type: string, listener: Callback): void;
    _preventDefault(event: Event): void;
    _onContextMenu(event: Event): void;
    _onWheel(event: WheelEvent): void;
    _onPointerDown(event: PointerEvent): void;
    _onPointerMove(event: PointerEvent): void;
    _onPointerSimulation(timeDelta: number): void;
    _onPointerUp(event: PointerEvent): void;
    _onKeyDown(event: KeyboardEvent): void;
    _onKeyUp(event: KeyboardEvent): void;
    _onDragOver(event: DragEvent): void;
    _onDrop(event: DragEvent): void;
    onTrackedPointerDown(_pointer: PointerTracker, _pointers: PointerTracker[]): void;
    onTrackedPointerMove(_pointer: PointerTracker, _pointers: PointerTracker[], _centerPointer: CenterPointerTracker): void;
    onTrackedPointerHover(_pointer: PointerTracker, _pointers: PointerTracker[]): void;
    onTrackedPointerUp(_pointer: PointerTracker, _pointers: PointerTracker[]): void;
    onTrackedKeyDown(code: number, codes: number[]): void;
    onTrackedKeyUp(code: number, codes: number[]): void;
    onTrackedKeyChange(code: number, codes: number[]): void;
    onTrackedDragOver(_pointer: PointerTracker, _pointers: PointerTracker[]): void;
    onTrackedDrop(_pointer: PointerTracker, _pointers: PointerTracker[]): void;
}
//# sourceMappingURL=ControlsInteractive.d.ts.map