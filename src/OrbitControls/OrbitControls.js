/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {OrbitControlsDepricated} from "./OrbitControlsDepricated.js";

const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2 };
const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }; // The four arrow keys
const BUTTON = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT }; // Mouse buttons
const EPS = 0.000001;

// Temp variables
const tempVector = new THREE.Vector3();
const unitY = new THREE.Vector3( 0, 1, 0 );
const tempQuat = new THREE.Quaternion();
const tempQuatInverse = tempQuat.clone().inverse();

function dampTo(source, target, smoothing, dt) {
	const t = 1 - Math.pow( smoothing, dt );
	return source * ( 1 - t ) + target * t;
}
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/metaKey, or arrow keys / touch: two-finger move

export class OrbitControls extends OrbitControlsDepricated {
	constructor( object, domElement ) {
		super( domElement );

		this.defineProperties({
			object: object,
			target: new THREE.Vector3(), // sets the location of focus
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity, // PerspectiveCamera dolly limit
			minZoom: 0, // OrthographicCamera zoom limit
			maxZoom: Infinity, // OrthographicCamera zoom limit
			minPolarAngle: 0, // radians (0 to Math.PI)
			maxPolarAngle: Math.PI, // radians (0 to Math.PI)
			minAzimuthAngle: - Infinity, // radians (-Math.PI to Math.PI)
			maxAzimuthAngle: Infinity, // radians (-Math.PI to Math.PI)
			enableDamping: true, // Enable inertia
			dampingFactor: 0.05,
			enableZoom: true,
			zoomSpeed: 1.0,
			enableRotate: true,
			rotateSpeed: 1.0,
			enablePan: true,
			panSpeed: 1.0,
			screenSpacePanning: false,
			keyPanSpeed: 10.1,	// pixels moved per arrow key push
			autoRotate: false, // Automatically rotate around the target
			autoRotateSpeed: 0.9,
			enableKeys: true,
			// TODO: WIP
			state: STATE.NONE,
			needsUpdate: false
		});

		// internals
		// current position in _spherical coordinates
		this._spherical = new THREE.Spherical();
		this._sphericalOffset = new THREE.Spherical();
		this._sphericalInertia = new THREE.Spherical();

		this._panOffset = new THREE.Vector3();
		this._panInertia = new THREE.Vector3();

		this._scale = 1;

		this.addEventListener( 'autoRotate-changed', ( event ) => {
			if ( event.value ) {
				this._sphericalInertia.theta = this.autoRotateSpeed;
				this.needsUpdate = true;
			}
		} );

		this.addEventListener( 'needsUpdate-changed', ( event ) => {
			if ( event.value ) this.startAnimation();
		} );

		this.update(0);
	}

