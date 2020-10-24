import { Vector2, Vector3, Plane, Intersection, Object3D, PerspectiveCamera, OrthographicCamera, Raycaster, EventDispatcher, Event as ThreeEvent, Quaternion } from "../../three";

/* eslint-disable @typescript-eslint/no-use-before-define */

// Internal variables
const EPS = 0.00001;
const PI = Math.PI;
const HPI = PI / 2;

// Common reusable types
export type Callback = (callbackValue?: any) => void;

// Common reusable events
export const CHANGE_EVENT: ThreeEvent = {type: 'change'};
export const START_EVENT: ThreeEvent = {type: 'start'};
export const END_EVENT: ThreeEvent = {type: 'end'};

// onChange property decorator. Helps setting up property change handler functions.
export function onChange(onChangeFunc: string, onChangeToFalsyFunc?: string) {
  return (target: any, propertyKey: string) => { 
    const values = new WeakMap();  
    Object.defineProperty(target, propertyKey, {
      set(newValue: any) {
        Object.defineProperty(this, propertyKey, {
          get() {
            return values.get(this);
          },
          set(newValue: any) {
            const oldValue = values.get(this);
            values.set(this, newValue);
            if (oldValue !== undefined && newValue !== oldValue) {
              (newValue || !onChangeToFalsyFunc) ? this[onChangeFunc]() : this[onChangeToFalsyFunc]();
              this.dispatchEvent({type: propertyKey + '-changed', value: newValue });
            }
          }
        });
        this[propertyKey] = newValue;
      }
    }); 
  }
}

type Constructor<TBase extends any> = new (...args: any[]) => TBase;

