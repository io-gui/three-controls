import {Vector3, Matrix4, Quaternion, TorusBufferGeometry, SphereBufferGeometry, OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {TransformHelper} from "./TransformHelper.js";

// Reusable utility variables
const _worldY = new Vector3(0, 0, 0);
const _alignVector = new Vector3(0, 1, 0);
const _zero = new Vector3(0, 0, 0);
const _lookAtMatrix = new Matrix4();
const _tempQuaternion = new Quaternion();
const _identityQuaternion = new Quaternion();

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);

function stringHas(str, char) {return str.search(char) !== -1;}

const circleGeometry = new HelperGeometry(new OctahedronBufferGeometry( 1, 3 ), {scale: [1, 0.01, 1]});

const ringGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 128 ), {rotation: [HPI, 0, 0], thickness: 1});

const halfRingGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 64, PI ), {rotation: [HPI, 0, 0], thickness: 1});

const ringPickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 3, 12 ), {rotation: [HPI, 0, 0]});

const arrowGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 2, true), {position: [0, 0.1, 0]}],
]);

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 64, HPI/2 ), {thickness: 1, rotation: [0, 0, HPI - HPI/4]}],
	[arrowGeometry, {position: [0.37, 0.93, 0], rotation: [0, 0, -2.035]}],
	[arrowGeometry, {position: [-0.37, 0.93, 0], rotation: [0, 0, 2.035]}],
	[new OctahedronBufferGeometry(0.04, 2), {position: [0, 1, 0], scale: [1.5, .5, .5]}],
	[halfRingGeometry, {rotation: [-HPI, 0, 0], scale: 0.25}]
]);

const rotatePickerGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, 0.03, 4, 8, HPI/2 ), {rotation: [0, 0, HPI - HPI/4]}],
	[new OctahedronBufferGeometry(1, 0), {position: [0, 0.992, 0], scale: 0.2}],
]);

const handleGeometry = {
	X: new HelperGeometry(rotateHandleGeometry, {color: [1, 0.3, 0.3], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotateHandleGeometry, {color: [0.3, 1, 0.3], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotateHandleGeometry, {color: [0.3, 0.3, 1], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringGeometry, {color: [1, 1, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	XYZ: new HelperGeometry(ringGeometry, {color: [0.5, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.25, outlineThickness: 0}),
};

const pickerGeometry = {
	X: new HelperGeometry(rotatePickerGeometry, {color: [1, 0, 0, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotatePickerGeometry, {color: [0, 1, 0, 0.5], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotatePickerGeometry, {color: [0, 0, 1, 0.5], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringPickerGeometry, {color: [1, 1, 0.5, 0.5], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 1), {color: [0.5, 0.5, 0.5, 0.15], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.32}),
};

export class TransformHelperRotate extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	updateAxesDirection(axis){
		axis.quaternion.copy(_identityQuaternion);
		if (stringHas(axis.name, "XYZ")) {
			axis.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_alignVector, _zero, _worldY));
		}
		if (stringHas(axis.name, "E")) {
			axis.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_alignVector, _zero, _worldY));
		}
		if (axis.name === 'X') {
			_tempQuaternion.setFromAxisAngle(_unitX, Math.atan2(-_alignVector.y, _alignVector.z));
			_tempQuaternion.multiplyQuaternions(_identityQuaternion, _tempQuaternion);
			axis.quaternion.copy(_tempQuaternion);
		}
		if (axis.name === 'Y') {
			_tempQuaternion.setFromAxisAngle(_unitY, Math.atan2(_alignVector.x, _alignVector.z));
			_tempQuaternion.multiplyQuaternions(_identityQuaternion, _tempQuaternion);
			axis.quaternion.copy(_tempQuaternion);
		}
		if (axis.name === 'Z') {
			_tempQuaternion.setFromAxisAngle(_unitZ, Math.atan2(_alignVector.y, _alignVector.x));
			_tempQuaternion.multiplyQuaternions(_identityQuaternion, _tempQuaternion);
			axis.quaternion.copy(_tempQuaternion);
		}
	}
	updateHelperMatrix() {
		// TODO: simplify rotation handle logic
		super.updateHelperMatrix();
		const quaternion = this.space === "local" ? this.quaternion : _identityQuaternion;
		// Align handles to current local or world rotation
		_tempQuaternion.copy(quaternion).inverse();
		_alignVector.copy(this.eye).applyQuaternion(_tempQuaternion);
		_worldY.copy(_unitY).applyQuaternion(_tempQuaternion);
		// // TODO: optimize!
		for (let i = this.handles.length; i--;) this.updateAxesDirection(this.handles[i]);
		for (let i = this.pickers.length; i--;) this.updateAxesDirection(this.pickers[i]);
	}
}
