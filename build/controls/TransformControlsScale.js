import { Object3D, Vector3, Quaternion, Vector2, BufferGeometry, BufferAttribute, UniformsUtils, Color, FrontSide, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, Mesh, Euler, Matrix4, Uint16BufferAttribute, Float32BufferAttribute, SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry } from '../../lib/three.module.js';
import { TransformControlsMixin } from './TransformControlsMixin.js';

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

class GeosphereGeometry extends OctahedronBufferGeometry {

	constructor() {

		super( 1, 3 );
		return this.geometry;

	}

}

class OctahedronGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new OctahedronBufferGeometry( 1, 0 ) }
		] );
		return this.geometry;

	}

}


class PlaneGeometry extends HelperMesh {

	constructor() {

		let geometry = new BufferGeometry();

		let indices = [
			0, 1, 2, 2, 3, 0,
			4, 1, 0, 5, 1, 4,
			1, 6, 2, 1, 5, 6,
			0, 3, 7, 4, 0, 7,
			7, 2, 6, 2, 7, 3,
			7, 6, 4, 4, 6, 5
		];
		geometry.index = new Uint16BufferAttribute( indices, 1 );

		let positions = [];
		positions[ 0 ] = 1; positions[ 1 ] = 1; positions[ 2 ] = 1;
		positions[ 3 ] = - 1; positions[ 4 ] = 1; positions[ 5 ] = 1;
		positions[ 6 ] = - 1; positions[ 7 ] = - 1; positions[ 8 ] = 1;
		positions[ 9 ] = 1; positions[ 10 ] = - 1; positions[ 11 ] = 1;
		positions[ 12 ] = 1; positions[ 13 ] = 1; positions[ 14 ] = - 1;
		positions[ 15 ] = - 1; positions[ 16 ] = 1; positions[ 17 ] = - 1;
		positions[ 18 ] = - 1; positions[ 19 ] = - 1; positions[ 20 ] = - 1;
		positions[ 21 ] = 1; positions[ 22 ] = - 1; positions[ 23 ] = - 1;

		geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'normal', new Float32BufferAttribute( positions, 3 ) );

		super( [
			{ geometry: geometry, scale: [ 0.5, 0.5, 0.00001 ] }
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

class ArrowGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new ConeGeometry(), position: [ 0, 0.8, 0 ], scale: 0.2 },
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 0.8, 5, 2, false ), position: [ 0, 0.4, 0 ], thickness: 1 }
		] );
		return this.geometry;

	}

}

class ScaleArrowGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new GeosphereGeometry(), position: [ 0, 0.8, 0 ], scale: 0.075 },
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 0.8, 5, 2, false ), position: [ 0, 0.4, 0 ], thickness: 1 }
		] );
		return this.geometry;

	}

}

class Corner2Geometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 1, 5, 2, false ), position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new CylinderBufferGeometry( EPS, EPS, 1, 5, 2, false ), position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 4, 4 ), position: [ 0, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( EPS, 4, 4 ), position: [ 0, 0, 1 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
		] );
		return this.geometry;

	}

}

class PickerHandleGeometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), position: [ 0, 0.5, 0 ] }
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

		this.traverse( child => child.renderOrder = 100 );

		// Hide pickers
		for ( let i = 0; i < this.pickers.length; i ++ ) this.pickers[ i ].material.visible = false;

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

	}

}

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = - 0.2;

const arrowGeometry = new ArrowGeometry();
const corner2Geometry = new Corner2Geometry();
const octahedronGeometry$1 = new OctahedronGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const planeGeometry = new PlaneGeometry();

function stringHas$1( str, char ) {

	return str.search( char ) !== - 1;

}

class TransformHelperTranslate extends TransformHelper {

