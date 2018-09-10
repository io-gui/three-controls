/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3, Quaternion} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperRotate} from "../helpers/TransformHelperRotate.js";

// Reusable utility variables
const tempVector = new Vector3();
const tempQuaternion = new Quaternion();
const identityQuaternion = new Quaternion();
const unit = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1)
};
const tempVector2 = new Vector3();

export class TransformControlsRotate extends TransformControlsMixin(TransformHelperRotate) {
	constructor(props) {
		super(props);
		this.defineProperties({
			rotationAxis: new Vector3(),
			rotationAngle: 0
		});
	}
	transform() {
		const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(tempVector.setFromMatrixPosition(this.camera.matrixWorld));
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;
		const axis = this.axis;

		if (axis === 'E') {
			tempVector.copy(this.pointEnd).cross(this.pointStart);
			this.rotationAxis.copy(this.eye);
			this.rotationAngle = this.pointEnd.angleTo(this.pointStart) * (tempVector.dot(this.eye) < 0 ? 1 : -1);
		} else if (axis === 'XYZ') {
			tempVector.copy(this.pointEnd).sub(this.pointStart).cross(this.eye).normalize();
			this.rotationAxis.copy(tempVector);
			this.rotationAngle = this.pointEnd.sub(this.pointStart).dot(tempVector.cross(this.eye)) * ROTATION_SPEED;
		} else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
			this.rotationAxis.copy(unit[axis]);
			tempVector.copy(unit[axis]);
			tempVector2.copy(this.pointEnd).sub(this.pointStart);
			if (this.space === 'local') {
				tempVector.applyQuaternion(quaternion);
				tempVector2.applyQuaternion(this.worldQuaternionStart);
			}
			this.rotationAngle = tempVector2.dot(tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
		}

		// Apply rotate
		if (this.space === 'local') {
			this.object.quaternion.copy(this.quaternionStart);
			this.object.quaternion.multiply(tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
		} else {
			this.object.quaternion.copy(tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
			this.object.quaternion.multiply(this.quaternionStart);
		}
	}
}
