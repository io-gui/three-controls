import {Vector3, CylinderBufferGeometry} from "../../../three.js/src/Three.js";
import {Helper} from "./Helper.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Animation} from "../../lib/Animation.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;
const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.1;
const AXIS_FLIP_TRESHOLD = 0;

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

const handleGeometry = {
	XYZ: new HelperGeometry([
		[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [1, 0, 0], position: [0.5, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
		[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [0, 1, 0], position: [0, 0.5, 0], rotation: [0, HPI, 0], thickness: 1}],
		[new CylinderBufferGeometry(EPS, EPS, 1, 4, 2, true), {color: [0, 0, 1], position: [0, 0, 0.5], rotation: [HPI, 0, 0], thickness: 1}],
	])
};

export class TransformHelper extends Helper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return {};
	}
	get guideGeometry() {
		return {};
	}
	get textGeometry() {
		return {};
	}
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: true,
			showY: true,
			showZ: true,
			axis: null,
			active: false,
			doHide: true,
			doFlip: true,
			hideX: false,
			hideY: false,
			hideZ: false,
			hideXY: false,
			hideYZ: false,
			hideXZ: false,
			flipX: false,
			flipY: false,
			flipZ: false,
			size: 0.05,
		});

		this.worldX = new Vector3();
		this.worldY = new Vector3();
		this.worldZ = new Vector3();
		this.axisDotEye = new Vector3();

		this.handles = this.addGeometries(this.handleGeometry);
		this.pickers = this.addGeometries(this.pickerGeometry, {isPicker: true});
		this.guides = this.addGeometries(this.guideGeometry, {isGuide: true, highlight: -2});
		this.texts = this.addTextSprites(this.textGeometry);

		this.setAxis = this.setAxis.bind(this);
		this.setGuide = this.setGuide.bind(this);
		this.setInfo = this.setInfo.bind(this);

		this.updateAxis = this.updateAxis.bind(this);
		this.updateGuide = this.updateGuide.bind(this);
		this.updateText = this.updateText.bind(this);

		this.animation = new Animation();

		this.animation.addEventListener('update', () => {
			this.dispatchEvent('change');
		});
	}
	traverseAxis(callback) {
		for (let i = this.handles.length; i--;) callback(this.handles[i]);
		for (let i = this.pickers.length; i--;) callback(this.pickers[i]);
	}
	traverseGuides(callback) {
		for (let i = this.guides.length; i--;) callback(this.guides[i]);
	}
	traverseInfos(callback) {
		for (let i = this.texts.length; i--;) callback(this.texts[i]);
	}
	spaceChanged() {
		super.spaceChanged();
		this.paramChanged();
		this.animateScaleUp();
	}
	objectChanged() {
		super.objectChanged();
		this.axis = null;
		this.active = false;
		this.hideX = false;
		this.hideY = false;
		this.hideZ = false;
		this.hideXY = false;
		this.hideYZ = false;
		this.hideXZ = false;
		this.flipX = false;
		this.flipY = false;
		this.flipZ = false;
		this.animateScaleUp();
	}
	animateScaleUp() {
		this.traverseAxis(axis => {
			axis.scale.set(0.0001, 0.0001, 0.0001);
			axis.scaleTarget.set(1, 1, 1);
		});
		this.animation.startAnimation(0.5);
	}
	axisChanged() {}
	paramChanged() {
		this.traverseAxis(this.setAxis);
		this.traverseGuides(this.setGuide);
		this.traverseInfos(this.setInfo);
		this.animation.startAnimation(1.5);
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();
		this.worldX.set(1, 0, 0).applyQuaternion(this.quaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.quaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.quaternion);
		this.axisDotEye.set(this.worldX.dot(this.eye), this.worldY.dot(this.eye), this.worldZ.dot(this.eye));
		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;
		// Hide axis facing the camera
		if (!this.active) {
			this.hideX = Math.abs(xDotE) > AXIS_HIDE_TRESHOLD;
			this.hideY = Math.abs(yDotE) > AXIS_HIDE_TRESHOLD;
			this.hideZ = Math.abs(zDotE) > AXIS_HIDE_TRESHOLD;
			this.hideXY = Math.abs(zDotE) < PLANE_HIDE_TRESHOLD;
			this.hideYZ = Math.abs(xDotE) < PLANE_HIDE_TRESHOLD;
			this.hideXZ = Math.abs(yDotE) < PLANE_HIDE_TRESHOLD;
			this.flipX = xDotE < AXIS_FLIP_TRESHOLD;
			this.flipY = yDotE < AXIS_FLIP_TRESHOLD;
			this.flipZ = zDotE < AXIS_FLIP_TRESHOLD;
		}
		if (this.object) {
			this.traverseAxis(this.updateAxis);
			this.traverseGuides(this.updateGuide);
			this.traverseInfos(this.updateText);
		}
	}
	// TODO: optimize, make less ugly and framerate independent!
	setAxis(axis) {
		axis.hidden = false;
		const name = axis.name.split('_').pop() || null;
		const dimmed = this.active ? -2 : -0.75;
		axis.highlight = this.axis ? hasAxisAny(axis.name, this.axis) ? 1 : dimmed : 0;
		// Hide by show[axis] parameter
		if (this.doHide) {
			if (name.indexOf('X') !== -1 && !this.showX) axis.hidden = true;
			if (name.indexOf('Y') !== -1 && !this.showY) axis.hidden = true;
			if (name.indexOf('Z') !== -1 && !this.showZ) axis.hidden = true;
			if (name.indexOf('E') !== -1 && (!this.showX || !this.showY || !this.showZ)) axis.hidden = true;
			// Hide axis facing the camera
			if ((name == 'X' || name == 'XYZ') && this.hideX) axis.hidden = true;
			if ((name == 'Y' || name == 'XYZ') && this.hideY) axis.hidden = true;
			if ((name == 'Z' || name == 'XYZ') && this.hideZ) axis.hidden = true;
			if (name == 'XY' && this.hideXY) axis.hidden = true;
			if (name == 'YZ' && this.hideYZ) axis.hidden = true;
			if (name == 'XZ' && this.hideXZ) axis.hidden = true;
		}
		// Flip axis
		if (this.doFlip) {
			if (name.indexOf('X') !== -1 || axis.name.indexOf('R') !== -1) axis.scaleTarget.x = this.flipX ? -1 : 1;
			if (name.indexOf('Y') !== -1 || axis.name.indexOf('R') !== -1) axis.scaleTarget.y = this.flipY ? -1 : 1;
			if (name.indexOf('Z') !== -1 || axis.name.indexOf('R') !== -1) axis.scaleTarget.z = this.flipZ ? -1 : 1;
		}
	}
	setGuide(guide) {
		guide.highlight = this.axis ? hasAxisAny(guide.name, this.axis) ? 0 : -2 : -2;
		// Flip axis
		if (this.doFlip) {
			const name = guide.name.split('_').pop() || null;
			if (name.indexOf('X') !== -1 || guide.name.indexOf('R') !== -1) guide.scaleTarget.x = this.flipX ? -1 : 1;
			if (name.indexOf('Y') !== -1 || guide.name.indexOf('R') !== -1) guide.scaleTarget.y = this.flipY ? -1 : 1;
			if (name.indexOf('Z') !== -1 || guide.name.indexOf('R') !== -1) guide.scaleTarget.z = this.flipZ ? -1 : 1;
		}
	}
	setInfo(text) {
		text.highlight = this.axis ? hasAxisAny(text.name, this.axis) ? 1 : 0 : 0;
		// Flip axis
		if (this.doFlip) {
			const name = text.name.split('_').pop() || null;
			if (name.indexOf('X') !== -1) text.positionTarget.x = this.flipX ? -1.2 : 1.2;
			if (name.indexOf('Y') !== -1) text.positionTarget.y = this.flipY ? -1.2 : 1.2;
			if (name.indexOf('Z') !== -1) text.positionTarget.z = this.flipZ ? -1.2 : 1.2;
		}
	}
	updateAxis(axis) {
		axis.visible = true;
		const highlight = (axis.hidden || axis.isPicker) ? -2 : axis.highlight || 0;
		axis.material.highlight = (8 * axis.material.highlight + highlight) / 9;
		axis.material.visible = axis.material.highlight > -1.99;
		axis.scale.multiplyScalar(5).add(axis.scaleTarget).divideScalar(6);
	}
	updateGuide(guide) {
		guide.visible = true;
		const highlight = guide.hidden ? -2 : guide.highlight || 0;
		guide.material.highlight = (8 * guide.material.highlight + highlight) / 9;
		guide.material.visible = guide.material.highlight > -1.99;
		guide.scale.multiplyScalar(5).add(guide.scaleTarget).divideScalar(6);
	}
	updateText(text) {
		text.visible = true;
		text.material.opacity = (8 * text.material.opacity + text.highlight) / 9;
		text.material.visible = text.material.opacity > 0.01;
		if (text.name === 'X') text.text = Math.round(this.object.position.x * 100) / 100;
		if (text.name === 'Y') text.text = Math.round(this.object.position.y * 100) / 100;
		if (text.name === 'Z') text.text = Math.round(this.object.position.z * 100) / 100;
		text.position.multiplyScalar(5).add(text.positionTarget).divideScalar(6);
	}

}
