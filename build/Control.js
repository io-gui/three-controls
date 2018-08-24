import { Object3D, Vector2 } from '../../three.js/build/three.module.js';

/**
 * @author arodic / https://github.com/arodic
 */

// TODO: implement cancel event

class Control extends Object3D {

	get isControl() {

		return true;

	}
	constructor( domElement ) {

		super();
		this.visible = false;

		if ( domElement === undefined || ! ( domElement instanceof HTMLElement ) ) {

			console.warn( 'Control: domElement is mandatory in constructor!' );
			domElement = document;

		}

		domElement.setAttribute( 'tabindex', 0 );

		this.defineProperties( {
			domElement: domElement,
			pointers: new ControlPointers(),
			// helper: new Object3D(),
			selection: null,
			enabled: true,
			active: false,
			enableKeys: true,
			needsUpdate: false
		} );

		const scope = this;

		function _onContextmenu( event ) {

			if ( scope.enabled ) {

				event.preventDefault();
				scope.onContextMenu( event );
				scope.dispatchEvent( { type: "contextmenu", detail: event } );

			}

		}

		function _onMouseDown( event ) {

			domElement.removeEventListener( "mousemove", _onMouseHover, false );
			document.addEventListener( "mousemove", _onMouseMove, false );
			document.addEventListener( "mouseup", _onMouseUp, false );
			if ( scope.enabled ) {

				scope.domElement.focus();
				scope.pointers.update( event, domElement );
				scope.onPointerDown( scope.pointers );
				scope.dispatchEvent( { type: "pointerdown", detail: event } );

			}

		}
		function _onMouseMove( event ) {

			if ( scope.enabled ) {

				event.preventDefault();
				scope.pointers.update( event, domElement );
				scope.onPointerMove( scope.pointers );
				scope.dispatchEvent( { type: "pointermove", detail: event } );

			}

		}
		function _onMouseHover( event ) {

			if ( scope.enabled ) {

				scope.pointers.update( event, domElement );
				scope.onPointerHover( scope.pointers );
				scope.dispatchEvent( { type: "hover", detail: event } );

			}

		}
		function _onMouseUp( event ) {

			domElement.addEventListener( "mousemove", _onMouseHover, false );
			document.removeEventListener( "mousemove", _onMouseMove, false );
			document.removeEventListener( "mouseup", _onMouseUp, false );
			if ( scope.enabled ) {

				scope.pointers.update( event, domElement, true );
				scope.onPointerUp( scope.pointers );
				scope.dispatchEvent( { type: "pointerup", detail: event } );

			}

		}

		function _onTouchDown( event ) {

			if ( scope.enabled ) {

				scope.pointers.update( event, domElement );
				scope.onPointerDown( scope.pointers );
				scope.dispatchEvent( { type: "pointerdown", detail: event } );

			}

		}
		function _onTouchMove( event ) {

			if ( scope.enabled ) {

				event.preventDefault();
				scope.pointers.update( event, domElement );
				scope.onPointerMove( scope.pointers );
				scope.dispatchEvent( { type: "pointermove", detail: event } );

			}

		}
		function _onTouchHover( event ) {

			if ( scope.enabled ) {

				scope.pointers.update( event, domElement );
				scope.onPointerHover( scope.pointers );
				scope.dispatchEvent( { type: "pointerHover", detail: event } );

			}

		}
		function _onTouchUp( event ) {

			if ( scope.enabled ) {

				scope.pointers.update( event, domElement, ! event.touches );
				scope.onPointerUp( scope.pointers );
				scope.dispatchEvent( { type: "pointerup", detail: event } );

			}

		}

		function _onKeyDown( event ) {

			if ( scope.enabled && scope.enableKeys ) {

				scope.onKeyDown( event );
				scope.dispatchEvent( { type: "keydown", detail: event } );

			}

		}
		function _onKeyUp( event ) {

			if ( scope.enabled && scope.enableKeys ) {

				scope.onKeyUp( event );
				scope.dispatchEvent( { type: "keyup", detail: event } );

			}

		}
		function _onWheel( event ) {

			if ( scope.enabled ) {

				event.preventDefault();
				// TODO: test on multiple platforms/browsers
				// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
				const delta = event.deltaY > 0 ? 1 : - 1;
				scope.onWheel( delta );
				scope.dispatchEvent( { type: "wheel", detail: event } );

			}

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

		this.needsUpdate = true;

	}
	// Optional animation methods
	startAnimation() {

		// console.log('start!');
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

		// console.log('stop!');
		this._animationActive = false;
		cancelAnimationFrame( this._rafID );

	}
	update( timestep ) {

		if ( timestep === undefined ) console.log( 'Control: update function requires timestep parameter!' );
		this.stopAnimation();
		this.needsUpdate = false;

	}
	// Control methods. Implement in subclass!

	onContextmenu() {} // event
	onPointerHover() {} // pointer
	onPointerDown() {} // pointer
	onPointerMove() {} // pointer
	onPointerUp() {} // pointer
	onPointerLeave() {} // pointer
	onKeyDown() {} // event
	onKeyUp() {} // event
	onWheel() {} // event
	// Defines getter, setter and store for a property
	defineProperty( propName, defaultValue ) {

		if ( ! this.hasOwnProperty( '_properties' ) ) {

			Object.defineProperty( this, '_properties', {
				value: {},
				enumerable: false
			} );

		}

		this._properties[ propName ] = defaultValue;
		Object.defineProperty( this, propName, {
			get: function () {

				return this._properties[ propName ] !== undefined ? this._properties[ propName ] : defaultValue;

			},
			set: function ( value ) {

				if ( this._properties[ propName ] !== value ) {

					this._properties[ propName ] = value;
					this.dispatchEvent( { type: propName + "-changed", value: value } );
					// TODO: consider removing (Too many initial events)
					this.dispatchEvent( { type: "change", prop: propName, value: value } );

				}

			}
		} );
		this[ propName ] = defaultValue;
		setTimeout( () => {

			this.dispatchEvent( { type: propName + "-changed", value: defaultValue } );
			// this.dispatchEvent( { type: "change", prop: propName, value: defaultValue });

		} );

	}
	defineProperties( props ) {

		for ( let prop in props ) {

			this.defineProperty( prop, props[ prop ] );

		}

	}
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
		if ( buttons === 2 ) button = 1;
		if ( buttons === 4 ) button = 2;
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

export { Control, ControlPointers };
