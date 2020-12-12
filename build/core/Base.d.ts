import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera, Camera, WebXRManager } from 'three';
import { Mesh, Event as ThreeEvent } from 'three';

export declare type Callback = ( callbackValue?: any, callbackOldValue?: any ) => void;

export declare type AnyCameraType = Camera | PerspectiveCamera | OrthographicCamera;

export declare type Viewport = {
	camera: AnyCameraType;
	domElement: HTMLElement;
};

export declare const EVENT: Record<string, ThreeEvent>;

export declare const UNIT: {
	ZERO: Readonly<Vector3>;
	X: Readonly<Vector3>;
	Y: Readonly<Vector3>;
	Z: Readonly<Vector3>;
};


/**
 * `Base`: Base class for Objects with observable properties, change events and animation.
 */
export declare class Base extends Mesh {

	viewport: Viewport;
	xr?: WebXRManager;
	eye: Vector3;
	protected needsAnimationFrame: boolean;
	protected readonly _cameraPosition: Vector3;
	protected readonly _cameraQuaternion: Quaternion;
	protected readonly _cameraScale: Vector3;
	protected readonly _cameraOffset: Vector3;
	protected readonly _position: Vector3;
	protected readonly _quaternion: Quaternion;
	protected readonly _scale: Vector3;
	private readonly _animations;
	private _animationFrame;
	protected _changeDispatched: boolean;
	constructor();

	/**
     * Adds property observing mechanism via getter and setter.
     * Also emits '[property]-changed' event and cummulative 'change' event on next rAF.
     */
	observeProperty( propertyKey: string ): void;
	protected needsAnimationFrameChanged(): void;
	private _onAnimationFrame;
	startAnimation( callback: Callback ): void;
	stopAnimation( callback: Callback ): void;
	stopAllAnimations(): void;
	dispose(): void;
	updateMatrixWorld(): void;

}
