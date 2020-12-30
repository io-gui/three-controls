import { Mesh } from 'three';
import { AnyCameraType } from './core/ControlsBase';
import { ControlsHelper } from './core/ControlsHelper';

export declare class TransformHelper extends ControlsHelper {

	static readonly isTransformHelper = true;
	static readonly type = "TransformHelper";
	enabled: boolean;
	size: number;
	space: 'world' | 'local';
	activeMode: string;
	activeAxis: string;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showE: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	dampingFactor: number;
	AXIS_HIDE_TRESHOLD: number;
	PLANE_HIDE_TRESHOLD: number;
	AXIS_FLIP_TRESHOLD: number;
	private readonly _tempMatrix;
	private readonly _dirVector;
	private readonly _tempQuaternion;
	private readonly _tempQuaternion2;
	private readonly _tempColor;
	constructor( camera: AnyCameraType, domElement: HTMLElement );
	changed(): void;
	updateHandle( handle: Mesh ): void;
	_animate( timestep: number ): void;
	updateMatrixWorld(): void;

}