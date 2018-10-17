import { UniformsUtils, Vector3, Color, FrontSide, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Mesh, BoxBufferGeometry, Sprite, Texture, Vector2, BufferGeometry, BufferAttribute, Euler, Quaternion, Matrix4, Float32BufferAttribute, Uint16BufferAttribute, CylinderBufferGeometry, Raycaster, Box3 } from '../lib/three.module.js';

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

class TextHelper extends IoLiteMixin( Sprite ) {

	constructor( props = {} ) {

		super();

		this.defineProperties( {
			text: '',
			color: props.color || 'black',
			size: 0.33,
		} );

		this.scaleTarget = new Vector3( 1, 1, 1 );

		this.canvas = document.createElement( 'canvas' );
		this.ctx = this.canvas.getContext( '2d' );
		this.texture = new Texture( this.canvas );

		this.material.map = this.texture;

		this.canvas.width = 256;
		this.canvas.height = 64;

		this.scale.set( 1, 0.25, 1 );
		this.scale.multiplyScalar( this.size );

		this.position.set( props.position[ 0 ], props.position[ 1 ], props.position[ 2 ] );

		this.text = '-+0.4';

	}
	textChanged() {

		const ctx = this.ctx;
		const canvas = this.canvas;

		ctx.clearRect( 0, 0, canvas.width, canvas.height );

		ctx.font = 'bold ' + canvas.height * 0.9 + 'px monospace';

		ctx.fillStyle = this.color;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.strokeStyle = 'black';
		ctx.lineWidth = canvas.height / 8;

		ctx.strokeText( this.text, canvas.width / 2, canvas.height / 2 );
		ctx.fillText( this.text, canvas.width / 2, canvas.height / 2 );

		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

		ctx.fillText( this.text, canvas.width / 2, canvas.height / 2 );

		this.texture.needsUpdate = true;

	}

}

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
	mergeBufferGeometries: function ( geometries, useGroups, mergedGeometry ) {

		let isIndexed = geometries[ 0 ].index !== null;

		let attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		let morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		let attributes = {};
		let morphAttributes = {};

		// mergedGeometry = mergedGeometry || new BufferGeometry();

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

// Reusable utility variables
const _position = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

class HelperGeometry extends BufferGeometry {

	constructor( geometry, props ) {

		super();

		this.props = props;

		this.index = new Uint16BufferAttribute( [], 1 );
		this.addAttribute( 'position', new Float32BufferAttribute( [], 3 ) );
		this.addAttribute( 'uv', new Float32BufferAttribute( [], 2 ) );
		this.addAttribute( 'color', new Float32BufferAttribute( [], 4 ) );
		this.addAttribute( 'normal', new Float32BufferAttribute( [], 3 ) );
		this.addAttribute( 'outline', new Float32BufferAttribute( [], 1 ) );

		let chunks;
		if ( geometry instanceof Array ) {

			chunks = geometry;

		} else {

			chunks = [[ geometry, props ]];

		}

		const chunkGeometries = [];

		for ( let i = chunks.length; i --; ) {

			const chunk = chunks[ i ];

			let chunkGeo = chunk[ 0 ].clone();
			chunkGeometries.push( chunkGeo );

			let chunkProp = chunk[ 1 ] || {};

			const color = chunkProp.color || [];
			const position = chunkProp.position;
			const rotation = chunkProp.rotation;
			let scale = chunkProp.scale;

			let thickness = ( chunkProp.thickness || - 0 ) / 2;
			let outlineThickness = chunkProp.outlineThickness !== undefined ? chunkProp.outlineThickness : 1;

			if ( scale && typeof scale === 'number' ) scale = [ scale, scale, scale ];

			_position.set( 0, 0, 0 );
			_quaternion.set( 0, 0, 0, 1 );
			_scale.set( 1, 1, 1 );

			if ( position ) _position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
			if ( rotation ) _quaternion.setFromEuler( _euler.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] ) );
			if ( scale ) _scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

			_matrix.compose( _position, _quaternion, _scale );

			chunkGeo.applyMatrix( _matrix );

			// TODO: investigate proper indexing!
			if ( chunkGeo.index === null ) {

				const indices = [];
				for ( let j = 0; j < chunkGeo.attributes.position.count - 2; j += 3 ) {

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

			const colorArray = chunkGeo.attributes.color.array;
			for ( let j = 0; j < vertCount; j ++ ) {

				const r = j * 4 + 0; colorArray[ r ] = color[ 0 ] !== undefined ? color[ 0 ] : colorArray[ r ];
				const g = j * 4 + 1; colorArray[ g ] = color[ 1 ] !== undefined ? color[ 1 ] : colorArray[ g ];
				const b = j * 4 + 2; colorArray[ b ] = color[ 2 ] !== undefined ? color[ 2 ] : colorArray[ b ];
				const a = j * 4 + 3; colorArray[ a ] = color[ 3 ] !== undefined ? color[ 3 ] : colorArray[ a ] || 1;

			}

			// Duplicate geometry and add outline attribute
			//TODO: enable outline overwrite (needs to know if is outline or not in combined geometry)
			if ( ! chunkGeo.attributes.outline ) {

				const outlineArray = [];
				for ( let j = 0; j < vertCount; j ++ ) {

					outlineArray[ j ] = - thickness;

				}

				chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
				BufferGeometryUtils.mergeBufferGeometries( [ chunkGeo, chunkGeo ], false, chunkGeo );

				if ( outlineThickness ) {

					for ( let j = 0; j < vertCount; j ++ ) {

						chunkGeo.attributes.outline.array[( vertCount + j )] = outlineThickness + thickness;

					}

				}

				let array = chunkGeo.index.array;
				for ( let j = array.length / 2; j < array.length; j += 3 ) {

					let a = array[ j + 1 ];
					let b = array[ j + 2 ];
					array[ j + 1 ] = b;
					array[ j + 2 ] = a;

				}

			}

			for ( let j = 0; j < chunkGeo.attributes.outline.array.length; j ++ ) {

				if ( chunkGeo.attributes.outline.array[ j ] < 0 ) {

					if ( chunkProp.thickness !== undefined ) chunkGeo.attributes.outline.array[ j ] = - thickness;

				} else {

					if ( chunkProp.outlineThickness !== undefined ) chunkGeo.attributes.outline.array[ j ] = outlineThickness + thickness;

				}

			}

		}

		BufferGeometryUtils.mergeBufferGeometries( chunkGeometries, false, this );

	}

}

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

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;
const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.1;
const AXIS_FLIP_TRESHOLD = 0;

function hasAxisAny( str, chars ) {

	let has = true;
	str.split( '' ).some( a => {

		if ( chars.indexOf( a ) === - 1 ) has = false;

	} );
	return has;

}

const handleGeometry = {
	XYZ: new HelperGeometry( [
		[ new CylinderBufferGeometry( EPS, EPS, 1, 4, 2, true ), { color: [ 1, 0, 0 ], position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 } ],
		[ new CylinderBufferGeometry( EPS, EPS, 1, 4, 2, true ), { color: [ 0, 1, 0 ], position: [ 0, 0.5, 0 ], rotation: [ 0, HPI, 0 ], thickness: 1 } ],
		[ new CylinderBufferGeometry( EPS, EPS, 1, 4, 2, true ), { color: [ 0, 0, 1 ], position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ], thickness: 1 } ],
	] )
};

