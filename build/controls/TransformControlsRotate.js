import { Raycaster, Vector3, Quaternion, Plane, Object3D, Vector2, BufferGeometry, BufferAttribute, UniformsUtils, Color, DoubleSide, ShaderMaterial, Mesh, Euler, Matrix4, Uint16BufferAttribute, Float32BufferAttribute, SphereBufferGeometry, CylinderBufferGeometry, OctahedronBufferGeometry, BoxBufferGeometry, TorusBufferGeometry } from '../../../three.js/build/three.module.js';
import { InteractiveMixin } from '../Interactive.js';

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
			axis: null,
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

	}
	// TODO: document
	hasAxis( str ) {

		let has = true;
		str.split( '' ).some( a => {

			if ( this.axis.indexOf( a ) === - 1 ) has = false;

		} );
		return has;

	}
	objectChanged( value ) {

		let hasObject = value ? true : false;
		this.visible = hasObject;
		if ( ! hasObject ) {

			this.active = false;
			this.axis = null;

		}

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

		this.transform( space );

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
	transform() {

		// TODO:
		return;

	}
	updateAxis( axis ) {

		super.updateAxis( axis );
		this.highlightAxis( axis, this.axis );

	}
	highlightAxis( child, axis ) {

		if ( child.material ) {

			if ( ! this.enabled ) {

				child.material.highlight = - 1;
				return;

			}
			if ( axis ) {

				if ( this.hasAxis( child.name ) ) {

					child.material.highlight = 1;
					return;

				}
				child.material.highlight = - 1;
				return;

			}
			child.material.highlight = 0;

		}

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

	}

};

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
			eye: new Vector3()
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

				if (outline > 0.0) {
					pos.x += sNormal.x * .0018 * (pos.w) * aspect;
					pos.y += sNormal.y * .0018 * (pos.w);
					pos.z += .1;
				}

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
				if (vOutline != 0.0) {
					if (uHighlight == 0.0) {
						gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
					} else if (uHighlight == 1.0) {
						gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
					} else {
						gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 * 0.15 );
					}
					return;
				}
				float dimming = 1.0;
				if (uHighlight == -1.0) dimming = 0.15;
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
		// name properties are essential for picking and updating logic.
		this.name = props.name;
		// this.material.wireframe = true;
		this.renderOrder = Infinity;

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

		const colorArray = [];
		for ( let j = 0; j < vertCount; j ++ ) {

			colorArray[ j * 4 + 0 ] = color[ 0 ];
			colorArray[ j * 4 + 1 ] = color[ 1 ];
			colorArray[ j * 4 + 2 ] = color[ 2 ];
			colorArray[ j * 4 + 3 ] = color[ 3 ] !== undefined ? color[ 3 ] : 1;

		}
		chunkGeo.addAttribute( 'color', new Float32BufferAttribute( colorArray, 4 ) );

		// Duplicate geometry and add outline attribute
		const outlineArray = [];
		for ( let j = 0; j < vertCount; j ++ ) outlineArray[ j ] = 1;
		chunkGeo.addAttribute( 'outline', new Float32BufferAttribute( outlineArray, 1 ) );
		chunkGeo = BufferGeometryUtils.mergeBufferGeometries( [ chunkGeo, chunkGeo ] );
		for ( let j = 0; j < vertCount; j ++ ) chunkGeo.attributes.outline.array[ j ] = 0;

		geometry = BufferGeometryUtils.mergeBufferGeometries( [ geometry, chunkGeo ] );

	}
	return geometry;

}

/**
 * @author arodic / https://github.com/arodic
 */

const PI = Math.PI;
const HPI = Math.PI / 2;

const geosphereGeometry = new OctahedronBufferGeometry( 1, 3 );

const octahedronGeometry = new OctahedronBufferGeometry( 1, 0 );

const coneGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0, 0.2, 1, 8, 2 ), position: [ 0, 0.5, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.2, 8, 8 ) }
] ).geometry;

const lineGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.02, 0.02, 1, 4, 2, false ), position: [ 0, 0.5, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.02, 4, 4 ), position: [ 0, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.02, 4, 4 ), position: [ 0, 1, 0 ] }
] ).geometry;

const arrowGeometry = new HelperMesh( [
	{ geometry: coneGeometry, position: [ 0, 0.8, 0 ], scale: 0.2 },
	{ geometry: new CylinderBufferGeometry( 0.005, 0.005, 0.8, 4, 2, false ), position: [ 0, 0.4, 0 ] }
] ).geometry;

