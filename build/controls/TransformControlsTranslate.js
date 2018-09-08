import { Object3D, Vector3, Quaternion, Vector2, BufferGeometry, BufferAttribute, UniformsUtils, Color, DoubleSide, ShaderMaterial, Mesh, Euler, Matrix4, Uint16BufferAttribute, Float32BufferAttribute, SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, BoxBufferGeometry } from '../../lib/three.module.js';
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

		if ( this._listeners === undefined ) return;
		if ( this._listeners[ event.type ] !== undefined ) {

			event.target = this;
			let array = this._listeners[ event.type ].slice( 0 );
			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

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
const defineProperty = function ( scope, propName, defaultValue ) {

	scope._properties[ propName ] = defaultValue;
	if ( defaultValue === undefined ) {

		console.warn( 'IoLiteMixin: ' + propName + ' is mandatory!' );

	}
	Object.defineProperty( scope, propName, {
		get: function () {

			return scope._properties[ propName ] !== undefined ? scope._properties[ propName ] : defaultValue;

		},
		set: function ( value ) {

			if ( scope._properties[ propName ] !== value ) {

				const oldValue = scope._properties[ propName ];
				scope._properties[ propName ] = value;
				if ( typeof scope[ propName + 'Changed' ] === 'function' ) scope[ propName + 'Changed' ]( value, oldValue );
				scope.dispatchEvent( { type: propName + '-changed', value: value, oldValue: oldValue } );
				scope.dispatchEvent( { type: 'change', prop: propName, value: value, oldValue: oldValue } );

			}

		},
		enumerable: propName.charAt( 0 ) !== '_'
	} );
	scope[ propName ] = defaultValue;

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
			_animationActive: false,
			_animationTime: 0,
			_animationTimeRemainging: 0,
			_rafID: 0
		} );

	}
	startAnimation( duration ) {

		this._animationTimeRemainging = Math.max( this._animationTimeRemainging, duration * 100000 || 0 );
		if ( ! this._animationActive ) {

			this._animationActive = true;
			this._animationTime = performance.now();
			this._rafID = requestAnimationFrame( () => {

				const time = performance.now();
				const timestep = time - this._animationTime;
				this._animationTime = time;
				this._animationTimeRemainging = Math.max( this._animationTimeRemainging - time, 0 );
				this.dispatchEvent( { type: 'start', timestep: timestep, time: time } );
				this.animate( timestep, time );

			} );

		}

	}
	animate( timestep, time ) {

		if ( this._animationActive && this._animationTimeRemainging ) {

			this._rafID = requestAnimationFrame( () => {

				const time = performance.now();
				timestep = time - this._animationTime;
				this._animationTime = time;
				this._animationTimeRemainging = Math.max( this._animationTimeRemainging - time, 0 );
				this.animate( timestep, time );

			} );

		} else {

			this.stopAnimation( timestep, time );

		}
		this.dispatchEvent( { type: 'update', timestep: timestep, time: time } );

	}
	stopAnimation() {

		const time = performance.now();
		const timestep = time - this._animationTime;
		this.dispatchEvent( { type: 'stop', timestep: timestep, time: time } );
		this._animationActive = false;
		cancelAnimationFrame( this._rafID );

	}

}

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
	constructor( params = {} ) {

		super();
		this.defineProperties( {
			object: params.object || null,
			camera: params.camera || null,
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
		this.animation.addEventListener( 'start', () => {

			this.dispatchEvent( { type: 'change' } );

		} );
		this.animation.addEventListener( 'update', () => {

			this.dispatchEvent( { type: 'change' } );

		} );
		this.animation.addEventListener( 'stop', () => {

			this.dispatchEvent( { type: 'change' } );

		} );

	}
	updateHelperMatrix() {

		if ( this.object ) {

			this.object.updateMatrixWorld();
			this.matrix.copy( this.object.matrix );
			this.matrixWorld.copy( this.object.matrixWorld );

		} else {

			super.updateMatrixWorld();

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
	updateMatrixWorld() {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

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
		} );

		this.defineProperties( {
			color: color !== undefined ? _colors[ color ] : _colors[ 'white' ],
			opacity: opacity !== undefined ? opacity : 1,
			side: DoubleSide,
			transparent: true,
			highlight: 0,
			// wireframe: true
		} );


		this.uniforms = UniformsUtils.merge( [ this.uniforms, {
			"uColor": { value: this.color },
			"uOpacity": { value: this.opacity },
			"uHighlight": { value: this.highlight }
		} ] );

		this.vertexShader = `
			attribute vec4 color;
			attribute float outline;
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			void main() {
				vColor = color;
				vOutline = outline;
				vNormal = normalize( normalMatrix * normal );
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];
				vec3 sNormal = normalize(vec3(vNormal.x, vNormal.y, 0));

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude += 0.0015 * outline;
					pos.z += .1;
				} else {
					extrude += 0.001 * -outline;
				}
				pos.x += sNormal.x * extrude * (pos.w) * aspect;
				pos.y += sNormal.y * extrude * (pos.w);

				gl_Position = pos;
			}
		`;
		this.fragmentShader = `
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uHighlight;
			void main() {
				if (vOutline > 0.0) {
					vec4 c = mix(vec4( 0.0, 0.0, 0.0, 1.0 ), vec4( 1.0, 1.0, 1.0, 2.0 ), max(0.0, uHighlight) );
					c = mix(c, vec4( 0.5, 0.5, 0.5, 1.0 * 0.15 ), max(0.0, -uHighlight) );
					gl_FragColor = c;
					return;
				}
				float dimming = mix(1.0, 0.2, max(0.0, -uHighlight));
				dimming = mix(dimming, dimming * 2.0, max(0.0, uHighlight));
				gl_FragColor = vec4( uColor * vColor.rgb, uOpacity * vColor.a * dimming );
			}
		`;

	}
	colorChanged() {

		this.uniforms.uColor.value = this.color;
		this.uniformsNeedUpdate = true;

	}
	opacityChanged() {

		this.uniforms.uOpacity.value = this.opacity;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
		this.uniformsNeedUpdate = true;

	}
	highlightChanged() {

		this.uniforms.uHighlight.value = this.highlight;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
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
		// this.material.wireframe = true;
		// this.renderOrder = 1000;

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

		let thickness = chunk.thickness || 0;
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
			for ( let j = 0; j < chunkGeo.attributes.position.count; j ++ ) {

				indices.push( j * 3 + 0 );
				indices.push( j * 3 + 1 );
				indices.push( j * 3 + 2 );

			}
			chunkGeo.index = new Uint16BufferAttribute( indices, 1 );

		}

		const vertCount = chunkGeo.attributes.position.count;

		if ( ! chunkGeo.attributes.color ) {

			chunkGeo.addAttribute( 'color', new Float32BufferAttribute( new Array( vertCount * 4 ), 4 ) );

		}

		const colorArray = chunkGeo.attributes.color.array;
		for ( let j = 0; j < vertCount; j ++ ) {

			// TODO: fix
			const hasAlpha = colorArray[ j * 4 + 3 ] !== undefined && ! isNaN( colorArray[ j * 4 + 3 ] );
			colorArray[ j * 4 + 0 ] = color[ 0 ];
			colorArray[ j * 4 + 1 ] = color[ 1 ];
			colorArray[ j * 4 + 2 ] = color[ 2 ];
			if ( ! hasAlpha ) colorArray[ j * 4 + 3 ] = color[ 3 ] !== undefined ? color[ 3 ] : 0;

		}

		// Duplicate geometry and add outline attribute
		if ( ! chunkGeo.attributes.outline ) {

			const outlineArray = [];
			for ( let j = 0; j < vertCount; j ++ ) outlineArray[ j ] = - thickness || 0;
			chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );

		}

		if ( outlineThickness ) {

			chunkGeo = BufferGeometryUtils.mergeBufferGeometries( [ chunkGeo, chunkGeo ] );
			for ( let j = 0; j < vertCount; j ++ ) chunkGeo.attributes.outline.array[ vertCount + j ] = outlineThickness + thickness;

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

class OctahedronGeometry extends OctahedronBufferGeometry {

	constructor() {

		super( 1, 0 );

	}

}

class PlaneGeometry extends BoxBufferGeometry {

	constructor() {

		super( 1, 1, 0.01, 1, 1, 1 );

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
			{ geometry: new CylinderBufferGeometry( 0.00001, 0.00001, 0.8, 4, 2, false ), position: [ 0, 0.4, 0 ], thickness: 1 }
		] );
		return this.geometry;

	}

}

