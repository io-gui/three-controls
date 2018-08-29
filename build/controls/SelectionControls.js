import { Object3D, Raycaster, Line, LineBasicMaterial } from '../../../three.js/build/three.module.js';

/**
 * @author arodic / https://github.com/arodic
 *
 * This class provides events and related interfaces for handling hardware
 * agnostic pointer input from mouse, touchscreen and keyboard.
 * It is inspired by PointerEvents https://www.w3.org/TR/pointerevents/
 *
 * Please report bugs at https://github.com/arodic/PointerEvents/issues
 *
 * @event contextmenu
 * @event keydown - requires focus
 * @event keyup - requires focus
 * @event wheel
 * @event focus
 * @event blur
 * @event pointerdown
 * @event pointermove
 * @event pointerhover
 * @event pointerup
 */

class PointerEvents {

	constructor( domElement, params = {} ) {

		if ( domElement === undefined || ! ( domElement instanceof HTMLElement ) ) {

			console.warn( 'PointerEvents: domElement is mandatory in constructor!' );
			domElement = document;

		}

		this.domElement = domElement;
		this.pointers = new PointerArray( domElement, params.normalized );

		const scope = this;
		let dragging = false;

		function _onContextmenu( event ) {

			event.preventDefault();
			scope.dispatchEvent( { type: "contextmenu" } );

		}

		function _onMouseDown( event ) {

			event.preventDefault();
			if ( ! dragging ) {

				dragging = true;
				domElement.removeEventListener( "mousemove", _onMouseHover, false );
				document.addEventListener( "mousemove", _onMouseMove, false );
				document.addEventListener( "mouseup", _onMouseUp, false );
				scope.domElement.focus();
				scope.pointers.update( event, "pointerdown" );
				scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );

			}

		}
		function _onMouseMove( event ) {

			event.preventDefault();
			scope.pointers.update( event, "pointermove" );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );

		}
		function _onMouseHover( event ) {

			scope.pointers.update( event, "pointerhover" );
			// TODO: UNHACK!
			scope.pointers[ 0 ].start.copy( scope.pointers[ 0 ].position );
			scope.dispatchEvent( makePointerEvent( "pointerhover", scope.pointers ) );

		}
		function _onMouseUp( event ) {

			if ( event.buttons === 0 ) {

				dragging = false;
				domElement.addEventListener( "mousemove", _onMouseHover, false );
				document.removeEventListener( "mousemove", _onMouseMove, false );
				document.removeEventListener( "mouseup", _onMouseUp, false );
				scope.pointers.update( event, "pointerup", true );
				scope.dispatchEvent( makePointerEvent( "pointerup", scope.pointers ) );

			}

		}

		function _onTouchDown( event ) {

			event.preventDefault();
			scope.domElement.focus();
			scope.pointers.update( event, "pointerdown" );
			scope.dispatchEvent( makePointerEvent( "pointerdown", scope.pointers ) );

		}
		function _onTouchMove( event ) {

			event.preventDefault();
			scope.pointers.update( event, "pointermove" );
			scope.dispatchEvent( makePointerEvent( "pointermove", scope.pointers ) );

		}
		function _onTouchHover( event ) {

			scope.pointers.update( event, "pointerhover" );
			scope.dispatchEvent( makePointerEvent( "pointerhover", scope.pointers ) );

		}
		function _onTouchUp( event ) {

			scope.pointers.update( event, "pointerup" );
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

		function _onFocus() {

			domElement.addEventListener( "blur", _onBlur, false );
			scope.dispatchEvent( { type: "focus" } );

		}
		function _onBlur() {

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
			delete this._listeners;

		};

	}
	addEventListener( type, listener ) {

		this._listeners = this._listeners || {};
		this._listeners[ type ] = this._listeners[ type ] || [];
		if ( this._listeners[ type ].indexOf( listener ) === - 1 ) {

			this._listeners[ type ].push( listener );

		}

	}
	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;
		return this._listeners[ type ] !== undefined && this._listeners[ type ].indexOf( listener ) !== - 1;

	}
	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ type ] !== undefined ) {

			let index = this._listeners[ type ].indexOf( listener );
			if ( index !== - 1 ) this._listeners[ type ].splice( index, 1 );

		}

	}
	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ event.type ] !== undefined ) {

			let array = this._listeners[ event.type ].slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

}

