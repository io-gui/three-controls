import {Vector3, Matrix4, Quaternion, TorusBufferGeometry, SphereBufferGeometry, OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {TransformHelper} from "./TransformHelper.js";
import {colors} from "./HelperGeometries.js";

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

const ringGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 4, 64 ), {rotation: [HPI, 0, 0], thickness: 1});

const halfRingGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 4, 12, PI ), {rotation: [HPI, 0, 0], thickness: 1});

const coneGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 6, HPI/2 ), {thickness: 1, rotation: [0, 0, HPI - HPI/4]}],
	[new TorusBufferGeometry( 0.96, 0.04, 2, 2, HPI/2/3 ), {color: colors['whiteTransparent'], rotation: [0, 0, HPI - HPI/4/3], scale: [1, 1, 0.01], outlineThickness: 0}],
	[coneGeometry, {position: [0.37, 0.93, 0], rotation: [0, 0, -2.035]}],
	[coneGeometry, {position: [-0.37, 0.93, 0], rotation: [0, 0, 2.035]}],
	[halfRingGeometry, {rotation: [-HPI, 0, 0], scale: 0.25}],
]);

const ringPickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 3, 12 ), {color: colors['whiteTransparent'], rotation: [HPI, 0, 0]});

const rotatePickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 4, 4, HPI/1.5 ), {color: colors['whiteTransparent'], rotation: [0, 0, HPI - HPI/3]});

const handleGeometry = {
	X: new HelperGeometry(rotateHandleGeometry, {color: colors['red'], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotateHandleGeometry, {color: colors['green'], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotateHandleGeometry, {color: colors['blue'], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringGeometry, {color: colors['yellow'], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	XYZ: new HelperGeometry(ringGeometry, {color: colors['gray'], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.25, outlineThickness: 0}),
};

const pickerGeometry = {
	X: new HelperGeometry(rotatePickerGeometry, {color: colors['red'], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	Y: new HelperGeometry(rotatePickerGeometry, {color: colors['green'], rotation: [Math.PI / 2, 0, 0]}),
	Z: new HelperGeometry(rotatePickerGeometry, {color: colors['blue'], rotation: [0, 0, -Math.PI / 2]}),
	E: new HelperGeometry(ringPickerGeometry, {color: colors['yellow'], rotation: [Math.PI / 2, Math.PI / 2, 0]}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 1), {color: colors['whiteTransparent'], rotation: [Math.PI / 2, Math.PI / 2, 0], scale: 0.32}),
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
