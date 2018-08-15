/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";

const _plane = new THREE.Plane();
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();
const _offset = new THREE.Vector3();
const _intersection = new THREE.Vector3();
let _selected = null, _hovered = null;

export class DragControls extends Control {
	constructor( objects, camera, domElement ) {
		super( domElement );
		if ( objects instanceof THREE.Camera ) {
			console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
			let temp = objects; objects = camera; camera = temp;
		}
		//
		let scope = this;
		function activate() {
			domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
			domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
			domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
			domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
			domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
			domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
			domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );
		}
		function deactivate() {
			domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
			domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
			domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
			domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
			domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
			domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );
		}
		function dispose() {
			deactivate();
		}
		function onDocumentMouseMove( event ) {
			event.preventDefault();
			let rect = domElement.getBoundingClientRect();
			_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
			_raycaster.setFromCamera( _mouse, camera );
			if ( _selected && scope.enabled ) {
				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
					_selected.position.copy( _intersection.sub( _offset ) );
				}
				scope.dispatchEvent( { type: 'drag', object: _selected } );
				return;
			}
			_raycaster.setFromCamera( _mouse, camera );
			let intersects = _raycaster.intersectObjects( objects );
			if ( intersects.length > 0 ) {
				let object = intersects[ 0 ].object;
				_plane.setFromNormalAndCoplanarPoint( camera.getWorldDirection( _plane.normal ), object.position );
				if ( _hovered !== object ) {
					scope.dispatchEvent( { type: 'hoveron', object: object } );
					domElement.style.cursor = 'pointer';
					_hovered = object;
				}
			} else {
				if ( _hovered !== null ) {
					scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );
					domElement.style.cursor = 'auto';
					_hovered = null;
				}
			}
		}
		function onDocumentMouseDown( event ) {
			event.preventDefault();
			_raycaster.setFromCamera( _mouse, camera );
			let intersects = _raycaster.intersectObjects( objects );
			if ( intersects.length > 0 ) {
				_selected = intersects[ 0 ].object;
				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
					_offset.copy( _intersection ).sub( _selected.position );
				}
				domElement.style.cursor = 'move';
				scope.dispatchEvent( { type: 'dragstart', object: _selected } );
			}
		}
		function onDocumentMouseCancel( event ) {
			event.preventDefault();
			if ( _selected ) {
				scope.dispatchEvent( { type: 'dragend', object: _selected } );
				_selected = null;
			}
			domElement.style.cursor = _hovered ? 'pointer' : 'auto';
		}
		function onDocumentTouchMove( event ) {
			event.preventDefault();
			event = event.changedTouches[ 0 ];
			let rect = domElement.getBoundingClientRect();
			_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
			_raycaster.setFromCamera( _mouse, camera );
			if ( _selected && scope.enabled ) {
				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
					_selected.position.copy( _intersection.sub( _offset ) );
				}
				scope.dispatchEvent( { type: 'drag', object: _selected } );
				return;
			}
		}
		function onDocumentTouchStart( event ) {
			event.preventDefault();
			event = event.changedTouches[ 0 ];
			let rect = domElement.getBoundingClientRect();
			_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
			_raycaster.setFromCamera( _mouse, camera );
			let intersects = _raycaster.intersectObjects( objects );
			if ( intersects.length > 0 ) {
				_selected = intersects[ 0 ].object;
				_plane.setFromNormalAndCoplanarPoint( camera.getWorldDirection( _plane.normal ), _selected.position );
				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
					_offset.copy( _intersection ).sub( _selected.position );
				}
				domElement.style.cursor = 'move';
				scope.dispatchEvent( { type: 'dragstart', object: _selected } );
			}
		}
		function onDocumentTouchEnd( event ) {
			event.preventDefault();
			if ( _selected ) {
				scope.dispatchEvent( { type: 'dragend', object: _selected } );
				_selected = null;
			}
			domElement.style.cursor = 'auto';
		}

		activate();

		// API
		this.enabled = true;
		this.activate = activate;
		this.deactivate = deactivate;
		this.dispose = dispose;
	}
	// Deprication warnings
	addEventListener( type, listener ) {
		super.addEventListener( type, listener );
		if ( type === "dragstart" ) {
			console.warn( '"dragstart" event depricated, use "pointerdown" or "active-changed" event instead.' );
		}
		if ( type === "dragend" ) {
			console.warn( '"dragend" event depricated, use "pointerup" or "active-changed" event instead.' );
		}
	}
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