class TransformHelper extends Helper {

	get handleGeometry() {

		return handleGeometry;

	}
	get pickerGeometry() {

		return {};

	}
	get guideGeometry() {

		return {};

	}
	get infoGeometry() {

		return {};

	}
	constructor( props ) {

		super( props );

		this.defineProperties( {
			showX: { value: true, observer: 'paramChanged' },
			showY: { value: true, observer: 'paramChanged' },
			showZ: { value: true, observer: 'paramChanged' },
			axis: null,
			active: false,
			doHide: true,
			doFlip: true,
			hideX: { value: false, observer: 'paramChanged' },
			hideY: { value: false, observer: 'paramChanged' },
			hideZ: { value: false, observer: 'paramChanged' },
			hideXY: { value: false, observer: 'paramChanged' },
			hideYZ: { value: false, observer: 'paramChanged' },
			hideXZ: { value: false, observer: 'paramChanged' },
			flipX: { value: false, observer: 'paramChanged' },
			flipY: { value: false, observer: 'paramChanged' },
			flipZ: { value: false, observer: 'paramChanged' },
		} );

		this.worldX = new Vector3();
		this.worldY = new Vector3();
		this.worldZ = new Vector3();
		this.axisDotEye = new Vector3();
		this.size = 0.05;

		this.handles = this.initAxes( this.handleGeometry );
		this.pickers = this.initPickers( this.pickerGeometry );
		this.guides = this.initGuides( this.guideGeometry );
		this.infos = this.initInfoMeshes( this.infoGeometry );

		this.setAxis = this.setAxis.bind( this );
		this.setGuide = this.setGuide.bind( this );
		this.setInfo = this.setInfo.bind( this );

		this.updateAxis = this.updateAxis.bind( this );
		this.updateGuide = this.updateGuide.bind( this );
		this.updateInfo = this.updateInfo.bind( this );

		this.animation = new Animation();

		this.animation.addEventListener( 'update', () => {

			this.dispatchEvent( { type: 'change' } );

		} );

	}
	initAxes( axesDef ) {

		const axes = [];
		for ( let name in axesDef ) {

			const mesh = this.makeMesh( axesDef[ name ] );
			mesh.name = name;
			mesh.scaleTarget = new Vector3( 1, 1, 1 );
			axes.push( mesh );
			axes[ name ] = mesh;
			this.add( mesh );

		}
		return axes;

	}
	initPickers( pickersDef ) {

		const axes = [];
		for ( let name in pickersDef ) {

			const mesh = this.makeMesh( pickersDef[ name ] );
			mesh.name = name;
			mesh.scaleTarget = new Vector3( 1, 1, 1 );
			mesh.material.visible = false;
			axes.push( mesh );
			axes[ name ] = mesh;
			this.add( mesh );

		}
		return axes;

	}
	initGuides( guidesDef ) {

		const axes = [];
		for ( let name in guidesDef ) {

			const mesh = this.makeMesh( guidesDef[ name ] );
			mesh.name = name;
			mesh.scaleTarget = new Vector3( 1, 1, 1 );
			mesh.isGuide = true;
			mesh.highlight = - 2;
			axes.push( mesh );
			axes[ name ] = mesh;
			this.add( mesh );

		}
		return axes;

	}
	initInfoMeshes( infosDef ) {

		const infos = [];
		for ( let name in infosDef ) {

			const mesh = new TextHelper( infosDef[ name ] );
			mesh.name = name;
			mesh.positionTarget = mesh.position.clone();
			mesh.material.opacity = 0;
			mesh.isInfo = true;
			infos.push( mesh );
			infos[ name ] = mesh;
			this.add( mesh );

		}
		return infos;

	}

