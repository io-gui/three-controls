import { Mesh, Vector3 } from 'three';
import { ControlsHelper } from './ControlsHelper';

export declare class TransformHelper extends ControlsHelper {

	static readonly isTransformHelper = true;
	static readonly type = "TransformHelper";
	enabled: boolean;
	size: number;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	AXIS_HIDE_TRESHOLD: number;
	PLANE_HIDE_TRESHOLD: number;
	AXIS_FLIP_TRESHOLD: number;
	protected readonly UNIT0: Readonly<Vector3>;
	protected readonly UNITX: Readonly<Vector3>;
	protected readonly UNITY: Readonly<Vector3>;
	protected readonly UNITZ: Readonly<Vector3>;
	protected _sizeAttenuation: number;
	protected readonly _cameraPosition: Vector3;
	protected readonly _position: Vector3;
	private readonly _tempMatrix;
	private readonly _dirVector;
	private readonly _tempQuaternion;
	private readonly _tempQuaternion2;
	constructor();
	updateHandle( handle: Mesh ): void;
	updateMatrixWorld(): void;

}
