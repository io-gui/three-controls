import { Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Raycaster, Ray, MathUtils } from 'three';
import { AnyCameraType } from './ControlsBase';

// Keeps pointer movement data in 2D space
class Pointer2D {
  readonly start: Vector2 = new Vector2();
  readonly current: Vector2 = new Vector2();
  readonly previous: Vector2 = new Vector2();
  private readonly _movement: Vector2 = new Vector2();
  private readonly _offset: Vector2 = new Vector2();
  get movement(): Vector2 {
    return this._movement.copy(this.current).sub(this.previous);
  }
  get offset(): Vector2 {
    return this._offset.copy(this.current).sub(this.start);
  }
  constructor(x = 0, y = 0) {
    this.set(x, y);
  }
  set(x: number, y: number): this {
    this.start.set(x, y);
    this.current.set(x, y);
    this.previous.set(x, y);
    return this;
  }
  update(x: number, y: number): this {
    this.previous.copy(this.current);
    this.current.set(x, y);
    return this;
  }
  updateByInertia(damping: number): this {
    this.update(this.current.x + this.movement.x * damping, this.current.y + this.movement.y * damping);
    return this;
  }
}

// Keeps pointer movement data in 3D space
class Pointer3D {
  readonly start: Vector3 = new Vector3();
  readonly current: Vector3 = new Vector3();
  readonly previous: Vector3 = new Vector3();
  private readonly _movement: Vector3 = new Vector3();
  private readonly _offset: Vector3 = new Vector3();
  get movement(): Vector3 {
    return this._movement.copy(this.current).sub(this.previous);
  }
  get offset(): Vector3 {
    return this._offset.copy(this.current).sub(this.start);
  }
  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }
  set(x: number, y: number, z: number): this {
    this.start.set(x, y, z);
    this.current.set(x, y, z);
    this.previous.set(x, y, z);
    return this;
  }
  update(x: number, y: number, z: number): this {
    this.previous.copy(this.current);
    this.current.set(x, y, z);
    return this;
  }
  updateByInertia(damping: number): this {
    this.update(this.current.x + this.movement.x * damping, this.current.y + this.movement.y * damping, this.current.z + this.movement.z * damping);
    return this;
  }
}