/**
 * `ControlsMixin`: Generic mixin for interactive threejs viewport controls.
 * It solves some of the most common and complex problems in threejs control designs.
 * 
 * ### Pointer Tracking ###
 *
 * - Captures most relevant pointer and keyboard events and fixes some platform-specific bugs and discrepancies.
 * - Serves as a proxy dispatcher for pointer and keyboard events:
 *   "contextmenu", "wheel", "pointerdown", "pointermove", "pointerup", "pointerleave", "pointerover", "pointerenter", "pointerout", "pointercancel", "keydown", "keyup"
 * - Tracks active pointer gestures and evokes pointer event handler functions with tracked pointer data:
 *   `onTrackedPointerDown`, `onTrackedPointerMove`, `onTrackedPointerHover`, `onTrackedPointerUp`
 * - Enables inertial behaviours via simmulated pointer with framerate-independent damping.
 * - Tracks active key presses and evokes key event handler functions with currently pressed key data:
 *   `onTrackedKeyDown`, `onTrackedKeyUp`, `onTrackedKeyChange`
 *
 * ### Internal Update and Animation Loop ###
 * 
 * - Removes the necessity to call `.update()` method externally from external animation loop for damping calculations.
 * - Developers can start and stop per-frame function invocations via `private startAnimation(callback)` and `stopAnimation(callback)`.
 * 
 * ### Controls Livecycle ###
 * 
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */
export function ControlsMixin<T extends Constructor<any>>(base: T) {
  class MixinClass extends base {
    // Public API
    camera: PerspectiveCamera | OrthographicCamera;
    domElement: HTMLElement;
    target = new Vector3();
    @onChange('_connect', '_disconnect')
    enabled = true;
    enableDamping = false;
    dampingFactor = 0.05;
    // Tracked pointers and keys
    // @onChange('asd', 'asda')
    _simulatedPointer: Pointer | null = null;
    _hover: Pointer | null = null;
    _center: CenterPointer | null = null;
    _pointers: Pointer[] = [];
    _animations: Callback[] = [];
    _keys: number[] = [];
    // Internal utility variables
    _resetQuaternion = new Quaternion();
    _resetPosition = new Vector3();
    _resetUp = new Vector3();
    _resetTarget = new Vector3();
    _resetZoom = 1;
    _resetFocus = 1;

    constructor(...args: any[]) {
      super(...args);

      this.camera = args[0];
      this.domElement = args[1];

      // Runtime contructor arguments check 
      if (this.camera === undefined) console.warn('THREE.Controls: "camera" parameter is now mandatory!');
      if (!(this.camera instanceof PerspectiveCamera) && !(this.camera instanceof OrthographicCamera)) console.warn('THREE.Controls: Unsupported camera type!');
      if (this.domElement === undefined) console.warn('THREE.Controls: "domElement" parameter is now mandatory!');
      if (this.domElement === document as unknown) console.error('THREE.Controls: "domElement" should be "renderer.domElement"!');

      // Camera target used for camera controls and pointer view -> world space conversion. 
      const target = new Vector3();
      // TODO encode target in camera matrix + focus?
      Object.defineProperty(this, 'target', {
        get: () => {
          return target;
        },
        set: (value) => {
          target.copy(value);
        }
      });
      target.set = (x, y, z) => {
        Vector3.prototype.set.call(target, x, y, z);
        this.camera.lookAt(target);
        this.dispatchEvent(CHANGE_EVENT);
        return target;
      }
      target.copy = (value) => {
        Vector3.prototype.copy.call(target, value);
        this.camera.lookAt(target);
        this.dispatchEvent(CHANGE_EVENT);
        return target;
      }
      target.set(0, 0, 0);

      // Save initial camera state
      this.saveCameraState();
      // Bind handler functions
      this._onContextMenu = this._onContextMenu.bind(this);
      this._onWheel = this._onWheel.bind(this);
      this._onPointerDown = this._onPointerDown.bind(this);
      this._onPointerMove = this._onPointerMove.bind(this);
      this._onPointerSimulation = this._onPointerSimulation.bind(this);
      this._onPointerUp = this._onPointerUp.bind(this);
      this._onPointerLeave = this._onPointerLeave.bind(this);
      this._onPointerCancel = this._onPointerCancel.bind(this);
      this._onPointerOver = this._onPointerOver.bind(this);
      this._onPointerEnter = this._onPointerEnter.bind(this);
      this._onPointerOut = this._onPointerOut.bind(this);
      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp = this._onKeyUp.bind(this);
      this._connect = this._connect.bind(this);
      this._disconnect = this._disconnect.bind(this);
      // Perform initial `connect()`
      this._connect();
    }

    // Internal utility methods

    startAnimation(callback: Callback) {
      const index = this._animations.findIndex(animation => animation === callback);
      if (index === -1) this._animations.push(callback);
      AnimationManagerSingleton.add(callback);
    }
    
    stopAnimation(callback: Callback) {
      const index = this._animations.findIndex(animation => animation === callback);
      if (index !== -1) this._animations.splice(index, 1);
      AnimationManagerSingleton.remove(callback);
    }

    // Internal lyfecycle methods

    _connect() {
      this.domElement.addEventListener('contextmenu', this._onContextMenu, false);
      this.domElement.addEventListener('wheel', this._onWheel, {capture: false, passive: false});
      this.domElement.addEventListener('pointerdown', this._onPointerDown, false);
      this.domElement.addEventListener('pointermove', this._onPointerMove, false);
      this.domElement.addEventListener('pointerleave', this._onPointerLeave, false);
      this.domElement.addEventListener('pointercancel', this._onPointerCancel, false);
      this.domElement.addEventListener('pointerover', this._onPointerOver, false);
      this.domElement.addEventListener('pointerenter', this._onPointerEnter, false);
      this.domElement.addEventListener('pointerout', this._onPointerOut, false);
      this.domElement.addEventListener('pointerup', this._onPointerUp, false);
      this.domElement.addEventListener('keydown', this._onKeyDown, false);
      this.domElement.addEventListener('keyup', this._onKeyUp, false);
      // make sure element can receive keys.
      if (this.domElement.tabIndex === - 1) {
        this.domElement.tabIndex = 0;
      }
      // make sure element has disabled touch-actions.
      if (window.getComputedStyle(this.domElement).touchAction !== 'none') {
        this.domElement.style.touchAction = 'none';
      }
      // TODO: consider reverting "tabIndex" and "style.touchAction" attributes on disconnect.
    }

    _disconnect() {
      this.domElement.removeEventListener('contextmenu', this._onContextMenu, false);
      // TODO: investigate typescript bug?
      (this.domElement as any).removeEventListener('wheel', this._onWheel, {capture: false, passive: false});
      this.domElement.removeEventListener('pointerdown', this._onPointerDown, false);
      this.domElement.removeEventListener('pointermove', this._onPointerMove, false);
      this.domElement.removeEventListener('pointerleave', this._onPointerLeave, false);
      this.domElement.removeEventListener('pointercancel', this._onPointerCancel, false);
      this.domElement.removeEventListener('pointerup', this._onPointerUp, false);
      this.domElement.removeEventListener('keydown', this._onKeyDown, false);
      this.domElement.removeEventListener('keyup', this._onKeyUp, false);
      // Release all captured pointers
      for (let i = 0; i < this._pointers.length; i++) {
        this.domElement.releasePointerCapture(this._pointers[i].pointerId);
      }
      // Stop all animations
      for (let i = 0; i < this._animations.length; i++) {
        this.stopAnimation(this._animations[i]);
      }
      // Clear current pointers and keys
      this._pointers.length = 0;
      this._keys.length = 0;
    }

    // Public API methods

    dispose() {
      this.enabled = false;
      this.dispatchEvent({type: 'dispose'});
    }

    addEventListener(type: string, listener: Callback) {
      // Deprecation warning
      if (type === 'enabled') {
        console.warn(`THREE.Controls: "enabled" event is now "enabled-changed"!`);
        type = 'enabled-changed';
      }
      if (type === 'disabled') {
        console.warn(`THREE.Controls: "disabled" event is now "enabled-changed"!`);
        type = 'enabled-changed';
      }
      super.addEventListener(type, listener);
    }

    saveState() {
      console.warn('THREE.Controls: "saveState" is now "saveCameraState"!');
      this.saveCameraState();
    }

    reset() {
      console.warn('THREE.Controls: "reset" is now "resetCameraState"!');
      this.resetCameraState();
    }

    saveCameraState() {
      this._resetQuaternion.copy(this.camera.quaternion);
      this._resetPosition.copy(this.camera.position);
      this._resetUp.copy(this.camera.up);
      this._resetTarget.copy(this.target);
      this._resetZoom = this.camera.zoom;
      if (this.camera instanceof PerspectiveCamera) {
        this._resetFocus = this.camera.focus;
      }
    }

    resetCameraState() {
      this.camera.quaternion.copy(this._resetQuaternion);
      this.camera.position.copy(this._resetPosition);
      this.camera.up.copy(this._resetUp);
      this.target.copy(this._resetTarget);
      this.camera.zoom = this._resetZoom;
      if (this.camera instanceof PerspectiveCamera) {
        this.camera.focus = this._resetFocus;
      }
      this.camera.updateProjectionMatrix();
      this.dispatchEvent(CHANGE_EVENT);
    }

    dispatchEvent(event: ThreeEvent | Event) {
      Object.defineProperty(event, 'target', {writable: true});
      super.dispatchEvent(event);
    }

    // Event handlers

    _onContextMenu(event: Event) {
      this.dispatchEvent(event);
    }

    _onWheel(event: WheelEvent) {
      this.dispatchEvent(event);
    }

    _onPointerDown(event: PointerEvent) {
      if (this._simulatedPointer) this._simulatedPointer = null;
      this.domElement.focus ? this.domElement.focus() : window.focus();
      this.domElement.setPointerCapture(event.pointerId);
      const pointers = this._pointers;
      const pointer = new Pointer(event, this.camera, this.target);
      pointers.push(pointer);
      this.onTrackedPointerDown(pointer, pointers);
      this.dispatchEvent(event);
    }

    _onPointerMove(event: PointerEvent) {
      const pointers = this._pointers;
      const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
      let pointer = pointers[index];
      if (pointer) {
        pointer.update(event, this.camera, this.target);
        const x = Math.abs(pointer.view.current.x);
        const y = Math.abs(pointer.view.current.y);
        // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1131348
        if (pointer.button !== 0 && (x > 1 || x < 0 || y > 1 || y < 0)) {
          pointers.splice(index, 1);
          this.domElement.releasePointerCapture(event.pointerId);
          this.dispatchEvent(event);
          this.onTrackedPointerUp(pointer, pointers);
          return;
        }
        /**
          * TODO: investigate multi-poiter movement accumulation and unhack.
          * This shouldn't be necessary yet without it, multi pointer gestures result with 
          * multiplied movement values. TODO: investigate and unhack.
          * */
        for (let i = 0; i < pointers.length; i++) {
          if (pointer.pointerId !== pointers[i].pointerId) {
            pointers[i]._clearMovement();
          }
        }
        this._center = this._center || new CenterPointer(event, this.camera, this.target);
        this._center.updateCenter(event, this.camera, this.target, pointers);
        // TODO: consider throttling once per frame. On Mac pointermove fires up to 120 Hz.
        this.onTrackedPointerMove(pointer, pointers, this._center);
      } else if (this._hover && this._hover.pointerId === event.pointerId) {
        pointer = this._hover;
        pointer.update(event, this.camera, this.target);
        this.onTrackedPointerHover(pointer, [pointer]);
      } else {
        pointer = this._hover = new Pointer(event, this.camera, this.target);
        this.onTrackedPointerHover(pointer, [pointer]);
      }
      // Fix MovementX/Y for Safari
      Object.defineProperty(event, 'movementX', {writable: true, value: pointer.canvas.movement.x});
      Object.defineProperty(event, 'movementY', {writable: true, value: pointer.canvas.movement.y});
      this.dispatchEvent(event);
    }

    _onPointerSimulation(timeDelta: number) {
      if (this._simulatedPointer) {
        const pointer = this._simulatedPointer;
        pointer.applyDamping(this.dampingFactor, timeDelta);
        if (pointer.canvas.movement.length() > EPS) {
          this.onTrackedPointerMove(pointer, [pointer], pointer as CenterPointer);
        } else {
          this.onTrackedPointerUp(pointer, []);
          this._simulatedPointer = null
        }
      } else {
        this.stopAnimation(this._onPointerSimulation as Callback);
      }
    }

    _onPointerUp(event: PointerEvent) {
      // TODO: three-finger drag on Mac producing delayed pointerup.
      const pointers = this._pointers;
      const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
      const pointer = pointers[index];
      if (pointer) {
        pointers.splice(index, 1);
        this.domElement.releasePointerCapture(event.pointerId);
        if (this.enableDamping) {
          this._simulatedPointer = pointer;
          this._simulatedPointer.isSimulated = true;
          this.startAnimation(this._onPointerSimulation as Callback);
        } else {
          this.onTrackedPointerUp(pointer, pointers);
        }
      }
      this.dispatchEvent(event);
    }

    _onPointerLeave(event: PointerEvent) {
      const pointers = this._pointers;
      const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
      const pointer = pointers[index];
      if (pointer) {
        pointers.splice(index, 1);
        this.domElement.releasePointerCapture(event.pointerId);
        this.onTrackedPointerUp(pointer, pointers);
      }
      this.dispatchEvent(event);
    }

    _onPointerCancel(event: PointerEvent) {
      const pointers = this._pointers;
      const index = pointers.findIndex(pointer => pointer.pointerId === event.pointerId);
      const pointer = pointers[index];
      if (pointer) {
        pointers.splice(index, 1);
        this.domElement.releasePointerCapture(event.pointerId);
        this.onTrackedPointerUp(pointer, pointers);
      }
      this.dispatchEvent(event);
    }

    _onPointerOver(event: PointerEvent) {
      this.dispatchEvent(event);
    }

    _onPointerEnter(event: PointerEvent) {
      this.dispatchEvent(event);
    }

    _onPointerOut(event: PointerEvent) {
      this.dispatchEvent(event);
    }

    _onKeyDown(event: KeyboardEvent) {
      const code = Number(event.code);
      const keys = this._keys;
      const index = keys.findIndex(key => key === code);
      if (index === -1) keys.push(code);
      if (!event.repeat) {
        this.onTrackedKeyDown(code, keys);
        this.onTrackedKeyChange(code, keys);
      }
      this.dispatchEvent(event);
    }

    _onKeyUp(event: KeyboardEvent) {
      const code = Number(event.code);
      const keys = this._keys;
      const index = keys.findIndex(key => key === code);
      if (index !== -1) keys.splice(index, 1);
      this.onTrackedKeyUp(code, keys);
      this.onTrackedKeyChange(code, keys);
      this.dispatchEvent(event);
    }

    // Tracked pointer handlers

    /* eslint-disable @typescript-eslint/no-empty-function */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    onTrackedPointerDown(_pointer: Pointer, _pointers: Pointer[]) {}
    onTrackedPointerMove(_pointer: Pointer, _pointers: Pointer[], _center: CenterPointer) {}
    onTrackedPointerHover(_pointer: Pointer, _pointers: Pointer[]) {}
    onTrackedPointerUp(_pointer: Pointer, _pointers: Pointer[]) {}
    onTrackedKeyDown(code: number, codes: number[]) {}
    onTrackedKeyUp(code: number, codes: number[]) {}
    onTrackedKeyChange(code: number, codes: number[]) {}
    /* eslint-enable @typescript-eslint/no-empty-function */
    /* eslint-enable @typescript-eslint/no-unused-vars */
    /* eslint-enable no-unused-vars */
  }
  return MixinClass;
}

