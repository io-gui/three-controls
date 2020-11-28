import { MOUSE, Vector2, Vector3, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { PointerTracker, CONTROL_CHANGE_EVENT, CONTROL_START_EVENT, CONTROL_END_EVENT } from './Controls';
import { CameraControls } from './CameraControls';

const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };

const _eye = new Vector3();

const _rotationMagnitude = new Vector2();
const _zoomMagnitude = new Vector2();
const _panMagnitude = new Vector3();

// TODO: make sure events are always fired in right order ( start > change > end )

// Temp variables

const _axis = new Vector3();
const _quaternion = new Quaternion();
const _eyeDirection = new Vector3();
const _cameraUpDirection = new Vector3();
const _cameraSidewaysDirection = new Vector3();
const _moveDirection = new Vector3();

class TrackballControls extends CameraControls {
  // Public API
  rotateSpeed = 1.0;
  zoomSpeed = 1.2;
  panSpeed = 1.0;
  noRotate = false;
  noZoom = false;
  noPan = false;
  minDistance = 0;
  maxDistance = Infinity;
  keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
  mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

  // Internal utility variables
  _keyState = STATE.NONE;

  constructor( camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement ) {
    super( camera, domElement );

    // Deprecation warnings
    Object.defineProperty( this, 'staticMoving', {
      set: value => {
        console.warn( `THREE.TrackballControls: "staticMoving" has been renamed to "enableDamping".` );
        this.enableDamping = ! value;
      }
    });
    Object.defineProperty( this, 'dynamicDampingFactor', {
      set: value => {
        console.warn( 'THREE.TrackballControls: "dynamicDampingFactor" is now "dampingFactor"!' );
        this.dampingFactor = value;
      }
    });
    this.update = () => {
      console.warn( 'THREE.TrackballControls: update() has been deprecated.' );
    }
    this.handleResize = () => {
      console.warn( 'THREE.TrackballControls: handleResize() has been deprecated.' );
    }
  }

  // Event handlers

  _onContextMenu( event: Event ) {
    super._onContextMenu( event );
    event.preventDefault();
  }

  _onWheel( event: WheelEvent ) {
    super._onWheel( event );
    if ( this.noZoom === true ) return;
    event.preventDefault();
    event.stopPropagation();
    switch ( event.deltaMode ) {
      case 2:
        // Zoom in pages
        _zoomMagnitude.y -= event.deltaY * 0.025 * this.zoomSpeed;
        break;
      case 1:
        // Zoom in lines
        _zoomMagnitude.y -= event.deltaY * 0.01 * this.zoomSpeed;
        break;
      default:
        // undefined, 0, assume pixels
        _zoomMagnitude.y -= event.deltaY * 0.00025 * this.zoomSpeed;
        break;
    }
  }

  // Tracked pointer handlers

  onTrackedPointerDown( pointer: PointerTracker, pointers: PointerTracker[] ): void {
    if ( pointers.length === 1 ) {
      this.dispatchEvent( CONTROL_START_EVENT );
    }
  }

