/**
 * @author arodic / https://github.com/arodic
 */

// TODO: implement multi-selection per-object snapping

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

const selectedOld = [];

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

/*
 * Selection object stores selection list and implements various methods for selection list manipulation.
 * Selection object transforms all selected objects when moved in either world or local space.
 */

export class Selection extends Object3D {
	constructor() {
		super();
		this.selected = [];
		this.transformSpace = "local";
	}
	toggle(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		for (let i = list.length; i--;) {
			let index = this.selected.indexOf(list[i]);
			if (index !== -1) this.selected.splice(index, 1);
			else this.selected.push(list[i]);
		}
		this.update();
	}
	add(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		this.selected = this.selected.concat(...list);
		this.update();
	}
	addFirst(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		this.selected = list.concat(...this.selected);
		this.update();
	}
	remove(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		for (let i = list.length; i--;) {
			let index = this.selected.indexOf(list[i]);
			if (index !== -1) this.selected.splice(i, 1);
		}
		this.update();
	}
	replace(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		this.selected.length = 0;
		this.selected = list;
		this.update();
	}
	clear() {
		selectedOld.push(...this.selected);
		this.selected.length = 0;
		this.update();
	}
	update() {
		// Reset selection transform.
		this.position.set(0,0,0,1);
		this.quaternion.set(0,0,0,1);
		this.scale.set(1,1,1);

		if (!this.selected.length) return;
		// Set selection transform to last selected item.
		if (this.transformSpace === 'local') {
			let i = this.selected.length - 1;
			this.selected[i].updateMatrixWorld();
			this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
			this.position.copy(posSelected);
			this.quaternion.copy(quatSelected);
		// Set selection transform to the average of selected items.
		} else if (this.transformSpace === 'world') {
			pos.set(0,0,0);
			for (let i = 0; i < this.selected.length; i++) {
				this.selected[i].updateMatrixWorld();
				this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
				pos.add(posSelected);
			}
			this.position.copy(pos).divideScalar(this.selected.length);
		}
		super.updateMatrixWorld();

		// gather selection data and emit selection-changed event
		let added = [];
		for (let i = 0; i < this.selected.length; i++) {
			if (selectedOld.indexOf(this.selected[i]) === -1) {
				added.push(this.selected[i]);
			}
		}
		let removed = [];
		for (let i = 0; i < selectedOld.length; i++) {
			if (this.selected.indexOf(selectedOld[i]) === -1) {
				removed.push(selectedOld[i]);
			}
		}
		selectedOld.length = 0;
		// @event selected-changed
		this.dispatchEvent({type: 'changed'});
		this.dispatchEvent({type: 'selected-changed', selected: [...this.selected], added: added, removed: removed});
	}
	updateMatrixWorld() {
		// Extract tranformations before and after matrix update.
		this.matrix.decompose(posOld, quatOld, scaleOld);
		super.updateMatrixWorld();
		this.matrix.decompose(pos, quat, scale);
		// Get transformation offsets from transform deltas.
		posOffset.copy(pos).sub(posOld);
		quatOffset.copy(quat).multiply(quatOld.inverse());
		scaleOffset.copy(scale).sub(scaleOld);
		quatInv.copy(quat).inverse();

		if (!this.selected.length) return;
		// Apply tranformatio offsets to ancestors.
		for (let i = 0; i < this.selected.length; i++) {
			// get local transformation variables.
			this.selected[i].updateMatrixWorld();
			this.selected[i].matrixWorld.decompose(posSelected, quatSelected, scaleSelected);
			this.selected[i].parent.matrixWorld.decompose(posParent, quatParent, scaleParent);
			quatParentInv.copy(quatParent).inverse();
			quatSelectedInv.copy(quatSelected).inverse();
			// Transform selected in local space.
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
			// Transform selected in world space.
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
	_isAncestorOfSelected( object ) {
		let parent = object.parent;
		while (parent) {
			if (this.selected.indexOf(parent) !== -1) return true;
			object = parent, parent = object.parent;
		}
		return false;
	}
}
