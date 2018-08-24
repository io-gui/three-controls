/**
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";

/*
 * ViewportControls is a base class for controls performing orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

const STATE = { NONE: - 1, ORBIT: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const EPS = 0.000001;

// Temp variables
const direction = new THREE.Vector2();
const aspectMultiplier = new THREE.Vector2();
const orbit = new THREE.Vector2();
const pan = new THREE.Vector2();

// Framerate-independent damping
function dampTo( source, target, smoothing, dt ) {
	const t = 1 - Math.pow( smoothing, dt );
	return source * ( 1 - t ) + target * t;
}

// Events
const changeEvent = { type: 'change' };

export class ViewportControls extends Control {
	get isViewportControls() { return true; }
	constructor( camera, domElement, object ) {
		super( camera, domElement, object );

		if ( camera === undefined || !camera.isCamera ) {
			console.warn( 'ViewportControls: camera is mandatory in constructor!' );
		}

		this.defineProperties({
			target: new THREE.Vector3(),
			enableOrbit: true,
			enableDolly: true,
			enablePan: true,
			enableFocus: true,
			orbitSpeed: 1.0,
			dollySpeed: 1.0,
			panSpeed: 1.0,
			keyOrbitSpeed: 0.1,
			keyDollySpeed: 0.1,
			keyPanSpeed: 0.1,
			wheelDollySpeed: 0.05,
			autoRotate: false,
			autoRotateSpeed: 0.5,
			enableDamping: true,
			dampingFactor: 0.05,
			KEYS: {
				PAN_LEFT: 37, // Direction left
				PAN_UP: 38, // Direction up
				PAN_RIGHT: 39, // Direction right
				PAN_DOWN: 40, // Direction down
				ORBIT_LEFT: 65, // A
				ORBIT_RIGHT: 68, // D
				ORBIT_UP: 83, // S
				ORBIT_DOWN: 87, // W
				DOLLY_OUT: 189, // +
				DOLLY_IN: 187, // -
				FOCUS: 70 // F
			},
			BUTTON: { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT }, // Mouse buttons
			_state: STATE.NONE,
			_orbitOffset: new THREE.Vector2(),
			_orbitInertia: new THREE.Vector2(),
			_panOffset: new THREE.Vector2(),
			_panInertia: new THREE.Vector2(),
			_dollyOffset: 0,
			_dollyInertia: 0
		});
	}
	autoRotateChanged( value ) {
		if ( value ) {
			this._orbitInertia.x = this.autoRotateSpeed;
		}
	}
	cameraChanged( value ) {
		this.needsUpdate = true;
	}
	_stateChanged( value ) {
		this.needsUpdate = true;
	}
	update( timestep ) {
		let dt = timestep / 1000;
		// Apply orbit intertia
		if ( this._state !== STATE.ORBIT ) {
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
		if ( this._state !== STATE.PAN ) {
			this._panInertia.x = dampTo( this._panInertia.x, 0.0, this.dampingFactor, dt );
			this._panInertia.y = dampTo( this._panInertia.y, 0.0, this.dampingFactor, dt );
		}
		this._panOffset.x += this._panInertia.x * dt;
		this._panOffset.y += this._panInertia.y * dt;

		// Apply dolly intertia
		if ( this._state !== STATE.DOLLY ) {
			this._dollyInertia = dampTo( this._dollyInertia, 0.0, this.dampingFactor, dt );
		}
		this._dollyOffset += this._dollyInertia * dt;

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._dollyInertia ) );
		if ( maxVelocity < EPS ) this.stopAnimation();

		// set inertiae from current offsets
		if ( this.enableDamping ) {
			if ( this._state === STATE.ORBIT ) {
				this._orbitInertia.copy( this._orbitOffset ).multiplyScalar( timestep );
			}
			if ( this._state === STATE.PAN ) {
				this._panInertia.copy( this._panOffset ).multiplyScalar( timestep );
			}
			if ( this._state === STATE.DOLLY ) {
				this._dollyInertia = this._dollyOffset * timestep;
			}
		}

		this.orbit( orbit.copy( this._orbitOffset ) );
		this.dolly( this._dollyOffset );
		this.pan( pan.copy( this._panOffset ) );

		this._orbitOffset.set( 0, 0 );
		this._panOffset.set( 0, 0 );
		this._dollyOffset = 0;

		this.camera.lookAt( this.target );

		this.dispatchEvent( changeEvent );
		this.needsUpdate = false;
	}
	onPointerMove( pointers ) {
		let rect = this.domElement.getBoundingClientRect();
		aspectMultiplier.set( rect.width / rect.height, 1 );
		switch ( pointers.length ) {
			case 1:
				direction.copy(pointers[0].movement).multiply(aspectMultiplier);
				switch ( pointers[0].button ) {
					case this.BUTTON.LEFT:
						if ( pointers.ctrlKey ) {
							this._setPan( direction.multiplyScalar( this.panSpeed ) );
						} else if ( pointers.altKey ) {
							this._setDolly( pointers[0].movement.y * this.dollySpeed );
						} else {
							this._setOrbit( direction.multiplyScalar( this.orbitSpeed ) );
						}
						break;
					case this.BUTTON.MIDDLE:
						this._setDolly( pointers[0].movement.y * this.dollySpeed );
						break;
					case this.BUTTON.RIGHT:
						this._setPan( direction.multiplyScalar( this.panSpeed ) );
						break;
				}
				break;
			default: // 2 or more
				// two-fingered touch: dolly-pan
				// TODO: apply aspectMultiplier?
				let distance = pointers[0].position.distanceTo( pointers[1].position );
				let prevDistance = pointers[0].previous.distanceTo( pointers[1].previous );
				direction.copy(pointers[0].movement).add(pointers[1].movement).multiply(aspectMultiplier);
				this._setDollyPan( ( prevDistance - distance) * this.dollySpeed, direction.multiplyScalar( this.panSpeed ) );
				break;
		}
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0 ) {
			this._state = STATE.NONE;
			this.active = false;
		}
	}
	onKeyDown( event ) {
		if ( !this.enablePan ) return;
		// TODO: key inertia
		// TODO: better state setting
		switch ( event.keyCode ) {
			case this.KEYS.PAN_UP:
				this._setPan( direction.set( 0, -this.keyPanSpeed ) );
				break;
			case this.KEYS.PAN_DOWN:
				this._setPan( direction.set( 0, this.keyPanSpeed ) );
				break;
			case this.KEYS.PAN_LEFT:
				this._setPan( direction.set( this.keyPanSpeed, 0 ) );
				break;
			case this.KEYS.PAN_RIGHT:
				this._setPan( direction.set( -this.keyPanSpeed, 0 ) );
				break;
			case this.KEYS.ORBIT_LEFT:
				this._setOrbit( direction.set( this.keyOrbitSpeed, 0 ) );
				break;
			case this.KEYS.ORBIT_RIGHT:
				this._setOrbit( direction.set( -this.keyOrbitSpeed, 0 ) );
				break;
			case this.KEYS.ORBIT_UP:
				this._setOrbit( direction.set( 0, this.keyOrbitSpeed ) );
				break;
			case this.KEYS.ORBIT_DOWN:
				this._setOrbit( direction.set( 0, -this.keyOrbitSpeed ) );
				break;
			case this.KEYS.DOLLY_IN:
				this._setDolly( -this.keyDollySpeed );
				break;
			case this.KEYS.DOLLY_OUT:
				this._setDolly( this.keyDollySpeed );
				break;
			case this.KEYS.FOCUS:
				this._setFocus();
				break;
			default:
				break;
		}
	}
	onKeyUp( event ) {
		// TODO: Consider improving for prevent pointer and multi-key interruptions.
		this.active = false;
	}
	onWheel( delta ) {
		if ( !this.enableDolly || ( this._state !== STATE.NONE && this._state !== STATE.ORBIT ) ) return;
		this._setDolly( delta * this.wheelDollySpeed );
	}
	// control methods
	attach( camera ) {
		this.camera = camera;
	}
	detach() {
		this.camera = undefined;
	}
	_setPan( dir ) {
		this._state = STATE.PAN;
		this.active = true;
		if ( this.enablePan ) this._panOffset.copy( dir );
		this.needsUpdate = true;
	}
	_setDolly( dir ) {
		this._state = STATE.DOLLY;
		this.active = true;
		if ( this.enableDolly ) this._dollyOffset = dir;
		this.needsUpdate = true;
	}
	_setDollyPan( dollyDir, panDir ) {
		this._state = STATE.DOLLY_PAN;
		this.active = true;
		if ( this.enableDolly ) this._dollyOffset = dollyDir;
		if ( this.enablePan ) this._panOffset.copy( panDir );
		this.needsUpdate = true;
	}
	_setDolly( dir ) {
		this._state = STATE.DOLLY;
		this.active = true;
		if ( this.enableDolly ) this._dollyOffset = dir;
		this.needsUpdate = true;
	}
	_setOrbit( dir ) {
		this._state = STATE.ORBIT;
		this.active = true;
		if ( this.enableOrbit ) this._orbitOffset.copy( dir );
		this.needsUpdate = true;
	}
	_setFocus() {
		this._state = STATE.NONE;
		if ( this.object && this.enableFocus ) this.focus( this.object );
		this.needsUpdate = true;
	}
	// ViewportControl control methods. Implement in subclass!
	pan() {
		console.warn( 'ViewportControls: pan() not implemented!' );
	}
	dolly() {
		console.warn( 'ViewportControls: dolly() not implemented!' );
	}
	orbit() {
		console.warn( 'ViewportControls: orbit() not implemented!' );
	}
	focus() {
		console.warn( 'ViewportControls: focus() not implemented!' );
	}
	// Deprication warnings
	getAutoRotationAngle() {
		console.warn( '.getAutoRotationAngle() has been depricated. Use .autoRotateSpeed instead.' );
		return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	}
	getZoomScale() {
		console.warn( '.getZoomScale() has been depricated.' );
	}
	get object() {
		console.warn( '.object has been renamed to .camera' );
		return this.camera;
	}
	set object( value ) {
		console.warn( '.object has been renamed to .camera' );
		this.camera = value;
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
