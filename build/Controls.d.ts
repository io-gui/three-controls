import { Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Event as ThreeEvent, Quaternion } from "../../three";

export declare type Callback = ( callbackValue?: any ) => void;

export declare const CHANGE_EVENT: ThreeEvent;

export declare const START_EVENT: ThreeEvent;

export declare const END_EVENT: ThreeEvent;

export declare const DISPOSE_EVENT: ThreeEvent;

export declare function onChange( onChangeFunc: string, onChangeToFalsyFunc?: string ): ( target: any, propertyKey: string ) => void;

declare type Constructor<TBase extends any> = new ( ...args: any[] ) => TBase;


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
 * - Developers can start and stop per-frame function invocations via `private startAnimation(callback)` and `stopAnimation(callback)`.
 *
 * ### Controls Livecycle ###
 *
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export declare function ControlsMixin<T extends Constructor<any>>( base: T ): {
	new ( ...args: any[] ): {
		[x: string]: any;
		camera: PerspectiveCamera | OrthographicCamera;
		domElement: HTMLElement;
		target: Vector3;
		enabled: boolean;
		enableDamping: boolean;
		dampingFactor: number;
		_simulatedPointer: Pointer | null;
		_hover: Pointer | null;
		_center: CenterPointer | null;
		_pointers: Pointer[];
		_animations: Callback[];
		_keys: number[];
		_resetQuaternion: Quaternion;
		_resetPosition: Vector3;
		_resetUp: Vector3;
		_resetTarget: Vector3;
		_resetZoom: number;
		_resetFocus: number;
		startAnimation( callback: Callback ): void;
		stopAnimation( callback: Callback ): void;
		_connect(): void;
		_disconnect(): void;
		dispose(): void;
		saveState(): void;
		reset(): void;
		saveCameraState(): void;
		resetCameraState(): void;
		addEventListener( type: string, listener: Callback ): void;
		dispatchEvent( event: ThreeEvent | Event ): void;
		_onContextMenu( event: Event ): void;
		_onWheel( event: WheelEvent ): void;
		_onPointerDown( event: PointerEvent ): void;
		_onPointerMove( event: PointerEvent ): void;
		_onPointerSimulation( timeDelta: number ): void;
		_onPointerUp( event: PointerEvent ): void;
		_onPointerLeave( event: PointerEvent ): void;
		_onPointerCancel( event: PointerEvent ): void;
		_onPointerOver( event: PointerEvent ): void;
		_onPointerEnter( event: PointerEvent ): void;
		_onPointerOut( event: PointerEvent ): void;
		_onKeyDown( event: KeyboardEvent ): void;
		_onKeyUp( event: KeyboardEvent ): void;
		onTrackedPointerDown( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedPointerMove( _pointer: Pointer, _pointers: Pointer[], _center: CenterPointer ): void;
		onTrackedPointerHover( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedPointerUp( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedKeyDown( code: number, codes: number[] ): void;
		onTrackedKeyUp( code: number, codes: number[] ): void;
		onTrackedKeyChange( code: number, codes: number[] ): void;
	};
} & T;

declare const Controls_base: any;


/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export declare class Controls extends Controls_base {

	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );

}

declare class Pointer2D {

	start: Vector2;
	current: Vector2;
	previous: Vector2;
	movement: Vector2;
	offset: Vector2;
	constructor( x: number, y: number );
	set( x: number, y: number ): this;
	clear(): void;
	add( pointer: Pointer2D ): this;
	copy( pointer: Pointer2D ): this;
	divideScalar( value: number ): this;
	update( x: number, y: number ): this;
	convertToViewSpace( domElement: HTMLElement ): this;

}
declare class Pointer3D {

	start: Vector3;
	current: Vector3;
	previous: Vector3;
	movement: Vector3;
	offset: Vector3;
	constructor( x: number, y: number, z: number );
	set( x: number, y: number, z: number ): this;
	clear(): void;
	add( pointer: Pointer3D ): this;
	divideScalar( value: number ): this;
	fromView( viewPointer: Pointer2D, camera: PerspectiveCamera | OrthographicCamera, planeNormal: Vector3 ): this;

}


/**
 * Keeps track of pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export declare class Pointer {

	domElement: HTMLElement;
	pointerId: number;
	type: string;
	buttons: number;
	button: number;
	altKey: boolean;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
	isSimulated: boolean;
	canvas: Pointer2D;
	view: Pointer2D;
	planeX: Pointer3D;
	planeY: Pointer3D;
	planeZ: Pointer3D;
	planeE: Pointer3D;
	planeNormalX: Pointer3D;
	planeNormalY: Pointer3D;
	planeNormalZ: Pointer3D;
	private _camera;
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	update( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera ): void;
	applyDamping( dampingFactor: number, deltaTime: number ): void;
	intersectObjects( objects: Object3D[] ): Intersection[];
	intersectPlane( plane: Plane ): Vector3;
	_clearMovement(): void;

}

export declare class CenterPointer extends Pointer {

	_pointers: Pointer[];
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	updateCenter( pointers: Pointer[] ): void;

}

export {};
