/**
 * @author arodic / https://github.com/arodic
 */
import {Vector3, Quaternion} from "../../../../three.js/src/Three.js";
import {TransformControlsMixin} from "../Transform.js";
import {TransformHelperCombined} from "../../helpers/transform/Combined.js";

const offset = new Vector3();
const scaleFactor = new Vector3();
const EPS = 0.000001;

const tempVector = new Vector3();
const tempQuaternion = new Quaternion();
const unit = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1)
};
const rotationAxis = new Vector3();
let rotationAngle = 0;

export class CombinedTransformControls extends TransformControlsMixin(TransformHelperCombined) {
	transform() {

		if (this.axis.indexOf('T') !== -1) {

			offset.copy(this.pointEnd).sub(this.pointStart);

			if (this.space === 'local' && this.axis !== 'XYZ') {
				offset.applyQuaternion(this.worldQuaternionInv);
			}

			if (this.axis.indexOf('X') === -1) offset.x = 0;
			if (this.axis.indexOf('Y') === -1) offset.y = 0;
			if (this.axis.indexOf('Z') === -1) offset.z = 0;

			if (this.space === 'local' && this.axis !== 'XYZ') {
				offset.applyQuaternion(this.quaternionStart).divide(this.parentScale);
			} else {
				offset.applyQuaternion(this.parentQuaternionInv).divide(this.parentScale);
			}

			this.object.position.copy(offset).add(this.positionStart);

		}

		if (this.axis.indexOf('S') !== -1) {

			if (this.axis === 'S_XYZ') {

				let refVector = this.pointStart.clone().normalize();
				let factor = this.pointEnd.dot(refVector) / this.pointStart.dot(refVector);
				scaleFactor.set(factor, factor, factor);

			} else {

				scaleFactor.set(
					this.pointEnd.dot(this.worldX) / this.pointStart.dot(this.worldX),
					this.pointEnd.dot(this.worldY) / this.pointStart.dot(this.worldY),
					this.pointEnd.dot(this.worldZ) / this.pointStart.dot(this.worldZ),
				);

				if (this.axis.indexOf('X') === -1) scaleFactor.x = 1;
				if (this.axis.indexOf('Y') === -1) scaleFactor.y = 1;
				if (this.axis.indexOf('Z') === -1) scaleFactor.z = 1;

			}

			this.object.scale.copy(this.scaleStart).multiply(scaleFactor);
			this.object.scale.set(
				Math.max(this.object.scale.x, EPS),
				Math.max(this.object.scale.y, EPS),
				Math.max(this.object.scale.z, EPS),
			);

		}

		if (this.axis.indexOf('R') !== -1) {

			offset.copy(this.pointEnd).sub(this.pointStart);

			const ROTATION_SPEED = 5 / this.scale.length();

			if (this.axis === 'R_X' || this.axis === 'R_Y' || this.axis === 'R_Z') {

				rotationAxis.copy(unit[this.axis[2]]);

				tempVector.copy(unit[this.axis[2]]);

				if (this.space === 'local') {
					tempVector.applyQuaternion(this.worldQuaternion);
				}

				rotationAngle = offset.dot(tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;

			}

			// Apply rotate
			if (this.space === 'local') {
				this.object.quaternion.copy(this.quaternionStart);
				this.object.quaternion.multiply(tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle)).normalize();
			} else {
				rotationAxis.applyQuaternion(this.parentQuaternionInv);
				this.object.quaternion.copy(tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle));
				this.object.quaternion.multiply(this.quaternionStart).normalize();
			}

		}
	}
}
