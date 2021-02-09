import { Vector3, Vector4, Euler, Mesh, LineSegments } from 'three';
import { ControlsBase, AnyCameraType } from './ControlsBase';
import { HelperMaterial } from './HelperMaterial';

export declare const helperMaterial: HelperMaterial;

export interface HelperGeometrySpec {
	type: string;
	axis: string;
	color: Vector4;
	position?: Vector3;
	rotation?: Euler;
	scale?: Vector3;
	thickness?: number;
	outlineThickness?: number;
	tag?: string;
}

export declare class ControlsHelper extends ControlsBase {

	sizeAttenuation: number;
	constructor( camera: AnyCameraType, domElement: HTMLElement, helperMap?: [Mesh | LineSegments, HelperGeometrySpec][] );
	dispose(): void;
	decomposeMatrices(): void;

}
