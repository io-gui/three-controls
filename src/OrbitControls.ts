import { MOUSE, TOUCH, Vector3, Quaternion, Spherical, PerspectiveCamera, OrthographicCamera } from "../../three/src/Three";
import { Controls, Pointer, CenterPointer, Callback, Camera } from "./Controls.js";

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction camera.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const changeEvent = {type: 'change'};
const startEvent = {type: 'start'};
const endEvent = {type: 'end'};

let scale = 1;

// so camera.up is the orbit axis
const quat = new Quaternion();
const quatInverse = new Quaternion();
const offset = new Vector3();
const movement = new Vector3();

const twoPI = 2 * Math.PI;

class OrbitControls extends Controls {
  // How far you can dolly in and out (PerspectiveCamera only)
  minDistance = 0;
  maxDistance = Infinity;
  // How far you can zoom in and out (OrthographicCamera only)
  minZoom = 0;
  maxZoom = Infinity;
  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle = 0;
  maxPolarAngle = Math.PI;
  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with (max - min < 2 PI)
  minAzimuthAngle = - Infinity;
  maxAzimuthAngle = Infinity;
  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  enableZoom = true;
  zoomSpeed = 1;
  // Set to false to disable rotating
  enableRotate = true;
  rotateSpeed = 1;
  // Set to false to disable panning
  enablePan = true;
  panSpeed = 1;
  screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
  keyPanSpeed = 7;
  // Set to true to automatically rotate around the target
  autoRotateSpeed = 1; // 30 seconds per round when fps is 60
  autoRotate = false;
  // Set to false to disable use of the keys
  enableKeys = true;
  // The four arrow keys
  keys = {LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40};
  // Mouse buttons
  mouseButtons = {LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN};
  // Touch fingers // TODO: deprecate touches.ONE
  touches = {ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN};

  // Internal
  // current position in spherical coordinates
  private _spherical = new Spherical();
  private _autoRotationMagnitude = 0;
  private _interacting = false;
  constructor(camera: Camera, domElement: HTMLElement) {

    super(camera, domElement);

    if (!(camera instanceof PerspectiveCamera) && !(camera instanceof OrthographicCamera)) {
      console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
      this.enablePan = false;
    }

    // TODO: restart animation on disable > enable.
    this._defineProperty('autoRotate', false, value => {
      value ? (() => {
        this.startAnimation(this._autoRotate);
      })() : (() => {
        this.stopAnimation(this._autoRotate);
      })();
    });

    this._autoRotate = this._autoRotate.bind(this);

    // event handlers
    const _onContextMenu = (event: Event) => {
      event.preventDefault();
    }

    const _onKeyDown = (event: KeyboardEvent) => {
      if (this.enableKeys === false || this.enablePan === false) return;
      const code = Number(event.code);
      switch (code) {
        case this.keys.UP:
          this._keydownPan(0, this.keyPanSpeed);
          event.preventDefault();
          break;
        case this.keys.BOTTOM:
          this._keydownPan(0, - this.keyPanSpeed);
          event.preventDefault();
          break;
        case this.keys.LEFT:
          this._keydownPan(this.keyPanSpeed, 0);
          event.preventDefault();
          break;
        case this.keys.RIGHT:
          this._keydownPan(- this.keyPanSpeed, 0);
          event.preventDefault();
          break;
      }
    }

    const _onWheel = (event: WheelEvent) => {
      // TODO: test with inerial movement
      if (this.enableZoom === false) return;
      event.preventDefault();
      event.stopPropagation();
      this._applyDollyMovement(event.deltaY);
    }

    this.addEventListener('contextmenu', _onContextMenu);
    this.addEventListener('keydown', _onKeyDown);
    this.addEventListener('wheel', _onWheel);

    this.dispatchEvent(changeEvent);

    // Deprecation warnings
    Object.defineProperty(this, 'dynamicDampingFactor', {
      set: (value) => {
        console.warn('THREE.OrbitControls: "dynamicDampingFactor" is now "dampingFactor"!');
        this.dampingFactor = value;
      }
    });
    this.update = function() {
      console.warn('THREE.OrbitControls: update() has been deprecated.');
    };
  }

  // API
  getPolarAngle(): number {
    return this._spherical.phi;
  }
  getAzimuthalAngle(): number {
    return this._spherical.theta;
  }

  // Event handlers
  onTrackedPointerDown(pointer: Pointer, pointers: Pointer[]): void {
    if (pointers.length === 1) {
      this.dispatchEvent(startEvent);
    }
  }

  onTrackedPointerMove(pointer: Pointer, pointers: Pointer[], center: CenterPointer): void {
    let button = -1;
    this._interacting = true;
    switch (pointers.length) {
      case 1: // 1 pointer
        switch (pointer.button) {
          case 0:
            button = this.mouseButtons.LEFT;
            break;
          case 2:
            button = this.mouseButtons.MIDDLE;
            break;
          case 1:
            button = this.mouseButtons.RIGHT;
            break;
        }
        if (button === MOUSE.ROTATE) {
          if (pointer.ctrlKey || pointer.metaKey || pointer.shiftKey) {
            if (this.enablePan) this._pointerPan(pointer);
          } else {
            if (this.enableRotate) this._pointerRotate(pointer);
          }
        } else if (button === MOUSE.DOLLY) {
          if (this.enableZoom) this._pointerDolly(pointer);
        } else if (button === MOUSE.PAN && this.enablePan) {
          if (pointer.ctrlKey || pointer.metaKey || pointer.shiftKey) {
            if (this.enableRotate) this._pointerRotate(pointer);
          } else {
            if (this.enablePan) this._pointerPan(pointer);
          }
        }
        break;
      default: // 2 or more pointers
        switch (this.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (this.enableZoom) this._twoPointerDolly(pointers);
            if (this.enablePan) this._pointerPan(center);
            break;
          case TOUCH.DOLLY_ROTATE:
            if (this.enableZoom) this._twoPointerDolly(pointers);
            if (this.enableRotate) this._pointerRotate(center);
            break;
        }
    }
  }

