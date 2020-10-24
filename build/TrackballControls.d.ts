import { MOUSE, PerspectiveCamera, OrthographicCamera } from "../../three";
import { Controls, Pointer } from "./Controls.js";

declare class TrackballControls extends Controls {

	rotateSpeed: number;
	zoomSpeed: number;
	panSpeed: number;
	noRotate: boolean;
	noZoom: boolean;
	noPan: boolean;
	minDistance: number;
	maxDistance: number;
	keys: number[];
	mouseButtons: {
		LEFT: MOUSE;
		MIDDLE: MOUSE;
		RIGHT: MOUSE;
	};
	_keyState: number;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	_onContextMenu( event: Event ): void;
	_onWheel( event: WheelEvent ): void;
	onTrackedPointerDown( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedPointerMove( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedKeyChange( code: number, codes: number[] ): void;
	_rotateCamera(): void;
	_zoomCamera(): void;
	_panCamera(): void;

}

export { TrackballControls };
