import { Mesh } from 'three';
import { AnyCameraType } from './core/Base';
import { Helper } from './core/Helper';

export declare class TransformHelper extends Helper {

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
	private readonly _tempMatrix;
	private readonly _dirVector;
	private readonly _tempQuaternion;
	private readonly _tempQuaternion2;
	constructor( camera: AnyCameraType, domElement: HTMLElement );
	updateHandle( handle: Mesh ): void;
	updateMatrixWorld(): void;

}
