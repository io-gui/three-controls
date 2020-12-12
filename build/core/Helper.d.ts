import { Vector3, Vector4, Euler, Mesh, Line, LineBasicMaterial, MeshBasicMaterial } from 'three';
import { Base } from './Base';
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
export declare class Helper extends Base {
    constructor(helperMap?: [Mesh | Line, HelperGeometrySpec][]);
}