	traverseAxis( callback ) {

		for ( let i = this.handles.length; i --; ) callback( this.handles[ i ] );
		for ( let i = this.pickers.length; i --; ) callback( this.pickers[ i ] );

	}
	traverseGuides( callback ) {

		for ( let i = this.guides.length; i --; ) callback( this.guides[ i ] );

	}
	traverseInfos( callback ) {

		for ( let i = this.infos.length; i --; ) callback( this.infos[ i ] );

	}

	spaceChanged() {

		super.spaceChanged();
		this.paramChanged();
		this.animateScaleUp();

	}
	objectChanged() {

		super.objectChanged();
		this.hideX = false;
		this.hideY = false;
		this.hideZ = false;
		this.hideXY = false;
		this.hideYZ = false;
		this.hideXZ = false;
		this.flipX = false;
		this.flipY = false;
		this.flipZ = false;
		this.animateScaleUp();

	}
	animateScaleUp() {

		this.traverseAxis( axis => {

			axis.scale.set( 0.0001, 0.0001, 0.0001 );
			axis.scaleTarget.set( 1, 1, 1 );

		} );
		this.animation.startAnimation( 0.5 );

	}
	axisChanged() {

		this.paramChanged();
		this.animation.startAnimation( 0.5 );

	}
	paramChanged() {

		this.traverseAxis( this.setAxis );
		this.traverseGuides( this.setGuide );
		this.traverseInfos( this.setInfo );
		this.animation.startAnimation( 0.5 );

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();
		this.worldX.set( 1, 0, 0 ).applyQuaternion( this.quaternion );
		this.worldY.set( 0, 1, 0 ).applyQuaternion( this.quaternion );
		this.worldZ.set( 0, 0, 1 ).applyQuaternion( this.quaternion );
		this.axisDotEye.set( this.worldX.dot( this.eye ), this.worldY.dot( this.eye ), this.worldZ.dot( this.eye ) );
		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;
		// Hide axis facing the camera
		if ( ! this.active ) {

			this.hideX = Math.abs( xDotE ) > AXIS_HIDE_TRESHOLD;
			this.hideY = Math.abs( yDotE ) > AXIS_HIDE_TRESHOLD;
			this.hideZ = Math.abs( zDotE ) > AXIS_HIDE_TRESHOLD;
			this.hideXY = Math.abs( zDotE ) < PLANE_HIDE_TRESHOLD;
			this.hideYZ = Math.abs( xDotE ) < PLANE_HIDE_TRESHOLD;
			this.hideXZ = Math.abs( yDotE ) < PLANE_HIDE_TRESHOLD;
			this.flipX = xDotE < AXIS_FLIP_TRESHOLD;
			this.flipY = yDotE < AXIS_FLIP_TRESHOLD;
			this.flipZ = zDotE < AXIS_FLIP_TRESHOLD;

		}
		if ( this.object ) {

			this.traverseAxis( this.updateAxis );
			this.traverseGuides( this.updateGuide );
			this.traverseInfos( this.updateInfo );

		}

	}
	// TODO: optimize, make less ugly and framerate independent!
	setAxis( axis ) {

		axis.hidden = false;
		const name = axis.name.split( '_' ).pop() || null;
		axis.highlight = this.axis ? hasAxisAny( axis.name, this.axis ) ? 1 : - 0.75 : 0;
		// Hide by show[axis] parameter
		if ( this.doHide ) {

			if ( name.indexOf( 'X' ) !== - 1 && ! this.showX ) axis.hidden = true;
			if ( name.indexOf( 'Y' ) !== - 1 && ! this.showY ) axis.hidden = true;
			if ( name.indexOf( 'Z' ) !== - 1 && ! this.showZ ) axis.hidden = true;
			if ( name.indexOf( 'E' ) !== - 1 && ( ! this.showX || ! this.showY || ! this.showZ ) ) axis.hidden = true;
			// Hide axis facing the camera
			if ( ( name == 'X' || name == 'XYZ' ) && this.hideX ) axis.hidden = true;
			if ( ( name == 'Y' || name == 'XYZ' ) && this.hideY ) axis.hidden = true;
			if ( ( name == 'Z' || name == 'XYZ' ) && this.hideZ ) axis.hidden = true;
			if ( name == 'XY' && this.hideXY ) axis.hidden = true;
			if ( name == 'YZ' && this.hideYZ ) axis.hidden = true;
			if ( name == 'XZ' && this.hideXZ ) axis.hidden = true;

		}
		// Flip axis
		if ( this.doFlip ) {

			if ( name.indexOf( 'X' ) !== - 1 || axis.name.indexOf( 'R' ) !== - 1 ) axis.scaleTarget.x = this.flipX ? - 1 : 1;
			if ( name.indexOf( 'Y' ) !== - 1 || axis.name.indexOf( 'R' ) !== - 1 ) axis.scaleTarget.y = this.flipY ? - 1 : 1;
			if ( name.indexOf( 'Z' ) !== - 1 || axis.name.indexOf( 'R' ) !== - 1 ) axis.scaleTarget.z = this.flipZ ? - 1 : 1;

		}

	}
	setGuide( guide ) {

		guide.highlight = this.axis ? hasAxisAny( guide.name, this.axis ) ? 0 : - 2 : - 2;
		// Flip axis
		if ( this.doFlip ) {

			const name = guide.name.split( '_' ).pop() || null;
			if ( name.indexOf( 'X' ) !== - 1 || guide.name.indexOf( 'R' ) !== - 1 ) guide.scaleTarget.x = this.flipX ? - 1 : 1;
			if ( name.indexOf( 'Y' ) !== - 1 || guide.name.indexOf( 'R' ) !== - 1 ) guide.scaleTarget.y = this.flipY ? - 1 : 1;
			if ( name.indexOf( 'Z' ) !== - 1 || guide.name.indexOf( 'R' ) !== - 1 ) guide.scaleTarget.z = this.flipZ ? - 1 : 1;

		}

	}
	setInfo( info ) {

		info.highlight = this.axis ? hasAxisAny( info.name, this.axis ) ? 1 : 0 : 0;
		// Flip axis
		if ( this.doFlip ) {

			const name = info.name.split( '_' ).pop() || null;
			if ( name.indexOf( 'X' ) !== - 1 ) info.positionTarget.x = this.flipX ? - 1.2 : 1.2;
			if ( name.indexOf( 'Y' ) !== - 1 ) info.positionTarget.y = this.flipY ? - 1.2 : 1.2;
			if ( name.indexOf( 'Z' ) !== - 1 ) info.positionTarget.z = this.flipZ ? - 1.2 : 1.2;

		}

	}
	updateAxis( axis ) {

		axis.visible = true;
		const highlight = axis.hidden ? - 2 : axis.highlight || 0;
		axis.material.highlight = ( 4 * axis.material.highlight + highlight ) / 5;
		if ( axis.material.highlight < - 1.99 ) axis.visible = false;
		axis.scale.multiplyScalar( 5 ).add( axis.scaleTarget ).divideScalar( 6 );

	}
	updateGuide( guide ) {

		guide.visible = true;
		const highlight = guide.hidden ? - 2 : guide.highlight || 0;
		guide.material.highlight = ( 8 * guide.material.highlight + highlight ) / 9;
		if ( guide.material.highlight < - 1.99 ) guide.visible = false;
		guide.scale.multiplyScalar( 5 ).add( guide.scaleTarget ).divideScalar( 6 );

	}
	updateInfo( info ) {

		info.visible = true;
		info.material.opacity = ( 8 * info.material.opacity + info.highlight ) / 9;
		if ( info.material.opacity <= 0.001 ) info.visible = false;
		if ( info.name === 'X' ) info.text = Math.round( this.object.position.x * 100 ) / 100;
		if ( info.name === 'Y' ) info.text = Math.round( this.object.position.y * 100 ) / 100;
		if ( info.name === 'Z' ) info.text = Math.round( this.object.position.z * 100 ) / 100;
		info.position.multiplyScalar( 5 ).add( info.positionTarget ).divideScalar( 6 );

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const PI$1 = Math.PI;
const HPI$1 = PI$1 / 2;
const EPS$1 = 0.000001;

// TODO: consider supporting objects with skewed transforms.
const _position$1 = new Vector3();
const _quaternion$1 = new Quaternion();
const _scale$1 = new Vector3();
const _m1 = new Matrix4();
const _m2 = new Matrix4();
const _one = new Vector3( 1, 1, 1 );

const corner3Geometry = new HelperGeometry( [
	[ new CylinderBufferGeometry( EPS$1, EPS$1, 1, 4, 2, true ), { color: [ 1, 0, 0 ], position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI$1 ], thickness: 1 } ],
	[ new CylinderBufferGeometry( EPS$1, EPS$1, 1, 4, 2, true ), { color: [ 0, 1, 0 ], position: [ 0, 0.5, 0 ], rotation: [ 0, HPI$1, 0 ], thickness: 1 } ],
	[ new CylinderBufferGeometry( EPS$1, EPS$1, 1, 4, 2, true ), { color: [ 0, 0, 1 ], position: [ 0, 0, 0.5 ], rotation: [ HPI$1, 0, 0 ], thickness: 1 } ],
] );

const handleGeometry$1 = {
	XYZ: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ HPI$1, 0, PI$1 ] } ),
	XYz: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ HPI$1, 0, HPI$1 ] } ),
	xyz: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ - HPI$1, 0, - HPI$1 ] } ),
	xyZ: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ - HPI$1, 0, 0 ] } ),
	xYZ: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ PI$1 / 2, 0, - PI$1 / 2 ] } ),
	xYz: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ PI$1 / 2, 0, 0 ] } ),
	Xyz: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ 0, 0, HPI$1 ] } ),
	XyZ: new HelperGeometry( corner3Geometry, { color: [ 1, 1, 0 ], rotation: [ 0, PI$1, 0 ] } ),
};

