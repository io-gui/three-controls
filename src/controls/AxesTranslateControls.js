/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {AxesControls} from "./AxesControls.js";
import {AxesTranslateHelper} from "../helpers/AxesTranslateHelper.js";

// Reusable utility variables
const _ray = new Raycaster();
const _tempVector = new Vector3();
const _tempQuaternion = new Quaternion();

// events
const changeEvent = { type: "change" };

export class AxesTranslateControls extends AxesControls(AxesTranslateHelper) {
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;
		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);
		let space = this.space;
		if (planeIntersect) {
			// TODO: check
			if (this.axis === 'XYZE' ||  this.axis === 'XYZ') {
				space = 'world';
			}
			this.object.updateMatrixWorld();
			if (this.object.parent) {
				this.object.parent.updateMatrixWorld();
			}
			this.positionStart.copy(this.object.position);
			this.quaternionStart.copy(this.object.quaternion);
			this.scaleStart.copy(this.object.scale);
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			this.pointStart.copy(planeIntersect).sub(this.worldPositionStart);
			if (space === 'local') this.pointStart.applyQuaternion(this.worldQuaternionStart.clone().inverse());
		}

		this.active = true;
	}
	onPointerMove(pointers) {
		let axis = this.axis;
		let object = this.object;
		let space = this.space;

		// TODO: check
		if (axis === 'XYZE' ||  axis === 'XYZ') {
			space = 'world';
		}

		if (object === undefined || axis === null || this.active === false || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);

		if (!planeIntersect) return;

		this.pointEnd.copy(planeIntersect).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		// Apply translate
		if (axis.search('X') === -1) {
			this.pointEnd.x = this.pointStart.x;
		}
		if (axis.search('Y') === -1) {
			this.pointEnd.y = this.pointStart.y;
		}
		if (axis.search('Z') === -1) {
			this.pointEnd.z = this.pointStart.z;
		}
		if (space === 'local') {
			object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
		} else {
			object.position.copy(this.pointEnd).sub(this.pointStart);
		}
		object.position.add(this.positionStart);

		// Apply translation snap
		if (this.translationSnap) {
			if (space === 'local') {
				object.position.applyQuaternion(_tempQuaternion.copy(this.quaternionStart).inverse());
				if (axis.search('X') !== -1) {
					object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
				}
				if (axis.search('Y') !== -1) {
					object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
				}
				if (axis.search('Z') !== -1) {
					object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
				}
				object.position.applyQuaternion(this.quaternionStart);
			}
			if (space === 'world') {
				if (object.parent) {
					object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
				}
				if (axis.search('X') !== -1) {
					object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
				}
				if (axis.search('Y') !== -1) {
					object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
				}
				if (axis.search('Z') !== -1) {
					object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
				}
				if (object.parent) {
					object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
				}
			}
		}
		this.object.updateMatrixWorld();
		this.dispatchEvent(changeEvent);
	}
}
