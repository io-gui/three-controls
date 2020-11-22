import {
	MOUSE, TOUCH, Vector3, Spherical, PerspectiveCamera, OrthographicCamera
} from 'three';
import {
	PointerTracker, Callback
} from './Controls';
import {
	CameraControls
} from './CameraControls';

declare class OrbitControls extends CameraControls {

	minDistance: number;
	maxDistance: number;
	minZoom: number;
	maxZoom: number;
	minPolarAngle: number;
	maxPolarAngle: number;
	minAzimuthAngle: number;
	maxAzimuthAngle: number;
	enableZoom: boolean;
	zoomSpeed: number;
	enableRotate: boolean;
	rotateSpeed: number;
	enablePan: boolean;
	panSpeed: number;
	screenSpacePanning: boolean;
	keyPanSpeed: number;
	autoRotate: boolean;
	autoRotateSpeed: number;
	enableKeys: boolean;
	keys: {
		LEFT: number;
		UP: number;
		RIGHT: number;
		BOTTOM: number;
	};
	mouseButtons: {
		LEFT: MOUSE;
		MIDDLE: MOUSE;
		RIGHT: MOUSE;
	};
	touches: {
		ONE: TOUCH;
		TWO: TOUCH;
	};
	_spherical: Spherical;
	_autoRotationMagnitude: number;
	_interacting: boolean;
	constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement );
	getPolarAngle(): number;
	getAzimuthalAngle(): number;
	addEventListener( type: string, listener: Callback ): void;
	_onContextMenu( event: Event ): void;
	_onWheel( event: WheelEvent ): void;
	_onKeyDown( event: KeyboardEvent ): void;
	onTrackedPointerDown( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	onTrackedPointerMove( pointer: PointerTracker, pointers: PointerTracker[], center: PointerTracker ): void;
	onTrackedPointerUp( pointer: PointerTracker, pointers: PointerTracker[] ): void;
	_pointerDolly( pointer: PointerTracker ): void;
	_twoPointerDolly( pointers: PointerTracker[] ): void;
	_applyDollyMovement( dollyMovement: number ): void;
	_pointerPan( pointer: PointerTracker ): void;
	_keydownPan( deltaX: number, deltaY: number ): void;
	_applyPanMovement( movement: Vector3 ): void;
	_pointerRotate( pointer: PointerTracker ): void;
	_autoRotateChanged(): void;
	_autoRotateAnimation( deltaTime: number ): void;
	_applyRotateMovement( movement: Vector3 ): void;

}

export { OrbitControls };
