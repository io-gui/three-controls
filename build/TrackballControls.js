import { MOUSE, Vector2, Vector3, Quaternion, PerspectiveCamera, OrthographicCamera } from 'three';
import { ControlsCamera } from './core/ControlsCamera.js';

const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };


// TODO: make sure events are always fired in right order (start > change > end)
class TrackballControls extends ControlsCamera {


	// Public API
	rotateSpeed = 1.0;
	zoomSpeed = 1.2;
	panSpeed = 1.0;
	noRotate = false;
	noZoom = false;
	noPan = false;
	minDistance = 0;
	maxDistance = Infinity;
	keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/];
	mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

	// Internal utility variables
	_keyState = STATE.NONE;
	_offset = new Vector3();
	_rotationMagnitude = new Vector2();
	_zoomMagnitude = new Vector2();
	_panMagnitude = new Vector3();
	_rotateAxis = new Vector3();
	_rotateQuaternion = new Quaternion();
	_cameraUpDirection = new Vector3();
	_cameraSidewaysDirection = new Vector3();
	_moveDirection = new Vector3();
	constructor( camera, domElement ) {

		super( camera, domElement );


		// Deprecation warnings
		Object.defineProperty( this, 'staticMoving', {
			set: value => {

				console.warn( `THREE.TrackballControls: "staticMoving" has been renamed to "enableDamping".` );
				this.enableDamping = ! value;

			}
		} );

		Object.defineProperty( this, 'dynamicDampingFactor', {
			set: value => {

				console.warn( 'THREE.TrackballControls: "dynamicDampingFactor" is now "dampingFactor"!' );
				this.dampingFactor = value;

			}
		} );

	}

	// Event handlers
	_onContextMenu( event ) {

		super._onContextMenu( event );
		event.preventDefault();

	}
	_onWheel( event ) {

		super._onWheel( event );

		if ( this.noZoom === true )
			return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.deltaMode ) {

			case 2:

				// Zoom in pages
				this._zoomMagnitude.y -= event.deltaY * 0.025 * this.zoomSpeed;
				break;

			case 1:

				// Zoom in lines
				this._zoomMagnitude.y -= event.deltaY * 0.01 * this.zoomSpeed;
				break;

			default:

				// undefined, 0, assume pixels
				this._zoomMagnitude.y -= event.deltaY * 0.00025 * this.zoomSpeed;
				break;

		}

	}

	// Tracked pointer handlers
	onTrackedPointerDown( pointer, pointers ) {

		if ( pointers.length === 1 ) {

			this.dispatchEvent( { type: 'start' } );

		}

	}
	onTrackedPointerMove( pointer, pointers ) {

		this._rotationMagnitude.set( 0, 0 );
		this._zoomMagnitude.set( 0, 0 );
		this._panMagnitude.set( 0, 0, 0 );
		this._plane.setFromNormalAndCoplanarPoint( this.eye, this.position );
		const button = pointers[ 0 ].button;
		const camera = this.camera;

		switch ( pointers.length ) {

			case 1: // 1 pointer
				if ( ( button === this.mouseButtons.LEFT || this._keyState === STATE.ROTATE ) && ! this.noRotate ) {

					this._rotationMagnitude.set( pointers[ 0 ].view.movement.x, pointers[ 0 ].view.movement.y ).multiplyScalar( this.rotateSpeed );

				} else if ( ( button === this.mouseButtons.MIDDLE || this._keyState === STATE.ZOOM ) && ! this.noZoom ) {

					this._zoomMagnitude.y = pointers[ 0 ].view.movement.y * this.zoomSpeed;

				} else if ( ( button === this.mouseButtons.RIGHT || this._keyState === STATE.PAN ) && ! this.noPan ) {

					this._panMagnitude.copy( pointers[ 0 ].projectOnPlane( this._plane ).movement ).multiplyScalar( this.panSpeed );

				}

				break;

			default: // 2 or more pointers
				this._zoomMagnitude.y = pointers[ 0 ].view.current.distanceTo( pointers[ 1 ].view.current );
				this._zoomMagnitude.y -= pointers[ 0 ].view.previous.distanceTo( pointers[ 1 ].view.previous );
				this._zoomMagnitude.y *= this.zoomSpeed;
				this._panMagnitude.copy( pointers[ 0 ].projectOnPlane( this._plane ).movement );
				this._panMagnitude.add( pointers[ 1 ].projectOnPlane( this._plane ).movement );
				this._panMagnitude.multiplyScalar( this.panSpeed * 0.5 );
				break;

		}

		this._offset.copy( this.cameraOffset );

		if ( ! camera )
			return;

		if ( ! this.noRotate ) {

			const angle = this._rotationMagnitude.length();

			if ( angle ) {

				this._cameraUpDirection.copy( camera.up ).normalize();
				this._cameraSidewaysDirection.crossVectors( this._cameraUpDirection, this.eye ).normalize();
				this._cameraUpDirection.setLength( this._rotationMagnitude.y );
				this._cameraSidewaysDirection.setLength( this._rotationMagnitude.x );
				this._moveDirection.copy( this._cameraUpDirection.add( this._cameraSidewaysDirection ) );
				this._rotateAxis.crossVectors( this._moveDirection, this.eye ).normalize();
				this._rotateQuaternion.setFromAxisAngle( this._rotateAxis, angle );
				this._offset.applyQuaternion( this._rotateQuaternion );
				camera.up.applyQuaternion( this._rotateQuaternion );

			}

		}

		if ( ! this.noZoom ) {

			const factor = 1.0 - this._zoomMagnitude.y;

			if ( factor !== 1.0 && factor > 0.0 ) {

				if ( camera instanceof PerspectiveCamera ) {

					this._offset.multiplyScalar( factor );


					// Clamp min/max
					if ( this._offset.lengthSq() < this.minDistance * this.minDistance ) {

						camera.position.addVectors( this.position, this._offset.setLength( this.minDistance ) );
						this._zoomMagnitude.y = 0;

					} else if ( this._offset.lengthSq() > this.maxDistance * this.maxDistance ) {

						camera.position.addVectors( this.position, this._offset.setLength( this.maxDistance ) );
						this._zoomMagnitude.y = 0;

					}

				} else if ( camera instanceof OrthographicCamera ) {

					camera.zoom /= factor;
					camera.updateProjectionMatrix();

				} else {

					console.warn( 'THREE.TrackballControls: Unsupported camera type' );

				}

			}

		}

		if ( ! this.noPan ) {

			camera.position.sub( this._panMagnitude );
			this.position.sub( this._panMagnitude );

		}

		camera.position.addVectors( this.position, this._offset );
		camera.lookAt( this.position );
		this.dispatchEvent( { type: 'change' } );

	}
	onTrackedPointerUp( pointer, pointers ) {

		if ( pointers.length === 0 ) {

			this.dispatchEvent( { type: 'end' } );

		}

	}
	onTrackedKeyChange( code, codes ) {

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

	// Deprecation warnings
	update() {

		console.warn( 'THREE.TrackballControls: update() has been deprecated.' );

	}
	handleResize() {

		console.warn( 'THREE.TrackballControls: handleResize() has been deprecated.' );

	}

}

export { TrackballControls };

//# sourceMappingURL=TrackballControls.js.map