	animate( timestep ) {

		super.animate( timestep );

		let dt = timestep / 1000;

		// Apply rotation intertia if not currently rotating
		if ( this.state !== STATE.ROTATE ) {
			let thetaTarget = this.autoRotate ? this.autoRotateSpeed : 0;
			if ( this.enableDamping ) {
				this._sphericalInertia.theta = dampTo(this._sphericalInertia.theta, thetaTarget, this.dampingFactor, dt);
				this._sphericalInertia.phi = dampTo(this._sphericalInertia.phi, 0.0, this.dampingFactor, dt);
			} else {
				this._sphericalInertia.theta = thetaTarget;
			}
		}
		this._sphericalOffset.theta += this._sphericalInertia.theta * dt;
		this._sphericalOffset.phi += this._sphericalInertia.phi * dt;

		// Apply pan intertia if not currently panning
		if ( this.state !== STATE.PAN ) {
			this._panInertia.x = dampTo(this._panInertia.x, 0.0, this.dampingFactor, dt);
			this._panInertia.y = dampTo(this._panInertia.y, 0.0, this.dampingFactor, dt);
			this._panInertia.z = dampTo(this._panInertia.z, 0.0, this.dampingFactor, dt);
		}
		this._panOffset.x += this._panInertia.x * dt;
		this._panOffset.y += this._panInertia.y * dt;
		this._panOffset.z += this._panInertia.z * dt;

		this.update( timestep );

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max(maxVelocity, Math.abs(this._sphericalInertia.theta));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._sphericalInertia.phi));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.x));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.y));
		maxVelocity = Math.max(maxVelocity, Math.abs(this._panInertia.z));
		if (maxVelocity < EPS) this.stopAnimation();

	}

	update( dt ) {
		// camera.up is the orbit axis
		tempQuat.setFromUnitVectors( this.object.up, unitY );
		tempQuatInverse.copy( tempQuat ).inverse();
		tempVector.copy( this.object.position ).sub( this.target );
		// rotate tempVector to "y-axis-is-up" space
		tempVector.applyQuaternion( tempQuat );
		// angle from z-axis around y-axis
		this._spherical.setFromVector3( tempVector );
		this._spherical.theta += this._sphericalOffset.theta;
		this._spherical.phi += this._sphericalOffset.phi;
		// restrict theta to be between desired limits
		this._spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, this._spherical.theta ) );
		// restrict phi to be between desired limits
		this._spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, this._spherical.phi ) );
		this._spherical.radius *= this._scale;
		this._spherical.makeSafe();
		// restrict radius to be between desired limits
		this._spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, this._spherical.radius ) );
		// move target to panned location
		this.target.add( this._panOffset );
		tempVector.setFromSpherical( this._spherical );
		// rotate tempVector back to "camera-up-vector-is-up" space
		tempVector.applyQuaternion( tempQuatInverse );
		this.object.position.copy( this.target ).add( tempVector );
		this.object.lookAt( this.target );

		if (this.state === STATE.ROTATE && this.enableDamping) {
			if (this._sphericalOffset.phi || this._sphericalOffset.theta) {
				this._sphericalInertia.theta = this._sphericalOffset.theta * dt;
				this._sphericalInertia.phi = this._sphericalOffset.phi * dt;
			}
		}
		this._sphericalOffset.set( 0, 0, 0 );

		if (this.state === STATE.PAN && this.enableDamping) {
			if (this._panOffset.length()) {
				this._panInertia.copy(this._panOffset).multiplyScalar( dt );
			}
		}
		this._panOffset.set( 0, 0, 0 );

		this._scale = 1;
		this.needsUpdate = false;
		this.dispatchEvent( {type: "change"} );
		return true;
	}

	onPointerMove( pointers ) {
		switch ( pointers.length ) {
			default:
			case 0:
				this.state = STATE.NONE;
				break;
			case 1:
				switch ( pointers[0].button ) {
					case BUTTON.LEFT:
						if ( pointers[0].ctrlKey || pointers[0].metaKey ) {
							if ( this.enablePan === false ) return;
							this.state = STATE.PAN;
							this.pan( pointers[0] ); // TODO: correct scale
						} else {
							if ( this.enableRotate === false ) return;
							this.state = STATE.ROTATE;
							this.rotate( pointers[0] );
						}
						break;
					case BUTTON.MIDDLE:
						if ( this.enableZoom === false ) return;
						this.state = STATE.DOLLY;
						this.dolly( pointers[0].movement.y );
						break;
					case BUTTON.RIGHT:
						if ( this.enablePan === false ) return;
						this.state = STATE.PAN;
						this.pan( pointers[0] ); // TODO: correct scale
						break;
				}
				break;
			case 2: // two-fingered touch: dolly-pan
				console.log('TODO');
				// if ( scope.enableZoom === false && scope.enablePan === false ) return;
				// if ( this.state !== STATE.TOUCH_DOLLY_PAN ) return; // is this needed?
				// 	if ( this.enableZoom ) {
				// 		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				// 		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				// 		var distance = Math.sqrt( dx * dx + dy * dy );
				// 		dollyEnd.set( 0, distance );
				// 		dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, this.zoomSpeed ) );
				// 		this.dollyIn( dollyDelta.y );
				// 		dollyStart.copy( dollyEnd );
				// 	}
				// 	if ( this.enablePan ) {
				// 		var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
				// 		var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
				// 		panEnd.set( x, y );
				// 		panDelta.subVectors( panEnd, panStart ).multiplyScalar( this.panSpeed );
				// 		pan( panDelta.x, panDelta.y );
				// 		panStart.copy( panEnd );
				// 	}
				break;
		}
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0 ) this.state = STATE.NONE;
	}
	onKeyDown( event ) {
		if ( this.enableKeys === false || this.enablePan === false ) return;
		switch ( event.keyCode ) {
			case KEYS.UP:
				this.panUp( this.keyPanSpeed );
				break;
			case KEYS.BOTTOM:
				this.panUp( - this.keyPanSpeed );
				break;
			case KEYS.LEFT:
				this.panLeft( this.keyPanSpeed );
				break;
			case KEYS.RIGHT:
				this.panLeft( - this.keyPanSpeed );
				break;
		}
	}
	onWheel( event ) {
		if ( this.enableZoom === false || ( this.state !== STATE.NONE && this.state !== STATE.ROTATE ) ) return;
		event.stopPropagation();
		if ( event.deltaY < 0 ) {
			this.dollyOut( Math.pow( 0.95, this.zoomSpeed ) );
		} else if ( event.deltaY > 0 ) {
			this.dollyIn( Math.pow( 0.95, this.zoomSpeed ) );
		}
	}
	// control methods
	pan( pointer ) {
		if ( this.object.isPerspectiveCamera ) {
			tempVector.copy( this.object.position ).sub( this.target );
			let targetDistance = tempVector.length();
			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );
			// we use only clientHeight here so aspect ratio does not distort speed
			this.panLeft( pointer.movement.x * targetDistance * this.panSpeed );
			this.panUp( -pointer.movement.y * targetDistance * this.panSpeed );
		} else if ( this.object.isOrthographicCamera ) {
			this.panLeft( pointer.movement.x * ( this.object.right - this.object.left ) / this.object.zoom * this.panSpeed );
			this.panUp( -pointer.movement.y * ( this.object.top - this.object.bottom ) / this.object.zoom * this.panSpeed );
		}
	}
	panLeft( distance ) {
		tempVector.setFromMatrixColumn( this.object.matrix, 0 );
		tempVector.multiplyScalar( - distance );
		this._panOffset.add( tempVector );
		this.needsUpdate = true;
	}
	panUp( distance ) {
		if ( this.screenSpacePanning === true ) {
			tempVector.setFromMatrixColumn( this.object.matrix, 1 );
		} else {
			tempVector.setFromMatrixColumn( this.object.matrix, 0 );
			tempVector.crossVectors( this.object.up, tempVector );
		}
		tempVector.multiplyScalar( distance );
		this._panOffset.add( tempVector );
		this.needsUpdate = true;
	}
	dolly( dollyDir ) {
		let dollyScale = ( dollyDir > 0 ) ? 1 - dollyDir : 1 / (1 + dollyDir);
		if ( this.object.isPerspectiveCamera ) {
			this._scale /= dollyScale;
		} else if ( this.object.isOrthographicCamera ) {
			this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
		}
		this.object.updateProjectionMatrix();
		this.needsUpdate = true;
	}
	rotate( pointer ) {
		this._sphericalOffset.theta = -pointer.movement.x * this.rotateSpeed;
		this._sphericalOffset.phi = pointer.movement.y * this.rotateSpeed;
		this.needsUpdate = true;
	}
	// utility getters
	get polarAngle() {
		return this._spherical.phi;
	}
	get azimuthalAngle() {
		return this._spherical.theta;
	}
}
