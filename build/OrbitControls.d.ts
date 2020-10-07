import { MOUSE, TOUCH, Vector3 } from "../../three/src/Three";
import { Controls, Pointer, CenterPointer, Callback, Camera } from "./Controls.js";

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
	autoRotateSpeed: number;
	autoRotate: boolean;
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
	private _spherical;
	private _autoRotationMagnitude;
	private _interacting;
	constructor( camera: Camera, domElement: HTMLElement );
	getPolarAngle(): number;
	getAzimuthalAngle(): number;
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
	_autoRotate( timeDelta: number ): void;
	_applyRotateMovement( movement: Vector3 ): void;
	addEventListener( type: string, listener: Callback ): void;

}

export { OrbitControls };

//# sourceMappingURL=OrbitControls.d.ts.map
