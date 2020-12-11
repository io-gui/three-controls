import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls } from './Controls';
import { EVENT } from './Base';

// Internal variables
const cameraTargets = new WeakMap();

/**
 * `CameraControls`: Generic superclass for interactive camera controls.
 */
export class CameraControls extends Controls {
  eye = new Vector3();
  target = new Vector3();
  lookAtTarget = true;
  // Internal utility variables
  private readonly _resetQuaternion = new Quaternion();
  private readonly _resetPosition = new Vector3();
  private readonly _resetUp = new Vector3();
  private readonly _resetTarget = new Vector3();
  private _resetZoom = 1;
  private _resetFocus = 1;
  constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );

    // Save initial camera state
    this.saveCameraState();

    const eye = new Vector3();
    Object.defineProperty( this, 'eye', {
      get: () => eye.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize()
    });

    // Camera target used for camera controls and pointer view -> world space conversion. 
    const target = cameraTargets.get( this.camera ) || cameraTargets.set( this.camera, new Vector3() ).get( this.camera );
    // TODO encode target in camera matrix + focus?
    // Optional target/lookAt eg. Dragcontrols, TransformControls
    Object.defineProperty( this, 'target', {
      get: () => {
        return target;
      },
      set: ( value ) => {
        target.copy( value );
      }
    });
    target.set = ( x: number, y: number, z: number ) => {
      Vector3.prototype.set.call( target, x, y, z );
      if ( this.enabled && this.lookAtTarget ) this.camera.lookAt( target );
      this.dispatchEvent( EVENT.CHANGE );
      return target;
    }
    target.copy = ( value: Vector3 ) => {
      Vector3.prototype.copy.call( target, value );
      if ( this.enabled && this.lookAtTarget ) this.camera.lookAt( target );
      this.dispatchEvent( EVENT.CHANGE );
      return target;
    }
    setTimeout( () => {
      if ( this.enabled && this.lookAtTarget ) this.camera.lookAt( target );
      this.dispatchEvent( EVENT.CHANGE );
    } );
  }
  // Saves camera state for later reset.
  saveCameraState() {
    this._resetQuaternion.copy( this.camera.quaternion );
    this._resetPosition.copy( this.camera.position );
    this._resetUp.copy( this.camera.up );
    this._resetTarget.copy( this.target );
    this._resetZoom = this.camera.zoom;
    if ( this.camera instanceof PerspectiveCamera ) {
      this._resetFocus = this.camera.focus;
    }
  }
  // Resets camera state from saved reset state.
  resetCameraState() {
    this.camera.quaternion.copy( this._resetQuaternion );
    this.camera.position.copy( this._resetPosition );
    this.camera.up.copy( this._resetUp );
    this.target.copy( this._resetTarget );
    this.camera.zoom = this._resetZoom;
    if ( this.camera instanceof PerspectiveCamera ) {
      this.camera.focus = this._resetFocus;
    }
    this.camera.updateProjectionMatrix();
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
