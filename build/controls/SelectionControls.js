import { Object3D, Vector3, Quaternion, Vector2, BufferGeometry, BufferAttribute, UniformsUtils, Color, FrontSide, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Mesh, Euler, Matrix4, Uint16BufferAttribute, Float32BufferAttribute, SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, Line, Raycaster } from '../../lib/three.module.js';

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
		this.position = new Vector2$1();
		this.previous = new Vector2$1();
		this.start = new Vector2$1();
		this.movement = new Vector2$1();
		this.distance = new Vector2$1();
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

class Vector2$1 {

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

const IoLiteMixin = ( superclass ) => class extends superclass {

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

		event.target = this;
		if ( this._listeners && this._listeners[ event.type ] !== undefined ) {

			let array = this._listeners[ event.type ].slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		} else if ( this.parent && event.bubbles ) ;

	}
	// Define properties in builk.
	defineProperties( props ) {

		//Define store for properties.
		if ( ! this.hasOwnProperty( '_properties' ) ) {

			Object.defineProperty( this, '_properties', {
				value: {},
				enumerable: false
			} );

		}
		for ( let prop in props ) {

			defineProperty( this, prop, props[ prop ] );

		}

	}
	// TODO: dispose

};

// Defines getter, setter
const defineProperty = function ( scope, propName, propDef ) {

	let observer = propName + 'Changed';
	let initValue = propDef;

	if ( propDef && typeof propDef === 'object' && propDef.value !== undefined ) {

		initValue = propDef.value;

		if ( typeof propDef.observer === 'string' ) {

			observer = propDef.observer;

		}

	}



	scope._properties[ propName ] = initValue;
	if ( initValue === undefined ) {

		console.warn( 'IoLiteMixin: ' + propName + ' is mandatory!' );

	}
	Object.defineProperty( scope, propName, {
		get: function () {

			return scope._properties[ propName ] !== undefined ? scope._properties[ propName ] : initValue;

		},
		set: function ( value ) {

			if ( scope._properties[ propName ] !== value ) {

				const oldValue = scope._properties[ propName ];
				scope._properties[ propName ] = value;
				if ( typeof scope[ observer ] === 'function' ) scope[ observer ]( value, oldValue );
				scope.dispatchEvent( { type: propName + '-changed', value: value, oldValue: oldValue, bubbles: true } );
				scope.dispatchEvent( { type: 'change', property: propName, value: value, oldValue: oldValue } );

			}

		},
		enumerable: propName.charAt( 0 ) !== '_'
	} );
	scope[ propName ] = initValue;

};

/**
 * @author arodic / https://github.com/arodic
 */

/*
 * Creates a single requestAnimationFrame loop thread.
 * provides methods to control animation and events to hook into animation updates.
 */

class Animation extends IoLiteMixin( Object ) {

	get isAnimation() {

		return true;

	}
	constructor( props ) {

		super( props );
		this.defineProperties( {
			_active: false,
			_time: 0,
			_timeRemainging: 0,
			_rafID: 0
		} );

	}
	startAnimation( duration ) {

		this._timeRemainging = Math.max( this._timeRemainging, duration * 1000 || 0 );
		if ( ! this._active ) {

			this._active = true;
			this._time = performance.now();
			this._rafID = requestAnimationFrame( () => {

				const time = performance.now();
				const timestep = time - this._time;
				this.animate( timestep, time );
				this._time = time;
				this._timeRemainging = Math.max( this._timeRemainging - timestep, 0 );

			} );

		}

	}
	animate( timestep, time ) {

		if ( this._active && this._timeRemainging ) {

			this._rafID = requestAnimationFrame( () => {

				const time = performance.now();
				timestep = time - this._time;
				this.animate( timestep, time );
				this._time = time;
				this._timeRemainging = Math.max( this._timeRemainging - timestep, 0 );

			} );

		} else {

			this.stopAnimation( timestep, time );

		}
		this.dispatchEvent( { type: 'update', timestep: timestep } );

	}
	stopAnimation() {

		this._active = false;
		cancelAnimationFrame( this._rafID );

	}

}
// TODO: dispose

/**
 * @author arodic / https://github.com/arodic
 */
/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

class Helper extends IoLiteMixin( Object3D ) {

