import { Object3D, Vector2 } from '../../../three.js/build/three.module.js';

/**
 * @author arodic / https://github.com/arodic
 */

// TODO: implement cancel event

// events
// const changeEvent = { type: 'change' };

class Control extends Object3D {

	constructor( domElement ) {

		super();
		this.visible = false;

		if ( domElement === undefined || ! ( domElement instanceof HTMLElement ) ) {

			console.warn( 'Control: domElement is mandatory in constructor!' );
			domElement = document;

		}

		Object.defineProperty( this, '_properties', {
			value: {},
			enumerable: false
		} );

		// TODO: implement dragging

		this.defineProperties( {
			domElement: domElement,
			pointers: new ControlPointers(),
			enabled: true,
			hovered: true,
			active: false,
			needsUpdate: false
		} );

		const scope = this;

		function _onContextMenu( event ) {

			if ( ! scope.enabled ) return;
			event.preventDefault();
			scope.onContextMenu( event );
			scope.dispatchEvent( { type: "contextmenu", detail: event } );

		}
		function _onHover( event ) {

			if ( ! scope.enabled ) return;
			if ( ! this.hovered ) {

				window.addEventListener( "keydown", _onKeyDown, false );
				window.addEventListener( "keyup", _onKeyUp, false );

			}
			this.hovered = true;
			scope.pointers.update( event, domElement );
			scope.onPointerHover( scope.pointers );
			scope.dispatchEvent( { type: "hover", detail: event } );

		}
		function _onLeave( event ) {

			if ( ! scope.enabled ) return;
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

			if ( ! scope.enabled ) return;
			scope.pointers.update( event, domElement );
			scope.onPointerHover( scope.pointers );
			scope.onPointerDown( scope.pointers );
			domElement.removeEventListener( "mousemove", _onHover );
			document.addEventListener( "mousemove", _onMove, false );
			document.addEventListener( "mouseup", _onUp, false );
			scope.dispatchEvent( { type: "pointerdown", detail: event } );

		}
		function _onMove( event ) {

			if ( ! scope.enabled ) {

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

			if ( ! scope.enabled ) return;
			scope.pointers.update( event, domElement, ! event.touches );
			scope.onPointerUp( scope.pointers );
			domElement.addEventListener( "mousemove", _onHover );
			document.removeEventListener( "mousemove", _onMove, false );
			document.removeEventListener( "mouseup", _onUp, false );
			scope.dispatchEvent( { type: "pointerup", detail: event } );

		}
		function _onKeyDown( event ) {

			if ( ! scope.enabled ) return;
			scope.onKeyDown( event );
			scope.dispatchEvent( { type: "keydown", detail: event } );

		}
		function _onKeyUp( event ) {

			if ( ! scope.enabled ) return;
			scope.onKeyUp( event );
			scope.dispatchEvent( { type: "keyup", detail: event } );

		}
		function _onWheel( event ) {

			if ( ! scope.enabled ) return;
			event.preventDefault();
			// TODO: test on multiple platforms/browsers
			// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
			const delta = event.deltaY > 0 ? 1 : - 1;
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

		this.addEventListener( 'needsUpdate-changed', ( event ) => {

			if ( event.value ) this.startAnimation();

		} );

		this.addEventListener( 'enabled-changed', ( event ) => {

			if ( event.value ) this.startAnimation();
			else this.stopAnimation();

		} );

	}
	// Optional animation methods
	startAnimation() {

		if ( ! this._animationActive ) {

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
		this.update( timestep );

	}
	stopAnimation() {

		this._animationActive = false;
		cancelAnimationFrame( this._rafID );

	}
	update( timestep ) {

		if ( timestep === undefined ) console.log( 'Control: updated function required timestep parameter!' );

	}
	// Defines getter, setter and store for a property
	defineProperty( propName, defaultValue ) {

		this._properties[ propName ] = defaultValue;
		Object.defineProperty( this, propName, {
			get: function () {

				return this._properties[ propName ] !== undefined ? this._properties[ propName ] : defaultValue;

			},
			set: function ( value ) {

				if ( this._properties[ propName ] !== value ) {

					this._properties[ propName ] = value;
					this.dispatchEvent( { type: propName + "-changed", value: value } );
					this.dispatchEvent( { type: "change", prop: propName, value: value } );

				}

			}
		} );
		this[ propName ] = defaultValue;
		setTimeout( () => {

			this.dispatchEvent( { type: propName + "-changed", value: defaultValue } );
			this.dispatchEvent( { type: "change", prop: propName, value: defaultValue } );

		} );

	}
	defineProperties( props ) {

		for ( let prop in props ) {

			this.defineProperty( prop, props[ prop ] );

		}

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
	// Deprication warnings
	addEventListener( type, listener ) {

		super.addEventListener( type, listener );
		if ( type === "start" ) {

			console.warn( '"start" event depricated, use "pointerdown" or "dragging-changed" event instead.' );

		}
		if ( type === "end" ) {

			console.warn( '"end" event depricated, use "pointerup" or "dragging-changed" event instead.' );

		}
		if ( type === "dragstart" ) {

			console.warn( '"dragstart" event depricated, use "pointerdown" or "active-changed" event instead.' );

		}
		if ( type === "drag" ) {

			console.warn( '"drag" event depricated, use "change" event instead.' );

		}
		if ( type === "dragend" ) {

			console.warn( '"dragend" event depricated, use "pointerup" or "active-changed" event instead.' );

		}
		if ( type === "hoveron" ) {

			console.warn( '"hoveron" event depricated.' );

		}
		if ( type === "hoveroff" ) {

			console.warn( '"dragend" event depricated.' );

		}

	}

}

class Pointer {

	constructor() {

		this.position = new Vector2();
		this.previous = new Vector2();
		this.movement = new Vector2();
		this.velocity = new Vector2();
		this.distance = new Vector2();
		this.start = new Vector2();
		this.button = undefined;

	}
	copy( pointer ) {

		this.position.copy( pointer.position );
		this.previous.copy( pointer.previous );
		this.movement.copy( pointer.movement );
		this.velocity.copy( pointer.velocity );
		this.distance.copy( pointer.distance );
		this.start.copy( pointer.start );

	}
	update( pointer, buttons, dt ) {

		let button = 0;
		if ( event.buttons === 2 ) button = 1;
		if ( event.buttons === 4 ) button = 2;
		this.previous.copy( this.position );
		this.movement.copy( pointer.position ).sub( this.position );
		this.velocity.copy( this.movement ).multiplyScalar( 1 / dt );
		this.distance.copy( pointer.position ).sub( this.start );
		this.position.copy( pointer.position );
		this.button = button;
		this.buttons = buttons;

	}

}

// normalize mouse / touch pointer and remap {x,y} to view space.
class ControlPointers extends Array {

	constructor() {

		super();
		this.ctrlKey = false;
		this.shiftKey = false;
		this.metaKey = false;
		this.altKey = false;
		this.removed = [];

		Object.defineProperty( this, 'time', { value: 0, enumerable: false, writable: true } );

	}
	getClosest( reference ) {

		let closest = this[ 0 ];
		for ( let i = 1; i < this.length; i ++ ) {

			if ( reference.position.distanceTo( this[ i ].position ) < reference.position.distanceTo( closest.position ) ) {

				closest = this[ i ];

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

		let dt = ( performance.now() - this.time ) / 1000;
		this.time = performance.now();

		let touches = event.touches ? event.touches : [ event ];
		let foundPointers = [];
		let rect = domElement.getBoundingClientRect();
		for ( let i = 0; i < touches.length; i ++ ) {

			if ( touches[ i ].target === event.target || event.touches === undefined ) {

				let position = new Vector2(
					( touches[ i ].clientX - rect.left ) / rect.width * 2.0 - 1.0,
					- ( ( touches[ i ].clientY - rect.top ) / rect.height * 2.0 - 1.0 )
				);
				if ( this[ i ] === undefined ) {

					this[ i ] = new Pointer();
					this[ i ].start.copy( position );

				}
				let newPointer = new Pointer();
				newPointer.position.copy( position );
				let pointer = this.getClosest( newPointer );
				pointer.update( newPointer, event.buttons, dt );
				foundPointers.push( pointer );

			}

		}
		if ( remove ) foundPointers = [];
		for ( let i = this.length; i --; ) {

			if ( foundPointers.indexOf( this[ i ] ) === - 1 ) {

				this.removed.push( this[ i ] );
				this.splice( i, 1 );

			}

		}

	}

}

class ObjectControls extends Control {

}

export { ObjectControls };
