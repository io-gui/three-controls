import { Mesh, Line, BoxBufferGeometry, CylinderBufferGeometry, BufferGeometry } from 'three';
import { ControlsHelper, ControlsHelperGeometrySpec } from './ControlsHelper';

export declare const CircleGeometry: ( radius: number, arc: number ) => BufferGeometry;

export declare const scaleHandleGeometry: BoxBufferGeometry;

export declare const arrowGeometry: CylinderBufferGeometry;

export declare const lineGeometry: BufferGeometry;

export declare const squareLineGeometry: BufferGeometry;

export declare const cornerLineGeometry: BufferGeometry;

export declare const translateHelperGeometrySpec: [Mesh | Line, ControlsHelperGeometrySpec][];

export declare const rotateHelperGeometrySpec: [Mesh | Line, ControlsHelperGeometrySpec][];

export declare const scaleHelperGeometrySpec: [Mesh | Line, ControlsHelperGeometrySpec][];

export declare class TransformHelper extends ControlsHelper {

	readonly isTransformHelper = true;
	type: string;
	enabled: boolean;
	activeMode: 'translate' | 'rotate' | 'scale' | '';
	activeAxis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'E' | '';
	size: number;
	showX: boolean;
	showY: boolean;
	showZ: boolean;
	showTranslate: boolean;
	showRotate: boolean;
	showScale: boolean;
	sizeAttenuation: number;
	constructor();
	updateHandle( handle: Mesh ): void;
	updateMatrixWorld(): void;

}
