import { MOUSE } from "../../three/src/Three";
import { Controls, Pointer, Camera } from "./Controls.js";

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
	private _keyState;
	constructor( camera: Camera, domElement: HTMLElement );
	onTrackedPointerDown( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedPointerMove( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedKeyChange( code: number, codes: number[] ): void;
	private _rotateCamera;
	private _zoomCamera;
	private _panCamera;

}

export { TrackballControls };

//# sourceMappingURL=TrackballControls.d.ts.map