/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export class Controls extends ControlsMixin(EventDispatcher as any) {
  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super(camera, domElement);
  }
}

const raycaster = new Raycaster();
const intersectedObjects: Array<Intersection> = [];
const intersectedPoint = new Vector3();

// Pointer class to keep track of pointer movements

const viewMultiplier = new Vector2();
const viewOffset = new Vector2();
const plane = new Plane();
const unitY = new Vector3(0, 1, 0);
const eye0 = new Vector3();

class Pointer2D {
  start: Vector2 = new Vector2();
  current: Vector2 = new Vector2();
  previous: Vector2 = new Vector2();
  movement: Vector2 = new Vector2();
  offset: Vector2 = new Vector2();
  constructor(x: number, y: number) {
    this.start.set(x, y);
    this.current.set(x, y);
    this.previous.set(x, y);
  }
  set(x: number, y: number): this {
    this.start.set(x, y);
    this.current.set(x, y);
    this.previous.set(x, y);
    this.movement.set(x, y);
    this.offset.set(x, y);
    return this;
  }
  add(pointer: Pointer2D): this {
    this.start.add(pointer.start);
    this.current.add(pointer.current);
    this.previous.add(pointer.previous);
    this.movement.add(pointer.movement);
    this.offset.add(pointer.offset);
    return this;
  }
  copy(pointer: Pointer2D): this {
    this.start.copy(pointer.start);
    this.current.copy(pointer.current);
    this.previous.copy(pointer.previous);
    this.movement.copy(pointer.movement);
    this.offset.copy(pointer.offset);
    return this;
  }
  divideScalar(value: number): this {
    this.start.divideScalar(value);
    this.current.divideScalar(value);
    this.previous.divideScalar(value);
    this.movement.divideScalar(value);
    this.offset.divideScalar(value);
    return this;
  }
  update(x: number, y: number): this {
    this.previous.copy(this.current);
    this.current.set(x, y);
    this.movement.copy(this.current).sub(this.previous);
    this.offset.copy(this.current).sub(this.start);
    return this;
  }
  // Converts pointer coordinates from "canvas" space (pixels) to "view" space (-1, 1).
  convertToViewSpace(domElement: HTMLElement): this {
    viewMultiplier.set(domElement.clientWidth / 2, - 1 * domElement.clientHeight / 2);
    viewOffset.set(1, -1);
    this.start.divide(viewMultiplier).sub(viewOffset);
    this.current.divide(viewMultiplier).sub(viewOffset);
    this.previous.divide(viewMultiplier).sub(viewOffset);
    this.movement.divide(viewMultiplier);
    this.offset.divide(viewMultiplier);
    return this;
  }
}

