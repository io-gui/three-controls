/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {ViewportControls} from "./ViewportControls.js";

// Temp variables
const delta = new THREE.Vector3();
const box = new THREE.Box3();
const normalMatrix = new THREE.Matrix3();
const spherical = new THREE.Spherical();

// events
const changeEvent = { type: 'change' };

export class EditorControls extends ViewportControls {
	update( timestep, orbit, pan, dolly ) {
		super.update( timestep );

		// Orbit
		delta.copy( this.object.position ).sub( this.target );
		spherical.setFromVector3( delta );
		spherical.theta -= orbit.x;
		spherical.phi += orbit.y;
		spherical.makeSafe();
		delta.setFromSpherical( spherical );
		this.object.position.copy( this.target ).add( delta );
		this.object.lookAt( this.target );

		// Pan
		let distance = this.object.position.distanceTo( this.target );
		delta.set( -pan.x, -pan.y, 0 );
		delta.multiplyScalar( distance );
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.object.matrix ) );
		this.object.position.add( delta );
		this.target.add( delta );

		// Dolly
		delta.set( 0, 0, dolly );
		distance = this.object.position.distanceTo( this.target );
		delta.multiplyScalar( distance * this.dollySpeed );
		if ( delta.length() > distance ) return;
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.object.matrix ) );
		this.object.position.add( delta );

		this.dispatchEvent( changeEvent );
	}
	focus( target ) {
		let distance;
		box.setFromObject( target );
		if ( box.isEmpty() === false ) {
			this.center.copy( box.getCenter() );
			distance = box.getBoundingSphere().radius;
		} else {
			// Focusing on an Group, AmbientLight, etc
			this.center.setFromMatrixPosition( target.matrixWorld );
			distance = 0.1;
		}
		delta.set( 0, 0, 1 );
		delta.applyQuaternion( this.object.quaternion );
		delta.multiplyScalar( distance * 4 );
		this.object.position.copy( this.target ).add( delta );

		this.dispatchEvent( changeEvent );
	}
}
