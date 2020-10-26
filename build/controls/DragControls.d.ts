import { Object3D, PerspectiveCamera, OrthographicCamera } from "../../../three";
import { Controls, Pointer } from "./Controls.js";

export declare class DragControls extends Controls {

	lookAtTarget: boolean;
	objects: Object3D[];
	transformGroup: boolean;
	constructor( objects: Object3D[], camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	onTrackedPointerHover( pointer: Pointer ): void;
	onTrackedPointerDown( pointer: Pointer ): void;
	onTrackedPointerMove( pointer: Pointer ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;

}