class Pointer3D {
  start: Vector3 = new Vector3();
  current: Vector3 = new Vector3();
  previous: Vector3 = new Vector3();
  movement: Vector3 = new Vector3();
  offset: Vector3 = new Vector3();
  constructor(x: number, y: number, z: number) {
    this.set(x, y, z);
  }
  set(x: number, y: number, z: number): this {
    this.start.set(x, y, z);
    this.current.set(x, y, z);
    this.previous.set(x, y, z);
    this.movement.set(x, y, z);
    this.offset.set(x, y, z);
    return this;
  }
  add(pointer: Pointer3D): this {
    this.start.add(pointer.start);
    this.current.add(pointer.current);
    this.previous.add(pointer.previous);
    this.movement.add(pointer.movement);
    this.offset.add(pointer.offset);
    return this;
  }
  divideScalar(value: number): this {
    this.start.divideScalar(value);
    this.current.divideScalar(value);
    this.previous.divideScalar(value);
    this.movement.divideScalar(value);
    this.offset.divideScalar(value);
    return this;
  }
  fromView(viewPointer: Pointer2D, camera: PerspectiveCamera | OrthographicCamera, plane: Plane): this {
    intersectedPoint.set(0, 0, 0);
    raycaster.setFromCamera(viewPointer.start, camera);
    raycaster.ray.intersectPlane(plane, intersectedPoint);
    this.start.copy(intersectedPoint);

    intersectedPoint.set(0, 0, 0);
    raycaster.setFromCamera(viewPointer.current, camera);
    raycaster.ray.intersectPlane(plane, intersectedPoint);
    this.current.copy(intersectedPoint);

    intersectedPoint.set(0, 0, 0);
    raycaster.setFromCamera(viewPointer.previous, camera);
    raycaster.ray.intersectPlane(plane, intersectedPoint);
    this.previous.copy(intersectedPoint);

    this.movement.copy(this.current).sub(this.previous);
    this.offset.copy(this.current).sub(this.start);
    return this;
  }
}

