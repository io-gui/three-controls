import { Object3D, Vector3, Quaternion, LineBasicMaterial, BufferGeometry, Float32BufferAttribute, Line, Color } from '../../three.js/build/three.module.js';

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

const worldPosition = new Vector3();
const cameraWorldPosition = new Vector3();

const tempPosition = new Vector3();
const tempQuaternion = new Quaternion();
const tempScale = new Vector3();

class Helper extends Object3D {

	get isHelper() {

		return true;

	}
	constructor( target, camera ) {

		super();
		this.target = target;
		this.camera = camera;
		this.space = 'local';
		this.size = 0;

	}
	updateHelperMatrix() {

		let eyeDistance = 0;
		let scale = new Vector3();
		if ( this.camera && this.size ) {

			this.camera.updateMatrixWorld();
			worldPosition.setFromMatrixPosition( this.matrixWorld );
			cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );
			eyeDistance = worldPosition.distanceTo( cameraWorldPosition );
			if ( eyeDistance ) scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size );

		}
		if ( this.target ) {

			this.target.updateMatrixWorld();
			this.matrix.copy( this.target.matrix );
			this.matrixWorld.copy( this.target.matrixWorld );

		} else {

			super.updateMatrixWorld();

		}

		this.matrixWorld.decompose( tempPosition, tempQuaternion, tempScale );
		if ( this.space === 'world' ) tempQuaternion.set( 0, 0, 0, 1 );
		this.matrixWorld.compose( tempPosition, tempQuaternion, eyeDistance ? scale : tempScale );

	}
	updateMatrixWorld() {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	setupHelper( gizmoMap ) {

		const gizmo = new Object3D();

		for ( let name in gizmoMap ) {

			for ( let i = gizmoMap[ name ].length; i --; ) {

				const object = gizmoMap[ name ][ i ][ 0 ].clone();
				const position = gizmoMap[ name ][ i ][ 1 ];
				const rotation = gizmoMap[ name ][ i ][ 2 ];
				const scale = gizmoMap[ name ][ i ][ 3 ];
				const tag = gizmoMap[ name ][ i ][ 4 ];

				// name and tag properties are essential for picking and updating logic.
				object.name = name;
				object.tag = tag;

				if ( position ) {

					object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );

				}
				if ( rotation ) {

					object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

				}
				if ( scale ) {

					object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

				}

				object.updateMatrix();

				const tempGeometry = object.geometry.clone();
				tempGeometry.applyMatrix( object.matrix );
				object.geometry = tempGeometry;

				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );
				gizmo.add( object );

			}

		}
		return gizmo;

	}

}

// const variables
const red = new Color( 0xff0000 );
const green = new Color( 0x00ff00 );
const blue = new Color( 0x0000ff );

// shared materials
const gizmoLineMaterial = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
} );

// Make unique material for each axis/color
const matLineRed = gizmoLineMaterial.clone();
matLineRed.color.copy( red );

const matLineGreen = gizmoLineMaterial.clone();
matLineGreen.color.copy( green );

const matLineBlue = gizmoLineMaterial.clone();
matLineBlue.color.copy( blue );

// reusable geometry
const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

class AxesHelper extends Helper {

	constructor( target, camera ) {

		super( target, camera );

		this.size = 0.15;
		this.showX = true;
		this.showY = true;
		this.showZ = true;

		this.init();

	}
	init() {

		const gizmoTranslate = {
			X: [[ new Line( lineGeometry, matLineRed ) ]],
			Y: [[ new Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ]]],
			Z: [[ new Line( lineGeometry, matLineBlue ), null, [ 0, - Math.PI / 2, 0 ]]]
		};
		this.add( this.setupHelper( gizmoTranslate ) );

	}
	updateHelperMatrix() {

		// Hide non-enabled axes
		this.traverse( axis => {

			axis.visible = axis.visible && ( axis.name.indexOf( "X" ) === - 1 || this.showX );
			axis.visible = axis.visible && ( axis.name.indexOf( "Y" ) === - 1 || this.showY );
			axis.visible = axis.visible && ( axis.name.indexOf( "Z" ) === - 1 || this.showZ );
			axis.visible = axis.visible && ( axis.name.indexOf( "E" ) === - 1 || ( this.showX && this.showY && this.showZ ) );

		} );
		super.updateHelperMatrix();

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

const helperMat = new LineBasicMaterial( { depthTest: false, transparent: true } );

class SelectionHelper extends Helper {

	constructor( target, camera ) {

		super( target, camera );
		const axis = new AxesHelper( target, camera );
		axis.size = 0.05;
		this.add( axis );
		this.add( new Line( target.geometry, helperMat ) );

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Temp variables
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

/*
 * Selection object stores selection list and implements various methods for selection list manipulation.
 * Selection object transforms all selected objects when moved in either world or local space.
 *
 * @event chang - fired on selection change.
 * @event selected-changed - also fired on selection change (includes selection payload).
 */

class Selection extends IoLiteMixin( Object3D ) {

	get isSelection() {

		return true;

	}
	constructor() {

		super();
		this.defineProperties( {
			selected: [],
			transformSelection: true,
			transformSpace: 'local'
		} );

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

			// Set selection transform to last selected item.
			if ( this.transformSpace === 'local' ) {

				let i = this.selected.length - 1;
				this.selected[ i ].updateMatrixWorld();
				this.selected[ i ].matrixWorld.decompose( itemPos, itemQuat, itemScale );
				this.position.copy( itemPos );
				this.quaternion.copy( itemQuat );
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

		// Add helpers
		// TODO: cache helpers per object
		this.children.length = 0;
		for ( let i = 0; i < this.selected.length; i ++ ) {

			const _helper = new SelectionHelper( this.selected[ i ] );
			this.children.push( _helper );

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
	updateMatrixWorld() {

		// Extract tranformations before and after matrix update.
		this.matrix.decompose( posOld, quatOld, scaleOld );
		super.updateMatrixWorld();
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
			this.selected[ i ].parent.matrixWorld.decompose( parentPos, parentQuat, parentScale );
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

export { Selection };