class SelectionHelper extends Helper {

	get handleGeometry() {

		return handleGeometry$1;

	}
	constructor( props ) {

		super( props );
		this.size = 0.005;
		this.combineHelperGroups( this.handleGeometry );

		const axis = new TransformHelper( { object: this } );
		axis.size = 0.01;
		axis.doFlip = false;
		axis.doHide = false;
		super.add( axis );

		if ( this.object && this.object.geometry ) {

			if ( ! this.object.geometry.boundingBox ) this.object.geometry.computeBoundingBox();
			const bbMax = this.object.geometry.boundingBox.max;
			const bbMin = this.object.geometry.boundingBox.min;

			this.corners[ 'XYZ' ].position.set( bbMax.x, bbMax.y, bbMax.z );
			this.corners[ 'XYz' ].position.set( bbMax.x, bbMax.y, bbMin.z );
			this.corners[ 'xyz' ].position.set( bbMin.x, bbMin.y, bbMin.z );
			this.corners[ 'xyZ' ].position.set( bbMin.x, bbMin.y, bbMax.z );
			this.corners[ 'xYZ' ].position.set( bbMin.x, bbMax.y, bbMax.z );
			this.corners[ 'xYz' ].position.set( bbMin.x, bbMax.y, bbMin.z );
			this.corners[ 'Xyz' ].position.set( bbMax.x, bbMin.y, bbMin.z );
			this.corners[ 'XyZ' ].position.set( bbMax.x, bbMin.y, bbMax.z );

		}

	}
	combineHelperGroups( groups ) {

		this.corners = {};
		for ( let name in groups ) {

			this.corners[ name ] = this.makeMesh( groups[ name ], { name: name } );
			// TODO: name?
			this.add( this.corners[ name ] );

		}

	}
	updateMatrixWorld() {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;

		this.object.matrixWorld.decompose( _position$1, _quaternion$1, _scale$1 );

		_m1.compose( this.position, this.quaternion, _one );

		_scale$1.x = Math.abs( _scale$1.x );
		_scale$1.y = Math.abs( _scale$1.y );
		_scale$1.z = Math.abs( _scale$1.z );

		for ( let i = 0; i < 8; i ++ ) {

			_position$1.copy( this.children[ i ].position ).multiply( _scale$1 );

			let __scale = this.scale.clone();

			let dir = this.children[ i ].position.clone().applyQuaternion( this.quaternion ).normalize();

			this.children[ i ].material.highlight = Math.min( Math.max( 3 - Math.abs( dir.dot( this.eye ) ) * 4, - 1 ), 0.5 );

			__scale.x = Math.min( this.scale.x, Math.abs( _position$1.x ) / 2 );
			__scale.y = Math.min( this.scale.y, Math.abs( _position$1.y ) / 2 );
			__scale.z = Math.min( this.scale.z, Math.abs( _position$1.z ) / 2 );

			__scale.x = Math.max( __scale.x, EPS$1 );
			__scale.y = Math.max( __scale.y, EPS$1 );
			__scale.z = Math.max( __scale.z, EPS$1 );

			_m2.compose( _position$1, new Quaternion(), __scale );

			this.children[ i ].matrixWorld.copy( _m1 ).multiply( _m2 );

		}
		this.children[ 8 ].updateMatrixWorld();

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
const bbox = new Box3();

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

	constructor( props ) {

		super( props );

		this.defineProperties( {
			object_: props.object_ || null, // TODO: remove
			selected: [],
			transformSelection: true,
			transformSpace: 'local',
			boundingBox: new Box3()
			// translationSnap: null,
			// rotationSnap: null
		} );

	}
	select( position, add ) {

		const camera = this.camera;
		raycaster.setFromCamera( position, camera );

		const intersects = raycaster.intersectObjects( this.object_.children, true );
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
		this.position.set( 0, 0, 0 );
		this.quaternion.set( 0, 0, 0, 1 );
		this.scale.set( 1, 1, 1 );

		// TODO: temp for testing
		this.boundingBox.makeEmpty();

		if ( this.selected.length && this.transformSelection ) {

			// Set selection transform to last selected item (not ancestor of selected).
			if ( this.transformSpace === 'local' ) {

				for ( let i = this.selected.length; i --; ) {

					let item = this.selected[ i ];
					if ( this._isAncestorOfSelected( item ) ) continue;
					item.updateMatrixWorld();
					item.matrixWorld.decompose( itemPos, itemQuat, itemScale );
					this.position.copy( itemPos );
					this.quaternion.copy( itemQuat );

					if ( item.geometry ) {

						if ( ! item.geometry.boundingBox ) item.geometry.computeBoundingBox();
						bbox.copy( item.geometry.boundingBox );
						bbox.min.multiply( itemScale );
						bbox.max.multiply( itemScale );
						this.boundingBox.copy( bbox );

					}

					break;

				}
				// Set selection transform to the average of selected items.

			} else if ( this.transformSpace === 'world' ) {

				// TODO: center should be in the center of combined boundging box.
				// TODO: Verify with StretchTransformControls box handles
				pos.set( 0, 0, 0 );
				for ( let i = 0; i < this.selected.length; i ++ ) {

					let item = this.selected[ i ];
					item.updateMatrixWorld();
					item.matrixWorld.decompose( itemPos, itemQuat, itemScale );
					pos.add( itemPos );

				}
				this.position.copy( pos ).divideScalar( this.selected.length );

				// this.updateMatrixWorld();

				for ( let i = 0; i < this.selected.length; i ++ ) {

					let item = this.selected[ i ];
					item.matrixWorld.decompose( itemPos, itemQuat, itemScale );
					if ( item.geometry ) {

						if ( ! item.geometry.boundingBox ) item.geometry.computeBoundingBox();
						bbox.copy( item.geometry.boundingBox );
						bbox.min.multiply( itemScale );
						bbox.max.multiply( itemScale );

						bbox.min.add( itemPos.clone().sub( this.position ) );
						bbox.max.add( itemPos.clone().sub( this.position ) );

						this.boundingBox.expandByPoint( bbox.min );
						this.boundingBox.expandByPoint( bbox.max );

					} else {

						// TODO: test with non-geometric objects
						this.boundingBox.expandByPoint( itemPos ); // Doesent make sense

					}

				}

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
		for ( let i = this.children.length; i --; ) {

			super.remove( this.children[ i ] );

		}

		for ( let i = 0; i < this.selected.length; i ++ ) {

			const _helper = new SelectionHelper( { object: this.selected[ i ] } );
			super.add( _helper );

		}

		super.updateMatrixWorld();

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
	updateMatrixWorld( force ) {

		// Extract tranformations before and after matrix update.
		this.matrixWorld.decompose( posOld, quatOld, scaleOld );
		super.updateMatrixWorld( force );
		this.matrixWorld.decompose( pos, quat, scale );

		// Get transformation offsets from transform deltas.
		posOffset.copy( pos ).sub( posOld );
		quatOffset.copy( quat ).multiply( quatOld.inverse() );
		scaleOffset.copy( scale ).divide( scaleOld );
		quatInv.copy( quat ).inverse();

		if ( ! this.selected.length || ! this.transformSelection ) return;
		// Apply tranformatio offsets to ancestors.
		for ( let i = 0; i < this.selected.length; i ++ ) {

			// get local transformation variables.
			this.selected[ i ].updateMatrixWorld();
			this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
			this.selected[ i ].parent.matrixWorld.decompose( parentPos, parentQuat, parentScale );
			parentQuatInv.copy( parentQuat ).inverse();
			itemQuatInv.copy( itemQuat ).inverse();
			// Transform selected in local space.
			if ( this.transformSpace === 'local' ) {

				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( quatInv ).divide( parentScale );
				itemPosOffset.applyQuaternion( this.selected[ i ].quaternion );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				itemQuatOffset.copy( quatInv ).multiply( quatOffset ).multiply( quat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue; // lets not go there...
				this.selected[ i ].scale.multiply( scaleOffset );
			// Transform selected in world space.

			} else if ( this.transformSpace === 'world' ) {

				if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;
				// Position
				itemPosOffset.copy( posOffset ).applyQuaternion( parentQuatInv ).divide( parentScale );
				this.selected[ i ].position.add( itemPosOffset );
				// Rotation
				dist0.subVectors( itemPos, pos );
				dist1.subVectors( itemPos, pos ).applyQuaternion( quatOffset );
				dist1.sub( dist0 ).applyQuaternion( parentQuatInv ).divide( parentScale );
				this.selected[ i ].position.add( dist1 );
				itemQuatOffset.copy( itemQuatInv ).multiply( quatOffset ).multiply( itemQuat ).normalize();
				this.selected[ i ].quaternion.multiply( itemQuatOffset );
				// Scale
				this.selected[ i ].scale.multiply( scaleOffset );

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
