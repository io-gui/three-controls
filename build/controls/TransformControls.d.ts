import {
	Mesh, Object3D, Vector3, PerspectiveCamera, OrthographicCamera
} from 'three';
import {
	PointerTracker
} from './Controls';

declare const TransformControls_base: any;
declare class TransformControls extends TransformControls_base {

	static readonly isTransformControls = true;
	static readonly type = "TransformControls";
	camera: PerspectiveCamera | OrthographicCamera;
	domElement: HTMLElement;
	enabled: boolean;
	enableDamping: boolean;
	dampingFactor: number;
	size: number;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	object?: Object3D;
	dragging: boolean;
	space: string;
	activeMode: 'translate' | 'rotate' | 'scale' | '';
	activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'XYZX' | 'XYZY' | 'XYZZ' | 'E' | '';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	avoidGrazingAngles: boolean;
	needsAnimation: boolean;
	private readonly _cameraPosition;
	private readonly _cameraQuaternion;
	private readonly _cameraScale;
	private readonly _parentPosition;
	private readonly _parentQuaternion;
	private readonly _parentQuaternionInv;
	private readonly _parentScale;
	private readonly _worldPositionStart;
	private readonly _worldQuaternionStart;
	private readonly _worldScaleStart;
	private readonly _worldPosition;
	private readonly _worldQuaternion;
	private readonly _worldQuaternionInv;
	private readonly _worldScale;
	private readonly _positionStart;
	private readonly _quaternionStart;
	private readonly _quaternionStartInv;
	private readonly _scaleStart;
	private readonly _rotationAxis;
	private _rotationAngle;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	onNeedsAnimationChanged(): void;
	updateHandleMaterial( handle: Mesh ): void;
	updateHandle( handle: Mesh ): void;
	updateMatrixWorld(): void;
	getPlaneNormal(): Vector3;
	onTrackedPointerHover( pointer: PointerTracker ): void;
	onTrackedPointerDown( pointer: PointerTracker ): void;
	onTrackedPointerMove( pointer: PointerTracker ): void;
	onTrackedPointerUp( pointer: PointerTracker ): void;
	dispose(): void;
	attach( object: Object3D ): this;
	detach(): this;
	getMode(): void;
	setMode( mode: 'translate' | 'rotate' | 'scale' ): void;
	setTranslationSnap( translationSnap: number ): void;
	setRotationSnap( rotationSnap: number ): void;
	setScaleSnap( scaleSnap: number ): void;
	setSize( size: number ): void;
	setSpace( space: string ): void;
	update(): void;
	addEventListener( type: string, listener: ( event: Event ) => void ): void;

}

export { TransformControls };
