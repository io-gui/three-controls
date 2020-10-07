import { Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Quaternion } from "../../../src/Three";

export declare type Callback = ( callbackValue?: any ) => void;

export declare type Camera = PerspectiveCamera | OrthographicCamera;

export declare class Pointer2D {

	start: Vector2;
	current: Vector2;
	previous: Vector2;
	movement: Vector2;
	offset: Vector2;

}

export declare class Pointer3D {

	start: Vector3;
	current: Vector3;
	previous: Vector3;
	movement: Vector3;
	offset: Vector3;

}

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
	canvas: Pointer2D;
	view: Pointer2D;
	planar: Pointer3D;
	world: Pointer3D;
	_camera: Camera;
	_target: Vector3;
	constructor( pointerEvent: PointerEvent, camera: Camera, target: Vector3 );
	update( pointerEvent: PointerEvent, camera: Camera, target: Vector3 ): void;
	clear(): void;
	applyDamping( dampingFactor: number, deltaTime: number ): void;
	intersectObjects( objects: Object3D[] ): Intersection[];
	intersectPlane( plane: Plane ): Vector3;
	_calculateView(): void;
	_calculateWorld(): void;
	_calculatePlanar(): void;

}

export declare class CenterPointer extends Pointer {

	updateCenter( pointers: Pointer[], camera: Camera, target: Vector3 ): void;

}

declare class AnimationQueue {

	private _queue;
	private _running;
	private _time;
	constructor();
	add( callback: Callback ): void;
	remove( callback: Callback ): void;
	private _start;
	private _stop;
	private _update;

}

export declare const AnimationQueueSingleton: AnimationQueue;

export declare type SyntheticEvent = {
	type: string;
	value?: any;
	target?: any;
	object?: Object3D;
	objects?: Object3D[];
	[x: string]: any;
};

export declare const changeEvent: SyntheticEvent;

declare const Controls_base: {
	new ( camera: Camera, domElement: HTMLElement ): {
		[x: string]: any;
		camera: Camera;
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
		_defineProperty( prop: string, initValue: any, onChange?: Callback | undefined ): void;
		onTrackedPointerDown( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedPointerMove( _pointer: Pointer, _pointers: Pointer[], _center: CenterPointer ): void;
		onTrackedPointerHover( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedPointerUp( _pointer: Pointer, _pointers: Pointer[] ): void;
		onTrackedKeyDown( code: number, codes: number[] ): void;
		onTrackedKeyUp( code: number, codes: number[] ): void;
		onTrackedKeyChange( code: number, codes: number[] ): void;
		dispose(): void;
		addEventListener( type: string, listener: Callback ): void;
		dispatchEvent( event: Event | SyntheticEvent ): void;
		startAnimation( callback: Callback ): void;
		stopAnimation( callback: Callback ): void;
		saveState(): void;
		reset(): void;
		saveCameraState(): void;
		resetCameraState(): void;
	};
	[x: string]: any;
};

export declare class Controls extends Controls_base {
}

export {};
