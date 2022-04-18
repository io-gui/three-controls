import { Vector2, Vector3, Vector4, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { ControlsInteractive } from './ControlsInteractive.js';
import { AnyCameraType } from './ControlsBase.js';

const STATES = new WeakMap();

/**
 * `ControlsCamera`: Generic superclass for interactive camera controls.
 */
export class ControlsCamera extends ControlsInteractive {
  frustumCulled = false;
  constructor(camera: AnyCameraType, domElement: HTMLElement) {
    super(camera, domElement);
    Object.defineProperty(this, 'camera', {
      get() {
        return camera;
      },
      set(newCamera: AnyCameraType) {
        const oldCamera = camera;
        camera = newCamera;
        newCamera !== oldCamera && this.cameraChanged(newCamera, oldCamera);
      }
   });
    this.cameraChanged(camera);
  }
  cameraChanged(newCamera: AnyCameraType, oldCamera?: AnyCameraType) {
    if (newCamera && oldCamera) {
      const oldState = STATES.get(oldCamera) || new CameraState(oldCamera, this);
      STATES.set(oldCamera, oldState.update(oldCamera, this));
    }
    const newState = STATES.get(newCamera) || new CameraState(newCamera, this);
    STATES.set(newCamera, newState.apply(newCamera, this));
  }
  // Saves camera state for later reset.
  saveCameraState() {
    const camera = this.camera as AnyCameraType;
    const state = STATES.get(camera) || new CameraState(camera, this);
    STATES.set(camera, state.update(camera, this));
  }
  // Resets camera state from saved reset state.
  resetCameraState() {
    const camera = this.camera as AnyCameraType;
    const state = STATES.get(camera) || new CameraState(camera, this);
    STATES.set(camera, state.apply(camera, this));
    this.dispatchEvent({ type: 'change'});
  }
  // Deprecation warning.
  saveState() {
    console.warn('THREE.Controls: "saveState" is now "saveCameraState"!');
    this.saveCameraState();
  }
  // Deprecation warning.
  reset() {
    console.warn('THREE.Controls: "reset" is now "resetCameraState"!');
    this.resetCameraState();
  }
}

class CameraState {
  private readonly quaternion = new Quaternion();
  private readonly position = new Vector3();
  private readonly up = new Vector3();
  private readonly target = new Vector3();
  private readonly lens = new Vector2();
  private readonly bounds = new Vector4();
  constructor(camera: AnyCameraType, controls: ControlsCamera) {
    this.update(camera, controls);
  }
  update(camera: AnyCameraType, controls: ControlsCamera): this {
    this.quaternion.copy(camera.quaternion);
    this.position.copy(camera.position);
    this.up.copy(camera.up);
    this.target.copy(controls.position);
    if (camera instanceof PerspectiveCamera) {
      this.lens.set(camera.zoom, camera.focus);
    }
    if (camera instanceof OrthographicCamera) {
      this.lens.set(camera.zoom, 0);
      this.bounds.set(camera.top, camera.right, camera.bottom, camera.left);
    }
    return this;
  }
  apply(camera: AnyCameraType, controls: ControlsCamera): this {
    camera.quaternion.copy(this.quaternion);
    camera.position.copy(this.position);
    camera.up.copy(this.up);
    controls.position.copy(this.target);
    camera.lookAt(controls.position);
    if (camera instanceof PerspectiveCamera) {
      camera.zoom = this.lens.x;
      camera.focus = this.lens.y;
      camera.updateProjectionMatrix();
    }
    if (camera instanceof OrthographicCamera) {
      camera.zoom = this.lens.x;
      camera.top = this.bounds.x;
      camera.right = this.bounds.y;
      camera.bottom = this.bounds.z;
      camera.left = this.bounds.w;
      camera.updateProjectionMatrix();
    }
    return this;
  }
}