class Pointer {

	constructor( pointerID, target, type, pointerType ) {

		this.pointerID = pointerID;
		this.target = target;
		this.type = type;
		this.pointerType = pointerType;
		this.position = new Vector2();
		this.previous = new Vector2();
		this.start = new Vector2();
		this.movement = new Vector2();
		this.distance = new Vector2();
		this.button = - 1;
		this.buttons = 0;

	}
	clone() {

		const pointer = new Pointer( this.pointerID, this.target, this.type, this.pointerType );
		pointer.position.copy( this.position );
		pointer.previous.copy( this.previous );
		pointer.start.copy( this.start );
		pointer.movement.copy( this.movement );
		pointer.distance.copy( this.distance );
		pointer.button = this.button;
		pointer.buttons = this.buttons;
		return pointer;

	}
	update( previous ) {

		this.pointerID = previous.pointerID;
		this.previous.copy( previous.position );
		this.start.copy( previous.start );
		this.movement.copy( this.position ).sub( previous.position );
		this.distance.copy( this.position ).sub( this.start );

	}

}

class PointerArray extends Array {

	constructor( target, normalized ) {

		super();
		this.normalized = normalized || false;
		this.target = target;
		this.previous = [];
		this.removed = [];

	}
	update( event, type, remove ) {

		this.previous.length = 0;
		this.removed.length = 0;

		for ( let i = 0; i < this.length; i ++ ) {

			this.previous.push( this[ i ] );

		}
		this.length = 0;

		const rect = this.target.getBoundingClientRect();

		let touches = event.touches ? event.touches : [ event ];
		let pointerType = event.touches ? 'touch' : 'mouse';
		let buttons = event.buttons || 1;

		let id = 0;
		if ( ! remove ) for ( let i = 0; i < touches.length; i ++ ) {

			if ( isTouchInTarget( touches[ i ], this.target ) || event.touches === undefined ) {

				let pointer = new Pointer( id, this.target, type, pointerType );
				pointer.position.set(
					touches[ i ].clientX - rect.x,
					touches[ i ].clientY - rect.y
				);
				if ( this.normalized ) {

					const rect = this.target.getBoundingClientRect();
					pointer.position.x = ( pointer.position.x - rect.left ) / rect.width * 2.0 - 1.0;
					pointer.position.y = ( pointer.position.y - rect.top ) / rect.height * - 2.0 + 1.0;

				}
				pointer.previous.copy( pointer.position );
				pointer.start.copy( pointer.position );
				pointer.buttons = buttons;
				pointer.button = - 1;
				if ( buttons === 1 || buttons === 3 || buttons === 5 || buttons === 7 ) pointer.button = 0;
				else if ( buttons === 2 || buttons === 6 ) pointer.button = 1;
				else if ( buttons === 4 ) pointer.button = 2;
				pointer.altKey = event.altKey;
				pointer.ctrlKey = event.ctrlKey;
				pointer.metaKey = event.metaKey;
				pointer.shiftKey = event.shiftKey;
				this.push( pointer );
				id ++;

			}

		}

		if ( ! remove ) for ( let i = 0; i < this.length; i ++ ) {

			if ( this.previous.length ) {

				let closest = getClosest( this[ i ], this.previous );
				if ( getClosest( closest, this ) !== this[ i ] ) closest = null;
				if ( closest ) {

					this[ i ].update( closest );
					this.previous.splice( this.previous.indexOf( closest ), 1 );

				}

			}

		}

		for ( let i = this.previous.length; i --; ) {

			this.removed.push( this.previous[ i ] );
			this.previous.splice( i, 1 );

		}

	}

}

