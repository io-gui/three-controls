import { Object3D } from "../../../src/Three";
import { Controls, Pointer, Camera } from "./Controls.js";

export declare class DragControls extends Controls {

	objects: Object3D[];
	transformGroup: boolean;
	constructor( objects: Object3D[], camera: Camera, domElement: HTMLElement );
	onTrackedPointerHover( pointer: Pointer ): void;
	onTrackedPointerDown( pointer: Pointer ): void;
	onTrackedPointerMove( pointer: Pointer ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;

}
