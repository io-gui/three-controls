/**
 * @author arodic / https://github.com/arodic
 */

// TODO: implement multi-selection per-object snapping
// TODO: handle non-uniform scale in hierarchy

import {Object3D, Vector3, Quaternion} from "../../three.js/build/three.module.js";

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

const posSelected = new Vector3();
const quatSelected = new Quaternion();
const scaleSelected = new Vector3();

const posParent = new Vector3();
const quatParent = new Quaternion();
const scaleParent = new Vector3();

const positionOffsetLocal = new Vector3();
const quatParentInv = new Quaternion();
const quatSelectedInv = new Quaternion();
const quatSelectedLocal = new Quaternion();

const dist0 = new Vector3();
const dist1 = new Vector3();

function filterItems(list, hierarchy, filter) {
	list = list instanceof Array ? list : [list];
	let filtered = [];
	for (let i = 0; i < list.length; i++) {
		if (!filter || filter(list[i])) filtered.push(list[i]);
		if (hierarchy) {
			let children = filterItems(list[i].children, hierarchy, filter);
			filtered.push(...children);
		}
	}
	return filtered;
}

export class Selection extends Object3D {
	constructor() {
		super();
		this.selected = [];
		this.transformSpace = "local";
	}
	toggle(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		for (let i = list.length; i--;) {
			let index = this.selected.indexOf(list[i]);
			if (index !== -1) this.selected.splice(index, 1);
			else this.selected.push(list[i]);
		}
		this.update();
	}
	add(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		this.selected = this.selected.concat(...list);
		this.update();
	}
	addFirst(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		this.selected = list.concat(...this.selected);
		this.update();
	}
	remove(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		for (let i = list.length; i--;) {
			let index = this.selected.indexOf(list[i]);
			if (index !== -1) this.selected.splice(i, 1);
		}
		this.update();
	}
	replace(list, hierarchy, filter) {
		this.selected.length = 0;
		list = filterItems(list, hierarchy, filter);
		this.selected = list;
		this.update();
	}
	clear() {
		this.selected.length = 0;
		this.update();
	}
	update() {
		pos.set(0,0,0);
		this.quaternion.set(0,0,0,1);
		this.scale.set(1,1,1);

		if (!this.selected.length) return;

		if (this.transformSpace === 'local') {

			// Set selection transform to last selected item.
			let i = this.selected.length - 1;
			this.selected[i].updateMatrixWorld();
			this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
			this.position.copy(posSelected);
			this.quaternion.copy(quatSelected);

		} else if (this.transformSpace === 'world') {

			// Set selection pos to the average pos of selected items.
			for (let i = 0; i < this.selected.length; i++) {
				this.selected[i].updateMatrixWorld();
				this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
				pos.add(posSelected);
			}
			this.position.copy(pos).divideScalar(this.selected.length);

		}

		super.updateMatrixWorld();
	}
	updateMatrixWorld() {
		this.matrix.decompose(posOld, quatOld, scaleOld);
		super.updateMatrixWorld();
		this.matrix.decompose(pos, quat, scale);

		posOffset.copy(pos).sub(posOld);
		quatOffset.copy(quat).multiply(quatOld.inverse());
		scaleOffset.copy(scale).sub(scaleOld);

		quatInv.copy(quat).inverse();

		if (this.selected.length) {

			for (let i = 0; i < this.selected.length; i++) {

				this.selected[i].updateMatrixWorld();
				this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
				this.selected[i].parent.matrixWorld.decompose(posParent, quatParent, scaleParent);

				quatParentInv.copy(quatParent).inverse();
				quatSelectedInv.copy(quatSelected).inverse();

				if (this.transformSpace === 'local') {

						// Position
						positionOffsetLocal.copy(posOffset).applyQuaternion(quatInv);
						positionOffsetLocal.applyQuaternion(this.selected[i].quaternion);
						this.selected[i].position.add(positionOffsetLocal);

						// Rotation
						quatSelectedLocal.copy(quatInv).multiply(quatOffset).multiply(quat).normalize();
						this.selected[i].quaternion.multiply(quatSelectedLocal);

						// Scale
						if (this._isAncestorOfSelected(this.selected[i])) continue; // lets not go there...
						this.selected[i].scale.add(scaleOffset);

				} else if (this.transformSpace === 'world') {

						if (this._isAncestorOfSelected(this.selected[i])) continue;

						// Position
						positionOffsetLocal.copy(posOffset).applyQuaternion(quatParentInv);
						this.selected[i].position.add(positionOffsetLocal);

						// Rotation
						dist0.subVectors(posSelected, pos);
						dist1.subVectors(posSelected, pos).applyQuaternion(quatOffset);
						dist1.sub(dist0).applyQuaternion(quatParentInv);
						this.selected[i].position.add(dist1);

						quatSelectedLocal.copy(quatSelectedInv).multiply(quatOffset).multiply(quatSelected).normalize();
						this.selected[i].quaternion.multiply(quatSelectedLocal);

						// Scale
						this.selected[i].scale.add(scaleOffset);
					}


			}

		}
	}
	_isAncestorOfSelected( object ) {
		let parent = object.parent;
		while (parent) {
			if (this.selected.indexOf(parent) !== -1) return true;
			object = parent, parent = object.parent;
		}
		return false;
	}
}