function makePointerEvent( type, pointers ) {

	const event = Object.assign( { type: type }, pointers );
	event.length = pointers.length;
	return event;

}

function isTouchInTarget( event, target ) {

	let eventTarget = event.target;
	while ( eventTarget ) {

		if ( eventTarget === target ) return true;
		eventTarget = eventTarget.parentElement;

	}
	return false;

}


function getClosest( pointer, pointers ) {

	let closestDist = Infinity;
	let closest;
	for ( let i = 0; i < pointers.length; i ++ ) {

		let dist = pointer.position.distanceTo( pointers[ i ].position );
		if ( dist < closestDist ) {

			closest = pointers[ i ];
			closestDist = dist;

		}

	}
	return closest;

}

class Vector2 {

	constructor( x, y ) {

		this.set( x, y );

	}
	set( x, y ) {

		this.x = x;
		this.y = y;
		return this;

	}
	clone() {

		return new Vector2( this.x, this.y );

	}
	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		return this;

	}
	add( v ) {

		this.x += v.x;
		this.y += v.y;
		return this;

	}
	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		return this;

	}
	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		return this;

	}
	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		return this;

	}
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}
	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}
	distanceToSquared( v ) {

		let dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
*/

// TODO: implement dom element swap and multiple dom elements

class Control extends Object3D {

	constructor( domElement ) {

		super();

		if ( domElement === undefined || ! ( domElement instanceof HTMLElement ) ) {

			console.warn( 'Control: domElement is mandatory in constructor!' );
			domElement = document;

		}

		const pointerEvents = new PointerEvents( domElement, { normalized: true } );

		this.defineProperties( {
			domElement: domElement,
			enabled: true,
			active: false,
			enableKeys: true,
			needsUpdate: false,
			_animationActive: false,
			_animationTime: 0,
			_rafID: 0
		} );

		this.onPointerDown = this.onPointerDown.bind( this );
		this.onPointerHover = this.onPointerHover.bind( this );
		this.onPointerMove = this.onPointerMove.bind( this );
		this.onPointerUp = this.onPointerUp.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.onWheel = this.onWheel.bind( this );
		this.onContextmenu = this.onContextmenu.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.onBlur = this.onBlur.bind( this );

		pointerEvents.addEventListener( 'pointerdown', this.onPointerDown );
		pointerEvents.addEventListener( 'pointerhover', this.onPointerHover );
		pointerEvents.addEventListener( 'pointermove', this.onPointerMove );
		pointerEvents.addEventListener( 'pointerup', this.onPointerUp );
		pointerEvents.addEventListener( 'keydown', this.onKeyDown );
		pointerEvents.addEventListener( 'keyup', this.onKeyUp );
		pointerEvents.addEventListener( 'wheel', this.onWheel );
		pointerEvents.addEventListener( 'contextmenu', this.onContextmenu );
		pointerEvents.addEventListener( 'focus', this.onFocus );
		pointerEvents.addEventListener( 'blur', this.onBlur );

		this.dispose = function () {

			pointerEvents.removeEventListener( 'pointerdown', this.onPointerDown );
			pointerEvents.removeEventListener( 'pointerhover', this.onPointerHover );
			pointerEvents.removeEventListener( 'pointermove', this.onPointerMove );
			pointerEvents.removeEventListener( 'pointerup', this.onPointerUp );
			pointerEvents.removeEventListener( 'keydown', this.onKeyDown );
			pointerEvents.removeEventListener( 'keyup', this.onKeyUp );
			pointerEvents.removeEventListener( 'wheel', this.onWheel );
			pointerEvents.removeEventListener( 'contextmenu', this.onContextmenu );
			pointerEvents.removeEventListener( 'focus', this.onFocus );
			pointerEvents.removeEventListener( 'blur', this.onBlur );
			pointerEvents.dispose();
			this.stopAnimation();

		};

		this.needsUpdate = true;

	}
	needsUpdateChanged( value ) {

		if ( value ) this.startAnimation();

	}
	enabledChanged( value ) {

		if ( value ) {

			this.startAnimation();

		} else {

			this.stopAnimation();

		}

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
	onFocus() {} // event
	onBlur() {} // event
	// Defines getter, setter and store for a property
	defineProperty( propName, defaultValue ) {

		this._properties[ propName ] = defaultValue;
		if ( defaultValue === undefined ) {

			console.warn( 'Control: ' + propName + ' is mandatory!' );

		}
		Object.defineProperty( this, propName, {
			get: function () {

				return this._properties[ propName ] !== undefined ? this._properties[ propName ] : defaultValue;

			},
			set: function ( value ) {

				if ( this._properties[ propName ] !== value ) {

					const oldValue = this._properties[ propName ];
					this._properties[ propName ] = value;
					if ( typeof this[ propName + "Changed" ] === 'function' ) this[ propName + "Changed" ]( value, oldValue );
					this.dispatchEvent( { type: propName + "-changed", value: value, oldValue: oldValue } );
					this.dispatchEvent( { type: "change", prop: propName, value: value, oldValue: oldValue } );

				}

			},
			enumerable: propName.charAt( 0 ) !== '_'
		} );
		this[ propName ] = defaultValue;

	}
	defineProperties( props ) {

		if ( ! this.hasOwnProperty( '_properties' ) ) {

			Object.defineProperty( this, '_properties', {
				value: {},
				enumerable: false
			} );

		}
		for ( let prop in props ) {

			this.defineProperty( prop, props[ prop ] );

		}

	}

}

/**
 * @author arodic / http://github.com/arodic
 */

const mat = new LineBasicMaterial( { depthTest: false, transparent: true } );

// Temp variables
const raycaster = new Raycaster();
let intersects;

// Events
const changeEvent = { type: 'change' };

class SelectionControls extends Control {

	constructor( camera, domElement, scene, selection ) {

		super( domElement );

		this.defineProperties( {
			camera: camera,
			scene: scene,
			selection: selection
		} );

	}
	select( position, add ) {

		raycaster.setFromCamera( position, this.camera );
		intersects = raycaster.intersectObjects( this.scene.children, true );
		if ( intersects.length > 0 ) {

			const object = intersects[ 0 ].object;
			// TODO: handle helper selection
			if ( add ) {

				this.selection.toggle( object );

			} else {

				this.selection.replace( object );

			}

		} else {

			this.selection.clear();

		}

		for ( let i = this.children.length; i --; ) {

			this.remove( this.children[ i ] );

		}
		for ( let i = 0; i < this.selection.selected.length; i ++ ) {

			const _helper = new Line( this.selection.selected[ i ].geometry, mat );
			_helper._src = this.selection.selected[ i ];
			_helper.matrixAutoUpdate = false;
			this.selection.selected[ i ].updateMatrixWorld();
			this.selection.selected[ i ].matrixWorld.decompose( _helper.position, _helper.quaternion, _helper.scale );
			this.add( _helper );

		}

		this.dispatchEvent( changeEvent );

	}
	onPointerUp( pointers ) {

		if ( ! this.enabled ) return;
		if ( pointers.length === 0 ) {

			const dist = pointers.removed[ 0 ].distance.length();
			if ( dist < 0.01 ) {

				this.select( pointers.removed[ 0 ].position, pointers.removed[ 0 ].ctrlKey );

			}

		}

	}
	updateMatrixWorld() {

		super.updateMatrixWorld();
		for ( let i = 0; i < this.children.length; i ++ ) {

			const _helper = this.children[ i ];
			_helper.matrixWorld.copy( _helper._src.matrixWorld );

		}

	}

}

export { SelectionControls };
