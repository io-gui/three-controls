import { Vector3, Quaternion, Spherical, MOUSE, Vector2 } from '../../../three.js/build/three.module.js';
import { Control } from '../Control.js';

/**
 * @author arodic / http://github.com/arodic
 */

/*
 * ViewportControls is a base class for controls performing orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, A: 65, S: 83, D: 68, W: 87 }; // Direction keys
const BUTTON = { LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT }; // Mouse buttons
const EPS = 0.000001;

// Temp variables
const direction = new Vector2();

// Framerate-independent damping
function dampTo( source, target, smoothing, dt ) {
	const t = 1 - Math.pow( smoothing, dt );
	return source * ( 1 - t ) + target * t;
}

class ViewportControls extends Control {
	constructor( object, domElement ) {
		super( domElement );

		this.defineProperties({
			object: object,
			target: new Vector3(),
			enableOrbit: true,
			enableDolly: true,
			enablePan: true,
			enableKeys: true,
			orbitSpeed: 1.0,
			dollySpeed: 1.0,
			panSpeed: 0.5,
			keyPanSpeed: 0.1,
			wheelDollySpeed: 1,
			autoRotate: false,
			autoRotateSpeed: 0.9,
			enableDamping: false,
			dampingFactor: 0.05,
			state: STATE.NONE,
			needsUpdate: false
		});

		// Internals
		this._orbitOffset = new Vector2();
		this._orbitInertia = new Vector2();
		this._panOffset = new Vector2();
		this._panInertia = new Vector2();
		this._dollyOffset = 0;
		this._dollyInertia = 0;

		this.addEventListener( 'autoRotate-changed', ( event ) => {
			if ( event.value ) {
				this._orbitInertia.x = this.autoRotateSpeed;
				this.needsUpdate = true;
			}
		} );

		this.addEventListener( 'needsUpdate-changed', ( event ) => {
			if ( event.value ) this.startAnimation();
		} );

		if ( this.autoRotate ) this.startAnimation();

		this.needsUpdate = true;
	}
	animate( timestep ) {
		super.animate( timestep );

		let dt = timestep / 1000;

		// Apply orbit intertia
		if ( this.state !== STATE.ROTATE ) {
			let thetaTarget = this.autoRotate ? this.autoRotateSpeed : 0;
			if ( this.enableDamping ) {
				this._orbitInertia.x = dampTo( this._orbitInertia.x, thetaTarget, this.dampingFactor, dt );
				this._orbitInertia.y = dampTo( this._orbitInertia.y, 0.0, this.dampingFactor, dt );
			} else {
				this._orbitInertia.x = thetaTarget;
			}
		}
		this._orbitOffset.x += this._orbitInertia.x * dt;
		this._orbitOffset.y += this._orbitInertia.y * dt;

		// Apply pan intertia
		if ( this.state !== STATE.PAN ) {
			this._panInertia.x = dampTo( this._panInertia.x, 0.0, this.dampingFactor, dt );
			this._panInertia.y = dampTo( this._panInertia.y, 0.0, this.dampingFactor, dt );
		}
		this._panOffset.x += this._panInertia.x * dt;
		this._panOffset.y += this._panInertia.y * dt;

		// Apply dolly intertia
		if ( this.state !== STATE.DOLLY ) {
			this._dollyInertia = dampTo( this._dollyInertia, 0.0, this.dampingFactor, dt );
		}
		this._dollyOffset += this._dollyInertia * dt;

		// TODO
		let orbit = new Vector2().copy( this._orbitOffset );
		let pan = new Vector2().copy( this._panOffset );
		let dolly = this._dollyOffset;
		this.update( timestep, orbit, pan, dolly );

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._dollyInertia ) );
		if ( maxVelocity < EPS ) this.stopAnimation();
	}
	update( timestep ) {
		// Copy current offsets to inertia
		if ( this.enableDamping ) {
			if ( this.state === STATE.ROTATE ) {
				this._orbitInertia.copy( this._orbitOffset ).multiplyScalar( timestep );
			}
			if ( this.state === STATE.PAN ) {
				this._panInertia.copy( this._panOffset ).multiplyScalar( timestep );
			}
			if ( this.state === STATE.DOLLY ) {
				this._dollyInertia = this._dollyOffset * timestep;
			}
		}
		this._orbitOffset.set( 0, 0 );
		this._panOffset.set( 0, 0 );
		this._dollyOffset = 0;

		this.object.lookAt( this.target );

		this.needsUpdate = false;
	}
	onPointerMove( pointers ) {
		switch ( pointers.length ) {
			case 1:
				switch ( pointers[0].button ) {
					case BUTTON.LEFT:
						if ( pointers.ctrlKey ) {
							if ( !this.enablePan ) return;
							this.state = STATE.PAN;
							this.pan( direction.copy(pointers[0].movement).multiplyScalar( this.panSpeed ) );
						} else if ( pointers.altKey ) {
							if ( !this.enableDolly ) return;
							this.state = STATE.DOLLY;
							this.dolly( pointers[0].movement.y * this.dollySpeed );
						} else {
							if ( !this.enableOrbit ) return;
							this.state = STATE.ROTATE;
							this.orbit( direction.copy(pointers[0].movement).multiplyScalar( this.orbitSpeed ) );
						}
						break;
					case BUTTON.MIDDLE:
						if ( !this.enableDolly ) return;
						this.state = STATE.DOLLY;
						this.dolly( pointers[0].movement.y * this.dollySpeed );
						break;
					case BUTTON.RIGHT:
						if ( !this.enablePan ) return;
						this.state = STATE.PAN;
						this.pan( direction.copy(pointers[0].movement).multiplyScalar( this.panSpeed ) );
						break;
				}
				break;
			default: // 2 or more
				// two-fingered touch: dolly-pan
				if ( !this.enableDolly && !this.enablePan ) return;
				this.state = STATE.DOLLY_PAN;
				if ( this.enableDolly ) {
					let distance = pointers[0].position.distanceTo( pointers[1].position );
					let prevDistance = pointers[0].previous.distanceTo( pointers[1].previous );
					this.dolly( (prevDistance - distance) * this.dollySpeed );
				}
				if ( this.enablePan ) {
					this.pan( direction.copy(pointers[0].movement).add(pointers[1].movement).multiplyScalar( this.panSpeed ) );
				}
				break;
		}
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0 ) this.state = STATE.NONE;
	}
	onKeyDown( event ) {
		if ( !this.enableKeys || !this.enablePan ) return;
		switch ( event.keyCode ) {
			case KEYS.UP:
				this.pan( direction.set( 0, this.keyPanSpeed ) );
				break;
			case KEYS.BOTTOM:
				this.pan( direction.set( 0, -this.keyPanSpeed ) );
				break;
			case KEYS.LEFT:
			case KEYS.A:
				this.pan( direction.set( this.keyPanSpeed, 0 ) );
				break;
			case KEYS.RIGHT:
			case KEYS.D:
				this.pan( direction.set( -this.keyPanSpeed, 0 ) );
				break;
			case KEYS.W:
				this.dolly( -this.keyPanSpeed );
				break;
			case KEYS.S:
				this.dolly( this.keyPanSpeed );
				break;
		}
	}
	onWheel( event ) {
		if ( !this.enableDolly || ( this.state !== STATE.NONE && this.state !== STATE.ROTATE ) ) return;
		event.stopPropagation();
		this.dolly( event.deltaY * this.wheelDollySpeed );
	}
	// control methods
	pan( dir ) {
		this._panOffset.copy( dir );
		this.needsUpdate = true;
	}
	dolly( dir ) {
		this._dollyOffset = dir;
		this.needsUpdate = true;
	}
	orbit( dir ) {
		this._orbitOffset.copy( dir );
		this.needsUpdate = true;
	}
	// Deprication warnings
	addEventListener( type, listener ) {
		super.addEventListener( type, listener );
		if ( type === "start" ) {
			console.warn( '"start" event depricated, use "pointerdown" or "dragging-changed" event instead.' );
		}
		if ( type === "end" ) {
			console.warn( '"end" event depricated, use "pointerup" or "dragging-changed" event instead.' );
		}
	}
	getAutoRotationAngle() {
		console.warn( '.getAutoRotationAngle() has been depricated. Use .autoRotateSpeed instead.' );
		return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	}
	getZoomScale() {
		console.warn( '.getZoomScale() has been depricated.' );
	}
	get center() {
		console.warn( '.center has been renamed to .target' );
		return this.target;
	}
	set center( value ) {
		console.warn( '.center has been renamed to .target' );
		this.target = value;
	}
	get enableRotate() {
		console.warn( '.enableRotate has been deprecated. Use .enableOrbit instead.' );
		return this.enableOrbit;
	}
	set enableRotate( value ) {
		console.warn( '.enableRotate has been deprecated. Use .enableOrbit instead.' );
		this.enableOrbit = value;
	}
	get rotateSpeed() {
		console.warn( '.rotateSpeed has been deprecated. Use .orbitSpeed instead.' );
		return this.orbitSpeed;
	}
	set rotateSpeed( value ) {
		console.warn( '.rotateSpeed has been deprecated. Use .orbitSpeed instead.' );
		this.orbitSpeed = value;
	}
	get noZoom() {
		console.warn( '.noZoom has been deprecated. Use .enableDolly instead.' );
		return !this.enableDolly;
	}
	set noZoom( value ) {
		console.warn( '.noZoom has been deprecated. Use .enableDolly instead.' );
		this.enableDolly = !value;
	}
	get enableZoom() {
		console.warn( '.enableZoom has been deprecated. Use .enableDolly instead.' );
		return this.enableDolly;
	}
	set enableZoom( value ) {
		console.warn( '.enableZoom has been deprecated. Use .enableDolly instead.' );
		this.enableDolly = value;
	}
	get zoomSpeed() {
		console.warn( '.zoomSpeed has been deprecated. Use .dollySpeed instead.' );
		return this.dollySpeed;
	}
	set zoomSpeed( value ) {
		console.warn( '.zoomSpeed has been deprecated. Use .dollySpeed instead.' );
		this.dollySpeed = value;
	}
	get noRotate() {
		console.warn( '.noRotate has been deprecated. Use .enableRotate instead.' );
		return !this.enableRotate;
	}
	set noRotate( value ) {
		console.warn( '.noRotate has been deprecated. Use .enableRotate instead.' );
		this.enableRotate = !value;
	}
	get noPan() {
		console.warn( '.noPan has been deprecated. Use .enablePan instead.' );
		return !this.enablePan;
	}
	set noPan( value ) {
		console.warn( '.noPan has been deprecated. Use .enablePan instead.' );
		this.enablePan = !value;
	}
	get noKeys() {
		console.warn( '.noKeys has been deprecated. Use .enableKeys instead.' );
		return !this.enableKeys;
	}
	set noKeys( value ) {
		console.warn( '.noKeys has been deprecated. Use .enableKeys instead.' );
		this.enableKeys = !value;
	}
	get staticMoving() {
		console.warn( '.staticMoving has been deprecated. Use .enableDamping instead.' );
		return !this.enableDamping;
	}
	set staticMoving( value ) {
		console.warn( '.staticMoving has been deprecated. Use .enableDamping instead.' );
		this.enableDamping = !value;
	}
	get dynamicDampingFactor() {
		console.warn( '.dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
		return this.dampingFactor;
	}
	set dynamicDampingFactor( value ) {
		console.warn( '.dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
		this.dampingFactor = value;
	}
}

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author arodic / http://github.com/arodic
 */

