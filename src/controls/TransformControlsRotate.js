/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {TransformControlsMixin} from "./TransformControls.js";
import {TransformHelperRotate} from "../helpers/TransformHelperRotate.js";


// Reusable utility variables
const _ray = new Raycaster();
const _tempVector = new Vector3();
const _tempQuaternion = new Quaternion();
const _identityQuaternion = new Quaternion();
const _unit = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1)
};
const _alignVector = new Vector3();
const _tempVector2 = new Vector3();
// events
const changeEvent = { type: "change" };

export class TransformControlsRotate extends TransformControlsMixin(TransformHelperRotate) {
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;
		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);
		let space = this.space;
		if (planeIntersect) {
			if (this.axis === 'E' ||  this.axis === 'XYZE' ||  this.axis === 'XYZ') {
				space = 'world';
			}
			if (space === 'local') {
				const snap = this.rotationSnap;
				if (this.axis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
				if (this.axis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
				if (this.axis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
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
		if (axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ') {
			space = 'world';
		}

		if (object === undefined || axis === null || this.active === false || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);

		if (!planeIntersect) return;

		this.pointEnd.copy(planeIntersect).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld));
		const quaternion = this.space === "local" ? this.worldQuaternion : _identityQuaternion;
		const unit = _unit[axis];

		if (axis === 'E') {
			_tempVector.copy(this.pointEnd).cross(this.pointStart);
			this.rotationAxis.copy(this.eye);
			this.rotationAngle = this.pointEnd.angleTo(this.pointStart) * (_tempVector.dot(this.eye) < 0 ? 1 : -1);
		} else if (axis === 'XYZE') {
			_tempVector.copy(this.pointEnd).sub(this.pointStart).cross(this.eye).normalize();
			this.rotationAxis.copy(_tempVector);
			this.rotationAngle = this.pointEnd.sub(this.pointStart).dot(_tempVector.cross(this.eye)) * ROTATION_SPEED;
		} else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
			_alignVector.copy(unit).applyQuaternion(quaternion);
			this.rotationAxis.copy(unit);
			_tempVector.copy(unit);
			_tempVector2.copy(this.pointEnd).sub(this.pointStart);
			if (space === 'local') {
				_tempVector.applyQuaternion(quaternion);
				_tempVector2.applyQuaternion(this.worldQuaternionStart);
			}
			this.rotationAngle = _tempVector2.dot(_tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
		}

		// Apply rotation snap
		if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

		// Apply rotate
		if (space === 'local') {
			object.quaternion.copy(this.quaternionStart);
			object.quaternion.multiply(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
		} else {
			object.quaternion.copy(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
			object.quaternion.multiply(this.quaternionStart);
		}

		this.object.updateMatrixWorld();
		this.dispatchEvent(changeEvent);
	}
}