class Corner2Geometry extends HelperMesh {

	constructor() {

		super( [
			{ geometry: new CylinderBufferGeometry( 0.00001, 0.00001, 1, 4, 2, false ), position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new CylinderBufferGeometry( 0.00001, 0.00001, 1, 4, 2, false ), position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( 0.00001, 4, 4 ), position: [ 0, 0, 0 ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( 0.00001, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ 0, 0, HPI ], thickness: 1 },
			{ geometry: new SphereBufferGeometry( 0.00001, 4, 4 ), position: [ 0, 0, 1 ], rotation: [ HPI, 0, 0 ], thickness: 1 },
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

class TransformHelper extends Helper {

	constructor( props ) {

		super( props );

		this.defineProperties( {
			showX: true,
			showY: true,
			showZ: true,
			worldX: new Vector3(),
			worldY: new Vector3(),
			worldZ: new Vector3(),
			axisDotEye: new Vector3()
		} );
		this.size = 0.1;

		this.handles = this.combineHelperGroups( this.handlesGroup );
		this.pickers = this.combineHelperGroups( this.pickersGroup );
		if ( this.handles.length ) this.add( ...this.handles );
		if ( this.pickers.length ) this.add( ...this.pickers );

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups( groups ) {

		const meshes = [];
		for ( let name in groups ) {

			const mesh = new HelperMesh( groups[ name ], { name: name } );
			mesh.has = char => {

				return mesh.name.search( char ) !== - 1;

			};
			mesh.is = char => {

				return mesh.name === char;

			};
			meshes.push( mesh );

		}
		return meshes;

	}
	get handlesGroup() {

		return {
			X: [ { geometry: coneGeometry, color: [ 1, 0, 0 ], position: [ 0.15, 0, 0 ], rotation: [ 0, 0, - Math.PI / 2 ], scale: [ 0.5, 1, 0.5 ] } ],
			Y: [ { geometry: coneGeometry, color: [ 0, 1, 0 ], position: [ 0, 0.15, 0 ], rotation: [ 0, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ],
			Z: [ { geometry: coneGeometry, color: [ 0, 0, 1 ], position: [ 0, 0, - 0.15 ], rotation: [ Math.PI / 2, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ]
		};

	}
	get pickersGroup() {

		return {
			XYZ: [ { geometry: octahedronGeometry, scale: 0.5 } ]
		};

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		for ( let i = this.handles.length; i --; ) this.updateAxis( this.handles[ i ] );
		for ( let i = this.pickers.length; i --; ) this.updateAxis( this.pickers[ i ] );

		this.worldX.set( 1, 0, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldY.set( 0, 1, 0 ).applyQuaternion( this.worldQuaternion );
		this.worldZ.set( 0, 0, 1 ).applyQuaternion( this.worldQuaternion );

		this.axisDotEye.set(
			this.worldX.dot( this.eye ),
			this.worldY.dot( this.eye ),
			this.worldZ.dot( this.eye )
		);

	}
	updateAxis( axis ) {

		// Hide non-enabled Transform
		axis.visible = true;
		axis.visible = axis.visible && ( ! axis.has( "X" ) || this.showX );
		axis.visible = axis.visible && ( ! axis.has( "Y" ) || this.showY );
		axis.visible = axis.visible && ( ! axis.has( "Z" ) || this.showZ );
		axis.visible = axis.visible && ( ! axis.has( "E" ) || ( this.showX && this.showY && this.showZ ) );
		// Hide pickers
		for ( let i = 0; i < this.pickers.length; i ++ ) this.pickers[ i ].material.visible = false;

	}

}

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = 0;

const arrowGeometry = new ArrowGeometry();
const corner2Geometry = new Corner2Geometry();
const octahedronGeometry$1 = new OctahedronGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const planeGeometry = new PlaneGeometry();

class TransformHelperTranslate extends TransformHelper {

	get handlesGroup() {

		return {
			X: [ { geometry: arrowGeometry, color: [ 1, 0.3, 0.3 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: arrowGeometry, color: [ 0.3, 1, 0.3 ] } ],
			Z: [ { geometry: arrowGeometry, color: [ 0.3, 0.3, 1 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			XYZ: [
				{ geometry: octahedronGeometry$1, scale: 0.075 }
			],
			XY: [
				{ geometry: planeGeometry, color: [ 1, 1, 0, 0.25 ], position: [ 0.15, 0.15, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 1, 1, 0.3 ], position: [ 0.32, 0.32, 0 ], scale: 0.15, rotation: [ Math.PI / 2, 0, Math.PI ] }
			],
			YZ: [
				{ geometry: planeGeometry, color: [ 0, 1, 1, 0.25 ], position: [ 0, 0.15, 0.15 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 0.3, 1, 1 ], position: [ 0, 0.32, 0.32 ], scale: 0.15, rotation: [ 0, Math.PI, - Math.PI / 2 ] }
			],
			XZ: [
				{ geometry: planeGeometry, color: [ 1, 0, 1, 0.25 ], position: [ 0.15, 0, 0.15 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.3 },
				{ geometry: corner2Geometry, color: [ 1, 0.3, 1 ], position: [ 0.32, 0, 0.32 ], scale: 0.15, rotation: [ 0, Math.PI, 0 ] }
			]
		};

	}
	get pickersGroup() {

		return {
			X: [ { geometry: pickerHandleGeometry, rotation: [ 0, 0, - Math.PI / 2 ] } ],
			Y: [ { geometry: pickerHandleGeometry } ],
			Z: [ { geometry: pickerHandleGeometry, rotation: [ Math.PI / 2, 0, 0 ] } ],
			XYZ: [ { geometry: octahedronGeometry$1, scale: 0.4 } ],
			XY: [ { geometry: planeGeometry, position: [ 0.25, 0.25, 0 ], scale: 0.5 } ],
			YZ: [ { geometry: planeGeometry, position: [ 0, 0.25, 0.25 ], rotation: [ 0, Math.PI / 2, 0 ], scale: 0.5 } ],
			XZ: [ { geometry: planeGeometry, position: [ 0.25, 0, 0.25 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: 0.5 } ]
		};

	}
	updateAxis( axis ) {

		super.updateAxis( axis );

		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;

		// Hide translate and scale axis facing the camera
		if ( ( axis.is( 'X' ) || axis.is( 'XYZX' ) ) && Math.abs( xDotE ) > AXIS_HIDE_TRESHOLD ) axis.visible = false;
		if ( ( axis.is( 'Y' ) || axis.is( 'XYZY' ) ) && Math.abs( yDotE ) > AXIS_HIDE_TRESHOLD ) axis.visible = false;
		if ( ( axis.is( 'Z' ) || axis.is( 'XYZZ' ) ) && Math.abs( zDotE ) > AXIS_HIDE_TRESHOLD ) axis.visible = false;
		if ( axis.is( 'XY' ) && Math.abs( zDotE ) < PLANE_HIDE_TRESHOLD ) axis.visible = false;
		if ( axis.is( 'YZ' ) && Math.abs( xDotE ) < PLANE_HIDE_TRESHOLD ) axis.visible = false;
		if ( axis.is( 'XZ' ) && Math.abs( yDotE ) < PLANE_HIDE_TRESHOLD ) axis.visible = false;

		// Flip axis ocluded behind another axis
		axis.scale.set( 1, 1, 1 );
		if ( axis.has( 'X' ) && xDotE < AXIS_FLIP_TRESHOLD ) axis.scale.x *= - 1;
		if ( axis.has( 'Y' ) && yDotE < AXIS_FLIP_TRESHOLD ) axis.scale.y *= - 1;
		if ( axis.has( 'Z' ) && zDotE < AXIS_FLIP_TRESHOLD ) axis.scale.z *= - 1;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

class TransformControlsTranslate extends TransformControlsMixin( TransformHelperTranslate ) {

	transform( space ) {

		if ( ! this.hasAxis( 'X' ) ) this.pointEnd.x = this.pointStart.x;
		if ( ! this.hasAxis( 'Y' ) ) this.pointEnd.y = this.pointStart.y;
		if ( ! this.hasAxis( 'Z' ) ) this.pointEnd.z = this.pointStart.z;

		if ( space === 'local' ) {

			this.object.position.copy( this.pointEnd ).sub( this.pointStart ).applyQuaternion( this.quaternionStart );

		} else {

			this.object.position.copy( this.pointEnd ).sub( this.pointStart );

		}
		this.object.position.add( this.positionStart );

	}

}

export { TransformControlsTranslate };
