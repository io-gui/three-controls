import { Vector3, Vector4, Euler, Quaternion, WebGLRenderer, Scene, Mesh, Line, Camera, PerspectiveCamera, OrthographicCamera, LineBasicMaterial, MeshBasicMaterial } from 'three';

export declare const gizmoMaterial: MeshBasicMaterial;

export declare const gizmoLineMaterial: LineBasicMaterial;

export interface ControlsHelperGeometrySpec {
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

export declare class ControlsHelper extends Mesh {

	camera: PerspectiveCamera | OrthographicCamera;
	eye: Vector3;
	protected readonly _cameraPosition: Vector3;
	protected readonly _cameraQuaternion: Quaternion;
	protected readonly _cameraScale: Vector3;
	protected readonly _position: Vector3;
	constructor( gizmoMap?: [Mesh | Line, ControlsHelperGeometrySpec][] );
	onBeforeRender: ( renderer: WebGLRenderer, scene: Scene, camera: Camera ) => void;
	updateMatrixWorld(): void;

}