const scaleArrowGeometry = new HelperMesh( [
	{ geometry: geosphereGeometry, position: [ 0, 0.8, 0 ], scale: 0.075 },
	{ geometry: new CylinderBufferGeometry( 0.005, 0.005, 0.8, 4, 2, false ), position: [ 0, 0.4, 0 ] }
] ).geometry;

const corner2Geometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.05, 0.05, 1, 4, 2, false ), position: [ 0.5, 0, 0 ], rotation: [ 0, 0, HPI ] },
	{ geometry: new CylinderBufferGeometry( 0.05, 0.05, 1, 4, 2, false ), position: [ 0, 0, 0.5 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.05, 8, 4 ), position: [ 0, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.05, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ 0, 0, HPI ] },
	{ geometry: new SphereBufferGeometry( 0.05, 4, 4 ), position: [ 0, 0, 1 ], rotation: [ HPI, 0, 0 ] },
] ).geometry;

const pickerHandleGeometry = new HelperMesh( [
	{ geometry: new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), position: [ 0, 0.5, 0 ] }
] ).geometry;

const planeGeometry = new BoxBufferGeometry( 1, 1, 0.01, 1, 1, 1 );

const circleGeometry = new HelperMesh( [
	{ geometry: new OctahedronBufferGeometry( 1, 3 ), scale: [ 1, 0.01, 1 ] },
] ).geometry;

const ringGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 8, 128 ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const halfRingGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 8, 64, PI ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const ringPickerGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.1, 8, 128 ), rotation: [ HPI, 0, 0 ] },
] ).geometry;

const rotateHandleGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.005, 4, 64, PI ) },
	{ geometry: new SphereBufferGeometry( 0.005, 4, 4 ), position: [ 1, 0, 0 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: new SphereBufferGeometry( 0.005, 4, 4 ), position: [ - 1, 0, 0 ], rotation: [ HPI, 0, 0 ] },
	{ geometry: octahedronGeometry, position: [ 0, 0.992, 0 ], scale: [ 0.2, 0.05, 0.05 ] }
] ).geometry;

const rotatePickerGeometry = new HelperMesh( [
	{ geometry: new TorusBufferGeometry( 1, 0.03, 4, 8, PI ) },
	{ geometry: octahedronGeometry, position: [ 0, 0.992, 0 ], scale: 0.2 }
] ).geometry;

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
			Z: [ { geometry: coneGeometry, color: [ 0, 0, 1 ], position: [ 0, 0, - 0.15 ], rotation: [ - Math.PI / 2, 0, 0 ], scale: [ 0.5, 1, 0.5 ] } ]
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

// Reusable utility variables
const tempVector$1 = new Vector3( 0, 0, 0 );
const alignVector = new Vector3( 0, 1, 0 );
const zeroVector = new Vector3( 0, 0, 0 );
const lookAtMatrix = new Matrix4();
const tempQuaternion = new Quaternion();
const identityQuaternion = new Quaternion();

const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );

class TransformHelperRotate extends TransformHelper {

