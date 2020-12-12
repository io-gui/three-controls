import { Vector2, Vector3, Vector4, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls, Viewport } from './Controls';
import { EVENT, AnyCameraType } from './Base';

const STATES = new WeakMap();

/**
 * `CameraControls`: Generic superclass for interactive camera controls.
 */
export class CameraControls extends Controls {
  viewport: Viewport;
  frustumCulled = false;
  constructor( camera: AnyCameraType, domElement: HTMLElement ) {
    super();
    if ( camera && !(camera instanceof PerspectiveCamera) && !(camera instanceof OrthographicCamera) ) {
      console.error(`THREE.CameraControls: Unsuported camera type: ${camera.constructor.name}`);
    }
    if ( domElement && !(domElement instanceof HTMLElement) ) {
      console.error(`THREE.CameraControls: Unsuported domElement: ${domElement}`);
    }
    this.viewport = {
      domElement: domElement,
      camera: camera,
    }
  }
  viewportChanged( newViewport: Viewport, oldViewport: Viewport ) {
    super.viewportChanged( newViewport, oldViewport );
    if ( oldViewport && oldViewport.camera ) {
      const oldState = STATES.get( oldViewport.camera ) || new CameraState( oldViewport.camera, this );
      STATES.set( oldViewport.camera, oldState.update( oldViewport.camera, this ) );
    }
    const newState = STATES.get( newViewport.camera ) || new CameraState( newViewport.camera, this );
    STATES.set( newViewport.camera, newState.apply( newViewport.camera, this ) );
    this.dispatchEvent( EVENT.CHANGE );
  }
  // Saves camera state for later reset.
  saveCameraState() {
    const camera = this.viewport.camera as AnyCameraType;
    const state = STATES.get( camera ) || new CameraState( camera, this );
    STATES.set( camera, state.update( camera, this ) );
  }
  // Resets camera state from saved reset state.
  resetCameraState() {
    const camera = this.viewport.camera as AnyCameraType;
    const state = STATES.get( camera ) || new CameraState( camera, this );
    STATES.set( camera, state.apply( camera, this ) );
    this.dispatchEvent( EVENT.CHANGE );
  }
  // Deprecation warning.
  saveState() {
    console.warn( 'THREE.Controls: "saveState" is now "saveCameraState"!' );
    this.saveCameraState();
  }
  // Deprecation warning.
  reset() {
    console.warn( 'THREE.Controls: "reset" is now "resetCameraState"!' );
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
  constructor( camera: AnyCameraType, controls: CameraControls ) {
    this.update( camera, controls );
  }
  update( camera: AnyCameraType, controls: CameraControls ): this {
    this.quaternion.copy( camera.quaternion );
    this.position.copy( camera.position );
    this.up.copy( camera.up );
    this.target.copy( controls.position );
    if ( camera instanceof PerspectiveCamera ) {
      this.lens.set( camera.zoom, camera.focus );
    }
    if ( camera instanceof OrthographicCamera ) {
      this.lens.set( camera.zoom, 0 );
      this.bounds.set( camera.top, camera.right, camera.bottom, camera.left );
    }
    return this;
  }
  apply( camera: AnyCameraType, controls: CameraControls ): this {
    camera.quaternion.copy( this.quaternion );
    camera.position.copy( this.position );
    camera.up.copy( this.up );
    controls.position.copy( this.target );
    camera.lookAt( controls.position );
    if ( camera instanceof PerspectiveCamera ) {
      camera.zoom = this.lens.x;
      camera.focus = this.lens.y;
      camera.updateProjectionMatrix();
    }
    if ( camera instanceof OrthographicCamera ) {
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