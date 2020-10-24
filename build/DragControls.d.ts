import { Object3D } from "../../three";
import { PerspectiveCamera, OrthographicCamera } from "../../three";
import { Controls, Pointer } from "./Controls.js";

export declare class DragControls extends Controls {

	objects: Object3D[];
	transformGroup: boolean;
	constructor( objects: Object3D[], camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	onTrackedPointerHover( pointer: Pointer ): void;
	onTrackedPointerDown( pointer: Pointer ): void;
	onTrackedPointerMove( pointer: Pointer ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;

}