// Keeps pointer movement data in 6D space
class Pointer6D {
  readonly start: Ray = new Ray();
  readonly current: Ray = new Ray();
  readonly previous: Ray = new Ray();
  private readonly _movement: Ray = new Ray();
  private readonly _offset: Ray = new Ray();
  get movement(): Ray {
    this._movement.origin.copy(this.current.origin).sub(this.previous.origin);
    this._movement.direction.copy(this.current.direction).sub(this.previous.direction);
    return this._movement;
  }
  get offset(): Ray {
    this._offset.origin.copy(this.current.origin).sub(this.start.origin);
    this._offset.direction.copy(this.current.direction).sub(this.start.direction);
    return this._offset;
  }
  private readonly _intersection = new Vector3();
  private readonly _origin = new Vector3();
  private readonly _direction = new Vector3();
  private readonly _axis = new Vector3();
  private readonly _raycaster = new Raycaster();
  private readonly _projected = new Pointer3D();
  constructor(origin = new Vector3(), direction = new Vector3()) {
    this.set(origin, direction);
  }
  set(origin: Vector3, direction: Vector3): this {
    this.start.set(origin, direction);
    this.current.set(origin, direction);
    this.previous.set(origin, direction);
    return this;
  }
  update(origin: Vector3, direction: Vector3) {
    this.previous.copy(this.current);
    this.current.set(origin, direction);
  }
  updateByViewPointer(camera: AnyCameraType, viewPointer: Pointer2D): this {
    if (camera instanceof PerspectiveCamera) {
      this.start.origin.setFromMatrixPosition(camera.matrixWorld);
      this.start.direction.set(viewPointer.start.x, viewPointer.start.y, 0.5).unproject(camera).sub(this.start.origin).normalize();
      this.current.origin.setFromMatrixPosition(camera.matrixWorld);
      this.current.direction.set(viewPointer.current.x, viewPointer.current.y, 0.5).unproject(camera).sub(this.current.origin).normalize();
      this.previous.origin.setFromMatrixPosition(camera.matrixWorld);
      this.previous.direction.set(viewPointer.previous.x, viewPointer.previous.y, 0.5).unproject(camera).sub(this.previous.origin).normalize();
    } else if (camera instanceof OrthographicCamera) {
      this.start.origin.set(viewPointer.start.x, viewPointer.start.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
      this.start.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
      this.current.origin.set(viewPointer.current.x, viewPointer.current.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
      this.current.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
      this.previous.origin.set(viewPointer.previous.x, viewPointer.previous.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
      this.previous.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
    } else {
      this.start.origin.setFromMatrixPosition(camera.matrixWorld);
      this.start.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
      this.current.origin.setFromMatrixPosition(camera.matrixWorld);
      this.current.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
      this.previous.origin.setFromMatrixPosition(camera.matrixWorld);
      this.previous.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
    }
    return this;
  }
  updateByInertia(damping: number): this {
    this._origin.set(
      this.current.origin.x + this.movement.origin.x * damping,
      this.current.origin.y + this.movement.origin.y * damping,
      this.current.origin.z + this.movement.origin.z * damping
   );
    this._direction.set(
      this.current.direction.x + this.movement.direction.x * damping,
      this.current.direction.y + this.movement.direction.y * damping,
      this.current.direction.z + this.movement.direction.z * damping
   );
    this.update(this._origin, this._direction);
    return this;
  }
  projectOnPlane(plane: Plane, minGrazingAngle = 30): Pointer3D {
    // Avoid projecting onto a plane at grazing angles 
    const _rayStart = new Ray().copy(this.start);
    const _rayCurrent = new Ray().copy(this.current);
    const _rayPrevious = new Ray().copy(this.previous);

    _rayStart.direction.normalize();
    _rayCurrent.direction.normalize();
    _rayPrevious.direction.normalize();

    const angleStart =  Math.PI / 2 - _rayStart.direction.angleTo(plane.normal);
    const angleCurrent =  Math.PI / 2 - _rayCurrent.direction.angleTo(plane.normal);

    // Grazing angle avoidance algorithm which prevents extreme transformation changes when principal transformation axis is sharply aligned with the camera.
    if (minGrazingAngle && Math.abs(angleCurrent) < Math.abs(angleStart)) {
      const minAngle = MathUtils.DEG2RAD * minGrazingAngle;
      const correctionAngle = Math.abs(angleStart) > minAngle ? 0 : (- angleStart + (angleStart >= 0 ? minAngle : - minAngle));
      this._axis.copy(_rayStart.direction).cross(plane.normal).normalize();
      this._raycaster.set(_rayStart.origin, _rayStart.direction);
      this._raycaster.ray.intersectPlane(plane, this._intersection);

      _rayStart.origin.sub(this._intersection).applyAxisAngle(this._axis, correctionAngle).add(this._intersection);
      _rayStart.direction.applyAxisAngle(this._axis, correctionAngle);
      _rayCurrent.origin.sub(this._intersection).applyAxisAngle(this._axis, correctionAngle).add(this._intersection);
      _rayCurrent.direction.applyAxisAngle(this._axis, correctionAngle);
      _rayPrevious.origin.sub(this._intersection).applyAxisAngle(this._axis, correctionAngle).add(this._intersection);
      _rayPrevious.direction.applyAxisAngle(this._axis, correctionAngle);
    }

    this._raycaster.set(_rayStart.origin, _rayStart.direction);
    this._raycaster.ray.intersectPlane(plane, this._projected.start);
    this._raycaster.set(_rayCurrent.origin, _rayCurrent.direction);
    this._raycaster.ray.intersectPlane(plane, this._projected.current);
    this._raycaster.set(_rayPrevious.origin, _rayPrevious.direction);
    this._raycaster.ray.intersectPlane(plane, this._projected.previous);

    return this._projected;
  }
}

/**
 * Track pointer movements and handles coordinate conversions to various 2D and 3D spaces.
 * It handles pointer raycasting to various 3D planes at camera's target position.
 */
export class PointerTracker {
  get button(): number {
    switch (this.buttons) {
      case 1: return 0;
      case 2: return 2;
      case 4: return 1;
      default: return -1;
    }
  }
  buttons = 0;
  altKey = false;
  ctrlKey = false;
  metaKey = false;
  shiftKey = false;
  domElement: HTMLElement;
  pointerId: number;
  type: string;
  timestamp: number;
  // Used to distinguish a special "simulated" pointer used to actuate inertial gestures with damping.
  isSimulated = false;
  // 2D pointer with coordinates in view-space ([-1...1] range)
  readonly view: Pointer2D = new Pointer2D();
  // 6D pointer with coordinates in world-space (origin, direction)
  readonly ray: Pointer6D = new Pointer6D();

  camera: AnyCameraType;
  private readonly _viewCoord = new Vector2();
  private readonly _intersection = new Vector3();
  private readonly _raycaster = new Raycaster();
  private readonly _intersectedObjects: Array<Intersection> = [];
  private readonly _viewOffset = Object.freeze(new Vector2(1, -1));
  private readonly _viewMultiplier = new Vector2();
  private readonly _origin = new Vector3();
  private readonly _direction = new Vector3();
  constructor(pointerEvent: PointerEvent, camera: AnyCameraType) {
    this.buttons = pointerEvent.buttons;
    this.altKey = pointerEvent.altKey;
    this.ctrlKey = pointerEvent.ctrlKey;
    this.metaKey = pointerEvent.metaKey;
    this.shiftKey = pointerEvent.shiftKey;
    this.domElement = pointerEvent.target as HTMLElement;
    this.pointerId = pointerEvent.pointerId;
    this.type = pointerEvent.type;

    this.camera = camera;
    this.timestamp = Date.now();

    // Get view-space pointer coords from PointerEvent data and domElement size.
    const rect = this.domElement.getBoundingClientRect();
    this._viewCoord.set(pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top);
    this._viewMultiplier.set(this.domElement.clientWidth / 2, - 1 * this.domElement.clientHeight / 2);
    this._viewCoord.divide(this._viewMultiplier).sub(this._viewOffset);
    this.view.set(this._viewCoord.x, this._viewCoord.y);
    this.ray.updateByViewPointer(camera, this.view);
  }
  // Updates the pointer with the lastest pointerEvent and camera.
  update(pointerEvent: PointerEvent, camera: AnyCameraType) {
    debug: {
      if (this.pointerId !== pointerEvent.pointerId) {
        console.error('Invalid pointerId!');
        return;
      }
    }
    this.camera = camera;
    this.domElement = pointerEvent.target as HTMLElement;
    this.timestamp = Date.now();
    // Get view-space pointer coords from PointerEvent data and domElement size.
    const rect = this.domElement.getBoundingClientRect();
    this._viewCoord.set(pointerEvent.clientX - rect.left, pointerEvent.clientY - rect.top);
    this._viewMultiplier.set(this.domElement.clientWidth / 2, - 1 * this.domElement.clientHeight / 2);
    this._viewCoord.divide(this._viewMultiplier).sub(this._viewOffset);
    this.view.update(this._viewCoord.x, this._viewCoord.y);
    this.ray.updateByViewPointer(camera, this.view);
  }
  setByXRController(controller: Object3D) {
    this.timestamp = Date.now();
    this._viewCoord.set(0, 0)
    this.view.set(this._viewCoord.x, this._viewCoord.y);
    this.ray.updateByViewPointer(controller, this.view);
  }
  updateByXRController(controller: Object3D) {
    this.timestamp = Date.now();
    this._viewCoord.set(this.domElement.clientWidth / 2, this.domElement.clientHeight / 2);
    this.view.update(this._viewCoord.x, this._viewCoord.y);
    this._origin.setFromMatrixPosition(controller.matrixWorld);
    this._direction.set(0, 0, - 1).transformDirection(controller.matrixWorld);
    this.ray.update(this._origin, this._direction);
  }
  // Simmulates inertial movement by applying damping to previous movement. For special **simmulated** pointer only!
  simmulateDamping(dampingFactor: number, deltaTime: number): void {
    debug: {
      if (!this.isSimulated) {
        console.error('Cannot invoke `simmulateDamping()` on non-simmulated PointerTracker!');
      }
    }
    if (!this.isSimulated) return;
    const damping = Math.pow(1 - dampingFactor, deltaTime * 60 / 1000);
    this.view.updateByInertia(damping);
    this.ray.updateByViewPointer(this.camera, this.view);
  }
  // Projects tracked pointer onto a plane object-space.
  projectOnPlane(plane: Plane, minGrazingAngle?: number): Pointer3D {
    return this.ray.projectOnPlane(plane, minGrazingAngle);
  }
  // Intersects specified objects with **current** view-space pointer vector.
  intersectObjects(objects: Object3D[]): Intersection[] {
    this._raycaster.set(this.ray.current.origin, this.ray.current.direction);
    this._intersectedObjects.length = 0;
    this._raycaster.layers.mask = objects[0].layers.mask;
    this._raycaster.intersectObjects(objects, true, this._intersectedObjects);
    return this._intersectedObjects;
  }
  // Intersects specified plane with **current** view-space pointer vector.
  intersectPlane(plane: Plane): Vector3 {
    this._raycaster.set(this.ray.current.origin, this.ray.current.direction);
    this._raycaster.ray.intersectPlane(plane, this._intersection);
    return this._intersection;
  }
  // Clears pointer movement
  clearMovement(): void {
    this.view.previous.copy(this.view.current);
    this.ray.previous.copy(this.ray.current);
  }
}

// Virtual "center" pointer tracker for multi-touch gestures.
// TODO: test!
export class CenterPointerTracker extends PointerTracker {
  // Array of pointers to calculate centers from
  private _pointers: PointerTracker[] = [];
  private readonly _projected = new Pointer3D();
  constructor(pointerEvent: PointerEvent, camera: AnyCameraType) {
    super(pointerEvent, camera);
    // Set center pointer read-only "type" and "pointerId" properties.
    Object.defineProperties(this, {
      type: { value: 'virtual' },
      pointerId: { value: -1 },
   })
    const view = new Pointer2D();
    Object.defineProperty(this, 'view', {
      get: () => {
        view.set(0, 0);
        for (let i = 0; i < this._pointers.length; i++) {
          view.start.add(this._pointers[i].view.start);
          view.current.add(this._pointers[i].view.current);
          view.previous.add(this._pointers[i].view.previous);
        }
        if (this._pointers.length > 1) {
          view.start.divideScalar(this._pointers.length);
          view.current.divideScalar(this._pointers.length);
          view.previous.divideScalar(this._pointers.length);
        }
        return view;
      }
   });
    const ray = new Pointer6D();
    Object.defineProperty(this, 'ray', {
      get: () => {
        ray.updateByViewPointer(this.camera, this.view);
        return ray;
      }
   });
  }
  projectOnPlane(plane: Plane, minGrazingAngle?: number): Pointer3D {
    this._projected.set(0, 0, 0);
    for (let i = 0; i < this._pointers.length; i++) {
      const projected = this._pointers[i].projectOnPlane(plane, minGrazingAngle);
      this._projected.start.add(projected.start);
      this._projected.current.add(projected.current);
      this._projected.previous.add(projected.previous);
    }
    if (this._pointers.length > 1) {
      this._projected.start.divideScalar(this._pointers.length);
      this._projected.current.divideScalar(this._pointers.length);
      this._projected.previous.divideScalar(this._pointers.length);
    }
    return this._projected;
  }
  updateCenter(pointers: PointerTracker[]): void {
    this._pointers = pointers;
  }
}