import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera, Camera } from 'three';
import { Mesh, Event as ThreeEvent } from 'three';

export declare type Callback = ( callbackValue?: any, callbackOldValue?: any ) => void;

export declare type AnyCameraType = Camera | PerspectiveCamera | OrthographicCamera;

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

	camera: AnyCameraType;
	domElement: HTMLElement;
	readonly eye: Vector3;
	protected readonly cameraPosition: Vector3;
	protected readonly cameraQuaternion: Quaternion;
	protected readonly cameraScale: Vector3;
	protected readonly cameraOffset: Vector3;
	protected readonly worldPosition: Vector3;
	protected readonly worldQuaternion: Quaternion;
	protected readonly worldScale: Vector3;
	protected needsAnimationFrame: boolean;
	private readonly _animations;
	private _animationFrame;
	protected changeDispatched: boolean;
	constructor( camera: AnyCameraType, domElement: HTMLElement );

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
	decomposeMatrices(): void;
	updateMatrixWorld(): void;

}