  onTrackedPointerMove( pointer: PointerTracker, pointers: PointerTracker[] ): void {
    _rotationMagnitude.set( 0, 0 );
    _zoomMagnitude.set( 0, 0 );
    _panMagnitude.set( 0, 0, 0 );
    _eye.set( 0, 0, 1 ).applyQuaternion( this.camera.quaternion ).normalize()
    this._plane.setFromNormalAndCoplanarPoint( _eye, this.target );

    const button = pointers[ 0 ].button;
    switch ( pointers.length ) {
      case 1: // 1 pointer
        if ( ( button === this.mouseButtons.LEFT || this._keyState === STATE.ROTATE ) && ! this.noRotate ) {
          _rotationMagnitude.set( pointers[ 0 ].view.movement.x, pointers[ 0 ].view.movement.y ).multiplyScalar( this.rotateSpeed );
        } else if ( ( button === this.mouseButtons.MIDDLE || this._keyState === STATE.ZOOM ) && ! this.noZoom ) {
          _zoomMagnitude.y = pointers[ 0 ].view.movement.y * this.zoomSpeed;
        } else if ( ( button === this.mouseButtons.RIGHT || this._keyState === STATE.PAN ) && ! this.noPan ) {
          _panMagnitude.copy( pointers[ 0 ].projectOnPlane( this._plane ).movement ).multiplyScalar( this.panSpeed );
        }
        break;

      default: // 2 or more pointers
        _zoomMagnitude.y = pointers[ 0 ].view.current.distanceTo( pointers[ 1 ].view.current );
        _zoomMagnitude.y -= pointers[ 0 ].view.previous.distanceTo( pointers[ 1 ].view.previous );
        _zoomMagnitude.y *= this.zoomSpeed;
        _panMagnitude.copy( pointers[ 0 ].projectOnPlane( this._plane ).movement );
        _panMagnitude.add( pointers[ 1 ].projectOnPlane( this._plane ).movement );
        _panMagnitude.multiplyScalar( this.panSpeed * 0.5 );
        break;
    }
    _eye.subVectors( this.camera.position, this.target );

    if ( ! this.noRotate ) this._rotateCamera();
    if ( ! this.noZoom ) this._zoomCamera();
    if ( ! this.noPan ) this._panCamera();

    this.camera.position.addVectors( this.target, _eye );
    this.camera.lookAt( this.target );
    this.dispatchEvent( CONTROL_CHANGE_EVENT );
  }

  onTrackedPointerUp( pointer: PointerTracker, pointers: PointerTracker[] ): void {
    if ( pointers.length === 0 ) {
      this.dispatchEvent( CONTROL_END_EVENT );
    }
  }

  onTrackedKeyChange( code: number, codes: number[] ): void {
    if ( codes.length > 0 ) {
      if ( codes[ 0 ] === this.keys[ STATE.ROTATE ] && ! this.noRotate ) {
        this._keyState = STATE.ROTATE;
      } else if ( codes[ 0 ] === this.keys[ STATE.ZOOM ] && ! this.noZoom ) {
        this._keyState = STATE.ZOOM;
      } else if ( codes[ 0 ] === this.keys[ STATE.PAN ] && ! this.noPan ) {
        this._keyState = STATE.PAN;
      }
    } else {
      this._keyState = STATE.NONE;
    }
  }

  // Internal helper functions

  _rotateCamera(): void {
    const angle = _rotationMagnitude.length();
    if ( angle ) {
      _eye.copy( this.camera.position ).sub( this.target );
      _eyeDirection.copy( _eye ).normalize();
      _cameraUpDirection.copy( this.camera.up ).normalize();
      _cameraSidewaysDirection.crossVectors( _cameraUpDirection, _eyeDirection ).normalize();
      _cameraUpDirection.setLength( _rotationMagnitude.y );
      _cameraSidewaysDirection.setLength( _rotationMagnitude.x );
      _moveDirection.copy( _cameraUpDirection.add( _cameraSidewaysDirection ) );
      _axis.crossVectors( _moveDirection, _eye ).normalize();
      _quaternion.setFromAxisAngle( _axis, angle );
      _eye.applyQuaternion( _quaternion );
      this.camera.up.applyQuaternion( _quaternion );
    }
  }

  _zoomCamera(): void {
    const factor = 1.0 - _zoomMagnitude.y;
    if ( factor !== 1.0 && factor > 0.0 ) {
      if ( this.camera instanceof PerspectiveCamera ) {
        _eye.multiplyScalar( factor );
        // Clamp min/max
        if ( _eye.lengthSq() < this.minDistance * this.minDistance ) {
          this.camera.position.addVectors( this.target, _eye.setLength( this.minDistance ) );
          _zoomMagnitude.y = 0;
        } else if ( _eye.lengthSq() > this.maxDistance * this.maxDistance ) {
          this.camera.position.addVectors( this.target, _eye.setLength( this.maxDistance ) );
          _zoomMagnitude.y = 0;
        }
      } else if ( this.camera instanceof OrthographicCamera ) {
        this.camera.zoom /= factor;
        this.camera.updateProjectionMatrix();
      } else {
        console.warn( 'THREE.TrackballControls: Unsupported camera type' );
      }
    }
  }

  _panCamera(): void {
    this.camera.position.sub( _panMagnitude );
    this.target.sub( _panMagnitude );
  }

 }

export { TrackballControls };
