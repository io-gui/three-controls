/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";

// events
const changeEvent = { type: 'change' };

// internals
// TODO: move
const vector2 = new THREE.Vector2();
const vector3 = new THREE.Vector3();
const delta = new THREE.Vector3();
const box = new THREE.Box3();

const normalMatrix = new THREE.Matrix3();
const pointer = new THREE.Vector2();
const pointerOld = new THREE.Vector2();
const spherical = new THREE.Spherical();

export class EditorControls extends Control {
	constructor(	object,	domElement	)	{
		super(	domElement	);

		this.defineProperties({
			center:	new	THREE.Vector3(),
			object:	object,
			panSpeed:	0.3,
			zoomSpeed: 1,
			rotationSpeed:	1
		});

		this.object.lookAt( this.center );
		this.dispatchEvent( changeEvent );
	}
	focus( target ) {
		var distance;
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
		delta.applyQuaternion( object.quaternion );
		delta.multiplyScalar( distance * 4 );
		this.object.position.copy( this.center ).add( delta );
		this.dispatchEvent( changeEvent );
	}
	pan( delta ) {
		var distance = this.object.position.distanceTo( this.center );
		delta.multiplyScalar( distance * this.panSpeed );
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.object.matrix ) );
		this.object.position.add( delta );
		this.center.add( delta );
		this.dispatchEvent( changeEvent );
	}
	zoom( delta ) {
		var distance = this.object.position.distanceTo( this.center );
		delta.multiplyScalar( distance * this.zoomSpeed );
		if ( delta.length() > distance ) return;
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.object.matrix ) );
		this.object.position.add( delta );
		this.dispatchEvent( changeEvent );
	}
	rotate( delta ) {
		vector3.copy( this.object.position ).sub( this.center );
		spherical.setFromVector3( vector3 );
		spherical.theta += delta.x;
		spherical.phi -= delta.y;
		spherical.makeSafe();
		vector3.setFromSpherical( spherical );
		this.object.position.copy( this.center ).add( vector3 );
		this.object.lookAt( this.center );
		this.dispatchEvent( changeEvent );
	}

	onPointerMove( pointers ) {
		switch ( pointers.length ) {
			case 1:
				if ( pointers[0].button === 0 ) {
					this.rotate( vector2.copy( pointers[0].movement ).multiplyScalar( - this.rotationSpeed ) );
				} else if ( pointers[0].button === 1 ) {
					this.zoom( delta.set( 0, 0, pointers[0].movement.y ) );
				} else if ( pointers[0].button === 2 ) {
					this.pan( delta.set( - pointers[0].movement.x, -pointers[0].movement.y, 0 ) );
				}
				break;
			case 2:
				var distance = pointers[0].position.distanceTo( pointers[1].position );
				var prevDistance = pointers[0].previous.distanceTo( pointers[1].previous );
				this.zoom( delta.set( 0, 0, prevDistance - distance ) );
				break;
		}
	}
	onWheel( deltaWheel ) {
		this.zoom( delta.set( 0, 0, deltaWheel * 0.1 ) );
	}
}
