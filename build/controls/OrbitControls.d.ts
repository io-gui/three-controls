import { MOUSE, TOUCH, Vector3, Spherical, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls, Pointer, CenterPointer, Callback } from './Controls';

declare class OrbitControls extends Controls {

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
	onTrackedPointerDown( pointer: Pointer, pointers: Pointer[] ): void;
	onTrackedPointerMove( pointer: Pointer, pointers: Pointer[], center: CenterPointer ): void;
	onTrackedPointerUp( pointer: Pointer, pointers: Pointer[] ): void;
	_pointerDolly( pointer: Pointer ): void;
	_twoPointerDolly( pointers: Pointer[] ): void;
	_applyDollyMovement( dollyMovement: number ): void;
	_pointerPan( pointer: Pointer ): void;
	_keydownPan( deltaX: number, deltaY: number ): void;
	_applyPanMovement( movement: Vector3 ): void;
	_pointerRotate( pointer: Pointer ): void;
	_autoRotateChanged(): void;
	_autoRotateAnimation( deltaTime: number ): void;
	_applyRotateMovement( movement: Vector3 ): void;

}

export { OrbitControls };
