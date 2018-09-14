import {Vector3, Matrix4, Quaternion} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
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

function stringHas(str, char) {return str.search(char) !== -1;}

const handleGeometry = {
	X: new HelperGeometry(new RotateHandleGeometry(), {color: [1, 0.3, 0.3], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(new RotateHandleGeometry(), {color: [0.3, 1, 0.3], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(new RotateHandleGeometry(), {color: [0.3, 0.3, 1], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(new RingGeometry(), {color: [1, 1, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}),
	XYZ: new HelperGeometry([
		[new RingGeometry(), {color: [0.5, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}],
		[new CircleGeometry(), {color: [0.5, 0.5, 0.5, 0.25], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.25}]
	]),
};

const pickerGeometry = {
	X: new HelperGeometry(new RotatePickerGeometry(), {color: [1, 0, 0, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(new RotatePickerGeometry(), {color: [0, 1, 0, 0.5], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(new RotatePickerGeometry(), {color: [0, 0, 1, 0.5], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(new RingPickerGeometry(), {color: [1, 1, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}),
	XYZ: new HelperGeometry(new OctahedronGeometry(), {color: [0.5, 0.5, 0.5, 0.15], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.32}),
};

export class TransformHelperRotate extends TransformHelper {
	get handlesGroup() {
		return handleGeometry;
	}
	get pickersGroup() {
		return pickerGeometry;
	}
	updateAxesDirection(axis){
		axis.quaternion.copy(identityQuaternion);
		if (stringHas(axis.name, "E") || stringHas(axis.name, "XYZ")) {
			axis.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(alignVector, zeroVector, tempVector));
		}
		if (axis.name === 'X') {
			tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.name === 'Y') {
			tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.name === 'Z') {
			tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
	}
	updateHelperMatrix() {
		// TODO: simplify rotation handle logic
		super.updateHelperMatrix();
		const quaternion = this.space === "local" ? this.quaternion : identityQuaternion;
		// Align handles to current local or world rotation
		tempQuaternion.copy(quaternion).inverse();
		alignVector.copy(this.eye).applyQuaternion(tempQuaternion);
		tempVector.copy(unitY).applyQuaternion(tempQuaternion);
		// // TODO: optimize!
		for (let i = this.handles.length; i--;) this.updateAxesDirection(this.handles[i]);
		for (let i = this.pickers.length; i--;) this.updateAxesDirection(this.pickers[i]);
	}
}