const virtualCameras = new WeakMap();

export class Pointer {
  domElement: HTMLElement;
  pointerId: number;
  type: string;
  isSimulated = false;

  buttons: number;
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  canvas: Pointer2D;
  view: Pointer2D;
  world: Pointer3D;
  planar: Pointer3D;

  _camera: PerspectiveCamera | OrthographicCamera;
  _target: Vector3;

  constructor(pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera, target: Vector3) {
    this._camera = camera;
    this._target = target;

    this.domElement = pointerEvent.target as HTMLElement;

    this.pointerId = pointerEvent.pointerId;
    this.type = pointerEvent.pointerType;

    this.button = pointerEvent.button;
    this.buttons = pointerEvent.buttons;

    this.altKey = pointerEvent.altKey;
    this.ctrlKey = pointerEvent.ctrlKey;
    this.metaKey = pointerEvent.metaKey;
    this.shiftKey = pointerEvent.shiftKey;

    this.canvas = new Pointer2D(pointerEvent.clientX, pointerEvent.clientY);

    const view = this.view = new Pointer2D(0, 0);
    const world = this.world = new Pointer3D(0, 0, 0);
    const planar = this.planar = new Pointer3D(0, 0, 0);

    Object.defineProperty(this, 'view', {
      get: () => {
        return view.copy(this.canvas).convertToViewSpace(this.domElement);
      }
    });
    Object.defineProperty(this, 'world', {
      get: () => {
        plane.setFromNormalAndCoplanarPoint(eye0.set(0, 0, 1).applyQuaternion(this._camera.quaternion).normalize(), this._target);
        return world.fromView(this.view, this._camera, plane);
      }
    });
    Object.defineProperty(this, 'planar', {
      get: () => {
        plane.setFromNormalAndCoplanarPoint(unitY, this._target);
        eye0.set(0, 0, 1).applyQuaternion(this._camera.quaternion);

        const angle =  HPI - eye0.angleTo(unitY);
        const minAngle = ((this._camera instanceof PerspectiveCamera) ? (this._camera.fov / 2) : 30) / 180 * PI
        const rotationAxis = eye0.cross(unitY).normalize();

        let virtualCamera = virtualCameras.get(this._camera);
        if (!virtualCamera) virtualCameras.set(this._camera, virtualCamera = this._camera.clone());

        virtualCamera.copy(this._camera);

        const rp = new Vector3().setFromMatrixPosition(virtualCamera.matrixWorld).sub(this._target);
        if (Math.abs(angle) < minAngle) rp.applyAxisAngle(rotationAxis, - angle + (angle >= 0 ? minAngle : - minAngle));

        virtualCamera.position.copy(rp).add(this._target);
        virtualCamera.lookAt(this._target);
        virtualCamera.updateMatrixWorld();

        return planar.fromView(this.view, virtualCamera, plane);
      }
    });
  }

