import {Vector3, Matrix4, Quaternion} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {RotateHandleGeometry, RotatePickerGeometry, RingGeometry, RingPickerGeometry, CircleGeometry, OctahedronGeometry} from "./HelperGeometries.js";

// Reusable utility variables
const tempVector = new Vector3(0, 0, 0);
const alignVector = new Vector3(0, 1, 0);
const zeroVector = new Vector3(0, 0, 0);
const lookAtMatrix = new Matrix4();
const tempQuaternion = new Quaternion();
const identityQuaternion = new Quaternion();

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

const rotateHandleGeometry = new RotateHandleGeometry();
const rotatePickerGeometry = new RotatePickerGeometry();
const ringGeometry = new RingGeometry();
const ringPickerGeometry = new RingPickerGeometry();
const circleGeometry = new CircleGeometry();
const octahedronGeometry = new OctahedronGeometry();

export class TransformHelperRotate extends TransformHelper {
	get handlesGroup() {
		return {
			X: [{geometry: rotateHandleGeometry, color: [1, 0.3, 0.3], rotation: [Math.PI / 2, Math.PI / 2, 0]}],
			Y: [{geometry: rotateHandleGeometry, color: [0.3, 1, 0.3], rotation: [Math.PI / 2, 0, 0]}],
			Z: [{geometry: rotateHandleGeometry, color: [0.3, 0.3, 1], rotation: [0, 0, -Math.PI / 2]}],
			E: [{geometry: ringGeometry, color: [1, 1, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}],
			XYZ: [
				{geometry: ringGeometry, color: [0.5, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]},
				{geometry: circleGeometry, color: [0.5, 0.5, 0.5, 0.25], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.25}
			],
		};
	}
	get pickersGroup() {
		return {
			X: [{geometry: rotatePickerGeometry, color: [1, 0, 0, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}],
			Y: [{geometry: rotatePickerGeometry, color: [0, 1, 0, 0.5], rotation: [Math.PI / 2, 0, 0]}],
			Z: [{geometry: rotatePickerGeometry, color: [0, 0, 1, 0.5], rotation: [0, 0, -Math.PI / 2]}],
			E: [{geometry: ringPickerGeometry, color: [1, 1, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}],
			XYZ: [{geometry: octahedronGeometry, color: [0.5, 0.5, 0.5, 0.15], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.32}],
		};
	}
	updateAxisMaterial(axis){
		super.updateAxisMaterial(axis);
		axis.quaternion.copy(identityQuaternion);
		if (axis.has("E") || axis.has("XYZ")) {
			axis.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(alignVector, zeroVector, tempVector));
		}
		if (axis.is('X')) {
			tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.is('Y')) {
			tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.is('Z')) {
			tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		// TODO: simplify rotation handle logic
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;
		// Align handles to current local or world rotation

		tempQuaternion.copy(quaternion).inverse();
		alignVector.copy(this.eye).applyQuaternion(tempQuaternion);
		tempVector.copy(unitY).applyQuaternion(tempQuaternion);

		// TODO: optimize!
		for (let i = this.handles.length; i--;) this.updateAxisMaterial(this.handles[i]);
		for (let i = this.pickers.length; i--;) this.updateAxisMaterial(this.pickers[i]);
	}
}