	get isHelper() {

		return true;

	}
	constructor( props = {} ) {

		super();
		this.defineProperties( {
			domElement: props.domElement || null,
			object: props.object || null,
			camera: props.camera || null,
			space: 'local',
			size: 0,
			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(),
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			cameraScale: new Vector3(),
			eye: new Vector3(),
			animation: new Animation()
		} );
		this.animation.addEventListener( 'update', () => {

			this.dispatchEvent( { type: 'change' } );

		} );

	}
	updateHelperMatrix() {

		if ( this.object ) {

			this.object.updateMatrixWorld();
			this.matrix.copy( this.object.matrix );
			this.matrixWorld.copy( this.object.matrixWorld );

		} else {

			super.updateMatrixWorld(); // TODO: camera?

		}

		this.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );

		let eyeDistance = 1;
		if ( this.camera ) {

			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
			if ( this.camera.isPerspectiveCamera ) {

				this.eye.copy( this.cameraPosition ).sub( this.worldPosition );
				eyeDistance = this.eye.length();
				this.eye.normalize();

			} else if ( this.camera.isOrthographicCamera ) {

				this.eye.copy( this.cameraPosition ).normalize();

			}

		}

		if ( this.size || this.space == 'world' ) {

			if ( this.size ) this.worldScale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size );
			if ( this.space === 'world' ) this.worldQuaternion.set( 0, 0, 0, 1 );
			this.matrixWorld.compose( this.worldPosition, this.worldQuaternion, this.worldScale );

		}

	}
	updateMatrixWorld( force, camera ) {

		if ( camera ) this.camera = camera; // TODO

		this.updateHelperMatrix( camera );
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true, camera );

		}

	}

}
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

class Interactive extends InteractiveMixin( Helper ) {}

/**
 * @author mrdoob / http://mrdoob.com/
 */

const BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		let index = geometry.index;
		let attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			attributes.position === undefined ||
			attributes.normal === undefined ||
			attributes.uv === undefined ) {

			console.warn( 'BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()' );
			return;

		}

		let indices = index.array;
		let positions = attributes.position.array;
		let normals = attributes.normal.array;
		let uvs = attributes.uv.array;

		let nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.addAttribute( 'tangent', new BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		let tangents = attributes.tangent.array;

		let tan1 = [], tan2 = [];

		for ( let i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new Vector3();
			tan2[ i ] = new Vector3();

		}

		let vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			let x1 = vB.x - vA.x;
			let x2 = vC.x - vA.x;

			let y1 = vB.y - vA.y;
			let y2 = vC.y - vA.y;

			let z1 = vB.z - vA.z;
			let z2 = vC.z - vA.z;

			let s1 = uvB.x - uvA.x;
			let s2 = uvC.x - uvA.x;

			let t1 = uvB.y - uvA.y;
			let t2 = uvC.y - uvA.y;

			let r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		let groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			let group = groups[ i ];

			let start = group.start;
			let count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		let tmp = new Vector3(), tmp2 = new Vector3();
		let n = new Vector3(), n2 = new Vector3();
		let w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( let i = 0, il = groups.length; i < il; ++ i ) {

			let group = groups[ i ];

			let start = group.start;
			let count = group.count;

			for ( let j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	* @param  {Array<BufferGeometry>} geometries
	* @return {BufferGeometry}
	*/
	mergeBufferGeometries: function ( geometries, useGroups ) {

		let isIndexed = geometries[ 0 ].index !== null;

		let attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		let morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		let attributes = {};
		let morphAttributes = {};

		let mergedGeometry = new BufferGeometry();

		let offset = 0;

		for ( let i = 0; i < geometries.length; ++ i ) {

			let geometry = geometries[ i ];

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) return null;

			// gather attributes, exit early if they're different

			for ( let name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) return null;

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

			}

			// gather morph attributes, exit early if they're different

			for ( let name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) return null;

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				let count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			let indexOffset = 0;
			let mergedIndex = [];

			for ( let i = 0; i < geometries.length; ++ i ) {

				let index = geometries[ i ].index;

				for ( let j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( let name in attributes ) {

			let mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) return null;

			mergedGeometry.addAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( let name in morphAttributes ) {

			let numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( let i = 0; i < numMorphTargets; ++ i ) {

				let morphAttributesToMerge = [];

				for ( let j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				let mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) return null;

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	* @param {Array<BufferAttribute>} attributes
	* @return {BufferAttribute}
	*/
	mergeBufferAttributes: function ( attributes ) {

		let TypedArray;
		let itemSize;
		let normalized;
		let arrayLength = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			let attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) return null;

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) return null;

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) return null;

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) return null;

			arrayLength += attribute.array.length;

		}

		let array = new TypedArray( arrayLength );
		let offset = 0;

		for ( let i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new BufferAttribute( array, itemSize, normalized );

	}

};

const _colors = {
	black: new Color( 0x000000 ),
	red: new Color( 0xff0000 ),
	green: new Color( 0x00ff00 ),
	blue: new Color( 0x0000ff ),
	white: new Color( 0xffffff ),
	gray: new Color( 0x787878 ),
	yellow: new Color( 0xffff00 ),
	cyan: new Color( 0x00ffff ),
	magenta: new Color( 0xff00ff ),
};

// TODO: dithering instead transparency
// TODO: pixel-perfect outlines

class HelperMaterial extends IoLiteMixin( ShaderMaterial ) {

	constructor( color, opacity ) {

		super( {
			depthTest: true,
			depthWrite: true,
			side: FrontSide,
		} );

		const data = new Float32Array( [
			1.0 / 17.0, 0, 0, 0, 9.0 / 17.0, 0, 0, 0, 3.0 / 17.0, 0, 0, 0, 11.0 / 17.0, 0, 0, 0,
			13.0 / 17.0, 0, 0, 0, 5.0 / 17.0, 0, 0, 0, 15.0 / 17.0, 0, 0, 0, 7.0 / 17.0, 0, 0, 0,
			4.0 / 17.0, 0, 0, 0, 12.0 / 17.0, 0, 0, 0, 2.0 / 17.0, 0, 0, 0, 10.0 / 17.0, 0, 0, 0,
			16.0 / 17.0, 0, 0, 0, 8.0 / 17.0, 0, 0, 0, 14.0 / 17.0, 0, 0, 0, 6.0 / 17.0, 0, 0, 0,
		] );
		const texture = new DataTexture( data, 4, 4, RGBAFormat, FloatType );
		texture.magFilter = NearestFilter;
		texture.minFilter = NearestFilter;

		const res = new Vector3( window.innerWidth, window.innerHeight, window.devicePixelRatio );
		color = color !== undefined ? _colors[ color ] : _colors[ 'white' ];
		opacity = opacity !== undefined ? opacity : 1;

		this.defineProperties( {
			color: { value: color, observer: 'uniformChanged' },
			opacity: { value: opacity, observer: 'uniformChanged' },
			highlight: { value: 0, observer: 'uniformChanged' },
			resolution: { value: res, observer: 'uniformChanged' },
		} );

		this.uniforms = UniformsUtils.merge( [ this.uniforms, {
			"uColor": { value: this.color },
			"uOpacity": { value: this.opacity },
			"uHighlight": { value: this.highlight },
			"uResolution": { value: this.resolution },
			"tDitherMatrix": { value: texture },
		} ] );

		this.uniforms.tDitherMatrix.value = texture;
		texture.needsUpdate = true;

		this.vertexShader = `

			attribute vec4 color;
			attribute float outline;

			varying vec4 vColor;
			varying float isOutline;

			uniform vec3 uResolution;

			void main() {
				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];

				vColor = color;
				isOutline = outline;

				vec3 nor = normalMatrix * normal;
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				float pixelRatio = uResolution.z;

				nor = (projectionMatrix * vec4(nor, 1.0)).xyz;
				nor = normalize((nor.xyz) * vec3(1., 1., 0.));

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude = outline;
					pos.z += 0.01;
				} else {
					extrude += outline;
				}

				pos.xy /= pos.w;

				float dx = nor.x * extrude * 2.2;
				float dy = nor.y * extrude * 2.2;

				pos.x += (dx) * (1.0 / uResolution.x);
				pos.y += (dy) * (1.0 / uResolution.y);

				pos.xy *= pos.w;

				gl_Position = pos;
			}
		`;
		this.fragmentShader = `
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uHighlight;
			uniform vec3 uResolution;
			uniform sampler2D tDitherMatrix;

			varying vec4 vColor;
			varying float isOutline;

			void main() {

				float opacity = 1.0;
				vec3 color = vec3(1.0);
				float pixelRatio = 1.0;//uResolution.z;

				if (isOutline > 0.0) {
					color = mix(color * vec3(0.2), vec3(1.0), max(0.0, uHighlight) );
					color = mix(color, vec3(0.5), max(0.0, -uHighlight) );
				} else {
					color = uColor * vColor.rgb;
				}

				float dimming = mix(1.0, 0.2, max(0.0, -uHighlight));
				dimming = mix(dimming, dimming * 1.25, max(0.0, uHighlight));
				opacity = uOpacity * vColor.a * dimming;

				color = mix(vec3(0.5), color, dimming);

				gl_FragColor = vec4(color, 1.0);

				vec2 matCoord = ( mod(gl_FragCoord.xy / pixelRatio, 4.0) - vec2(0.5) ) / 4.0;
				vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );
				if (opacity < ditherPattern.r) discard;
			}
		`;

	}
	uniformChanged() {

		this.uniforms.uColor.value = this.color;
		this.uniforms.uOpacity.value = this.opacity;
		this.uniforms.uHighlight.value = this.highlight;
		this.uniforms.uResolution.value = this.resolution;
		this.uniformsNeedUpdate = true;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

class HelperMesh extends Mesh {

	constructor( geometry, props = {} ) {

		super();
		this.geometry = geometry instanceof Array ? mergeGeometryChunks( geometry ) : geometry;
		this.material = new HelperMaterial( props.color || 'white', props.opacity || 1 );
		this.name = props.name;

	}

}

// Reusable utility variables
const _position = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

function mergeGeometryChunks( chunks ) {

	let geometry = new BufferGeometry();

	geometry.index = new Uint16BufferAttribute( [], 1 );
	geometry.addAttribute( 'position', new Float32BufferAttribute( [], 3 ) );
	geometry.addAttribute( 'uv', new Float32BufferAttribute( [], 2 ) );
	geometry.addAttribute( 'color', new Float32BufferAttribute( [], 4 ) );
	geometry.addAttribute( 'normal', new Float32BufferAttribute( [], 3 ) );
	geometry.addAttribute( 'outline', new Float32BufferAttribute( [], 1 ) );

	for ( let i = chunks.length; i --; ) {

		const chunk = chunks[ i ];
		let chunkGeo = chunk.geometry.clone();

		const color = chunk.color || [ 1, 1, 1, 1 ];
		const position = chunk.position;
		const rotation = chunk.rotation;
		let scale = chunk.scale;

		let thickness = chunk.thickness / 2 || 0;
		let outlineThickness = chunk.outlineThickness !== undefined ? chunk.outlineThickness : 1;

		if ( scale && typeof scale === 'number' ) scale = [ scale, scale, scale ];

		_position.set( 0, 0, 0 );
		_quaternion.set( 0, 0, 0, 1 );
		_scale.set( 1, 1, 1 );

		if ( position ) _position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
		if ( rotation ) _quaternion.setFromEuler( _euler.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] ) );
		if ( scale ) _scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

		_matrix.compose( _position, _quaternion, _scale );

		chunkGeo.applyMatrix( _matrix );

		if ( chunkGeo.index === null ) {

			const indices = [];
			for ( let j = 0; j < chunkGeo.attributes.position.count - 2; j ++ ) {

				indices.push( j + 0 );
				indices.push( j + 1 );
				indices.push( j + 2 );

			}
			chunkGeo.index = new Uint16BufferAttribute( indices, 1 );

		}

		let vertCount = chunkGeo.attributes.position.count;

		if ( ! chunkGeo.attributes.color ) {

			chunkGeo.addAttribute( 'color', new Float32BufferAttribute( new Array( vertCount * 4 ), 4 ) );

		}

		//TODO: enable color overwrite
		const colorArray = chunkGeo.attributes.color.array;
		for ( let j = 0; j < vertCount; j ++ ) {

			const r = j * 4 + 0; colorArray[ r ] = color[ 0 ];
			const g = j * 4 + 1; colorArray[ g ] = color[ 1 ];
			const b = j * 4 + 2; colorArray[ b ] = color[ 2 ];
			const a = j * 4 + 3; colorArray[ a ] = color[ 3 ] !== undefined ? color[ 3 ] : colorArray[ a ] !== undefined ? colorArray[ a ] : 1;

		}

		// Duplicate geometry and add outline attribute
		//TODO: enable outline overwrite (needs to know if is outline or not in combined geometry)
		if ( ! chunkGeo.attributes.outline ) {

			const outlineArray = [];
			for ( let j = 0; j < vertCount; j ++ ) outlineArray[ j ] = - ( thickness ) || 0;
			chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
			chunkGeo = BufferGeometryUtils.mergeBufferGeometries( [ chunkGeo, chunkGeo ] );
			if ( outlineThickness ) {

				for ( let j = 0; j < vertCount; j ++ ) chunkGeo.attributes.outline.array[ ( vertCount ) + j ] = outlineThickness + ( thickness );

			}

			let array = chunkGeo.index.array;
			for ( let j = array.length / 2; j < array.length; j += 3 ) {

				let a = array[ j + 1 ];
				let b = array[ j + 2 ];
				array[ j + 1 ] = b;
				array[ j + 2 ] = a;

			}

		}


		geometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry, chunkGeo ] );

	}
	return geometry;

}

