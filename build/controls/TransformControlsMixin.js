import { Vector3, Quaternion, Raycaster, Plane } from '../../lib/three.module.js';

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

			event.preventDefault();
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

			// event.target = this; // TODO: consider adding target!
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
				pointer.position.x = touches[ i ].clientX - rect.x;
				pointer.position.y = touches[ i ].clientY - rect.y;
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

		this.x = x;
		this.y = y;

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
	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}
	distanceTo( v ) {

		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return Math.sqrt( dx * dx + dy * dy );

	}

}

/**
 * @author arodic / https://github.com/arodic
 *
 * Minimal implementation of io mixin: https://github.com/arodic/io
 * Includes event listener/dispatcher and defineProperties() method.
 * Changed properties trigger "changed" and "[prop]-changed" events as well as
 * execution of [prop]Changed() funciton if defined.
 */

/**
 * @author arodic / https://github.com/arodic
 */
// TODO: dispose

/**
 * @author arodic / https://github.com/arodic
 */
// TODO: dispose

/**
 * @author arodic / https://github.com/arodic
 */

// TODO: documentation
/*
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute)
 */

// TODO: implement dom element swap and multiple dom elements
const InteractiveMixin = ( superclass ) => class extends superclass {

	get isInteractive() {

		return true;

	}
	constructor( props ) {

		super( props );

		this.defineProperties( {
			enabled: true,
			_pointerEvents: new PointerEvents( props.domElement, { normalized: true } )
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

		this._addEvents();

	}
	dispose() {

		this._removeEvents();
		this._pointerEvents.dispose();

	}
	_addEvents() {

		if ( this._listening ) return;
		this._pointerEvents.addEventListener( 'pointerdown', this.onPointerDown );
		this._pointerEvents.addEventListener( 'pointerhover', this.onPointerHover );
		this._pointerEvents.addEventListener( 'pointermove', this.onPointerMove );
		this._pointerEvents.addEventListener( 'pointerup', this.onPointerUp );
		this._pointerEvents.addEventListener( 'keydown', this.onKeyDown );
		this._pointerEvents.addEventListener( 'keyup', this.onKeyUp );
		this._pointerEvents.addEventListener( 'wheel', this.onWheel );
		this._pointerEvents.addEventListener( 'contextmenu', this.onContextmenu );
		this._pointerEvents.addEventListener( 'focus', this.onFocus );
		this._pointerEvents.addEventListener( 'blur', this.onBlur );
		this._listening = true;

	}
	_removeEvents() {

		if ( ! this._listening ) return;
		this._pointerEvents.removeEventListener( 'pointerdown', this.onPointerDown );
		this._pointerEvents.removeEventListener( 'pointerhover', this.onPointerHover );
		this._pointerEvents.removeEventListener( 'pointermove', this.onPointerMove );
		this._pointerEvents.removeEventListener( 'pointerup', this.onPointerUp );
		this._pointerEvents.removeEventListener( 'keydown', this.onKeyDown );
		this._pointerEvents.removeEventListener( 'keyup', this.onKeyUp );
		this._pointerEvents.removeEventListener( 'wheel', this.onWheel );
		this._pointerEvents.removeEventListener( 'contextmenu', this.onContextmenu );
		this._pointerEvents.removeEventListener( 'focus', this.onFocus );
		this._pointerEvents.removeEventListener( 'blur', this.onBlur );
		this._listening = false;

	}
	enabledChanged( value ) {

		value ? this._addEvents() : this._removeEvents();

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

};

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const ray = new Raycaster();
const rayTarget = new Vector3();
const tempVector = new Vector3();

// events
const changeEvent = { type: "change" };

const TransformControlsMixin = ( superclass ) => class extends InteractiveMixin( superclass ) {

	constructor( props ) {

		super( props );

		this.visible = false;

		this.defineProperties( {
			active: false,
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3(),
			plane: new Plane()
		} );

		// this.add(this.planeMesh = new Mesh(new PlaneBufferGeometry(1000, 1000, 10, 10), new MeshBasicMaterial({wireframe: true})));

	}
	objectChanged( value ) {

		let hasObject = value ? true : false;
		this.visible = hasObject;
		if ( ! hasObject ) {

			this.active = false;
			this.axis = null;

		}

	}
	// TODO: better animation trigger
	// TODO: also trigger on object change
	// TODO: Debug stalling animations on hover
	enabledChanged( value ) {

		super.enabledChanged( value );
		this.animation.startAnimation( 3 );

	}
	activeChanged() {

		this.animation.startAnimation( 3 );

	}
	updateHelperMatrix() {

		if ( this.object ) {

			this.object.updateMatrixWorld();
			this.object.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );

		}
		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
		if ( this.camera.isPerspectiveCamera ) {

			this.eye.copy( this.cameraPosition ).sub( this.worldPosition ).normalize();

		} else if ( this.camera.isOrthographicCamera ) {

			this.eye.copy( this.cameraPosition ).normalize();

		}
		super.updateHelperMatrix();
		this.updatePlane();

	}
	onPointerHover( pointers ) {

		if ( ! this.object || this.active === true ) return;
		ray.setFromCamera( pointers[ 0 ].position, this.camera ); //TODO: unhack

		const intersect = ray.intersectObjects( this.pickers, true )[ 0 ] || false;
		if ( intersect ) {

			this.axis = intersect.object.name;

		} else {

			this.axis = null;

		}

	}
	onPointerDown( pointers ) {

		if ( this.axis === null || ! this.object || this.active === true || pointers[ 0 ].button !== 0 ) return;
		ray.setFromCamera( pointers[ 0 ].position, this.camera );
		this.updatePlane();
		const planeIntersect = ray.ray.intersectPlane( this.plane, rayTarget );
		let space = ( this.axis === 'E' || this.axis === 'XYZ' ) ? 'world' : this.space;
		if ( planeIntersect ) {

			this.object.updateMatrixWorld();
			if ( this.object.parent ) {

				this.object.parent.updateMatrixWorld();

			}
			this.positionStart.copy( this.object.position );
			this.quaternionStart.copy( this.object.quaternion );
			this.scaleStart.copy( this.object.scale );
			this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart );
			this.pointStart.copy( planeIntersect ).sub( this.worldPositionStart );
			if ( space === 'local' ) this.pointStart.applyQuaternion( this.worldQuaternionStart.clone().inverse() );
			this.active = true;

		}

	}
	onPointerMove( pointers ) {

		let axis = this.axis;
		let object = this.object;
		let space = ( axis === 'E' || axis === 'XYZ' ) ? 'world' : this.space;

		if ( object === undefined || axis === null || this.active === false || pointers[ 0 ].button !== 0 ) return;

		ray.setFromCamera( pointers[ 0 ].position, this.camera );

		const planeIntersect = ray.ray.intersectPlane( this.plane, tempVector );

		if ( ! planeIntersect ) return;

		this.pointEnd.copy( planeIntersect ).sub( this.worldPositionStart );

		if ( space === 'local' ) this.pointEnd.applyQuaternion( this.worldQuaternionStart.clone().inverse() );

		this.transform();

		this.object.updateMatrixWorld();
		this.dispatchEvent( changeEvent );

	}
	onPointerUp( pointers ) {

		if ( pointers.length === 0 ) {

			this.active = false;
			if ( pointers.removed[ 0 ].pointerType === 'touch' ) this.axis = null;

		} else {

			if ( pointers[ 0 ].button === - 1 ) this.axis = null;

		}

	}
	transform() {}
	updateAxisMaterial( axis ) {

		super.updateAxisMaterial( axis );

		const mat = axis.material;
		const h = axis.material.highlight;

		if ( ! this.enabled ) mat.highlight = ( 10 * h - 1.1 ) / 11;

	}
	updatePlane() {

		const axis = this.axis;
		const normal = this.plane.normal;

		if ( axis === 'X' ) normal.copy( this.worldX ).cross( tempVector.copy( this.eye ).cross( this.worldX ) );
		if ( axis === 'Y' ) normal.copy( this.worldY ).cross( tempVector.copy( this.eye ).cross( this.worldY ) );
		if ( axis === 'Z' ) normal.copy( this.worldZ ).cross( tempVector.copy( this.eye ).cross( this.worldZ ) );
		if ( axis === 'XY' ) normal.copy( this.worldZ );
		if ( axis === 'YZ' ) normal.copy( this.worldX );
		if ( axis === 'XZ' ) normal.copy( this.worldY );
		if ( axis === 'XYZ' || axis === 'E' ) this.camera.getWorldDirection( normal );

		this.plane.setFromNormalAndCoplanarPoint( normal, this.worldPosition );

		// this.parent.add(this.planeMesh);
		// this.planeMesh.position.set(0,0,0);
		// this.planeMesh.lookAt(this.plane.normal);
		// this.planeMesh.position.copy(this.worldPosition);

	}

};

export { TransformControlsMixin };
