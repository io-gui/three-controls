/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D} from "../../three.js/build/three.module.js";

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

export class Helper extends Object3D {
	get isHelper() { return true; }
	constructor(target) {
		super();
		this.target = target;
	}
	updateHelperMatrix() {
		this.target.updateMatrixWorld();
		this.matrix.copy(this.target.matrix);
		this.matrixWorld.copy(this.target.matrixWorld);
	}
	updateMatrixWorld() {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i ++) {
			children[i].updateMatrixWorld(true);
		}
	}
}
