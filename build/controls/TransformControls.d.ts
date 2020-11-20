import { Mesh, Object3D, Quaternion, Vector3, PerspectiveCamera, OrthographicCamera } from 'three';
import { Pointer } from './Controls';

declare const TransformControls_base: any;
declare class TransformControls extends TransformControls_base {

	readonly isTransformControls = true;
	type: string;
	camera: PerspectiveCamera | OrthographicCamera;
	domElement: HTMLElement;
	lookAtTarget: boolean;
	object?: Object3D;
	space: string;
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	cameraPosition: Vector3;
	cameraQuaternion: Quaternion;
	cameraScale: Vector3;
	parentPosition: Vector3;
	parentQuaternion: Quaternion;
	parentQuaternionInv: Quaternion;
	parentScale: Vector3;
	worldPositionStart: Vector3;
	worldQuaternionStart: Quaternion;
	worldScaleStart: Vector3;
	worldPosition: Vector3;
	worldQuaternion: Quaternion;
	worldQuaternionInv: Quaternion;
	worldScale: Vector3;
	positionStart: Vector3;
	quaternionStart: Quaternion;
	scaleStart: Vector3;
	rotationAxis: Vector3;
	rotationAngle: number;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	updateHandle( handle: Mesh ): void;
	updateMatrixWorld(): void;
	getPlaneNormal(): Vector3;
	onTrackedPointerHover( pointer: Pointer ): void;
	onTrackedPointerDown( pointer: Pointer ): void;
	onTrackedPointerMove( pointer: Pointer ): void;
	onTrackedPointerUp( pointer: Pointer ): void;
	dispose(): void;
	attach( object: Object3D ): this;
	detach(): this;
	getMode(): void;
	setMode(): void;
	setTranslationSnap( translationSnap: number ): void;
	setRotationSnap( rotationSnap: number ): void;
	setScaleSnap( scaleSnap: number ): void;
	setSize( size: number ): void;
	setSpace( space: string ): void;
	update(): void;

}

export { TransformControls };
