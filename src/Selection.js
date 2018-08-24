/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Quaternion} from "../../three.js/build/three.module.js";

const position = new Vector3();
const quaternion = new Quaternion();
const scale = new Vector3();

const positionOld = new Vector3();
const quaternionOld = new Quaternion();
const scaleOld = new Vector3();

export class Selection extends Object3D {
	get isSelection() { return true; }
	constructor() {
		super();

		this.selected = [];

		this.visible = false;
	}
	add( list, includeChildren, filter ) {
		console.log(list, includeChildren, filter);
		if ( !( list instanceof Array ) ) list = [ list ];
		for ( let i = 0; i < list.length; i++ ) {
			if ( this.selected.indexOf( list[i] ) !== -1 ) {
				this.selected.splice( this.selected.indexOf( list[i] ), 1 );
			}
			this.selected.push( list[i] );
		}
	}
	addFirst( list, includeChildren, filter ) {
		console.log(list, includeChildren, filter);
	}
	remove( list, includeChildren, filter ) {
		console.log(list, includeChildren, filter);
	}
	replace( list, includeChildren, filter ) {
		console.log(list, includeChildren, filter);
	}
	toggle( list, includeChildren, filter ) {
		console.log(list, includeChildren, filter);
	}
	clear() {

	}
	updateMatrixWorld() {

		this.matrix.decompose( positionOld, quaternionOld, scaleOld );

		super.updateMatrixWorld();

		this.matrix.decompose( position, quaternion, scale );

		position.sub( positionOld );
		quaternion.multiply( quaternionOld.inverse() );
		scale.sub( scaleOld );

		for (let i = 0; i < this.selected.length; i++) {
			this.selected[i].position.add( position );
			this.selected[i].quaternion.multiply( quaternion );
			this.selected[i].scale.add( scale );
		}

	}
}
