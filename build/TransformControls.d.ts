import { Mesh, Object3D, Vector3, Plane } from 'three';
import { PointerTracker } from './core/Pointers';
import { Controls } from './core/Controls';

export { TransformHelper } from './TransformHelper';

export declare const TRANSFORM_CHANGE_EVENT: {
	type: string;
};

declare class TransformControls extends Controls {

	static readonly isTransformControls = true;
	static readonly type = "TransformControls";
	size: number;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	object?: Object3D;
	dragging: boolean;
	active: boolean;
	space: string;
	activeMode: 'translate' | 'rotate' | 'scale' | '';
	activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'XYZX' | 'XYZY' | 'XYZZ' | 'E' | '';
	translationSnap: number;
	rotationSnap: number;
	scaleSnap: number;
	minGrazingAngle: number;
	FADE_EPS: number;
	FADE_FACTOR: number;
	private readonly _pointStart;
	private readonly _pointEnd;
	private readonly _offset;
	private readonly _startNorm;
	private readonly _endNorm;
	private readonly _startMatrix;
	private readonly _endMatrix;
	private readonly _offsetMatrix;
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
	private readonly _tempVector;
	private readonly _tempQuaternion;
	private readonly _targetColor;
	private readonly _dirX;
	private readonly _dirY;
	private readonly _dirZ;
	private readonly _dirVector;
	private readonly _identityQuaternion;
	private _helper;
	protected readonly _plane: Plane;
	constructor();
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