  update(pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera, target: Vector3) {
    if (this.pointerId !== pointerEvent.pointerId) {
      console.error('Invalid pointerId!');
      return;
    }
    this._camera = camera;
    this._target = target;

    this.buttons = pointerEvent.buttons;

    this.altKey = pointerEvent.altKey;
    this.ctrlKey = pointerEvent.ctrlKey;
    this.metaKey = pointerEvent.metaKey;
    this.shiftKey = pointerEvent.shiftKey;

    this.canvas.update(pointerEvent.clientX, pointerEvent.clientY);
  }

  applyDamping(dampingFactor: number, deltaTime: number) {
    const damping = Math.pow(1 - dampingFactor, deltaTime * 60 / 1000);
    this.canvas.update(this.canvas.current.x + this.canvas.movement.x * damping, this.canvas.current.y + this.canvas.movement.y * damping);
  }

  intersectObjects(objects: Object3D[]): Intersection[] {
    raycaster.setFromCamera(this.view.current, this._camera);
    intersectedObjects.length = 0;
    raycaster.intersectObjects(objects, true, intersectedObjects);
    return intersectedObjects;
  }

  intersectPlane(plane: Plane): Vector3 {
    raycaster.setFromCamera(this.view.current, this._camera);
    raycaster.ray.intersectPlane(plane, intersectedPoint);
    return intersectedPoint;
  }

