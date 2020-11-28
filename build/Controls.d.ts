import { Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Ray, Event as ThreeEvent, WebXRManager } from 'three';

export declare type Callback = ( callbackValue?: any ) => void;

export declare const CONTROL_CHANGE_EVENT: ThreeEvent;

export declare const CONTROL_START_EVENT: ThreeEvent;

export declare const CONTROL_END_EVENT: ThreeEvent;

export declare const CONTROL_DISPOSE_EVENT: ThreeEvent;

declare type Constructor = new ( ...args: any[] ) => any;


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
export declare function ControlsMixin<Super extends Constructor>( superClass: Super ): {
	new ( ...args: any[] ): {
		[x: string]: any;
		camera: PerspectiveCamera | OrthographicCamera;
		domElement: HTMLElement;
		enabled: boolean;
		xr: WebXRManager | null;
		enableDamping: boolean;
		dampingFactor: number;
		_hoverPointer: PointerTracker | null;
		_centerPointer: CenterPointerTracker | null;
		_simulatedPointer: PointerTracker | null;
		_pointers: PointerTracker[];
		_xrControllers: PointerTracker[];
		_animations: Callback[];
		_keys: number[];
		_changeDispatched: boolean;
		observeProperty( propertyKey: string | number, onChangeFunc: Callback, onChangeToFalsyFunc?: Callback | undefined ): void;
		startAnimation( callback: Callback ): void;
		stopAnimation( callback: Callback ): void;
		_connect(): void;
		_disconnect(): void;
		_connectXR(): void;
		_disconnectXR(): void;
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
} & Super;

declare const Controls_base: any;


/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export declare class Controls extends Controls_base {

	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );

}

declare class CanvasPointer {

	readonly start: Vector2;
	readonly current: Vector2;
	readonly previous: Vector2;
	private readonly _movement;
	private readonly _offset;
	get movement(): Vector2;
	get offset(): Vector2;
	constructor( x?: number, y?: number );
	set( x: number, y: number ): this;
	update( x: number, y: number ): this;

}
declare class ViewPointer {

	readonly start: Vector2;
	readonly current: Vector2;
	readonly previous: Vector2;
	private readonly _movement;
	private readonly _offset;
	private readonly _viewOffset;
	private readonly _viewMultiplier;
	get movement(): Vector2;
	get offset(): Vector2;
	constructor( x?: number, y?: number );
	set( x: number, y: number ): this;
	update( canvasPointer: CanvasPointer, domElement: HTMLElement ): this;

}
declare class RayPointer {

	readonly start: Ray;
	readonly current: Ray;
	readonly previous: Ray;
	update( camera: PerspectiveCamera | OrthographicCamera, viewPointer: ViewPointer ): this;

}
declare class ProjectedPointer {

	readonly start: Vector3;
	readonly current: Vector3;
	readonly previous: Vector3;
	private readonly _movement;
	private readonly _offset;
	private readonly _intersection;
	private readonly _axis;
	private readonly _raycaster;
	get movement(): Vector3;
	get offset(): Vector3;
	constructor( x?: number, y?: number, z?: number );
	set( x: number, y: number, z: number ): this;
	projectOnPlane( ray: RayPointer, plane: Plane, minGrazingAngle?: number ): this;

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
	readonly canvas: CanvasPointer;
	readonly view: ViewPointer;
	readonly ray: RayPointer;
	protected _projected: ProjectedPointer;
	private _camera;
	private _pointerEvent;
	private readonly _intersection;
	private readonly _raycaster;
	private readonly _intersectedObjects;
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	update( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera ): void;
	simmulateDamping( dampingFactor: number, deltaTime: number ): void;
	projectOnPlane( plane: Plane, minGrazingAngle?: number ): ProjectedPointer;
	intersectObjects( objects: Object3D[] ): Intersection[];
	intersectPlane( plane: Plane ): Vector3;
	clearMovement(): void;

}

declare class CenterPointerTracker extends PointerTracker {

	private _pointers;
	constructor( pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera );
	projectOnPlane( plane: Plane, minGrazingAngle?: number ): ProjectedPointer;
	updateCenter( pointers: PointerTracker[] ): void;

}

export {};
