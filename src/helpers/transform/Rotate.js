import {Vector3, Matrix4, Quaternion, TorusBufferGeometry, OctahedronBufferGeometry, CylinderBufferGeometry} from "../../../lib/three.module.js";
import {HelperGeometry, colors} from "../../HelperGeometry.js";
import {TransformHelper} from "../Transform.js";

// Reusable utility variables
const _worldY = new Vector3(0, 0, 0);
const _alignVector = new Vector3(0, 1, 0);
const _zero = new Vector3(0, 0, 0);
const _lookAtMatrix = new Matrix4();
const _tempQuaternion = new Quaternion();
const _identityQuaternion = new Quaternion();

const PI = Math.PI;
const HPI = PI / 2;
const QPI = HPI / 2;
const EPS = 0.000001;

const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);

const ringGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 4, 64 ), {rotation: [HPI, 0, 0], thickness: 1});

const halfRingGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 4, 12, PI ), {rotation: [HPI, 0, 0], thickness: 1});

const coneGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 6, QPI ), {thickness: 1, rotation: [0, 0, HPI - HPI/4]}],
	[new TorusBufferGeometry( 0.96, 0.04, 2, 2, QPI/3 ), {color: colors['whiteTransparent'], rotation: [0, 0, HPI - HPI/4/3], scale: [1, 1, 0.01], outlineThickness: 0}],
	[coneGeometry, {position: [0.37, 0.93, 0], rotation: [0, 0, -2.035]}],
	[coneGeometry, {position: [-0.37, 0.93, 0], rotation: [0, 0, 2.035]}],
	[halfRingGeometry, {rotation: [-HPI, 0, 0], scale: 0.25}],
]);

const ringPickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 3, 12 ), {color: colors['whiteTransparent'], rotation: [HPI, 0, 0]});

const rotatePickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 4, 4, HPI/1.5 ), {color: colors['whiteTransparent'], rotation: [0, 0, HPI - HPI/3]});

const rotateGuideGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 64 ), {thickness: 1, outlineThickness: 0}],
	[new CylinderBufferGeometry(EPS, EPS, 10, 5, 1, true), {position: [0, 1, 0], rotation: [0, 0, HPI], thickness: 1, outlineThickness: 0}],
]);

const handleGeometry = {
	X: new HelperGeometry(rotateHandleGeometry, {color: colors['red'], rotation: [HPI, HPI, 0]}),
	Y: new HelperGeometry(rotateHandleGeometry, {color: colors['green'], rotation: [HPI, 0, 0]}),
	Z: new HelperGeometry(rotateHandleGeometry, {color: colors['blue'], rotation: [0, 0, -HPI]}),
	E: new HelperGeometry(ringGeometry, {color: colors['yellow'], rotation: [HPI, HPI, 0]}),
	XYZ: new HelperGeometry(ringGeometry, {color: colors['gray'], rotation: [HPI, HPI, 0], scale: 0.25, outlineThickness: 0}),
};

const pickerGeometry = {
	X: new HelperGeometry(rotatePickerGeometry, {color: colors['red'], rotation: [HPI, HPI, 0]}),
	Y: new HelperGeometry(rotatePickerGeometry, {color: colors['green'], rotation: [HPI, 0, 0]}),
	Z: new HelperGeometry(rotatePickerGeometry, {color: colors['blue'], rotation: [0, 0, -HPI]}),
	E: new HelperGeometry(ringPickerGeometry, {color: colors['yellow'], rotation: [HPI, HPI, 0]}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 1), {color: colors['whiteTransparent'], rotation: [HPI, HPI, 0], scale: 0.32}),
};

const guideGeometry = {
	X: new HelperGeometry(rotateGuideGeometry, {color: colors['red'], opacity: 0.5, rotation: [HPI, HPI, 0]}),
	Y: new HelperGeometry(rotateGuideGeometry, {color: colors['green'], opacity: 0.5, rotation: [HPI, 0, 0]}),
	Z: new HelperGeometry(rotateGuideGeometry, {color: colors['blue'], opacity: 0.5, rotation: [0, 0, -HPI]}),
};

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

export class TransformHelperRotate extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	get guideGeometry() {
		return guideGeometry;
	}
	get infoGeometry() {
		return {
			X: {position: [0.5, 0, 0], color: 'red'},
			Y: {position: [0, 0.5, 0], color: 'green'},
			Z: {position: [0, 0, 0.5], color: 'blue'},
		};
	}
	setGuide(guide) {
		super.setGuide(guide);
		if (this.axis === "XYZ") guide.highlight = -2;
	}
	updateHelperMatrix() {
		// TODO: simplify rotation handle logic
		super.updateHelperMatrix();
		const quaternion = this.space === "local" ? this.quaternion : _identityQuaternion;
		// Align handles to current local or world rotation
		_tempQuaternion.copy(quaternion).inverse();
		_alignVector.copy(this.eye).applyQuaternion(_tempQuaternion);
		_worldY.copy(_unitY).applyQuaternion(_tempQuaternion);
		// TODO: optimize!
		this.traverseAxis(axis => this.updateAxesDirection(axis));
		this.traverseGuides(axis => this.updateAxesDirection(axis));
	}
	// TODO: move to updateAxis?
	updateAxesDirection(axis){
		axis.quaternion.copy(_identityQuaternion);
		if (axis.name.indexOf('XYZ') !== -1) {
			axis.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_alignVector, _zero, _worldY));
		}
		if (axis.name.indexOf('E') !== -1) {
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
	setInfo(info) {
		info.highlight = this.axis ? hasAxisAny(info.name, this.axis) ? 1 : 0 : 0;
		// Flip axis
		if (this.doFlip) {
			const name = info.name.split('_').pop() || null;
			if (name.indexOf('X') !== -1) info.positionTarget.x = this.flipX ? -0.5 : 0.5;
			if (name.indexOf('Y') !== -1) info.positionTarget.y = this.flipY ? -0.5 : 0.5;
			if (name.indexOf('Z') !== -1) info.positionTarget.z = this.flipZ ? -0.5 : 0.5;
		}
	}
	updateInfo(info) {
		info.visible = true;
		info.material.opacity = (8 * info.material.opacity + info.highlight) / 9;
		if (info.material.opacity <= 0.001) info.visible = false;
		if (info.name === 'X') info.text = Math.round((this.object.rotation.x / Math.PI) * 180 * 100) / 100;
		if (info.name === 'Y') info.text = Math.round((this.object.rotation.y / Math.PI) * 180 * 100) / 100;
		if (info.name === 'Z') info.text = Math.round((this.object.rotation.z / Math.PI) * 180 * 100) / 100;
		info.position.multiplyScalar(5).add(info.positionTarget).divideScalar(6);
	}
}
