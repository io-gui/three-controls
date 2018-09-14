import {Vector3, Matrix4, Quaternion, TorusBufferGeometry, SphereBufferGeometry, OctahedronBufferGeometry} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {TransformHelper} from "./TransformHelper.js";

// Reusable utility variables
const tempVector = new Vector3(0, 0, 0);
const alignVector = new Vector3(0, 1, 0);
const zeroVector = new Vector3(0, 0, 0);
const lookAtMatrix = new Matrix4();
const tempQuaternion = new Quaternion();
const identityQuaternion = new Quaternion();

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

function stringHas(str, char) {return str.search(char) !== -1;}

const circleGeometry = new HelperGeometry(new OctahedronBufferGeometry( 1, 3 ), {scale: [1, 0.01, 1]});

const ringGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 128 ), {rotation: [HPI, 0, 0], thickness: 1});

const halfRingGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 64, PI ), {rotation: [HPI, 0, 0]});

const ringPickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 3, 12 ), {rotation: [HPI, 0, 0]});

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 64, PI ), {thickness: 1}],
	[new SphereBufferGeometry(0.05, 12, 16), {position: [0, 0.992, 0], scale: [3, .5, .5]}],
]);

const rotatePickerGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, 0.03, 4, 8, PI )],
	[new OctahedronBufferGeometry(1, 0), {position: [0, 0.992, 0], scale: 0.2}],
]);

const handleGeometry = {
	X: new HelperGeometry(rotateHandleGeometry, {color: [1, 0.3, 0.3], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotateHandleGeometry, {color: [0.3, 1, 0.3], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotateHandleGeometry, {color: [0.3, 0.3, 1], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringGeometry, {color: [1, 1, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}),
	XYZ: new HelperGeometry([
		[ringGeometry, {color: [0.5, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}],
		[circleGeometry, {color: [0.5, 0.5, 0.5, 0.25], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.25}]
	]),
};

const pickerGeometry = {
	X: new HelperGeometry(rotatePickerGeometry, {color: [1, 0, 0, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotatePickerGeometry, {color: [0, 1, 0, 0.5], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotatePickerGeometry, {color: [0, 0, 1, 0.5], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringPickerGeometry, {color: [1, 1, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 1.2}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 0), {color: [0.5, 0.5, 0.5, 0.15], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.32}),
};

export class TransformHelperRotate extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
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