  onTrackedPointerUp(pointer: Pointer, pointers: Pointer[]): void {
    if (pointers.length === 0) {
      this.dispatchEvent(endEvent);
      this._interacting = false;
    }
  }

  _pointerDolly(pointer: Pointer): void {
    this._applyDollyMovement(pointer.canvas.movement.y);
  }

  _twoPointerDolly(pointers: Pointer[]): void {
    const dist0 = pointers[ 0 ].world.current.distanceTo(pointers[ 1 ].world.current);
    const dist1 = pointers[ 0 ].world.previous.distanceTo(pointers[ 1 ].world.previous);
    this._applyDollyMovement(dist0 - dist1);

  }

  _applyDollyMovement(dollyMovement: number): void {
    scale = Math.pow(1 - dollyMovement / this.domElement.clientHeight, this.zoomSpeed);
    offset.copy(this.camera.position).sub(this.target);
    // angle from z-axis around y-axis
    this._spherical.setFromVector3(offset);
    // restrict radius to be between desired limits
    this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius * scale));
    // move target to panned location
    offset.setFromSpherical(this._spherical);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    this.dispatchEvent(changeEvent);
  }

  _pointerPan(pointer: Pointer): void {
    if (this.screenSpacePanning) {
      this._applyPanMovement(pointer.world.movement);
    } else {
      this._applyPanMovement(pointer.planar.movement);
    }
  }

  // deltaX and deltaY are in pixels; right and down are positive
  _keydownPan(deltaX: number, deltaY: number): void {
    let fovFactor = 1;
    if (this.camera instanceof PerspectiveCamera) {
      offset.copy(this.camera.position).sub(this.target);
      // half of the fov is center to top of screen. We use clientHeight only so aspect ratio does not distort speed
      fovFactor = offset.length() * Math.tan((this.camera.fov / 2) * Math.PI / 180.0) * 2 / this.domElement.clientHeight;
    } else if (this.camera instanceof OrthographicCamera) {
      fovFactor = (this.camera.top - this.camera.bottom) / this.camera.zoom / this.domElement.clientHeight;
    }
    // Pan movement up / down
    movement.set(0, 0, 0);
    if (this.screenSpacePanning === true) {
      offset.setFromMatrixColumn(this.camera.matrix, 1);
    } else {
      offset.setFromMatrixColumn(this.camera.matrix, 0);
      offset.crossVectors(this.camera.up, offset);
    }
    offset.multiplyScalar(-deltaY * fovFactor);
    movement.add(offset);
    // Pan movement left / right
    offset.setFromMatrixColumn(this.camera.matrix, 0); // get X column of objectMatrix
    offset.multiplyScalar(deltaX * fovFactor);
    movement.add(offset);
    this._applyPanMovement(movement);
  }

  _applyPanMovement(movement: Vector3): void {
    offset.copy(movement).multiplyScalar(this.panSpeed);
    this.target.sub(offset);
    this.camera.position.sub(offset);
    this.dispatchEvent(changeEvent);
  }

  _pointerRotate(pointer: Pointer): void {
    const aspect = this.domElement.clientWidth / this.domElement.clientHeight;
    movement.set(pointer.view.movement.x, pointer.view.movement.y, 0).multiplyScalar(this.rotateSpeed);
    movement.x *= aspect;
    this._applyRotateMovement(movement);
  }

  _autoRotate(timeDelta: number): void {
    // TODO: use timeDelta
    const angle = this._interacting ? 0 : 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
    if (this.enableDamping) {
      this._autoRotationMagnitude += angle * this.dampingFactor;
      this._autoRotationMagnitude *= (1 - this.dampingFactor);
    } else {
      this._autoRotationMagnitude = angle;
    }
    movement.set(this._autoRotationMagnitude, 0, 0);
    this._applyRotateMovement(movement);
  }

  _applyRotateMovement(movement: Vector3): void {
    offset.copy(this.camera.position).sub(this.target);
    // rotate offset to "y-axis-is-up" space
    quat.setFromUnitVectors(this.camera.up, new Vector3(0, 1, 0));
    quatInverse.copy(quat).inverse();
    offset.applyQuaternion(quat);
    // angle from z-axis around y-axis
    this._spherical.setFromVector3(offset);
    this._spherical.theta -= movement.x;
    this._spherical.theta -= movement.x + this._autoRotationMagnitude;
    this._spherical.phi += movement.y;
    // restrict theta to be between desired limits
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;
    if (isFinite(min) && isFinite(max)) {
      if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;
      if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;
      if (min < max) {
        this._spherical.theta = Math.max(min, Math.min(max, this._spherical.theta));
      } else {
        this._spherical.theta = (this._spherical.theta > (min + max) / 2) ?
          Math.max(min, this._spherical.theta) :
          Math.min(max, this._spherical.theta);
      }
    }
    // restrict phi to be between desired limits
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    offset.setFromSpherical(this._spherical);
    // rotate offset back to "camera-up-vector-is-up" space
    offset.applyQuaternion(quatInverse);
    this.camera.position.copy(this.target).add(offset);
    this.camera.lookAt(this.target);
    this.dispatchEvent(changeEvent);
  }

  addEventListener(type: string, listener: Callback): void {
    if (type === 'cancel') {
      console.warn(`THREE.OrbitControls: "cancel" event is deprecated. Use "enabled-changed" event instead.`);
      type = 'enabled-changed';
    }
    super.addEventListener(type, listener);
  }

}

export { OrbitControls };
