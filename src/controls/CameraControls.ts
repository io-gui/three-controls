import { Vector3, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { Controls, CHANGE_EVENT } from './Controls';

// Internal variables
const cameraTargets = new WeakMap();

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
 * - Developers can start and stop per-frame function invocations via `private startAnimation( callback )` and `stopAnimation( callback )`.
 * 
 * ### Controls Livecycle ###
 * 
 * - Adds/removes event listeners during lifecycle and on `enabled` property change.
 * - Stops current animations when `enabled` property is set to `false`.
 * - Takes care of the event listener cleanup when `dipose()` method is called.
 * - Emits lyfecycle events: "enabled", "disabled", "dispose"
 */


/**
 * `Controls`: Generic superclass for interactive viewport controls.
 * `ControlsMixin` applied to `EventDispatcher`.
 */
export class CameraControls extends Controls {
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
      this.dispatchEvent( CHANGE_EVENT );
      return target;
    }
    target.copy = ( value: Vector3 ) => {
      Vector3.prototype.copy.call( target, value );
      if ( this.enabled && this.lookAtTarget ) this.camera.lookAt( target );
      this.dispatchEvent( CHANGE_EVENT );
      return target;
    }
    setTimeout( () => {
      if ( this.enabled && this.lookAtTarget ) this.camera.lookAt( target );
      this.dispatchEvent( CHANGE_EVENT );
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
    this.dispatchEvent( CHANGE_EVENT );
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