/*
 * This set of controls performs orbiting, dollying, and panning.
 * Unlike TrackballControls, it maintains the "up" direction object.up ( +Y by default ).
 *
 *  Orbit - left mouse / touch: one-finger move
 *  Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *  Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

// Temp variables
const eye = new Vector3();
const offset = new Vector3();
const offset2 = new Vector3();
const unitY = new Vector3( 0, 1, 0 );
const tempQuat = new Quaternion();
const tempQuatInverse = tempQuat.clone().inverse();

// events
const changeEvent = { type: 'change' };

class OrbitControls extends ViewportControls {
	constructor( object, domElement ) {
		super( object, domElement );

		this.defineProperties( {
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity, // PerspectiveCamera dolly limit
			minZoom: 0, // OrthographicCamera zoom limit
			maxZoom: Infinity, // OrthographicCamera zoom limit
			minPolarAngle: 0, // radians ( 0 to Math.PI )
			maxPolarAngle: Math.PI, // radians ( 0 to Math.PI )
			minAzimuthAngle: - Infinity, // radians ( -Math.PI to Math.PI )
			maxAzimuthAngle: Infinity, // radians ( -Math.PI to Math.PI )
			screenSpacePanning: false
		} );

		// Internals
		this._spherical = new Spherical();
	}
	update( timestep, orbit, pan, dolly ) {
		super.update( timestep );

		// camera.up is the orbit axis
		tempQuat.setFromUnitVectors( this.object.up, unitY );
		tempQuatInverse.copy( tempQuat ).inverse();
		eye.copy( this.object.position ).sub( this.target );
		// rotate eye to "y-axis-is-up" space
		eye.applyQuaternion( tempQuat );
		// angle from z-axis around y-axis
		this._spherical.setFromVector3( eye );
		this._spherical.theta -= orbit.x;
		this._spherical.phi += orbit.y;
		// restrict theta to be between desired limits
		this._spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, this._spherical.theta ) );
		// restrict phi to be between desired limits
		this._spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this._spherical.phi ) );

		let dollyScale = ( dolly > 0 ) ? 1 - dolly : 1 / ( 1 + dolly );
		if ( this.object.isPerspectiveCamera ) {
			this._spherical.radius /= dollyScale;
		} else if ( this.object.isOrthographicCamera ) {
			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
		}
		this.object.updateProjectionMatrix();

		this._spherical.makeSafe();
		// restrict radius to be between desired limits
		this._spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this._spherical.radius ) );

		// move target to panned location

		let panLeftDist;
		let panUpDist;
		if ( this.object.isPerspectiveCamera ) {
			// half of the fov is center to top of screen
			let fovFactor = Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );
			panLeftDist = pan.x * eye.length() * fovFactor;
			panUpDist = -pan.y * eye.length() * fovFactor;
		} else if ( this.object.isOrthographicCamera ) {
			panLeftDist = pan.x * ( this.object.right - this.object.left ) / this.object.zoom;
			panUpDist = -pan.y * ( this.object.top - this.object.bottom ) / this.object.zoom;
		}

		// panLeft
		offset.setFromMatrixColumn( this.object.matrix, 0 );
		offset.multiplyScalar( -panLeftDist );
		offset2.copy( offset );

		// panUp
		if ( this.screenSpacePanning ) {
			offset.setFromMatrixColumn( this.object.matrix, 1 );
		} else {
			offset.setFromMatrixColumn( this.object.matrix, 0 );
			offset.crossVectors( this.object.up, offset );
		}
		offset.multiplyScalar( panUpDist );
		offset2.add( offset );


		this.target.add( offset2 );
		offset.setFromSpherical( this._spherical );
		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( tempQuatInverse );
		this.object.position.copy( this.target ).add( offset );
		this.object.lookAt( this.target );

		this.dispatchEvent( changeEvent );
	}
	// utility getters
	get polarAngle() {
		return this._spherical.phi;
	}
	get azimuthalAngle() {
		return this._spherical.theta;
	}
	// Deprication warnings
	getPolarAngle() {
		console.warn( '.getPolarAngle() has been depricated. Use .polarAngle instead.' );
		return this.polarAngle;
	}
	getAzimuthalAngle() {
		console.warn( '.getAzimuthalAngle() has been depricated. Use .azimuthalAngle instead.' );
		return this.azimuthalAngle;
	}
}

export { OrbitControls };
