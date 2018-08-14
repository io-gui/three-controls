/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 * @author arodic / https://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {CameraControls} from "./CameraControls.js";

/*
 * This set of controls performs orbiting, dollying (zooming), and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrl/metaKey, wasd, or arrow keys / touch: two-finger move
 */

const STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_DOLLY_PAN: 3 };
const KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, A: 65, S: 83, D: 68 }; // Direction keys
const BUTTON = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT }; // Mouse buttons
const EPS = 0.000001;

// Temp variables
const eye = new THREE.Vector3();
const panDirection = new THREE.Vector2();
const eyeDirection = new THREE.Vector3();
const rotationAxis = new THREE.Vector3();
const rotationQuat = new THREE.Quaternion();
const upDirection = new THREE.Vector3();
const sideDirection = new THREE.Vector3();
const moveDirection = new THREE.Vector3();

// events
const changeEvent = { type: 'change' };

export class TrackballControls extends CameraControls {
	constructor( object, domElement ) {
		super( object, domElement );

		this.defineProperties({
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity // PerspectiveCamera dolly limit
		});
	}
	update( timestep, orbit, pan, dolly ) {
		super.update( timestep );
		console.log(orbit)
		const angle = orbit.length();
		if ( angle ) {
			eye.copy( this.object.position ).sub( this.target );
			eyeDirection.copy( eye ).normalize();
			upDirection.copy( this.object.up ).normalize();
			sideDirection.crossVectors( upDirection, eyeDirection ).normalize();
			upDirection.setLength( orbit.y );
			sideDirection.setLength( orbit.x );
			moveDirection.copy( upDirection.add( sideDirection ) );
			rotationAxis.crossVectors( moveDirection, eye ).normalize();
			rotationQuat.setFromAxisAngle( rotationAxis, angle );
			eye.applyQuaternion( rotationQuat );
			this.object.up.applyQuaternion( rotationQuat );
		}

		this.object.lookAt( this.target );

		this.dispatchEvent( changeEvent );
	}
	// rotate( dir ) {

	// 	// TODO: damping
	// }
	// zoomCamera() {
	// 	var factor;
	// 	if ( this.state === STATE.TOUCH_DOLLY_PAN ) {
	// 		factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
	// 		_touchZoomDistanceStart = _touchZoomDistanceEnd;
	// 		eye.multiplyScalar( factor );
	// 	} else {
	// 		factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * this.zoomSpeed;
	// 		if ( factor !== 1.0 && factor > 0.0 ) {
	// 			eye.multiplyScalar( factor );
	// 		}
	// 		if ( this.staticMoving ) {
	// 			_zoomStart.copy( _zoomEnd );
	// 		} else {
	// 			_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dampingFactor;
	// 		}
	// 	}
	// }
	// panCamera() {
	// 	mouseChange.copy( _panEnd ).sub( _panStart );
	// 	if ( mouseChange.lengthSq() ) {
	// 		mouseChange.multiplyScalar( eye.length() * this.panSpeed );
	// 		pan.copy( eye ).cross( this.object.up ).setLength( mouseChange.x );
	// 		pan.add( up.copy( this.object.up ).setLength( mouseChange.y ) );
	// 		this.object.position.add( pan );
	// 		this.target.add( pan );
	// 		if ( this.staticMoving ) {
	// 			_panStart.copy( _panEnd );
	// 		} else {
	// 			_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( this.dampingFactor ) );
	// 		}
	// 	}
	// }
	// checkDistances() {
	// 	if ( this.enableZoom || this.enablePan ) {
	// 		if ( eye.lengthSq() > this.maxDistance * this.maxDistance ) {
	// 			this.object.position.addVectors( this.target, eye.setLength( this.maxDistance ) );
	// 			_zoomStart.copy( _zoomEnd );
	// 		}
	// 		if ( eye.lengthSq() < this.minDistance * this.minDistance ) {
	// 			this.object.position.addVectors( this.target, eye.setLength( this.minDistance ) );
	// 			_zoomStart.copy( _zoomEnd );
	// 		}
	// 	}
	// }
	// onPointerMove( pointers ) {
	// 	eye.subVectors( this.object.position, this.target );
	// 	switch ( pointers.length ) {
	// 		case 1:
	// 			switch ( pointers[0].button ) {
	// 				case BUTTON.LEFT:
	// 					if ( pointers[0].ctrlKey || pointers[0].metaKey ) {
	// 						if ( this.enablePan === false ) return;
	// 						this.state = STATE.PAN;
	// 						this.pan( pointers[0] ); // TODO: correct scale
	// 					} else {
	// 						if ( this.enableRotate === false ) return;
	// 						this.state = STATE.ROTATE;
	// 						this.rotate( pointers[0].movement );
	// 					}
	// 					break;
	// 				case BUTTON.MIDDLE:
	// 					if ( this.enableZoom === false ) return;
	// 					this.state = STATE.DOLLY;
	// 					this.dolly( pointers[0].movement.y );
	// 					break;
	// 				case BUTTON.RIGHT:
	// 					if ( this.enablePan === false ) return;
	// 					this.state = STATE.PAN;
	// 					this.pan( pointers[0].movement ); // TODO: correct scale
	// 					break;
	// 			}
	// 			break;
	// 		default: // 2 or more
	// 			// two-fingered touch: dolly-pan
	// 			if ( this.enableZoom === false && this.enablePan === false ) return;
	// 			this.state = STATE.TOUCH_DOLLY_PAN;
	// 			if ( this.enableZoom ) {
	// 				var distance = pointers[0].position.distanceTo( pointers[1].position );
	// 				var prevDistance = pointers[0].previous.distanceTo( pointers[1].previous );
	// 				this.dolly( (prevDistance - distance) * this.zoomSpeed );
	// 			}
	// 			if ( this.enablePan ) {
	// 				panDirection.copy(pointers[0].movement).add(pointers[1].movement).multiplyScalar( this.panSpeed );
	// 				this.pan( panDirection ); // TODO: unhack
	// 			}
	// 			break;
	// 	}
	// 	// this.update();
	// }
	// keydown( event ) {
	// 	if ( this.state !== STATE.NONE ) {
	// 		return;
	// 	} else if ( event.keyCode === KEYS[ STATE.ROTATE ] && this.enableRotate ) {
	// 		this.state = STATE.ROTATE;
	// 	} else if ( event.keyCode === KEYS[ STATE.DOLLY ] && this.enableZoom ) {
	// 		this.state = STATE.DOLLY;
	// 	} else if ( event.keyCode === KEYS[ STATE.PAN ] && this.enablePan ) {
	// 		this.state = STATE.PAN;
	// 	}
	// }
	// mousewheel( event ) {
	// 	if ( !this.enableZoom ) return;
	// 	switch ( event.deltaMode ) {
	// 		case 2: // Dolly in pages
	// 			_zoomStart.y -= event.deltaY * 0.025;
	// 			break;
	// 		case 1: // Dolly in lines
	// 			_zoomStart.y -= event.deltaY * 0.01;
	// 			break;
	// 		default: // undefined, 0, assume pixels
	// 			_zoomStart.y -= event.deltaY * 0.00025;
	// 			break;
	// 	}
	// }
}
