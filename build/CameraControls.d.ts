import { Vector3, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls } from './Controls';


/**
 * `ControlsMixin`: Generic mixin for interactive threejs viewport controls.
 * It solves some of the most common and complex problems in threejs control designs.
 *
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointerover", "pointerenter", "pointerout", "pointercancel", "keydown", "keyup"
 * - Tracks active pointer gestures and evokes pointer event handler functions with tracked pointer data:
 *   `onTrackedPointerDown`, `onTrackedPointerMove`, `onTrackedPointerHover`, `onTrackedPointerUp`
 * - Enables inertial behaviours via simmulated pointer with framerate-independent damping.
 * - Tracks active key presses and evokes key event handler functions with currently pressed key data:
 *   `onTrackedKeyDown`, `onTrackedKeyUp`, `onTrackedKeyChange`
 *
 * ### Internal Update and Animation Loop ###
 *
 * - Removes the necessity to call `.update()` method externally from external animation loop for damping calculations.
 * - Developers can start and stop per-frame function invocations via `private startAnimation( callback )` and `stopAnimation( callback )`.
 *
 * ### Controls Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export declare class CameraControls extends Controls {

	target: Vector3;
	lookAtTarget: boolean;
	private readonly _resetQuaternion;
	private readonly _resetPosition;
	private readonly _resetUp;
	private readonly _resetTarget;
	private _resetZoom;
	private _resetFocus;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	saveCameraState(): void;
	resetCameraState(): void;
	saveState(): void;
	reset(): void;

}
