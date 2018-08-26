/**
 * @author arodic / https://github.com/arodic
 */

import {EventDispatcher, Vector2} from "../../three.js/build/three.module.js";

function makePointerEvent( type, pointers ) {
	const event = Object.assign( { type: type }, pointers );
	event.length = pointers.length;
	return event;
}

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
*/

// TODO: implement dom element swap and multiple dom elements

export class Listener extends EventDispatcher {
	constructor( domElement ) {
		super();

		if ( domElement === undefined || !(domElement instanceof HTMLElement) ) {
			console.warn( 'Listener: domElement is mandatory in constructor!' );
			domElement = document;
		}

		this.domElement = domElement;
		this.pointers = new ControlPointers();

		const scope = this;

		function _onContextmenu( event ) {
			event.preventDefault();
			scope.dispatchEvent( { type: "contextmenu" } );
		}

		function _onMouseDown( event ) {
			domElement.removeEventListener( "mousemove", _onMouseHover, false );
			document.addEventListener( "mousemove", _onMouseMove, false );
			document.addEventListener( "mouseup", _onMouseUp, false );
			scope.domElement.focus();
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );
		}
		function _onMouseMove( event ) {
			event.preventDefault();
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );
		}
		function _onMouseHover( event ) {
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointerhover", scope.pointers ) );
		}
		function _onMouseUp( event ) {
			domElement.addEventListener( "mousemove", _onMouseHover, false );
			document.removeEventListener( "mousemove", _onMouseMove, false );
			document.removeEventListener( "mouseup", _onMouseUp, false );
			scope.pointers.update( event, domElement, true );
			scope.dispatchEvent( makePointerEvent( "pointerup", scope.pointers ) );
		}

		function _onTouchDown( event ) {
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );
		}
		function _onTouchMove( event ) {
			event.preventDefault();
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );
		}
		function _onTouchHover( event ) {
			scope.pointers.update( event, domElement );
			scope.dispatchEvent( makePointerEvent( "pointerHover", scope.pointers ) );
		}
		function _onTouchUp( event ) {
			scope.pointers.update( event, domElement, !event.touches );
			scope.dispatchEvent( makePointerEvent( "pointerup", scope.pointers ) );
		}

		function _onKeyDown( event ) {
			scope.dispatchEvent( { type: "keydown", keyCode: event.keyCode } );
		}
		function _onKeyUp( event ) {
			scope.dispatchEvent( { type: "keyup", keyCode: event.keyCode } );
		}

		function _onWheel( event ) {
			event.preventDefault();
			// TODO: test on multiple platforms/browsers
			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			const delta = event.deltaY > 0 ? 1 : - 1;
			scope.dispatchEvent( { type: "wheel", delta: delta } );
		}

		function _onFocus( event ) {
			domElement.addEventListener( "blur", _onBlur, false );
			scope.dispatchEvent( { type: "focus" } );
		}
		function _onBlur( event ) {
			domElement.removeEventListener( "blur", _onBlur, false );
			scope.dispatchEvent( { type: "blur" } );
		}

		{
			domElement.addEventListener( "contextmenu", _onContextmenu, false );
			domElement.addEventListener( "mousedown", _onMouseDown, false );
			domElement.addEventListener( "mousemove", _onMouseHover, false );
			domElement.addEventListener( "touchstart", _onTouchHover, false );
			domElement.addEventListener( "touchstart", _onTouchDown, false );
			domElement.addEventListener( "touchmove", _onTouchMove, false );
			domElement.addEventListener( "touchend", _onTouchUp, false );
			domElement.addEventListener( "keydown", _onKeyDown, false );
			domElement.addEventListener( "keyup", _onKeyUp, false );
			domElement.addEventListener( "wheel", _onWheel, false );
			domElement.addEventListener( "focus", _onFocus, false );
		}

		this.dispose = function () {
			domElement.removeEventListener( "contextmenu", _onContextmenu, false );
			domElement.removeEventListener( "mousedown", _onMouseDown, false );
			domElement.removeEventListener( "mousemove", _onMouseHover, false );
			document.removeEventListener( "mousemove", _onMouseMove, false );
			document.removeEventListener( "mouseup", _onMouseUp, false );
			domElement.removeEventListener( "touchstart", _onTouchHover, false );
			domElement.removeEventListener( "touchstart", _onTouchDown, false );
			domElement.removeEventListener( "touchmove", _onTouchMove, false );
			domElement.removeEventListener( "touchend", _onTouchUp, false );
			domElement.removeEventListener( "keydown", _onKeyDown, false );
			domElement.removeEventListener( "keyup", _onKeyUp, false );
			domElement.removeEventListener( "wheel", _onWheel, false );
			domElement.removeEventListener( "focus", _onFocus, false );
			domElement.removeEventListener( "blur", _onBlur, false );
		};
	}
}

class Pointer {
	constructor() {
		this.position = new Vector2();
		this.previous = new Vector2();
		this.movement = new Vector2();
		this.start = new Vector2();
		this.button = undefined;
	}
	copy( pointer ) {
		this.position.copy( pointer.position );
		this.previous.copy( pointer.previous );
		this.movement.copy( pointer.movement );
		this.start.copy( pointer.start );
	}
	update( pointer, buttons ) {
		let button = 0;
		if ( buttons === 2 ) button = 1;
		if ( buttons === 4 ) button = 2;
		this.previous.copy( this.position );
		this.movement.copy( pointer.position ).sub( this.position );
		this.position.copy( pointer.position );
		this.button = button;
		this.buttons = buttons;
	}
}

// normalize mouse / touch pointer and remap {x,y} to view space.
export class ControlPointers extends Array {
	constructor() {
		super();
		this.ctrlKey = false;
		this.shiftKey = false;
		this.metaKey = false;
		this.altKey = false;
		this.removed = [];
	}
	getClosest( reference ) {
		let closest = this[0];
		for ( let i = 1; i < this.length; i++ ) {
			if ( reference.position.distanceTo( this[i].position ) < reference.position.distanceTo( closest.position ) ) {
				closest = this[i];
			}
		}
		return closest;
	}
	update( event, domElement, remove ) {
		this.ctrlKey = event.ctrlKey;
		this.shiftKey = event.shiftKey;
		this.metaKey = event.metaKey;
		this.altKey = event.altKey;
		this.removed = [];

		let touches = event.touches ? event.touches : [event];
		let foundPointers = [];
		let rect = domElement.getBoundingClientRect();
		for ( let i = 0; i < touches.length; i++ ) {
			if ( touches[i].target === event.target || event.touches === undefined ) {
				let position = new Vector2(
					( touches[i].clientX - rect.left ) / rect.width * 2.0 - 1.0,
					( touches[i].clientY - rect.top ) / rect.height * -2.0 + 1.0
				);
				if ( this[i] === undefined ) {
					this[i] = new Pointer();
					this[i].start.copy( position );
				}
				let newPointer = new Pointer();
				newPointer.position.copy( position );
				let pointer = this.getClosest( newPointer );
				pointer.update( newPointer, event.buttons );
				foundPointers.push( pointer );
			}
		}
		if ( remove ) foundPointers = [];
		for ( let i = this.length; i--; ) {
			if ( foundPointers.indexOf( this[i] ) === -1 ) {
				this.removed.push( this[i] );
				this.splice( i, 1 );
			}
		}
	}
}