  // TODO: unhack
  _clearMovement() {
    this.canvas.previous.copy(this.canvas.current);
    this.canvas.movement.set(0, 0);
  }
}

// Virtual "center" pointer
export class CenterPointer extends Pointer {
  _pointers: Pointer[] = [];
  constructor(pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera, target: Vector3) {
    super(pointerEvent, camera, target);

    this.pointerId = -1;
    this.type = 'virtual';

    this.button = -1;
    this.buttons = -1;

    this.altKey = pointerEvent.altKey;
    this.ctrlKey = pointerEvent.ctrlKey;
    this.metaKey = pointerEvent.metaKey;
    this.shiftKey = pointerEvent.shiftKey;

    const canvas = new Pointer2D(0, 0);
    const view = new Pointer2D(0, 0);
    const world = new Pointer3D(0, 0, 0);
    const planar = new Pointer3D(0, 0, 0);

    Object.defineProperty(this, 'canvas', {
      get: () => {
        canvas.set(0, 0);
        for (let i = 0; i < this._pointers.length; i++) canvas.add(this._pointers[i].canvas);
        if (this._pointers.length > 1) canvas.divideScalar(this._pointers.length);
        return canvas;
      }
    });
    Object.defineProperty(this, 'view', {
      get: () => {
        view.set(0, 0);
        for (let i = 0; i < this._pointers.length; i++) view.add(this._pointers[i].view);
        if (this._pointers.length > 1) view.divideScalar(this._pointers.length);
        return view;
      }
    });
    Object.defineProperty(this, 'world', {
      get: () => {
        world.set(0, 0, 0);
        for (let i = 0; i < this._pointers.length; i++) world.add(this._pointers[i].world);
        if (this._pointers.length > 1) world.divideScalar(this._pointers.length);
        return world;
      }
    });
    Object.defineProperty(this, 'planar', {
      get: () => {
        planar.set(0, 0, 0);
        for (let i = 0; i < this._pointers.length; i++) planar.add(this._pointers[i].planar);
        if (this._pointers.length > 1) planar.divideScalar(this._pointers.length);
        return planar;
      }
    });
  }
  // Calculates center points from all pointers
  updateCenter(pointerEvent: PointerEvent, camera: PerspectiveCamera | OrthographicCamera, target: Vector3, pointers: Pointer[]) {
    this._camera = camera;
    this._target = target;

    this.altKey = pointerEvent.altKey;
    this.ctrlKey = pointerEvent.ctrlKey;
    this.metaKey = pointerEvent.metaKey;
    this.shiftKey = pointerEvent.shiftKey;

    this._pointers = pointers;
  }
}

/**
 * Internal animation manager.
 * It runs requestAnimationFrame loop as long as there are animation callbacks in its internal queue. 
 */
class AnimationManager {
  private _queue: Callback[] = [];
  private _running = false;
  private _time = performance.now();
  constructor() {
    this._update = this._update.bind(this);
  }

  // Adds animation callback to the queue
  add(callback: Callback) {
    const index = this._queue.indexOf(callback);
    if (index === -1) {
      this._queue.push(callback);
      if (this._queue.length === 1) this._start();
    }
  }

  // Removes animation callback from the queue
  remove(callback: Callback) {
    const index = this._queue.indexOf(callback);
    if (index !== -1) {
      this._queue.splice(index, 1);
      if (this._queue.length === 0) this._stop();
    }
  }

  private _start() {
    this._time = performance.now();
    this._running = true;
    requestAnimationFrame(this._update);
  }

  private _stop() {
    this._running = false;
  }

  private _update() {
    if (this._queue.length === 0) {
      this._running = false;
      return;
    }
    if (this._running) requestAnimationFrame(this._update);
    const time = performance.now();
    const timestep = performance.now() - this._time;
    this._time = time;
    for (let i = 0; i < this._queue.length; i++) {
      this._queue[i](timestep);
    }
  }
}

// Singleton animation manager.
const AnimationManagerSingleton = new AnimationManager();