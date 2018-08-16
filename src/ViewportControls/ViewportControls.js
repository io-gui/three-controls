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

const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, A: 65, S: 83, D: 68, W: 87 }; // Direction keys
const BUTTON = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT }; // Mouse buttons
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
	constructor( camera, domElement ) {
		super( domElement );

		if ( camera === undefined || !camera.isCamera ) {
			console.warn( 'ViewportControls: camera is mandatory in constructor!' );
		}

		this.defineProperties({
			camera: camera,
			target: new THREE.Vector3(),
			enableOrbit: true,
			enableDolly: true,
			enablePan: true,
			enableKeys: true,
			orbitSpeed: 1.0,
			dollySpeed: 1.0,
			panSpeed: 1.0,
			keyPanSpeed: 0.1,
			wheelDollySpeed: 1,
			autoRotate: true,
			autoRotateSpeed: 0.5,
			enableDamping: true,
			dampingFactor: 0.05,
			state: STATE.NONE
		});

		// Internals
		this._orbitOffset = new THREE.Vector2();
		this._orbitInertia = new THREE.Vector2();
		this._panOffset = new THREE.Vector2();
		this._panInertia = new THREE.Vector2();
		this._dollyOffset = 0;
		this._dollyInertia = 0;

		this.addEventListener( 'autoRotate-changed', ( event ) => {
			if ( event.value ) {
				this._orbitInertia.x = this.autoRotateSpeed;
			}
		} );

		this.addEventListener( 'camera-changed', ( event ) => {
			this.needsUpdate = true;
		});

		this.addEventListener( 'target-changed', ( event ) => {
			this.needsUpdate = true;
		});

		this.addEventListener( 'state-changed', ( event ) => {
			setTimeout( () => { this.needsUpdate = true; } )
		});

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

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._dollyInertia ) );
		if ( maxVelocity < EPS ) this.stopAnimation();
	}
	orbitUpdate( orbit ) {
	}
	dollyUpdate( dolly ) {
	}
	panUpdate( pan ) {
	}
	update( timestep ) {
		super.update( timestep );

		// set inertiae from current offsets
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

		this.orbitUpdate( orbit.copy( this._orbitOffset ) );
		this.dollyUpdate( this._dollyOffset );
		this.panUpdate( pan.copy( this._panOffset ) );

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
					case BUTTON.LEFT:
						if ( pointers.ctrlKey ) {
							if ( !this.enablePan ) return;
							this.state = STATE.PAN;
							this.pan( direction.multiplyScalar( this.panSpeed ) );
						} else if ( pointers.altKey ) {
							if ( !this.enableDolly ) return;
							this.state = STATE.DOLLY;
							this.dolly( pointers[0].movement.y * this.dollySpeed );
						} else {
							if ( !this.enableOrbit ) return;
							this.state = STATE.ROTATE;
							this.orbit( direction.multiplyScalar( this.orbitSpeed ) );
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
						this.pan( direction.multiplyScalar( this.panSpeed ) );
						break;
				}
				break;
			default: // 2 or more
				// two-fingered touch: dolly-pan
				if ( !this.enableDolly && !this.enablePan ) return;
				this.state = STATE.DOLLY_PAN;
				if ( this.enableDolly ) {
					// TODO: apply aspectMultiplier
					let distance = pointers[0].position.distanceTo( pointers[1].position );
					let prevDistance = pointers[0].previous.distanceTo( pointers[1].previous );
					this.dolly( (prevDistance - distance) * this.dollySpeed );
				}
				if ( this.enablePan ) {
					direction.copy(pointers[0].movement).add(pointers[1].movement).multiply(aspectMultiplier);
					this.pan( direction.multiplyScalar( this.panSpeed ) );
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
	attach( camera ) {
		this.camera = camera;
	}
	detach() {
		this.camera = undefined;
	}
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