	constructor( props ) {

		super( props );
		this.defineProperties( {
			hideX: { value: false, observer: 'updateAxis' },
			hideY: { value: false, observer: 'updateAxis' },
			hideZ: { value: false, observer: 'updateAxis' },
			hideXY: { value: false, observer: 'updateAxis' },
			hideYZ: { value: false, observer: 'updateAxis' },
			hideXZ: { value: false, observer: 'updateAxis' },
			flipX: { value: false, observer: 'updateAxis' },
			flipY: { value: false, observer: 'updateAxis' },
			flipZ: { value: false, observer: 'updateAxis' }
		} );
		this.traverse( child => {

			child.renderOrder = 200;

		} );

	}
	get handlesGroup() {

		return {
			X: [ { geometry: arrowGeometry, color: [ 1, 0.3, 0.3 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: arrowGeometry, color: [ 0.3, 1, 0.3 ] } ],
			Z: [ { geometry: arrowGeometry, color: [ 0.3, 0.3, 1 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			XYZ: [
				{ geometry: octahedronGeometry$1, color: [ 1, 1, 1 ], scale: 0.1 }
			],
			XY: [
				{ geometry: planeGeometry, color: [ 1, 1, 0, 0.5 ], position: [ 0.15, 0.15, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 1, 1, 0.3 ], position: [ 0.3, 0.3, 0 ], scale: 0.15, rotation: [ Math.PI / 2, 0, Math.PI ] }
			],
			YZ: [
				{ geometry: planeGeometry, color: [ 0, 1, 1, 0.5 ], position: [ 0, 0.15, 0.15 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 0.3, 1, 1 ], position: [ 0, 0.3, 0.3 ], scale: 0.15, rotation: [ 0, Math.PI, - Math.PI / 2 ] }
			],
			XZ: [
				{ geometry: planeGeometry, color: [ 1, 0, 1, 0.5 ], position: [ 0.15, 0, 0.15 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 1, 0.3, 1 ], position: [ 0.3, 0, 0.3 ], scale: 0.15, rotation: [ 0, Math.PI, 0 ] }
			]
		};

	}
	get pickersGroup() {

		return {
			X: [ { geometry: pickerHandleGeometry, color: [ 1, 0.3, 0.3, 0.5 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: pickerHandleGeometry, color: [ 0.3, 1, 0.3, 0.5 ] } ],
			Z: [ { geometry: pickerHandleGeometry, color: [ 0.3, 0.3, 1, 0.5 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			XYZ: [ { geometry: octahedronGeometry$1, color: [ 0.5, 0.5, 0.5, 0.5 ], scale: 0.2 } ],
			XY: [ { geometry: planeGeometry, color: [ 1, 1, 0, 0.5, 0.5 ], position: [ 0.25, 0.25, 0 ], scale: 0.5 } ],
			YZ: [ { geometry: planeGeometry, color: [ 0, 1, 1, 0.5, 0.5 ], position: [ 0, 0.25, 0.25 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.5 } ],
			XZ: [ { geometry: planeGeometry, color: [ 1, 0, 1, 0.5, 0.5 ], position: [ 0.25, 0, 0.25 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.5 } ]
		};

	}
	updateAxis() {

		this.animation.startAnimation( 4 );
		this.traverse( axis => {

			if ( axis !== this ) { // TODO: conside better loop

				axis.hidden = false;
				if ( stringHas$1( axis.name, "X" ) && ! this.showX ) axis.hidden = true;
				if ( stringHas$1( axis.name, "Y" ) && ! this.showY ) axis.hidden = true;
				if ( stringHas$1( axis.name, "Z" ) && ! this.showZ ) axis.hidden = true;
				if ( stringHas$1( axis.name, "E" ) && ( ! this.showX || ! this.showY || ! this.showZ ) ) axis.hidden = true;

				// Hide axis facing the camera
				if ( ( axis.name == 'X' || axis.name == 'XYZX' ) && this.hideX ) axis.hidden = true;
				if ( ( axis.name == 'Y' || axis.name == 'XYZY' ) && this.hideY ) axis.hidden = true;
				if ( ( axis.name == 'Z' || axis.name == 'XYZZ' ) && this.hideZ ) axis.hidden = true;
				if ( axis.name == 'XY' && this.hideXY ) axis.hidden = true;
				if ( axis.name == 'YZ' && this.hideYZ ) axis.hidden = true;
				if ( axis.name == 'XZ' && this.hideXZ ) axis.hidden = true;

				// Flip axis
				if ( stringHas$1( axis.name, 'X' ) ) axis.flipX = this.flipX ? - 1 : 1;
				if ( stringHas$1( axis.name, 'Y' ) ) axis.flipY = this.flipY ? - 1 : 1;
				if ( stringHas$1( axis.name, 'Z' ) ) axis.flipZ = this.flipZ ? - 1 : 1;

			}

		} );

	}
	// TODO: optimize!
	updateAxisMaterial( axis ) {

		super.updateAxisMaterial( axis );
		if ( axis.flipX ) axis.scale.x = ( axis.scale.x * 5 + axis.flipX ) / 6;
		if ( axis.flipY ) axis.scale.y = ( axis.scale.y * 5 + axis.flipY ) / 6;
		if ( axis.flipZ ) axis.scale.z = ( axis.scale.z * 5 + axis.flipZ ) / 6;

	}
	updateHelperMatrix() {

		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;

		// Hide axis facing the camera
		if ( ! this.active ) { // skip while controls are active

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

		super.updateHelperMatrix();


	}

}

const scaleArrowGeometry = new ScaleArrowGeometry();
const pickerHandleGeometry$1 = new PickerHandleGeometry();
const corner2Geometry$1 = new Corner2Geometry();
const planeGeometry$1 = new PlaneGeometry();
const geosphereGeometry = new GeosphereGeometry();

class TransformHelperScale extends TransformHelperTranslate {

	get handlesGroup() {

		return {
			X: [ { geometry: scaleArrowGeometry, color: [ 1, 0.3, 0.3 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: scaleArrowGeometry, color: [ 0.3, 1, 0.3 ] } ],
			Z: [ { geometry: scaleArrowGeometry, color: [ 0.3, 0.3, 1 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			XY: [
				{ geometry: planeGeometry$1, color: [ 1, 1, 0, 0.5 ], position: [ 0.725, 0.725, 0 ], scale: 0.25 },
				{ geometry: corner2Geometry$1, color: [ 1, 1, 0.3 ], position: [ 0.85, 0.85, 0 ], scale: 0.25, rotation: [ Math.PI / 2, 0, Math.PI ] }
			],
			YZ: [
				{ geometry: planeGeometry$1, color: [ 0, 1, 1, 0.5 ], position: [ 0, 0.725, 0.725 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.25 },
				{ geometry: corner2Geometry$1, color: [ 0.3, 1, 1 ], position: [ 0, 0.85, 0.85 ], scale: 0.25, rotation: [ 0, Math.PI, - Math.PI / 2 ] }
			],
			XZ: [
				{ geometry: planeGeometry$1, color: [ 1, 0, 1, 0.5 ], position: [ 0.725, 0, 0.725 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.25 },
				{ geometry: corner2Geometry$1, color: [ 1, 0.3, 1 ], position: [ 0.85, 0, 0.85 ], scale: 0.25, rotation: [ 0, Math.PI, 0 ] }
			],
			XYZX: [ { geometry: geosphereGeometry, position: [ 1.1, 0, 0 ], scale: 0.075 } ],
			XYZY: [ { geometry: geosphereGeometry, position: [ 0, 1.1, 0 ], scale: 0.075 } ],
			XYZZ: [ { geometry: geosphereGeometry, position: [ 0, 0, 1.1 ], scale: 0.075 } ]
		};

	}
	get pickersGroup() {

		return {
			X: [ { geometry: pickerHandleGeometry$1, color: [ 1, 0.3, 0.3, 0.5 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: pickerHandleGeometry$1, color: [ 0.3, 1, 0.3, 0.5 ] } ],
			Z: [ { geometry: pickerHandleGeometry$1, color: [ 0.3, 0.3, 1, 0.5 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			XY: [ { geometry: planeGeometry$1, color: [ 1, 1, 0, 0.5 ], position: [ 0.71, 0.71, 0 ], scale: 0.4 } ],
			YZ: [ { geometry: planeGeometry$1, color: [ 0, 1, 1, 0.5 ], position: [ 0, 0.71, 0.71 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.4 } ],
			XZ: [ { geometry: planeGeometry$1, color: [ 1, 0, 1, 0.5 ], position: [ 0.71, 0, 0.71 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.4 } ],
			XYZX: [ { geometry: geosphereGeometry, color: [ 0.5, 0.5, 0.5, 0.5 ], position: [ 1.1, 0, 0 ], scale: 0.15 } ],
			XYZY: [ { geometry: geosphereGeometry, color: [ 0.5, 0.5, 0.5, 0.5 ], position: [ 0, 1.1, 0 ], scale: 0.15 } ],
			XYZZ: [ { geometry: geosphereGeometry, color: [ 0.5, 0.5, 0.5, 0.5 ], position: [ 0, 0, 1.1 ], scale: 0.15 } ]
		};

	}
	updateHelperMatrix() {

		this.space = 'local';
		super.updateHelperMatrix();
		// TODO: optimize!
		for ( let i = this.handles.length; i --; ) this.updateAxisMaterial( this.handles[ i ] );
		for ( let i = this.pickers.length; i --; ) this.updateAxisMaterial( this.pickers[ i ] );

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const tempVector = new Vector3();

function hasAxisAny$1( str, chars ) {

	let has = true;
	str.split( '' ).some( a => {

		if ( chars.indexOf( a ) === - 1 ) has = false;

	} );
	return has;

}

class TransformControlsScale extends TransformControlsMixin( TransformHelperScale ) {

	transform() {

		if ( hasAxisAny$1( 'XYZ', this.axis ) ) {

			let d = this.pointEnd.length() / this.pointStart.length();
			if ( this.pointEnd.dot( this.pointStart ) < 0 ) d *= - 1;
			tempVector.set( d, d, d );

		} else {

			tempVector.copy( this.pointEnd ).divide( this.pointStart );
			if ( ! hasAxisAny$1( 'X', this.axis ) ) tempVector.x = 1;
			if ( ! hasAxisAny$1( 'Y', this.axis ) ) tempVector.y = 1;
			if ( ! hasAxisAny$1( 'Z', this.axis ) ) tempVector.z = 1;

		}
		// Apply scale
		this.object.scale.copy( this.scaleStart ).multiply( tempVector );

	}

}

export { TransformControlsScale };
