import {
	MOUSE, PerspectiveCamera, OrthographicCamera
} from 'three';
import {
	PointerTracker
} from './Controls';
import {
	CameraControls
} from './CameraControls';

declare class TrackballControls extends CameraControls {

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
	onTrackedPointerDown( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	onTrackedPointerMove( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	onTrackedPointerUp( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	onTrackedKeyChange( code: number, codes: number[] ): void;
	_rotateCamera(): void;
	_zoomCamera(): void;
	_panCamera(): void;

}

export { TrackballControls };
