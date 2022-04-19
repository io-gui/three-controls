import { MOUSE, TOUCH, Vector3, Quaternion, Spherical, PerspectiveCamera, OrthographicCamera } from 'three';
import { ControlsCamera } from './core/ControlsCamera.js';


// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction camera.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
// so camera.up is the orbit axis
const _unitY = new Vector3( 0, 1, 0 );
const _quat = new Quaternion();
const _quatInverse = new Quaternion();
const _offset = new Vector3();
const _movement = new Vector3();

class OrbitControls extends ControlsCamera {


	// Public API
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
	// If set, the interval [min, max] must be a sub-interval of [- 2 PI, 2 PI], with (max - min < 2 PI)
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
	autoRotate = false;
	autoRotateSpeed = 1; // 30 seconds per round when fps is 60
	// Set to false to disable use of the keys
	enableKeys = true;

	// The four arrow keys
	keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

	// Touch fingers // TODO: deprecate touches.ONE
	touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

	// Internal utility variables
	_spherical = new Spherical();
	_autoRotationMagnitude = 0;
	_interacting = false;
	constructor( camera, domElement ) {

		super( camera, domElement );

		if ( ! ( camera instanceof PerspectiveCamera ) && ! ( camera instanceof OrthographicCamera ) ) {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			this.enableZoom = false;
			this.enablePan = false;

		}

		this._autoRotateAnimation = this._autoRotateAnimation.bind( this );
		this.observeProperty( 'autoRotate' );


		// Deprecation warnings
		Object.defineProperty( this, 'dynamicDampingFactor', {
			set: ( value ) => {

				console.warn( 'THREE.OrbitControls: "dynamicDampingFactor" is now "dampingFactor"!' );
				this.dampingFactor = value;

			}
		} );

	}

	// Public methods
	getPolarAngle() {

		return this._spherical.phi;

	}
	getAzimuthalAngle() {

		return this._spherical.theta;

	}

	// Deprecated event warning
	addEventListener( type, listener ) {

		if ( type === 'cancel' ) {

			console.warn( `THREE.OrbitControls: "cancel" event is deprecated. Use "enabled-changed" event instead.` );
			type = 'enabled-changed';

		}

		super.addEventListener( type, listener );

	}

	// Event handlers
	_onContextMenu( event ) {

		super._onContextMenu( event );
		event.preventDefault();

	}
	_onWheel( event ) {

		super._onWheel( event );


		// TODO: test with inerial movement
		if ( this.enableZoom === false )
			return;

		event.preventDefault();
		event.stopPropagation();
		this._applyDollyMovement( event.deltaY );

	}
	_onKeyDown( event ) {

		super._onKeyDown( event );

		if ( this.enableKeys === false || this.enablePan === false )
			return;

		const code = Number( event.code );

		switch ( code ) {

			case this.keys.UP:
				this._keydownPan( 0, this.keyPanSpeed );
				event.preventDefault();
				break;

			case this.keys.BOTTOM:
				this._keydownPan( 0, - this.keyPanSpeed );
				event.preventDefault();
				break;

			case this.keys.LEFT:
				this._keydownPan( this.keyPanSpeed, 0 );
				event.preventDefault();
				break;

			case this.keys.RIGHT:
				this._keydownPan( - this.keyPanSpeed, 0 );
				event.preventDefault();
				break;

		}

	}

