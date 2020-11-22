import {
	Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Event as ThreeEvent
} from 'three';

export declare type Callback = ( callbackValue?: any ) => void;

export declare const CHANGE_EVENT: ThreeEvent;

export declare const START_EVENT: ThreeEvent;

export declare const END_EVENT: ThreeEvent;

export declare const DISPOSE_EVENT: ThreeEvent;

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
 * - Developers can start and stop per-frame function invocations via `private startAnimation( callback )` and `stopAnimation( callback )`.
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
		enabled: boolean;
		enableDamping: boolean;
		dampingFactor: number;
		_hoverPointer: PointerTracker | null;
		_centerPointer: CenterPointerTracker | null;
		_simulatedPointer: PointerTracker | null;
		_pointers: PointerTracker[];
		_animations: Callback[];
		_keys: number[];
		_changeDispatched: boolean;
		observeProperty( propertyKey: keyof Controls, onChangeFunc: Callback, onChangeToFalsyFunc?: Callback | undefined ): void;
		startAnimation( callback: Callback ): void;
		stopAnimation( callback: Callback ): void;
		_connect(): void;
		_disconnect(): void;
		dispose(): void;
		addEventListener( type: string, listener: Callback ): void;
		dispatchEvent( event: ThreeEvent | Event ): void;
		_preventDefault( event: Event ): void;
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
		onTrackedPointerDown( _pointer: PointerTracker, _pointers: PointerTracker[] ): void;
		onTrackedPointerMove( _pointer: PointerTracker, _pointers: PointerTracker[], _centerPointer: CenterPointerTracker ): void;
		onTrackedPointerHover( _pointer: PointerTracker, _pointers: PointerTracker[] ): void;
		onTrackedPointerUp( _pointer: PointerTracker, _pointers: PointerTracker[] ): void;
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

	readonly start: Vector2;
	readonly current: Vector2;
	readonly previous: Vector2;
	readonly movement: Vector2;
	readonly offset: Vector2;
	constructor( x: number, y: number );
	set( x: number, y: number ): this;
	clear(): this;
	add( pointer: Pointer2D ): this;
	copy( pointer: Pointer2D ): this;
	divideScalar( value: number ): this;
	update( x: number, y: number ): this;
	convertToViewSpace( domElement: HTMLElement ): this;

}
declare class Pointer3D {

	readonly start: Vector3;
	readonly current: Vector3;
	readonly previous: Vector3;
	readonly movement: Vector3;
	readonly offset: Vector3;
	constructor( x: number, y: number, z: number );
	set( x: number, y: number, z: number ): this;
	clear(): this;
	add( pointer: Pointer3D ): this;
	divideScalar( value: number ): this;
	projectOnPlane( viewPointer: Pointer2D, camera: PerspectiveCamera | OrthographicCamera, center: Vector3, planeNormal: Vector3, avoidGrazingAngles?: boolean ): this;

}


/**
 * Keeps track of pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export declare class PointerTracker {

	get button(): number;
	get buttons(): number;
	get altKey(): boolean;
	get ctrlKey(): boolean;
	get metaKey(): boolean;
	get shiftKey(): boolean;
	get domElement(): HTMLElement;
	get pointerId(): number;
	get type(): string;
	isSimulated: boolean;
	readonly canvas: Pointer2D;
	readonly view: Pointer2D;
	protected _projected: Pointer3D;
	private _camera;
	private _pointerEvent;
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	update( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera ): void;
	simmulateDamping( dampingFactor: number, deltaTime: number ): void;
	projectOnPlane( planeCenter: Vector3, planeNormal: Vector3, avoidGrazingAngles?: boolean ): Pointer3D;
	intersectObjects( objects: Object3D[] ): Intersection[];
	intersectPlane( plane: Plane ): Vector3;
	clearMovement(): void;

}

declare class CenterPointerTracker extends PointerTracker {

	private _pointers;
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	projectOnPlane( planeCenter: Vector3, planeNormal: Vector3 ): Pointer3D;
	updateCenter( pointers: PointerTracker[] ): void;

}

export {};
