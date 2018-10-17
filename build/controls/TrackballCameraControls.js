import { UniformsUtils, Vector3, Color, FrontSide, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Mesh, BoxBufferGeometry, Vector2, MOUSE, Quaternion } from '../../../lib/three.module.js';

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
 * Changed properties trigger "change" and "[prop]-changed" events, and execution of [prop]Changed() callback.
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
	defineProperties( props ) {

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

// TODO: pixel-perfect outlines
class HelperMaterial extends IoLiteMixin( ShaderMaterial ) {

	constructor( props = {} ) {

		super( {
			depthTest: true,
			depthWrite: true,
			transparent: !! props.opacity,
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

		let color = props.color || new Color( 0xffffff );
		let opacity = props.opacity !== undefined ? props.opacity : 1;

		const res = new Vector3( window.innerWidth, window.innerHeight, window.devicePixelRatio );


		this.defineProperties( {
			color: { value: color, observer: 'uniformChanged' },
			opacity: { value: opacity, observer: 'uniformChanged' },
			depthBias: { value: props.depthBias || 0, observer: 'uniformChanged' },
			highlight: { value: props.highlight || 0, observer: 'uniformChanged' },
			resolution: { value: res, observer: 'uniformChanged' },
		} );

		this.uniforms = UniformsUtils.merge( [ this.uniforms, {
			"uColor": { value: this.color },
			"uOpacity": { value: this.opacity },
			"uDepthBias": { value: this.depthBias },
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
			varying vec2 vUv;

			uniform vec3 uResolution;
			uniform float uDepthBias;
			uniform float uHighlight;

			void main() {
				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];

				vColor = color;
				isOutline = outline;

				vec3 nor = normalMatrix * normal;
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				// nor = (projectionMatrix * vec4(nor, 1.0)).xyz;
				nor = normalize((nor.xyz) * vec3(1., 1., 0.));

				pos.z -= uDepthBias * 0.1;
				pos.z -= uHighlight;

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude = outline;
					pos.z += 0.01;
					pos.z = max(-0.99, pos.z);
				} else {
					extrude -= outline;
					pos.z = max(-1.0, pos.z);
				}

				pos.xy /= pos.w;

				float dx = nor.x * extrude * 2.2;
				float dy = nor.y * extrude * 2.2;

				pos.x += (dx) * (1.0 / uResolution.x);
				pos.y += (dy) * (1.0 / uResolution.y);

				vUv = uv;

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
			varying vec2 vUv;

			void main() {

				float opacity = 1.0;
				vec3 color = vColor.rgb;

				if (isOutline > 0.0) {
					color = mix(color * vec3(0.25), vec3(1.0), max(0.0, uHighlight) );
					color = mix(color, vColor.rgb, max(0.0, -uHighlight) );
				}

				float dimming = mix(1.0, 0.0, max(0.0, -uHighlight));
				dimming = mix(dimming, 2.0, max(0.0, uHighlight));
				opacity = vColor.a * dimming;

				color = mix(vec3(0.5), saturate(color), dimming);

				gl_FragColor = vec4(color, uOpacity);

				opacity = opacity - mod(opacity, 0.25) + 0.25;

				vec2 matCoord = ( mod(gl_FragCoord.xy, 4.0) - vec2(0.5) ) / 4.0;
				vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );
				if (opacity < ditherPattern.r) discard;
			}
		`;

	}
	uniformChanged() {

		this.uniforms.uColor.value = this.color;
		this.uniforms.uOpacity.value = this.opacity;
		this.uniforms.uDepthBias.value = this.depthBias;
		this.uniforms.uHighlight.value = this.highlight;
		this.uniforms.uResolution.value = this.resolution;
		this.uniformsNeedUpdate = true;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const _cameraPosition = new Vector3();

/*
 * Helper extends Object3D to automatically follow its target `object` by copying transform matrices from it.
 * If `space` property is set to "world", helper will not inherit objects rotation.
 * Helpers will auto-scale in view space if `size` property is non-zero.
 */

class Helper extends IoLiteMixin( Mesh ) {

	constructor( props = {} ) {

		super();

		this.defineProperties( {
			object: props.object || null,
			camera: props.camera || null,
			depthBias: 0,
			space: 'local',
			size: 0
		} );

		this.eye = new Vector3();

		this.geometry = new BoxBufferGeometry( 1, 1, 1, 1, 1, 1 );
		this.material.colorWrite = false;
		this.material.depthWrite = false;

	}
	onBeforeRender( renderer, scene, camera ) {

		this.camera = camera;

	}
	depthBiasChanged() {

		this.traverse( object => {

			object.material.depthBias = this.depthBias;

		} );

	}
	objectChanged() {

		this.updateHelperMatrix();

	}
	cameraChanged() {

		this.updateHelperMatrix();

	}
	spaceChanged() {

		this.updateHelperMatrix();

	}
	updateHelperMatrix() {

		if ( this.object ) {

			this.matrix.copy( this.object.matrix );
			this.matrixWorld.copy( this.object.matrixWorld );
			this.matrixWorld.decompose( this.position, this.quaternion, this.scale );

		} else {

			super.updateMatrixWorld();

		}

		if ( this.camera ) {

			let eyeDistance = 1;
			_cameraPosition.set( this.camera.matrixWorld.elements[ 12 ], this.camera.matrixWorld.elements[ 13 ], this.camera.matrixWorld.elements[ 14 ] );
			if ( this.camera.isPerspectiveCamera ) {

				// TODO: make scale zoom independent with PerspectiveCamera
				this.eye.copy( _cameraPosition ).sub( this.position );
				eyeDistance = this.eye.length();
				this.eye.normalize();

			} else if ( this.camera.isOrthographicCamera ) {

				eyeDistance = 3 * ( this.camera.top - this.camera.bottom ) / this.camera.zoom; // TODO: Why magic number 3 matches perspective?
				this.eye.copy( _cameraPosition ).normalize();

			}
			if ( this.size ) this.scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size );

		}
		if ( this.space === 'world' ) this.quaternion.set( 0, 0, 0, 1 );

		this.matrixWorld.compose( this.position, this.quaternion, this.scale );

	}
	updateMatrixWorld( force ) {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		for ( let i = this.children.length; i --; ) this.children[ i ].updateMatrixWorld( force );

	}
	// TODO: refactor. Consider movinf to utils.
	makeMesh( geometry ) {

		const props = geometry.props || {};
		const material = new HelperMaterial( props );
		const mesh = new Mesh( geometry, material );
		mesh.hidden = false;
		mesh.highlight = props.highlight || 0;
		return mesh;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

/*
 * Wraps target class with PointerEvent API polyfill for more powerful mouse/touch interactions.
 * Following callbacks will be invoked on pointer events:
 * onPointerDown, onPointerHover, onPointerMove, onPointerUp,
 * onKeyDown, onKeyUp, onWheel, onContextmenu, onFocus, onBlur.
 * onKeyDown, onKeyUp require domElement to be focused (set tabindex attribute).
 *
 * See PointerEvents.js for more details.
 */

// TODO: PointerEvents documentation

const InteractiveMixin = ( superclass ) => class extends superclass {

	constructor( props ) {

		super( props );

		this.defineProperties( {
			enabled: true,
			domElement: props.domElement // TODO: implement domElement change / multiple elements
		} );

		this._pointerEvents = new PointerEvents( props.domElement, { normalized: true } );

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
	// Control methods - implemented in subclass!
	onContextmenu( /*event*/ ) {}
	onPointerHover( /*pointer*/ ) {}
	onPointerDown( /*pointer*/ ) {}
	onPointerMove( /*pointer*/ ) {}
	onPointerUp( /*pointer*/ ) {}
	onPointerLeave( /*pointer*/ ) {}
	onKeyDown( /*event*/ ) {}
	onKeyUp( /*event*/ ) {}
	onWheel( /*event*/ ) {}
	onFocus( /*event*/ ) {}
	onBlur( /*event*/ ) {}

};

/*
 * Helper class wrapped with PointerEvents API polyfill.
 */

class Interactive extends InteractiveMixin( Helper ) {}

/**
 * @author arodic / https://github.com/arodic
 */

/*
 * Creates a single requestAnimationFrame loop.
 * provides methods to control animation and update event to hook into animation updates.
 */

class Animation extends IoLiteMixin( Object ) {

	constructor() {

		super();
		this._active = false;
		this._time = 0;
		this._timeRemainging = 0;
		this._rafID = 0;

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
 * @author arodic / http://github.com/arodic
 */

/*
 * CameraControls is a base class for controls performing orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

const STATE = { NONE: - 1, ORBIT: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const EPS = 0.000001;

// Temp variables
const direction = new Vector2();
const aspectMultiplier = new Vector2();
const orbit = new Vector2();
const pan = new Vector2();

// Framerate-independent damping
function dampTo( source, target, smoothing, dt ) {

	const t = 1 - Math.pow( smoothing, dt );
	return source * ( 1 - t ) + target * t;

}

class CameraControls extends Interactive {

	constructor( props ) {

		super( props );

		this.defineProperties( {
			target: new Vector3(),
			active: false,
			enableOrbit: true,
			enableDolly: true,
			enablePan: true,
			enableFocus: true,
			orbitSpeed: 1.0,
			dollySpeed: 1.0,
			panSpeed: 1.0,
			keyOrbitSpeed: 0.1,
			keyDollySpeed: 0.1,
			keyPanSpeed: 0.1,
			wheelDollySpeed: 0.02,
			autoOrbit: new Vector2( 0.0, 0.0 ),
			autoDollyPan: new Vector3( 0.1, 0.0, 0.0 ),
			enableDamping: true,
			dampingFactor: 0.05,
			KEYS: {
				PAN_LEFT: 37, // left
				PAN_UP: 38, // up
				PAN_RIGHT: 39, // right
				PAN_DOWN: 40, // down
				ORBIT_LEFT: 65, // A
				ORBIT_RIGHT: 68, // D
				ORBIT_UP: 83, // S
				ORBIT_DOWN: 87, // W
				DOLLY_OUT: 189, // +
				DOLLY_IN: 187, // -
				FOCUS: 70 // F
			},
			BUTTON: { LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT }, // Mouse buttons
			state: STATE.NONE,
			_orbitOffset: new Vector2(),
			_orbitInertia: new Vector2(),
			_panOffset: new Vector2(),
			_panInertia: new Vector2(),
			_dollyOffset: 0,
			_dollyInertia: 0
		} );

		this.animation = new Animation();

		this.animation.addEventListener( 'update', event => {

			this.update( event.timestep );
			this.dispatchEvent( { type: 'change' } );

		} );

		this.cameraChanged(); // TODO: ahmm...

	}
	cameraChanged() {

		// TODO: consider removing and implementing multi-camera + multi-viewport controls
		this.camera.lookAt( this.target );
		this.animation.startAnimation( 0 );

	}
	targetChanged() {

		// TODO: consider removing and implementing multi-target + multi-viewport controls
		this.camera.lookAt( this.target );
		this.animation.startAnimation( 0 );

	}
	stateChanged() {

		this.active = this.state !== STATE.NONE;
		this.animation.startAnimation( 0 );

	}
	update( timestep ) {

		let dt = timestep / 1000;
		// Apply orbit intertia
		if ( this.state !== STATE.ORBIT ) {

			if ( this.enableDamping ) {

				this._orbitInertia.x = dampTo( this._orbitInertia.x, this.autoOrbit.x, this.dampingFactor, dt );
				this._orbitInertia.y = dampTo( this._orbitInertia.y, 0.0, this.dampingFactor, dt );

			}

		} else {

			this._orbitInertia.set( this.autoOrbit.x, 0 );

		}

		this._orbitOffset.x += this._orbitInertia.x;
		this._orbitOffset.y += this._orbitInertia.y;

		// Apply pan intertia
		if ( this.state !== STATE.PAN ) {

			this._panInertia.x = dampTo( this._panInertia.x, 0.0, this.dampingFactor, dt );
			this._panInertia.y = dampTo( this._panInertia.y, 0.0, this.dampingFactor, dt );

		} else {

			this._panInertia.set( 0, 0 );

		}
		this._panOffset.x += this._panInertia.x;
		this._panOffset.y += this._panInertia.y;

		// Apply dolly intertia
		if ( this.state !== STATE.DOLLY ) {

			this._dollyInertia = dampTo( this._dollyInertia, 0.0, this.dampingFactor, dt );

		} else {

			this._dollyInertia = 0;

		}
		this._dollyOffset += this._dollyInertia;

		// set inertiae from current offsets
		if ( this.enableDamping ) {

			if ( this.state === STATE.ORBIT ) {

				this._orbitInertia.copy( this._orbitOffset );

			}
			if ( this.state === STATE.PAN ) {

				this._panInertia.copy( this._panOffset );

			}
			if ( this.state === STATE.DOLLY ) {

				this._dollyInertia = this._dollyOffset;

			}

		}

		this.orbit( orbit.copy( this._orbitOffset ) );
		this.dolly( this._dollyOffset );
		this.pan( pan.copy( this._panOffset ) );

		this._orbitOffset.set( 0, 0 );
		this._panOffset.set( 0, 0 );
		this._dollyOffset = 0;

		this.camera.lookAt( this.target );

		// Determine if animation needs to continue
		let maxVelocity = 0;
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._orbitInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.x ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._panInertia.y ) );
		maxVelocity = Math.max( maxVelocity, Math.abs( this._dollyInertia ) );
		if ( maxVelocity > EPS ) this.animation.startAnimation( 0 );

	}
	onPointerMove( pointers ) {

		let rect = this.domElement.getBoundingClientRect();
		let prevDistance, distance;
		aspectMultiplier.set( rect.width / rect.height, 1 );
		switch ( pointers.length ) {

			case 1:
				direction.copy( pointers[ 0 ].movement ).multiply( aspectMultiplier );
				switch ( pointers[ 0 ].button ) {

					case this.BUTTON.LEFT:
						if ( pointers.ctrlKey ) {

							this._setPan( direction.multiplyScalar( this.panSpeed ) );

						} else if ( pointers.altKey ) {

							this._setDolly( pointers[ 0 ].movement.y * this.dollySpeed );

						} else {

							this._setOrbit( direction.multiplyScalar( this.orbitSpeed ) );

						}
						break;
					case this.BUTTON.MIDDLE:
						this._setDolly( pointers[ 0 ].movement.y * this.dollySpeed );
						break;
					case this.BUTTON.RIGHT:
						this._setPan( direction.multiplyScalar( this.panSpeed ) );
						break;

				}
				break;
			default: // 2 or more
				// two-fingered touch: dolly-pan
				// TODO: apply aspectMultiplier?
				distance = pointers[ 0 ].position.distanceTo( pointers[ 1 ].position );
				prevDistance = pointers[ 0 ].previous.distanceTo( pointers[ 1 ].previous );
				direction.copy( pointers[ 0 ].movement ).add( pointers[ 1 ].movement ).multiply( aspectMultiplier );
				this._setDollyPan( ( prevDistance - distance ) * this.dollySpeed, direction.multiplyScalar( this.panSpeed ) );
				break;

		}

	}
	onPointerUp( pointers ) {

		if ( pointers.length === 0 ) {

			this.state = STATE.NONE;

		}

	}
	// onKeyDown(event) {
	// 	TODO: key inertia
	// 	TODO: better state setting
	// 	switch (event.keyCode) {
	// 		case this.KEYS.PAN_UP:
	// 			this._setPan(direction.set(0, -this.keyPanSpeed));
	// 			break;
	// 		case this.KEYS.PAN_DOWN:
	// 			this._setPan(direction.set(0, this.keyPanSpeed));
	// 			break;
	// 		case this.KEYS.PAN_LEFT:
	// 			this._setPan(direction.set(this.keyPanSpeed, 0));
	// 			break;
	// 		case this.KEYS.PAN_RIGHT:
	// 			this._setPan(direction.set(-this.keyPanSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_LEFT:
	// 			this._setOrbit(direction.set(this.keyOrbitSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_RIGHT:
	// 			this._setOrbit(direction.set(-this.keyOrbitSpeed, 0));
	// 			break;
	// 		case this.KEYS.ORBIT_UP:
	// 			this._setOrbit(direction.set(0, this.keyOrbitSpeed));
	// 			break;
	// 		case this.KEYS.ORBIT_DOWN:
	// 			this._setOrbit(direction.set(0, -this.keyOrbitSpeed));
	// 			break;
	// 		case this.KEYS.DOLLY_IN:
	// 			this._setDolly(-this.keyDollySpeed);
	// 			break;
	// 		case this.KEYS.DOLLY_OUT:
	// 			this._setDolly(this.keyDollySpeed);
	// 			break;
	// 		case this.KEYS.FOCUS:
	// 			this._setFocus();
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	this.active = false;
	// }
	onKeyUp() {
		// TODO: Consider improving for prevent pointer and multi-key interruptions.
		// this.active = false;
	}
	onWheel( event ) {

		this.state = STATE.DOLLY;
		this._setDolly( event.delta * this.wheelDollySpeed );
		this.state = STATE.NONE;
		this.animation.startAnimation( 0 );

	}
	_setPan( dir ) {

		this.state = STATE.PAN;
		if ( this.enablePan ) this._panOffset.copy( dir );
		this.animation.startAnimation( 0 );

	}
	_setDolly( dir ) {

		this.state = STATE.DOLLY;
		if ( this.enableDolly ) this._dollyOffset = dir;
		this.animation.startAnimation( 0 );

	}
	_setDollyPan( dollyDir, panDir ) {

		this.state = STATE.DOLLY_PAN;
		if ( this.enableDolly ) this._dollyOffset = dollyDir;
		if ( this.enablePan ) this._panOffset.copy( panDir );
		this.animation.startAnimation( 0 );

	}
	_setOrbit( dir ) {

		this.state = STATE.ORBIT;
		if ( this.enableOrbit ) this._orbitOffset.copy( dir );
		this.animation.startAnimation( 0 );

	}
	_setFocus() {

		this.state = STATE.NONE;
		if ( this.object && this.enableFocus ) this.focus( this.object );
		this.animation.startAnimation( 0 );

	}
	// ViewportControl control methods. Implement in subclass!
	pan() {

		console.warn( 'CameraControls: pan() not implemented!' );

	}
	dolly() {

		console.warn( 'CameraControls: dolly() not implemented!' );

	}
	orbit() {

		console.warn( 'CameraControls: orbit() not implemented!' );

	}
	focus() {

		console.warn( 'CameraControls: focus() not implemented!' );

	}

}

/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 * @author arodic / https://github.com/arodic
 */

/*
 * This set of controls performs orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrl/metaKey, wasd, or arrow keys / touch: two-finger move
 */

// Reusable utility variables
const eye = new Vector3();
const panDirection = new Vector3();
const eyeDirection = new Vector3();
const rotationAxis = new Vector3();
const rotationQuat = new Quaternion();
const upDirection = new Vector3();
const sideDirection = new Vector3();
const moveDirection = new Vector3();

class TrackballCameraControls extends CameraControls {

	constructor( props ) {

		super( props );
		this.defineProperties( {
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity // PerspectiveCamera dolly limit
		} );

	}
	orbit( orbit ) {

		eye.copy( this.camera.position ).sub( this.target );
		eyeDirection.copy( eye ).normalize();
		upDirection.copy( this.camera.up ).normalize();
		sideDirection.crossVectors( upDirection, eyeDirection ).normalize();
		upDirection.setLength( orbit.y );
		sideDirection.setLength( orbit.x );
		moveDirection.copy( upDirection.add( sideDirection ) );
		rotationAxis.crossVectors( moveDirection, eye ).normalize();
		rotationQuat.setFromAxisAngle( rotationAxis, orbit.length() );
		eye.applyQuaternion( rotationQuat );
		this.camera.up.applyQuaternion( rotationQuat );

	}
	dolly( dolly ) {

		let dollyScale = ( dolly < 0 ) ? 1 + dolly : 1 / ( 1 - dolly );
		eye.multiplyScalar( dollyScale );

	}
	pan( pan ) {

		panDirection.copy( eye ).cross( this.camera.up ).setLength( pan.x * eye.length() );
		panDirection.add( upDirection.copy( this.camera.up ).setLength( - pan.y * eye.length() ) );
		this.camera.position.add( panDirection );
		this.target.add( panDirection );
		this.camera.position.addVectors( this.target, eye );
		this.camera.lookAt( this.target );

	}

}

export { TrackballCameraControls };
