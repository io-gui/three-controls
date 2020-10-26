import { Mesh, Object3D, Quaternion, Vector3, PerspectiveCamera, OrthographicCamera } from "../../../three";
import { Pointer } from "./Controls.js";

declare const TransformControls_base: any;
declare class TransformControls extends TransformControls_base {

	camera: PerspectiveCamera | OrthographicCamera;
	domElement: HTMLElement;
	readonly isTransformControls = true;
	object?: Object3D;
	enabled: boolean;
	axis: '' | 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'E' | 'XYZE';
	mode: 'translate' | 'rotate' | 'scale';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	space: string;
	size: number;
	dragging: boolean;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	rotationAngle: number;
	eye: Vector3;
	_gizmo: TransformControlsGizmo;
	_plane: TransformControlsPlane;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	updateMatrixWorld(): void;
	onTrackedPointerHover( pointer: Pointer ): void;
	onTrackedPointerDown( pointer: Pointer ): void;
	onTrackedPointerMove( pointer: Pointer ): void;
	onTrackedPointerUp( pointer: Pointer ): void;
	dispose(): void;
	attach( object: Object3D ): this;
	detach(): this;
	getMode(): string;
	setMode( mode: "translate" | "rotate" | "scale" ): void;
	setTranslationSnap( translationSnap: number ): void;
	setRotationSnap( rotationSnap: number ): void;
	setScaleSnap( scaleSnap: number ): void;
	setSize( size: number ): void;
	setSpace( space: string ): void;
	update(): void;

}
declare class TransformControlsGizmo extends Object3D {

	type: string;
	isTransformControlsGizmo: boolean;
	gizmo: {
		translate: Object3D;
		rotate: Object3D;
		scale: Object3D;
	};
	picker: {
		translate: Object3D;
		rotate: Object3D;
		scale: Object3D;
	};
	helper: {
		translate: Object3D;
		rotate: Object3D;
		scale: Object3D;
	};
	camera?: PerspectiveCamera | OrthographicCamera;
	object?: Object3D;
	enabled: boolean;
	axis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'E';
	mode: 'translate' | 'rotate' | 'scale';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	space: string;
	size: number;
	dragging: boolean;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	rotationAxis: Vector3;
	worldPosition: Vector3;
	worldPositionStart: Vector3;
	cameraPosition: Vector3;
	eye: Vector3;
	worldQuaternion: Quaternion;
	worldQuaternionStart: Quaternion;
	cameraQuaternion: Quaternion;
	constructor();

}
declare class TransformControlsPlane extends Mesh {

	type: string;
	isTransformControlsPlane: boolean;
	object?: Object3D;
	enabled: boolean;
	axis: '' | 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'E';
	mode: 'translate' | 'rotate' | 'scale';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	space: string;
	size: number;
	dragging: boolean;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	worldPosition: Vector3;
	eye: Vector3;
	worldQuaternion: Quaternion;
	cameraQuaternion: Quaternion;
	constructor();
	updateMatrixWorld(): void;

}

export { TransformControls, TransformControlsGizmo, TransformControlsPlane };