/**
 * @author arodic / https://github.com/arodic
 */

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

class OctahedronGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new OctahedronBufferGeometry( 1, 0 ) }
		] );
		return this.geometry;

	}

}

class ConeGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new CylinderBufferGeometry( 0, 0.2, 1, 8, 2 ), position: [ 0, 0.5, 0 ] },
			{ geometry: new SphereBufferGeometry( 0.2, 8, 8 ) }
		] );
		return this.geometry;

	}

}

class Corner3Geometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 1, 5, 2, false ), position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 1, 5, 2, false ), position: [ 0, 0.5, 0 ], rotation: [ 0, HPI, 0 ], thickness: 1 },
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 1, 5, 2, false ), position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 8, 4 ), position: [ 0, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 8, 4 ), position: [ 1, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 8, 4 ), position: [ 0, 1, 0 ], rotation: [ 0, HPI, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 8, 4 ), position: [ 0, 0, 1 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
		] );
		return this.geometry;

	}

}

const coneGeometry = new ConeGeometry();
const octahedronGeometry = new OctahedronGeometry();

function stringHas( str, char ) {

	return str.search( char ) !== - 1;

}

function hasAxisAny( str, chars ) {

	let has = true;
	str.split( '' ).some( a => {

		if ( chars.indexOf( a ) === - 1 ) has = false;

	} );
	return has;

}

