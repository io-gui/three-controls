/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D} from "../../three.js/build/three.module.js";
import {ControlPointers} from "./ControlPointers.js";

export class Control extends Object3D {
	constructor( domElement ) {
		super();
		this.visible = false;

		if ( domElement === undefined ) {
			console.warn( 'domElement is mandatory in constructor!' );
			domElement = document;
		}

		// TODO: implement dragging

		this.defineProperties( {
			"enabled": true,
			"hovered": true,
			"domElement": domElement,
			"pointers": new ControlPointers()
		} );

		const scope = this;

		function _onContextMenu( event ) {
			if ( !scope.enabled ) return;
			event.preventDefault();
			scope.onContextMenu( event );
			scope.dispatchEvent( { type: "contextmenu", detail: event } );
		}
		function _onHover( event ) {
			if ( !scope.enabled ) return;
			if ( !this.hovered ) {
				window.addEventListener( "keydown", _onKeyDown, false );
				window.addEventListener( "keyup", _onKeyUp, false );
			}
			this.hovered = true;
			scope.pointers.update( event, domElement );
			scope.onPointerHover( scope.pointers );
			scope.dispatchEvent( { type: "hover", detail: event } );
		}
		function _onLeave( event ) {
			if ( !scope.enabled ) return;
			if ( this.hovered ) {
				window.removeEventListener( "keydown", _onKeyDown, false );
				window.removeEventListener( "keyup", _onKeyUp, false );
			}
			this.hovered = false;
			scope.pointers.update( event, domElement );
			scope.onPointerLeave( scope.pointers );
			scope.dispatchEvent( { type: "pointerleave", detail: event } );
		}
		function _onDown( event ) {
			if ( !scope.enabled ) return;
			scope.pointers.update( event, domElement );
			scope.onPointerHover( scope.pointers );
			scope.onPointerDown( scope.pointers );
			domElement.removeEventListener( "mousemove", _onHover );
			document.addEventListener( "mousemove", _onMove, false );
			document.addEventListener( "mouseup", _onUp, false );
			scope.dispatchEvent( { type: "pointerdown", detail: event } );
		}
		function _onMove( event ) {
			if ( !scope.enabled ) {
				document.removeEventListener( "mousemove", _onMove, false );
				document.removeEventListener( "mouseup", _onUp, false );
				return;
			}
			event.preventDefault();
			scope.pointers.update( event, domElement );
			scope.onPointerMove( scope.pointers );
			scope.dispatchEvent( { type: "pointermove", detail: event } );
		}
		function _onUp( event ) {
			if ( !scope.enabled ) return;
			scope.pointers.update( event, domElement, !event.touches );
			scope.onPointerUp( scope.pointers );
			domElement.addEventListener( "mousemove", _onHover );
			document.removeEventListener( "mousemove", _onMove, false );
			document.removeEventListener( "mouseup", _onUp, false );
			scope.dispatchEvent( { type: "pointerup", detail: event } );
		}
		function _onKeyDown( event ) {
			if ( !scope.enabled ) return;
			scope.onKeyDown( event );
			scope.dispatchEvent( { type: "keydown", detail: event } );
		}
		function _onKeyUp( event ) {
			if ( !scope.enabled ) return;
			scope.onKeyUp( event );
			scope.dispatchEvent( { type: "keyup", detail: event } );
		}

		function _onWheel( event ) {
			if ( !scope.enabled ) return;
			event.preventDefault();
			// TODO: test on multiple platforms/browsers
			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			const delta = event.deltaY > 0 ? 1 : - 1
			scope.onWheel( delta );
			scope.dispatchEvent( { type: "wheel", detail: event } );
		}

		{
			domElement.addEventListener( "mousedown", _onDown, false );
			domElement.addEventListener( "touchstart", _onDown, false );
			domElement.addEventListener( "mousemove", _onHover, false );
			domElement.addEventListener( "touchmove", _onMove, false );
			domElement.addEventListener( "touchend", _onUp, false );
			domElement.addEventListener( "touchcancel", _onLeave, false );
			domElement.addEventListener( "touchleave", _onLeave, false );
			domElement.addEventListener( "mouseleave", _onLeave, false );
			domElement.addEventListener( "contextmenu", _onContextMenu, false );
			domElement.addEventListener( "wheel", _onWheel, false );
		}

		this.dispose = function () {
			domElement.removeEventListener( "mousedown", _onDown );
			domElement.removeEventListener( "touchstart", _onDown );
			domElement.removeEventListener( "mousemove", _onHover );
			document.removeEventListener( "mousemove", _onMove );
			domElement.removeEventListener( "touchmove", _onMove );
			document.removeEventListener( "mouseup", _onUp );
			domElement.removeEventListener( "touchend", _onUp );
			domElement.removeEventListener( "touchcancel", _onLeave );
			domElement.removeEventListener( "touchleave", _onLeave );
			domElement.removeEventListener( "mouseleave", _onLeave );
			domElement.removeEventListener( "contextmenu", _onContextMenu );
			window.removeEventListener( "keydown", _onKeyDown, false );
			window.removeEventListener( "keyup", _onKeyUp, false );
			domElement.removeEventListener( "wheel", _onWheel, false );
			this.stopAnimation();
		};
		// Internal animation utility variables
		this._animationActive = false;
		this._animationTime = 0;
		this._rafID;
	}
	// Optional animation methods
	startAnimation() {
		if ( !this._animationActive ) {
			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame( () => {
				const time = performance.now();
				this.animate( time - this._animationTime );
				this._animationTime = time;
			} );
		}
	}
	animate( timestep ) {
		if ( this._animationActive ) this._rafID = requestAnimationFrame( () => {
			const time = performance.now();
			timestep = time - this._animationTime;
			this.animate( timestep );
			this._animationTime = time;
		} );
	}
	stopAnimation() {
		this._animationActive = false;
		cancelAnimationFrame( this._rafID );
	}
	// Defines getter, setter and store for a property
	defineProperty( propName, defaultValue ) {
		let propValue = defaultValue;
		Object.defineProperty( this, propName, {
			get: function() {
				return propValue !== undefined ? propValue : defaultValue;
			},
			set: function( value ) {
				if ( propValue !== value ) {
					propValue = value;
					this.dispatchEvent( { type: propName + "-changed", value: value } );
					this.dispatchEvent( { type: "change", prop: propName, value: value } );
				}
			}
		} );
		this[propName] = defaultValue;
		this.dispatchEvent( { type: propName + "-changed", value: defaultValue } );
		this.dispatchEvent( { type: "change", prop: propName, value: defaultValue } );
	}
	defineProperties( props ) {
		for ( let prop in props ) {
			this.defineProperty( prop, props[prop] );
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
	onContextMenu() {} // event
	onPointerHover() {} // pointer
	onPointerDown() {} // pointer
	onPointerMove() {} // pointer
	onPointerUp() {} // pointer
	onPointerLeave() {} // pointer
	onKeyDown() {} // event
	onKeyUp() {} // event
	onWheel() {} // event
}
