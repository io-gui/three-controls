/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {TransformControlsMixin} from "./TransformControls.js";
import {TransformHelperScale} from "../helpers/TransformHelperScale.js";


// Reusable utility variables
const _ray = new Raycaster();
const _tempVector = new Vector3();
const _tempQuaternion = new Quaternion();

// events
const changeEvent = { type: "change" };

export class TransformControlsScale extends TransformControlsMixin(TransformHelperScale) {
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;
		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);
		if (planeIntersect) {
			this.object.updateMatrixWorld();
			if (this.object.parent) {
				this.object.parent.updateMatrixWorld();
			}
			this.positionStart.copy(this.object.position);
			this.quaternionStart.copy(this.object.quaternion);
			this.scaleStart.copy(this.object.scale);
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			this.pointStart.copy(planeIntersect).sub(this.worldPositionStart);
			this.pointStart.applyQuaternion(this.worldQuaternionStart.clone().inverse());
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

		if (axis.search('XYZ') !== -1) {
			let d = this.pointEnd.length() / this.pointStart.length();
			if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;
			_tempVector.set(d, d, d);
		} else {
			_tempVector.copy(this.pointEnd).divide(this.pointStart);
			if (axis.search('X') === -1) {
				_tempVector.x = 1;
			}
			if (axis.search('Y') === -1) {
				_tempVector.y = 1;
			}
			if (axis.search('Z') === -1) {
				_tempVector.z = 1;
			}
		}

		// Apply scale
		object.scale.copy(this.scaleStart).multiply(_tempVector);

		this.object.updateMatrixWorld();
		this.dispatchEvent(changeEvent);
	}
}
