import { Object3D, Vector3, Quaternion } from '../../three.js/build/three.module.js';

/**
 * @author arodic / https://github.com/arodic
 */

// Temp variables
const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();

const positionOld = new Vector3();
const quaternionOld = new Quaternion();
const scaleOld = new Vector3();

const positionOffset = new Vector3();
const quaternionOffset = new Quaternion();
const scaleOffset = new Vector3();

const positionSelected = new Vector3();
const quaternionSelected = new Quaternion();
const scaleSelected = new Vector3();

const positionParent = new Vector3();
const quaternionParent = new Quaternion();
const scaleParent = new Vector3();

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

class Selection extends Object3D {

	constructor() {

		super();
		this.selected = [];
		this.transformSpace = "local";

	}
	toggle( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( index, 1 );
			else this.selected.push( list[ i ] );

		}
		this.update();

	}
	add( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		this.selected = this.selected.concat( ...list );
		this.update();

	}
	addFirst( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		this.selected = list.concat( ...this.selected );
		this.update();

	}
	remove( list, hierarchy, filter ) {

		list = filterItems( list, hierarchy, filter );
		for ( let i = list.length; i --; ) {

			let index = this.selected.indexOf( list[ i ] );
			if ( index !== - 1 ) this.selected.splice( i, 1 );

		}
		this.update();

	}
	replace( list, hierarchy, filter ) {

		this.selected.length = 0;
		list = filterItems( list, hierarchy, filter );
		this.selected = list;
		this.update();

	}
	clear() {

		this.selected.length = 0;
		this.update();

	}
	update() {

		position.set( 0, 0, 0 );
		quaternion.set( 0, 0, 0, 1 );
		this.scale.set( 1, 1, 1 );

		if ( ! this.selected.length ) return;

		if ( this.transformSpace === 'local' ) {

			// Set selection transform to last selected item.
			let i = this.selected.length - 1;
			this.selected[ i ].updateMatrixWorld();
			this.selected[ i ].matrixWorld.decompose( positionSelected, quaternionSelected, scaleSelected );
			this.position.copy( positionSelected );
			this.quaternion.copy( quaternionSelected );

		} else if ( this.transformSpace === 'world' ) {

			// Set selection position to the average position of selected items.
			for ( let i = 0; i < this.selected.length; i ++ ) {

				this.selected[ i ].updateMatrixWorld();
				this.selected[ i ].matrixWorld.decompose( positionSelected, quaternionSelected, scaleSelected );
				position.add( positionSelected );

			}
			this.position.copy( position ).divideScalar( this.selected.length );

		}

		super.updateMatrixWorld();

	}
	updateMatrixWorld() {

		this.matrix.decompose( positionOld, quaternionOld, scaleOld );
		super.updateMatrixWorld();
		this.matrix.decompose( position, quaternion, scale );

		positionOffset.copy( position ).sub( positionOld );
		quaternionOffset.copy( quaternion ).multiply( quaternionOld.clone().inverse() );
		scaleOffset.copy( scale ).sub( scaleOld );

		if ( this.selected.length ) {

			if ( this.transformSpace === 'local' ) {

				let i = this.selected.length - 1;
				this.selected[ i ].updateMatrixWorld();
				this.selected[ i ].matrixWorld.decompose( positionSelected, quaternionSelected, scaleSelected );

				let tempQuat = quaternion.clone().inverse();
				positionOffset.applyQuaternion( tempQuat );

				for ( let i = 0; i < this.selected.length; i ++ ) {

					let tempQ = this.selected[ i ].quaternion.clone();
					let temp = positionOffset.clone().applyQuaternion( tempQ );
					this.selected[ i ].position.add( temp );
					this.selected[ i ].quaternion.multiply( quaternionOffset.clone() );
					this.selected[ i ].scale.add( scaleOffset );

				}

			} else if ( this.transformSpace === 'world' ) {

				for ( let i = 0; i < this.selected.length; i ++ ) {

					if ( this._isAncestorOfSelected( this.selected[ i ] ) ) continue;

					this.selected[ i ].updateMatrixWorld();
					this.selected[ i ].matrixWorld.decompose( positionSelected, quaternionSelected, scaleSelected );
					this.selected[ i ].parent.matrixWorld.decompose( positionParent, quaternionParent, scaleParent );

					let temp = positionOffset.clone().applyQuaternion( quaternionParent.clone().inverse() );
					this.selected[ i ].position.add( temp );

					{

						let dist = positionSelected.clone().sub( position );
						let distR = dist.clone().applyQuaternion( quaternionOffset.clone() );
						let temp = distR.sub( dist );
						temp = temp.applyQuaternion( quaternionParent.clone().inverse() );
						this.selected[ i ].position.add( temp );

						let invQuat = quaternionSelected.clone().inverse();

						temp = invQuat.multiply( quaternionOffset ).multiply( quaternionSelected ).normalize();

						this.selected[ i ].quaternion.multiply( temp );

					}
					this.selected[ i ].scale.add( scaleOffset );

				}

			}

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
