/**
 * @author arodic / http://github.com/arodic
 */

// TODO: marquee selection

import {Raycaster} from "../../../three.js/src/Three.js";
import {Interactive} from "../Interactive.js";
import {Vector3, Quaternion, Box3} from "../../../three.js/src/Three.js";
import {SelectionHelper} from "../helpers/Selection.js";

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

// Temp variables
const raycaster = new Raycaster();

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

export class SelectionControls extends Interactive {
	constructor(props) {
		super(props);

		this.defineProperties({
			object_: props.object_ || null, // TODO: remove
			selected: [],
			transformSelection: true,
			transformSpace: 'local',
			boundingBox: new Box3()
			// translationSnap: null,
			// rotationSnap: null
		});
	}
	select(position, add) {

		const camera = this.camera;
		raycaster.setFromCamera(position, camera);

		const intersects = raycaster.intersectObjects(this.object_.children, true);
		if (intersects.length > 0) {
			const object = intersects[0].object;
			// TODO: handle helper selection
			if (add) {
				this.toggle(object);
			} else {
				this.replace(object);
			}
		} else {
			this.clear();
		}
		this.dispatchEvent('change');
	}
	onPointerDown() {
		time = Date.now();
	}
	onPointerUp(pointers) {
		dtime = Date.now() - time;
		if (pointers.length === 0 && dtime < CLICK_TIME) {
			if (pointers.removed[0].distance.length() < CLICK_DIST) {
				this.select(pointers.removed[0].position, pointers.removed[0].ctrlKey);
			}
		}
	}
	transformSpaceChanged() {
		this.update();
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
		this.selected.concat(...list);
		this.update();
	}
	addFirst(list, hierarchy, filter) {
		list = filterItems(list, hierarchy, filter);
		selectedOld.push(...this.selected);
		this.selected.length = 0;
		this.selected.push(...list);
		this.selected.push(...selectedOld);
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
		this.selected.push(...list);
		this.update();
	}
	clear() {
		selectedOld.push(...this.selected);
		this.selected.length = 0;
		this.update();
	}
	update() {
		// Reset selection transform.
		this.position.set(0,0,0);
		this.quaternion.set(0,0,0,1);
		this.scale.set(1,1,1);

		// this.boundingBox.makeEmpty();

		if (this.selected.length && this.transformSelection) {

			// Set selection transform to last selected item (not ancestor of selected).
			if (this.transformSpace === 'local') {
				for (let i = this.selected.length; i--;) {
					let item = this.selected[i];
					if (this._isAncestorOfSelected(item)) continue;
					item.updateMatrixWorld();
					item.matrixWorld.decompose(itemPos, itemQuat, itemScale);
					this.position.copy(itemPos);
					this.quaternion.copy(itemQuat);

					if (item.geometry) {
						if (!item.geometry.boundingBox) item.geometry.computeBoundingBox();
						bbox.copy(item.geometry.boundingBox);
						bbox.min.multiply(itemScale);
						bbox.max.multiply(itemScale);
						this.boundingBox.copy(bbox);
					}

					break;
				}
				// Set selection transform to the average of selected items.
			} else if (this.transformSpace === 'world') {
				// TODO: center should be in the center of combined boundging box.
				// TODO: Verify with StretchTransformControls box handles
				pos.set(0,0,0);
				for (let i = 0; i < this.selected.length; i++) {
					let item = this.selected[i];
					item.updateMatrixWorld();
					item.matrixWorld.decompose(itemPos, itemQuat, itemScale);
					pos.add(itemPos);
				}
				this.position.copy(pos).divideScalar(this.selected.length);

				// this.updateMatrixWorld();

				for (let i = 0; i < this.selected.length; i++) {
					let item = this.selected[i];
					item.matrixWorld.decompose(itemPos, itemQuat, itemScale);
					if (item.geometry) {
						if (!item.geometry.boundingBox) item.geometry.computeBoundingBox();
						bbox.copy(item.geometry.boundingBox);
						bbox.min.multiply(itemScale);
						bbox.max.multiply(itemScale);

						bbox.min.add(itemPos.clone().sub(this.position));
						bbox.max.add(itemPos.clone().sub(this.position));

						this.boundingBox.expandByPoint(bbox.min);
						this.boundingBox.expandByPoint(bbox.max);
					}
					else {
						// TODO: test with non-geometric objects
						this.boundingBox.expandByPoint(itemPos); // Doesent make sense
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
		for (let i = this.children.length; i--;) {
			super.remove(this.children[i]);
		}

		for (let i = 0; i < this.selected.length; i++) {
			const _helper = new SelectionHelper({object: this.selected[i]});
			super.add(_helper);
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
		this.dispatchEvent('change');
		this.dispatchEvent('selected-changed', {selected: [...this.selected], added: added, removed: removed});
	}
	// TODO: group scale not from selection center!
	updateMatrixWorld(force) {
		// Extract tranformations before and after matrix update.
		this.matrixWorld.decompose(posOld, quatOld, scaleOld);
		super.updateMatrixWorld(force);
		this.matrixWorld.decompose(pos, quat, scale);

		// Get transformation offsets from transform deltas.
		posOffset.copy(pos).sub(posOld);
		quatOffset.copy(quat).multiply(quatOld.inverse());
		scaleOffset.copy(scale).divide(scaleOld);
		quatInv.copy(quat).inverse();

		if (!this.selected.length || !this.transformSelection) return;
		// Apply tranformatio offsets to ancestors.
		for (let i = 0; i < this.selected.length; i++) {
			// get local transformation variables.
			this.selected[i].updateMatrixWorld();
			this.selected[i].matrixWorld.decompose(itemPos, itemQuat, itemScale);
			this.selected[i].parent.matrixWorld.decompose(parentPos, parentQuat, parentScale);
			parentQuatInv.copy(parentQuat).inverse();
			itemQuatInv.copy(itemQuat).inverse();
			// Transform selected in local space.
			if (this.transformSpace === 'local') {
					// Position
					itemPosOffset.copy(posOffset).applyQuaternion(quatInv).divide(parentScale);
					itemPosOffset.applyQuaternion(this.selected[i].quaternion);
					this.selected[i].position.add(itemPosOffset);
					// Rotation
					itemQuatOffset.copy(quatInv).multiply(quatOffset).multiply(quat).normalize();
					this.selected[i].quaternion.multiply(itemQuatOffset);
					// Scale
					if (this._isAncestorOfSelected(this.selected[i])) continue; // lets not go there...
					this.selected[i].scale.multiply(scaleOffset);
			// Transform selected in world space.
			} else if (this.transformSpace === 'world') {
					if (this._isAncestorOfSelected(this.selected[i])) continue;
					// Position
					itemPosOffset.copy(posOffset).applyQuaternion(parentQuatInv).divide(parentScale);
					this.selected[i].position.add(itemPosOffset);
					// Rotation
					dist0.subVectors(itemPos, pos);
					dist1.subVectors(itemPos, pos).applyQuaternion(quatOffset);
					dist1.sub(dist0).applyQuaternion(parentQuatInv).divide(parentScale);
					this.selected[i].position.add(dist1);
					itemQuatOffset.copy(itemQuatInv).multiply(quatOffset).multiply(itemQuat).normalize();
					this.selected[i].quaternion.multiply(itemQuatOffset);
					// Scale
					this.selected[i].scale.multiply(scaleOffset);
				}
				this.selected[i].updateMatrixWorld();
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
