import { Vector2, Vector3, Plane, Intersection, Object3D, Ray } from 'three';
import { AnyCameraType } from './ControlsBase';
declare class Pointer2D {
    readonly start: Vector2;
    readonly current: Vector2;
    readonly previous: Vector2;
    private readonly _movement;
    private readonly _offset;
    get movement(): Vector2;
    get offset(): Vector2;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
    update(x: number, y: number): this;
    updateByInertia(damping: number): this;
}
declare class Pointer3D {
    readonly start: Vector3;
    readonly current: Vector3;
    readonly previous: Vector3;
    private readonly _movement;
    private readonly _offset;
    get movement(): Vector3;
    get offset(): Vector3;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    update(x: number, y: number, z: number): this;
    updateByInertia(damping: number): this;
}
declare class Pointer6D {
    readonly start: Ray;
    readonly current: Ray;
    readonly previous: Ray;
    private readonly _movement;
    private readonly _offset;
    get movement(): Ray;
    get offset(): Ray;
    private readonly _intersection;
    private readonly _origin;
    private readonly _direction;
    private readonly _axis;
    private readonly _raycaster;
    private readonly _projected;
    constructor(origin?: Vector3, direction?: Vector3);
    set(origin: Vector3, direction: Vector3): this;
    update(origin: Vector3, direction: Vector3): void;
    updateByViewPointer(camera: AnyCameraType, viewPointer: Pointer2D): this;
    updateByInertia(damping: number): this;
    projectOnPlane(plane: Plane, minGrazingAngle?: number): Pointer3D;
}
/**
 * Track pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export declare class PointerTracker {
    get button(): number;
    buttons: number;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    domElement: HTMLElement;
    pointerId: number;
    type: string;
    timestamp: number;
    isSimulated: boolean;
    readonly view: Pointer2D;
    readonly ray: Pointer6D;
    camera: AnyCameraType;
    private readonly _viewCoord;
    private readonly _intersection;
    private readonly _raycaster;
    private readonly _intersectedObjects;
    private readonly _viewOffset;
    private readonly _viewMultiplier;
    private readonly _origin;
    private readonly _direction;
    constructor(pointerEvent: PointerEvent, camera: AnyCameraType);
    update(pointerEvent: PointerEvent, camera: AnyCameraType): void;
    setByXRController(controller: Object3D): void;
    updateByXRController(controller: Object3D): void;
    simmulateDamping(dampingFactor: number, deltaTime: number): void;
    projectOnPlane(plane: Plane, minGrazingAngle?: number): Pointer3D;
    intersectObjects(objects: Object3D[]): Intersection[];
    intersectPlane(plane: Plane): Vector3;
    clearMovement(): void;
}
export declare class CenterPointerTracker extends PointerTracker {
    private _pointers;
    private readonly _projected;
    constructor(pointerEvent: PointerEvent, camera: AnyCameraType);
    projectOnPlane(plane: Plane, minGrazingAngle?: number): Pointer3D;
    updateCenter(pointers: PointerTracker[]): void;
}
export {};
//# sourceMappingURL=Pointers.d.ts.map