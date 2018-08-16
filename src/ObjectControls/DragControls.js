/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";

const _plane = new THREE.Plane();
const _raycaster = new THREE.Raycaster();
const _offset = new THREE.Vector3();
const _intersection = new THREE.Vector3();
let _selected = null;

// TODO: original controls stick when dragout

// events
const changeEvent = { type: "change" };

export class DragControls extends Control {
	constructor( objects, camera, domElement ) {
		super( domElement );

		if ( camera === undefined || !camera.isCamera ) {
			console.warn( 'camera is mandatory in constructor!' );
		}

		// TODO: check objects and implement selection

		this.defineProperties({
			objects: objects,
			camera: camera
		});

	}
	onPointerDown( pointers ) {
		_raycaster.setFromCamera( pointers[0].position, this.camera );
		_plane.setFromNormalAndCoplanarPoint( this.camera.getWorldDirection( _plane.normal ), this.object.position );
		let intersects = _raycaster.intersectObjects( this.objects );
		if ( intersects.length > 0 ) {
			_selected = intersects[ 0 ].object;
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
				this.active = true;
				_offset.copy( _intersection ).sub( _selected.position );
			}
		}
	}
	onPointerMove( pointers ) {
		let rect = this.domElement.getBoundingClientRect();
		_raycaster.setFromCamera( pointers[0].position, this.camera );
		_plane.setFromNormalAndCoplanarPoint( this.camera.getWorldDirection( _plane.normal ), this.object.position );
		if ( _selected && this.enabled ) {
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
				_selected.position.copy( _intersection.sub( _offset ) );
				this.needsUpdate = false;
			}
		}
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0 ) {
			_selected = null;
			this.active = false;
			// domElement.style.cursor = 'auto';
		}
	}
	attach( object ) {
		this.object = object;
		this.visible = true;
	}
	detach() {
		this.object = undefined;
		this.visible = false;
	}
	// Deprication warnings
	setObjects() {
		console.error( 'THREE.DragControls: setObjects() has been removed.' );
	}
	on( type, listener ) {
		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		this.addEventListener( type, listener );
	}
	off( type, listener ) {
		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		this.removeEventListener( type, listener );
	}
	notify( type ) {
		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		this.dispatchEvent( { type: type } );
	}
}