	get handlesGroup() {

		return {
			X: [ { geometry: rotateHandleGeometry, color: [ 1, 0, 0 ], rotation: [ Math.PI / 2, Math.PI / 2, 0 ] } ],
			Y: [ { geometry: rotateHandleGeometry, color: [ 0, 1, 0 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			Z: [ { geometry: rotateHandleGeometry, color: [ 0, 0, 1 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			E: [ { geometry: ringGeometry, color: [ 1, 1, 0 ], rotation: [ Math.PI / 2, Math.PI / 2, 0 ], scale: 1.2 } ],
			XYZ: [
				{ geometry: ringGeometry, color: [ 0.5, 0.5, 0.5 ], rotation: [ Math.PI / 2, Math.PI / 2, 0 ] },
				{ geometry: circleGeometry, color: [ 0.5, 0.5, 0.5, 0.1 ], rotation: [ Math.PI / 2, Math.PI / 2, 0 ], scale: 0.25 }
			],
		};

	}
	get pickersGroup() {

		return {
			X: [ { geometry: rotatePickerGeometry, color: [ 1, 0, 0 ], rotation: [ Math.PI / 2, Math.PI / 2, 0 ] } ],
			Y: [ { geometry: rotatePickerGeometry, color: [ 0, 1, 0 ], rotation: [ Math.PI / 2, 0, 0 ] } ],
			Z: [ { geometry: rotatePickerGeometry, color: [ 0, 0, 1 ], rotation: [ 0, 0, - Math.PI / 2 ] } ],
			E: [ { geometry: ringPickerGeometry, rotation: [ Math.PI / 2, Math.PI / 2, 0 ], scale: 1.2 } ],
			XYZ: [ { geometry: circleGeometry, rotation: [ Math.PI / 2, Math.PI / 2, 0 ], scale: 0.35 } ],
		};

	}
	updateAxis( axis ) {

		super.updateAxis( axis );
		axis.quaternion.copy( identityQuaternion );
		if ( axis.has( "E" ) || axis.has( "XYZ" ) ) {

			axis.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( alignVector, zeroVector, tempVector$1 ) );

		}
		if ( axis.is( 'X' ) ) {

			tempQuaternion.setFromAxisAngle( unitX, Math.atan2( - alignVector.y, alignVector.z ) );
			tempQuaternion.multiplyQuaternions( identityQuaternion, tempQuaternion );
			axis.quaternion.copy( tempQuaternion );

		}
		if ( axis.is( 'Y' ) ) {

			tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
			tempQuaternion.multiplyQuaternions( identityQuaternion, tempQuaternion );
			axis.quaternion.copy( tempQuaternion );

		}
		if ( axis.is( 'Z' ) ) {

			tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
			tempQuaternion.multiplyQuaternions( identityQuaternion, tempQuaternion );
			axis.quaternion.copy( tempQuaternion );

		}

	}
	updateHelperMatrix() {

		// TODO: simplify rotation handle logic
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;
		// Align handles to current local or world rotation
		tempQuaternion.copy( quaternion ).inverse();
		alignVector.copy( this.eye ).applyQuaternion( tempQuaternion );
		tempVector$1.copy( unitY ).applyQuaternion( tempQuaternion );
		super.updateHelperMatrix();

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const tempVector$2 = new Vector3();
const tempQuaternion$1 = new Quaternion();
const identityQuaternion$1 = new Quaternion();
const unit = {
	X: new Vector3( 1, 0, 0 ),
	Y: new Vector3( 0, 1, 0 ),
	Z: new Vector3( 0, 0, 1 )
};
const tempVector2 = new Vector3();

class TransformControlsRotate extends TransformControlsMixin( TransformHelperRotate ) {

	constructor( props ) {

		super( props );
		this.defineProperties( {
			rotationAxis: new Vector3(),
			rotationAngle: 0
		} );

	}
	transform( space ) {

		const ROTATION_SPEED = 20 / this.worldPosition.distanceTo( tempVector$2.setFromMatrixPosition( this.camera.matrixWorld ) );
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion$1;
		const axis = this.axis;

		if ( axis === 'E' ) {

			tempVector$2.copy( this.pointEnd ).cross( this.pointStart );
			this.rotationAxis.copy( this.eye );
			this.rotationAngle = this.pointEnd.angleTo( this.pointStart ) * ( tempVector$2.dot( this.eye ) < 0 ? 1 : - 1 );

		} else if ( axis === 'XYZ' ) {

			tempVector$2.copy( this.pointEnd ).sub( this.pointStart ).cross( this.eye ).normalize();
			this.rotationAxis.copy( tempVector$2 );
			this.rotationAngle = this.pointEnd.sub( this.pointStart ).dot( tempVector$2.cross( this.eye ) ) * ROTATION_SPEED;

		} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

			this.rotationAxis.copy( unit[ axis ] );
			tempVector$2.copy( unit[ axis ] );
			tempVector2.copy( this.pointEnd ).sub( this.pointStart );
			if ( space === 'local' ) {

				tempVector$2.applyQuaternion( quaternion );
				tempVector2.applyQuaternion( this.worldQuaternionStart );

			}
			this.rotationAngle = tempVector2.dot( tempVector$2.cross( this.eye ).normalize() ) * ROTATION_SPEED;

		}

		// Apply rotate
		if ( space === 'local' ) {

			this.object.quaternion.copy( this.quaternionStart );
			this.object.quaternion.multiply( tempQuaternion$1.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );

		} else {

			this.object.quaternion.copy( tempQuaternion$1.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );
			this.object.quaternion.multiply( this.quaternionStart );

		}

	}

}

export { TransformControlsRotate };
