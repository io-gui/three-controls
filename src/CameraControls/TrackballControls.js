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
 * This set of controls performs orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrl/metaKey, wasd, or arrow keys / touch: two-finger move
 */

// Temp variables
const eye = new THREE.Vector3();
const panDirection = new THREE.Vector3();
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
		// eye.subVectors( this.object.position, this.target );

		eye.copy( this.object.position ).sub( this.target );

		// Orbit
		eyeDirection.copy( eye ).normalize();
		upDirection.copy( this.object.up ).normalize();
		sideDirection.crossVectors( upDirection, eyeDirection ).normalize();
		upDirection.setLength( orbit.y );
		sideDirection.setLength( orbit.x );
		moveDirection.copy( upDirection.add( sideDirection ) );
		rotationAxis.crossVectors( moveDirection, eye ).normalize();
		rotationQuat.setFromAxisAngle( rotationAxis, orbit.length() );
		eye.applyQuaternion( rotationQuat );
		this.object.up.applyQuaternion( rotationQuat );

		// Dolly
		let dollyScale = ( dolly > 0 ) ? 1 - dolly : 1 / ( 1 + dolly );
		eye.multiplyScalar( dollyScale );

		// Pan
		panDirection.copy( eye ).cross( this.object.up ).setLength( pan.x * eye.length() );
		panDirection.add( upDirection.copy( this.object.up ).setLength( -pan.y * eye.length() ) );
		this.object.position.add( panDirection );
		this.target.add( panDirection );

		this.object.position.addVectors( this.target, eye );
		this.object.lookAt( this.target );
		this.dispatchEvent( changeEvent );
	}
}