	// Tracked pointer handlers
	onTrackedPointerDown( pointer, pointers ) {

		if ( pointers.length === 1 ) {

			this.dispatchEvent( { type: 'start' } );

			// this.saveCameraState();

		}

	}
	onTrackedPointerMove( pointer, pointers, center ) {

		let button = - 1;
		this._interacting = ! pointer.isSimulated;

		switch ( pointers.length ) {

			case 1: // 1 pointer
				switch ( pointer.button ) {

					case 0:
						button = this.mouseButtons.LEFT;
						break;

					case 1:
						button = this.mouseButtons.MIDDLE;
						break;

					case 2:
						button = this.mouseButtons.RIGHT;
						break;

				}

				if ( button === MOUSE.ROTATE ) {

					if ( pointer.ctrlKey || pointer.metaKey || pointer.shiftKey ) {

						if ( this.enablePan )
							this._pointerPan( pointer );

					} else {

						if ( this.enableRotate )
							this._pointerRotate( pointer );

					}

				} else if ( button === MOUSE.DOLLY ) {

					if ( this.enableZoom )
						this._pointerDolly( pointer );

				} else if ( button === MOUSE.PAN && this.enablePan ) {

					if ( pointer.ctrlKey || pointer.metaKey || pointer.shiftKey ) {

						if ( this.enableRotate )
							this._pointerRotate( pointer );

					} else {

						if ( this.enablePan )
							this._pointerPan( pointer );

					}

				}

				break;

			default: // 2 or more pointers
				switch ( this.touches.TWO ) {

					case TOUCH.DOLLY_PAN:
						if ( this.enableZoom )
							this._twoPointerDolly( pointers );

						if ( this.enablePan )
							this._pointerPan( center );

						break;

					case TOUCH.DOLLY_ROTATE:
						if ( this.enableZoom )
							this._twoPointerDolly( pointers );

						if ( this.enableRotate )
							this._pointerRotate( center );

						break;

				}

		}

	}
	onTrackedPointerUp( pointer, pointers ) {

		if ( pointers.length === 0 ) {

			this.dispatchEvent( { type: 'end' } );
			this._interacting = false;

		}

	}
	_pointerDolly( pointer ) {

		this._applyDollyMovement( pointer.view.movement.y * 1000 );

	}
	_twoPointerDolly( pointers ) {

		this.updateMatrixWorld();
		this._plane.setFromNormalAndCoplanarPoint( this.eye, this.position );
		const dist0 = pointers[ 0 ].projectOnPlane( this._plane ).current.distanceTo( pointers[ 1 ].projectOnPlane( this._plane ).current );
		const dist1 = pointers[ 0 ].projectOnPlane( this._plane ).previous.distanceTo( pointers[ 1 ].projectOnPlane( this._plane ).previous );
		this._applyDollyMovement( dist0 - dist1 );

	}
	_applyDollyMovement( dollyMovement ) {


		// TODO: handle Orthographic!
		const scale = Math.pow( 1 - dollyMovement / this.domElement.clientHeight, this.zoomSpeed );
		_offset.copy( this.camera.position ).sub( this.position );

		// angle from z-axis around y-axis
		this._spherical.setFromVector3( _offset );

		// restrict radius to be between desired limits
		this._spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this._spherical.radius * scale ) );

		// move target to panned location
		_offset.setFromSpherical( this._spherical );
		this.camera.position.copy( this.position ).add( _offset );
		this.camera.lookAt( this.position );
		this.dispatchEvent( { type: 'change' } );

	}
	_pointerPan( pointer ) {

		this.updateMatrixWorld();

		if ( this.screenSpacePanning ) {

			this._plane.setFromNormalAndCoplanarPoint( this.eye, this.position );
			this._applyPanMovement( pointer.projectOnPlane( this._plane ).movement );

		} else {

			this._plane.setFromNormalAndCoplanarPoint( _unitY, this.position );
			this._applyPanMovement( pointer.projectOnPlane( this._plane ).movement );

		}

	}
	_keydownPan( deltaX, deltaY ) {


		// deltaX and deltaY are in pixels; right and down are positive
		let fovFactor = 1;

		if ( this.camera instanceof PerspectiveCamera ) {

			_offset.copy( this.camera.position ).sub( this.position );

			// half of the fov is center to top of screen. We use clientHeight only so aspect ratio does not distort speed
			fovFactor = _offset.length() * Math.tan( ( this.camera.fov / 2 ) * Math.PI / 180.0 ) * 2 / this.domElement.clientHeight;

		} else if ( this.camera instanceof OrthographicCamera ) {

			fovFactor = ( this.camera.top - this.camera.bottom ) / this.camera.zoom / this.domElement.clientHeight;

		}


		// Pan movement up / down
		_movement.set( 0, 0, 0 );

		if ( this.screenSpacePanning === true ) {

			_offset.setFromMatrixColumn( this.camera.matrix, 1 );

		} else {

			_offset.setFromMatrixColumn( this.camera.matrix, 0 );
			_offset.crossVectors( this.camera.up, _offset );

		}

		_offset.multiplyScalar( - deltaY * fovFactor );
		_movement.add( _offset );

		// Pan movement left / right
		_offset.setFromMatrixColumn( this.camera.matrix, 0 ); // get X column of object matrix
		_offset.multiplyScalar( deltaX * fovFactor );
		_movement.add( _offset );
		this._applyPanMovement( _movement );

	}
	_applyPanMovement( movement ) {

		_offset.copy( movement ).multiplyScalar( this.panSpeed );
		this.position.sub( _offset );
		this.camera.position.sub( _offset );
		this.dispatchEvent( { type: 'change' } );

	}
	_pointerRotate( pointer ) {

		const aspect = this.domElement.clientWidth / this.domElement.clientHeight;
		_movement.set( pointer.view.movement.x, pointer.view.movement.y, 0 ).multiplyScalar( this.rotateSpeed );
		_movement.x *= aspect;
		this._applyRotateMovement( _movement );

	}
	autoRotateChanged() {


		// TODO: restart animation on disable > enable.
		this.autoRotate ? this.startAnimation( this._autoRotateAnimation ) : this.stopAnimation( this._autoRotateAnimation );

	}
	_autoRotateAnimation( timestep ) {

		const damping = Math.pow( 1 - this.dampingFactor, timestep * 60 / 1000 );
		const angle = this._interacting ? 0 : 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

		if ( this.enableDamping ) {

			this._autoRotationMagnitude += angle * ( 1 - damping );
			this._autoRotationMagnitude *= damping;

		} else {

			this._autoRotationMagnitude = angle;

		}

		_movement.set( this._autoRotationMagnitude, 0, 0 );
		this._applyRotateMovement( _movement );

	}
	_applyRotateMovement( movement ) {

		_offset.copy( this.camera.position ).sub( this.position );

		// rotate _offset to "y-axis-is-up" space
		_quat.setFromUnitVectors( this.camera.up, new Vector3( 0, 1, 0 ) );
		_quatInverse.copy( _quat ).invert();
		_offset.applyQuaternion( _quat );

		// angle from z-axis around y-axis
		this._spherical.setFromVector3( _offset );
		this._spherical.theta -= movement.x;
		this._spherical.theta -= movement.x + this._autoRotationMagnitude;
		this._spherical.phi += movement.y;

		// restrict theta to be between desired limits
		let min = this.minAzimuthAngle;
		let max = this.maxAzimuthAngle;
		const PI2 = Math.PI * 2;

		if ( isFinite( min ) && isFinite( max ) ) {

			if ( min < - Math.PI )
				min += PI2;
			else if ( min > Math.PI )
				min -= PI2;

			if ( max < - Math.PI )
				max += PI2;
			else if ( max > Math.PI )
				max -= PI2;

			if ( min <= max ) {

				this._spherical.theta = Math.max( min, Math.min( max, this._spherical.theta ) );

			} else {

				this._spherical.theta = ( this._spherical.theta > ( min + max ) / 2 ) ?
					Math.max( min, this._spherical.theta ) :
					Math.min( max, this._spherical.theta );

			}

		}


		// restrict phi to be between desired limits
		this._spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this._spherical.phi ) );
		this._spherical.makeSafe();
		_offset.setFromSpherical( this._spherical );

		// rotate _offset back to_ "camera-up-vector-is-up" space
		_offset.applyQuaternion( _quatInverse );
		this.camera.position.copy( this.position ).add( _offset );
		this.camera.lookAt( this.position );
		this.dispatchEvent( { type: 'change' } );

	}

	// Deprecation warning
	update() {

		console.warn( 'THREE.OrbitControls: update() has been deprecated.' );

	}

}

export { OrbitControls };

//# sourceMappingURL=OrbitControls.js.map
