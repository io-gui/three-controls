/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3, Quaternion} from "../../../../three.js/src/Three.js";
import {TransformControlsMixin} from "../Transform.js";
import {TransformHelperRotate} from "../../helpers/transform/Rotate.js";

// Reusable utility variables
const tempVector = new Vector3();
const tempQuaternion = new Quaternion();
const unit = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1)
};
const offset = new Vector3();
const startNorm = new Vector3();
const endNorm = new Vector3();
const rotationAxis = new Vector3();
let rotationAngle = 0;

export class RotateTransformControls extends TransformControlsMixin(TransformHelperRotate) {
	transform() {
		offset.copy(this.pointEnd).sub(this.pointStart);

		const ROTATION_SPEED = 5 / this.scale.length();

		if (this.axis === 'E') {

			rotationAxis.copy(this.eye);
			rotationAngle = this.pointEnd.angleTo(this.pointStart);

			startNorm.copy(this.pointStart).normalize();
			endNorm.copy(this.pointEnd).normalize();

			rotationAngle *= (endNorm.cross(startNorm).dot(this.eye) < 0 ? 1 : -1);

		} else if (this.axis === 'XYZ') {

			rotationAxis.copy(offset).cross(this.eye).normalize();
			rotationAngle = offset.dot(tempVector.copy(rotationAxis).cross(this.eye)) * ROTATION_SPEED;

		} else if (this.axis === 'X' || this.axis === 'Y' || this.axis === 'Z') {

			rotationAxis.copy(unit[this.axis]);

			tempVector.copy(unit[this.axis]);

			if (this.space === 'local') {
				tempVector.applyQuaternion(this.worldQuaternion);
			}

			rotationAngle = offset.dot(tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;

		}

		// Apply rotate
		if (this.space === 'local' && this.axis !== 'E' && this.axis !== 'XYZ') {
			this.object.quaternion.copy(this.quaternionStart);
			this.object.quaternion.multiply(tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle)).normalize();
		} else {
			rotationAxis.applyQuaternion(this.parentQuaternionInv);
			this.object.quaternion.copy(tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle));
			this.object.quaternion.multiply(this.quaternionStart).normalize();
		}
	}
}
