import { Vector3, Vector4, Euler, Mesh, Line, LineBasicMaterial, MeshBasicMaterial } from 'three';
import { ControlsBase, AnyCameraType } from './Base';

export declare const helperMaterial: MeshBasicMaterial;

export declare const helperLineMaterial: LineBasicMaterial;

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

export declare class Helper extends ControlsBase {

	sizeAttenuation: number;
	constructor( camera: AnyCameraType, domElement: HTMLElement, helperMap?: [Mesh | Line, HelperGeometrySpec][] );
	dispose(): void;
	decomposeMatrices(): void;

}