class TransformHelper extends Helper {

	constructor( props ) {

		super( props );

		this.defineProperties( {
			showX: { value: true, observer: 'updateAxis' },
			showY: { value: true, observer: 'updateAxis' },
			showZ: { value: true, observer: 'updateAxis' },
			axis: null,
			worldX: new Vector3(),
			worldY: new Vector3(),
			worldZ: new Vector3(),
			axisDotEye: new Vector3()
		} );
		this.size = 0.15;

		this.handles = this.combineHelperGroups( this.handlesGroup );
		this.pickers = this.combineHelperGroups( this.pickersGroup );
		if ( this.handles.length ) this.add( ...this.handles );
		if ( this.pickers.length ) this.add( ...this.pickers );

		this.traverse( axis => {

			axis.renderOrder = 100;
			axis.scaleTarget = axis.scaleTarget || new Vector3( 1, 1, 1 );

		} );

		// Hide pickers
		for ( let i = 0; i < this.pickers.length; i ++ ) this.pickers[ i ].material.visible = false;

	}
	objectChanged() {

		this.animation.startAnimation( 4 );
		this.traverse( axis => {

			axis.scale.x = 0.0001;
			axis.scale.y = 0.0001;
			axis.scale.z = 0.0001;
			axis.scaleTarget.x = 1;
			axis.scaleTarget.y = 1;
			axis.scaleTarget.z = 1;

		} );

	}
	axisChanged() {

		this.animation.startAnimation( 4 );
		this.traverse( axis => {

			axis.highlight = 0;
			if ( this.axis ) {

				if ( hasAxisAny( axis.name, this.axis ) ) {

					axis.highlight = 1;

				} else {

					axis.highlight = - 0.75;

				}

			}

		} );

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups( groups ) {

		const meshes = [];
		for ( let name in groups ) {

			meshes.push( new HelperMesh( groups[ name ], { name: name } ) );

		}
		return meshes;

	}
	get handlesGroup() {

		return {
			X: [ { geometry: coneGeometry, color: [ 1, 0, 0 ], position: [ 0.15, 0, 0 ], rotation: [ 0, 0, - Math.PI / 2 ], scale: [ 0.5, 1, 0.5 ] } ],
			Y: [ { geometry: coneGeometry, color: [ 0, 1, 0 ], position: [ 0, 0.15, 0 ], rotation: [ 0, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ],
			Z: [ { geometry: coneGeometry, color: [ 0, 0, 1 ], position: [ 0, 0, 0.15 ], rotation: [ Math.PI / 2, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ]
		};

	}
	get pickersGroup() {

		return {
			XYZ: [ { geometry: octahedronGeometry, scale: 0.5 } ]
		};

	}
	updateAxis() {

		this.animation.startAnimation( 4 );
		this.traverse( axis => {

			axis.hidden = false;
			if ( stringHas( axis.name, "X" ) && ! this.showX ) axis.hidden = true;
			if ( stringHas( axis.name, "Y" ) && ! this.showY ) axis.hidden = true;
			if ( stringHas( axis.name, "Z" ) && ! this.showZ ) axis.hidden = true;
			if ( stringHas( axis.name, "E" ) && ( ! this.showX || ! this.showY || ! this.showZ ) ) axis.hidden = true;

		} );

	}
	updateMatrixWorld( force, camera ) {

		if ( camera ) this.camera = camera; // TODO
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true, camera );

		}

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		this.worldX.set( 1, 0, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldY.set( 0, 1, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldZ.set( 0, 0, 1 ).applyQuaternion( this.worldQuaternion );

		this.axisDotEye.set(
			this.worldX.dot( this.eye ),
			this.worldY.dot( this.eye ),
			this.worldZ.dot( this.eye )
		);

		if ( this.animation._active ) {

			for ( let i = this.handles.length; i --; ) this.updateAxisMaterial( this.handles[ i ] );
			for ( let i = this.pickers.length; i --; ) this.updateAxisMaterial( this.pickers[ i ] );

		}

	}
	// TODO: optimize!
	updateAxisMaterial( axis ) {

		axis.visible = true;

		const mat = axis.material;
		const h = axis.material.highlight || 0;

		let highlight = axis.hidden ? - 1.5 : axis.highlight || 0;

		mat.highlight = ( 4 * h + highlight ) / 5;

		if ( mat.highlight < - 1.49 ) axis.visible = false;

		axis.scale.multiplyScalar( 5 ).add( axis.scaleTarget ).divideScalar( 6 );

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

const HPI$1 = Math.PI / 2;
const PI$1 = Math.PI;

const corner3Geometry = new Corner3Geometry();

class SelectionHelper extends Helper {

	get handlesGroup() {

		return {
			XYZ: [
				{ geometry: corner3Geometry, position: [ 1, 1, 1 ], scale: 0.5, rotation: [ HPI$1, 0, PI$1 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ 1, 1, - 1 ], scale: 0.5, rotation: [ HPI$1, 0, HPI$1 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ - 1, - 1, - 1 ], scale: 0.5, rotation: [ - HPI$1, 0, - HPI$1 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ - 1, - 1, 1 ], scale: 0.5, rotation: [ - HPI$1, 0, 0 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ - 1, 1, 1 ], scale: 0.5, rotation: [ PI$1 / 2, 0, - PI$1 / 2 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ - 1, 1, - 1 ], scale: 0.5, rotation: [ PI$1 / 2, 0, 0 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ 1, - 1, - 1 ], scale: 0.5, rotation: [ 0, 0, HPI$1 ], thickness: 3 },
				{ geometry: corner3Geometry, position: [ 1, - 1, 1 ], scale: 0.5, rotation: [ 0, PI$1, 0 ], thickness: 3 },
			]
		};

	}
	constructor( props ) {

		super( props );
		const axis = new TransformHelper();
		axis.size = 0.03;
		this.add( axis );
		if ( props.object && props.object.geometry ) {

			this.add( new Line( props.object.geometry, new HelperMaterial( 'white', 0.5 ) ) );

		}
		this.handles = this.combineHelperGroups( this.handlesGroup );
		if ( this.handles.length ) this.add( ...this.handles );

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups( groups ) {

		const meshes = [];
		for ( let name in groups ) {

			const mesh = new HelperMesh( groups[ name ], { name: name } );
			mesh.scale.set( 100, 100, 100 );
			meshes.push( mesh );

		}
		return meshes;

	}

}

/**
 * @author arodic / http://github.com/arodic
 */

// Reusable utility variables
const pos = new Vector3();
const quat = new Quaternion();
const quatInv = new Quaternion();
const scale = new Vector3();

const posOld = new Vector3();
const quatOld = new Quaternion();
const scaleOld = new Vector3();

const posOffset = new Vector3();
const quatOffset = new Quaternion();
const scaleOffset = new Vector3();

const itemPos = new Vector3();
const itemPosOffset = new Vector3();
const itemQuat = new Quaternion();
const itemQuatInv = new Quaternion();
const itemQuatOffset = new Quaternion();
const itemScale = new Vector3();

const parentPos = new Vector3();
const parentQuat = new Quaternion();
const parentQuatInv = new Quaternion();
const parentScale = new Vector3();

const dist0 = new Vector3();
const dist1 = new Vector3();

const selectedOld = [];

function filterItems( list, hierarchy, filter ) {

	list = list instanceof Array ? list : [ list ];
	let filtered = [];
	for ( let i = 0; i < list.length; i ++ ) {

		if ( ! filter || filter( list[ i ] ) ) filtered.push( list[ i ] );
		if ( hierarchy ) {

			let children = filterItems( list[ i ].children, hierarchy, filter );
			filtered.push( ...children );

		}

	}
	return filtered;

}

// Temp variables
const raycaster = new Raycaster();

// @event change
const changeEvent = { type: 'change' };

let time = 0, dtime = 0;
const CLICK_DIST = 0.01;
const CLICK_TIME = 250;

/*
 * Selection object stores selection list and implements various methods for selection list manipulation.
 * Selection object transforms all selected objects when moved in either world or local space.
 *
 * @event chang - fired on selection change.
 * @event selected-changed - also fired on selection change (includes selection payload).
 */

class SelectionControls extends Interactive {

	// get isSelection() { return true; } // TODO?
	get isSelectionControls() {

		return true;

	}
	constructor( props ) {

		super( props );

		this.defineProperties( {
			scene: props.scene || null,
			selected: [],
			transformSelection: true,
			transformSpace: 'local'
			// translationSnap: null,
			// rotationSnap: null
		} );

	}
	select( position, add ) {

		raycaster.setFromCamera( position, this.camera );
		const intersects = raycaster.intersectObjects( this.scene.children, true );
		if ( intersects.length > 0 ) {

			const object = intersects[ 0 ].object;
			// TODO: handle helper selection
			if ( add ) {

				this.toggle( object );

			} else {

				this.replace( object );

			}

		} else {

			this.clear();

		}
		this.dispatchEvent( changeEvent );

	}
	onPointerDown() {

		time = Date.now();

	}
	onPointerUp( pointers ) {

		dtime = Date.now() - time;
		if ( pointers.length === 0 && dtime < CLICK_TIME ) {

			if ( pointers.removed[ 0 ].distance.length() < CLICK_DIST ) {

				this.select( pointers.removed[ 0 ].position, pointers.removed[ 0 ].ctrlKey );

			}

		}

	}
	transformSpaceChanged() {

		this.update();

	}
	toggle( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( index, 1 );
			else this.selected.push( list[ i ] );

		}
		this.update();

	}
	add( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.concat( ...list );
		this.update();

	}
	addFirst( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.selected.push( ...list );
		this.selected.push( ...selectedOld );
		this.update();

	}
	remove( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( i, 1 );

		}
		this.update();

	}
	replace( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.selected.push( ...list );
		this.update();

	}
	clear() {

		selectedOld.push( ...this.selected );
		this.selected.length = 0;
		this.update();

	}
	update() {

		// Reset selection transform.
		this.position.set( 0, 0, 0, 1 );
		this.quaternion.set( 0, 0, 0, 1 );
		this.scale.set( 1, 1, 1 );

		if ( this.selected.length && this.transformSelection ) {

			// Set selection transform to last selected item (not ancestor of selected).
			if ( this.transformSpace === 'local' ) {

				for ( let i = this.selected.length; i --; ) {

					if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;
					this.selected[ i ].updateMatrixWorld();
					this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
					this.position.copy( itemPos );
					this.quaternion.copy( itemQuat );
					break;

				}
				// Set selection transform to the average of selected items.

			} else if ( this.transformSpace === 'world' ) {

				pos.set( 0, 0, 0 );
				for ( let i = 0; i < this.selected.length; i ++ ) {

					this.selected[ i ].updateMatrixWorld();
					this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
					pos.add( itemPos );

				}
				this.position.copy( pos ).divideScalar( this.selected.length );

			}

		}

		// TODO: apply snapping
		// Apply translation snap
		// if (this.translationSnap) {
		// 	if (space === 'local') {
		// 		object.position.applyQuaternion(_tempQuaternion.copy(this.quaternionStart).inverse());
		// 		if (axis.hasAxis('X')) object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Y')) object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Z')) object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
		// 		object.position.applyQuaternion(this.quaternionStart);
		// 	}
		// 	if (space === 'world') {
		// 		if (object.parent) {
		// 			object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
		// 		}
		// 		if (axis.hasAxis('X')) object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Y')) object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
		// 		if (axis.hasAxis('Z')) object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
		// 		if (object.parent) {
		// 			object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
		// 		}
		// 	}
		// }
		// Apply rotation snap
		// if (space === 'local') {
		// 	const snap = this.rotationSnap;
		// 	if (this.axis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
		// 	if (this.axis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
		// 	if (this.axis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
		// }
		// if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

		// Add helpers
		// TODO: cache helpers per object
		this.children.length = 0;
		for ( let i = 0; i < this.selected.length; i ++ ) {

			const _helper = new SelectionHelper( { object: this.selected[ i ] } );
			this.children.push( _helper );

		}

		super.updateMatrixWorld(); // TODO: camera?

		// gather selection data and emit selection-changed event
		let added = [];
		for ( let i = 0; i < this.selected.length; i ++ ) {

			if ( selectedOld.indexOf( this.selected[ i ] ) === - 1 ) {

				added.push( this.selected[ i ] );

			}

		}
		let removed = [];
		for ( let i = 0; i < selectedOld.length; i ++ ) {

			if ( this.selected.indexOf( selectedOld[ i ] ) === - 1 ) {

				removed.push( selectedOld[ i ] );

			}

		}
		selectedOld.length = 0;
		this.dispatchEvent( { type: 'change' } );
		this.dispatchEvent( { type: 'selected-changed', selected: [ ...this.selected ], added: added, removed: removed } );

	}
	updateMatrixWorld( force, camera ) {

		// Extract tranformations before and after matrix update.
		this.matrix.decompose( posOld, quatOld, scaleOld );
		super.updateMatrixWorld( force, camera );
		this.matrix.decompose( pos, quat, scale );
		// Get transformation offsets from transform deltas.
		posOffset.copy( pos ).sub( posOld );
		quatOffset.copy( quat ).multiply( quatOld.inverse() );
		scaleOffset.copy( scale ).sub( scaleOld );
		quatInv.copy( quat ).inverse();

		if ( ! this.selected.length || ! this.transformSelection ) return;
		// Apply tranformatio offsets to ancestors.
		for ( let i = 0; i < this.selected.length; i ++ ) {

			// get local transformation variables.
			this.selected[ i ].updateMatrixWorld();
			this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
			if ( this.selected[ i ].parent ) this.selected[ i ].parent.matrixWorld.decompose( parentPos, parentQuat, parentScale );
			parentQuatInv.copy( parentQuat ).inverse();
			itemQuatInv.copy( itemQuat ).inverse();
			// Transform selected in local space.
			if ( this.transformSpace === 'local' ) {

				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( quatInv );
				itemPosOffset.applyQuaternion( this.selected[ i ].quaternion );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				itemQuatOffset.copy( quatInv ).multiply( quatOffset ).multiply( quat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue; // lets not go there...
				this.selected[ i ].scale.add( scaleOffset );
			// Transform selected in world space.

			} else if ( this.transformSpace === 'world' ) {

				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;
				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( parentQuatInv );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				dist0.subVectors( itemPos, pos );
				dist1.subVectors( itemPos, pos ).applyQuaternion( quatOffset );
				dist1.sub( dist0 ).applyQuaternion( parentQuatInv );
				this.selected[ i ].position.add( dist1 );
				itemQuatOffset.copy( itemQuatInv ).multiply( quatOffset ).multiply( itemQuat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				this.selected[ i ].scale.add( scaleOffset );

			}
			this.selected[ i ].updateMatrixWorld();

		}

	}
	_isAncestorOfSelected( object ) {

		let parent = object.parent;
		while ( parent ) {

			if ( this.selected.indexOf( parent ) !== - 1 ) return true;
			object = parent, parent = object.parent;

		}
		return false;

	}

}

export { SelectionControls };
