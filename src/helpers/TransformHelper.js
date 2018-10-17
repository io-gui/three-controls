import {Vector3} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {TransformInfoMesh} from "./TransformInfoMesh.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Corner3Geometry} from "./HelperGeometries.js";
import {Animation} from "../../lib/Animation.js";

// Reusable utility variables
const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.1;
const AXIS_FLIP_TRESHOLD = 0;

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

const handleGeometry = {
	XYZ: new Corner3Geometry()
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
	get infoGeometry() {
		return {};
	}
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: {value: true, observer: 'paramChanged'},
			showY: {value: true, observer: 'paramChanged'},
			showZ: {value: true, observer: 'paramChanged'},
			axis: null,
			active: false,
			doHide: true,
			doFlip: true,
			hideX: { value: false, observer: 'paramChanged' },
			hideY: { value: false, observer: 'paramChanged' },
			hideZ: { value: false, observer: 'paramChanged' },
			hideXY: { value: false, observer: 'paramChanged' },
			hideYZ: { value: false, observer: 'paramChanged' },
			hideXZ: { value: false, observer: 'paramChanged' },
			flipX: { value: false, observer: 'paramChanged' },
			flipY: { value: false, observer: 'paramChanged' },
			flipZ: { value: false, observer: 'paramChanged' },
		});

		this.worldX = new Vector3();
		this.worldY = new Vector3();
		this.worldZ = new Vector3();
		this.axisDotEye = new Vector3();
		this.size = 0.05;

		this.handles = this.initAxes(this.handleGeometry);
		this.pickers = this.initPickers(this.pickerGeometry);
		this.guides = this.initGuides(this.guideGeometry);
		this.infos = this.initInfoMeshes(this.infoGeometry);

		this.setAxis = this.setAxis.bind(this);
		this.setGuide = this.setGuide.bind(this);
		this.setInfo = this.setInfo.bind(this);

		this.updateAxis = this.updateAxis.bind(this);
		this.updateGuide = this.updateGuide.bind(this);
		this.updateInfo = this.updateInfo.bind(this);

		this.animation = new Animation();

		this.animation.addEventListener('update', () => {
			this.dispatchEvent({type: 'change'});
		});
	}
	initAxes(axesDef) {
		const axes = [];
		for (let name in axesDef) {
			const mesh = new HelperMesh(axesDef[name]);
			mesh.name = name;
			mesh.scaleTarget = new Vector3(1, 1, 1);
			axes.push(mesh);
			axes[name] = mesh;
			this.add(mesh);
		}
		return axes;
	}
	initPickers(pickersDef) {
		const axes = [];
		for (let name in pickersDef) {
			const mesh = new HelperMesh(pickersDef[name]);
			mesh.name = name;
			mesh.scaleTarget = new Vector3(1, 1, 1);
			mesh.material.visible = false;
			axes.push(mesh);
			axes[name] = mesh;
			this.add(mesh);
		}
		return axes;
	}
	initGuides(guidesDef) {
		const axes = [];
		for (let name in guidesDef) {
			const mesh = new HelperMesh(guidesDef[name]);
			mesh.name = name;
			mesh.scaleTarget = new Vector3(1, 1, 1);
			mesh.isGuide = true;
			mesh.highlight = -2;
			axes.push(mesh);
			axes[name] = mesh;
			this.add(mesh);
		}
		return axes;
	}
	initInfoMeshes(infosDef) {
		const infos = [];
		for (let name in infosDef) {
			const mesh = new TransformInfoMesh(infosDef[name]);
			mesh.name = name;
			mesh.positionTarget = mesh.position.clone();
			mesh.material.opacity = 0;
			mesh.isInfo = true;
			infos.push(mesh);
			infos[name] = mesh;
			this.add(mesh);
		}
		return infos;
	}

	traverseAxis(callback) {
		for (let i = this.handles.length; i--;) callback(this.handles[i]);
		for (let i = this.pickers.length; i--;) callback(this.pickers[i]);
	}
	traverseGuides(callback) {
		for (let i = this.guides.length; i--;) callback(this.guides[i]);
	}
	traverseInfos(callback) {
		for (let i = this.infos.length; i--;) callback(this.infos[i]);
	}

	spaceChanged() {
		super.spaceChanged();
		this.paramChanged();
		this.animateScaleUp();
	}
	objectChanged() {
		super.objectChanged();
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
	axisChanged() {
		this.paramChanged();
		this.animation.startAnimation(0.5);
	}
	paramChanged() {
		this.traverseAxis(this.setAxis);
		this.traverseGuides(this.setGuide);
		this.traverseInfos(this.setInfo);
		this.animation.startAnimation(0.5);
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
			this.traverseInfos(this.updateInfo);
		}
	}
	// TODO: optimize, make less ugly and framerate independent!
	setAxis(axis) {
		axis.hidden = false;
		const name = axis.name.split('_').pop() || null;
		axis.highlight = this.axis ? hasAxisAny(axis.name, this.axis) ? 1 : -0.75 : 0;
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
	setInfo(info) {
		info.highlight = this.axis ? hasAxisAny(info.name, this.axis) ? 1 : 0 : 0;
		// Flip axis
		if (this.doFlip) {
			const name = info.name.split('_').pop() || null;
			if (name.indexOf('X') !== -1) info.positionTarget.x = this.flipX ? -1.2 : 1.2;
			if (name.indexOf('Y') !== -1) info.positionTarget.y = this.flipY ? -1.2 : 1.2;
			if (name.indexOf('Z') !== -1) info.positionTarget.z = this.flipZ ? -1.2 : 1.2;
		}
	}
	updateAxis(axis) {
		axis.visible = true;
		const highlight = axis.hidden ? -2 : axis.highlight || 0;
		axis.material.highlight = (4 * axis.material.highlight + highlight) / 5;
		if (axis.material.highlight < -1.99) axis.visible = false;
		axis.scale.multiplyScalar(5).add(axis.scaleTarget).divideScalar(6);
	}
	updateGuide(guide) {
		guide.visible = true;
		const highlight = guide.hidden ? -2 : guide.highlight || 0;
		guide.material.highlight = (8 * guide.material.highlight + highlight) / 9;
		if (guide.material.highlight < -1.99) guide.visible = false;
		guide.scale.multiplyScalar(5).add(guide.scaleTarget).divideScalar(6);
	}
	updateInfo(info) {
		info.visible = true;
		info.material.opacity = (8 * info.material.opacity + info.highlight) / 9;
		if (info.material.opacity <= 0.001) info.visible = false;
		if (info.name === 'X') info.text = Math.round(this.object.position.x * 100) / 100;
		if (info.name === 'Y') info.text = Math.round(this.object.position.y * 100) / 100;
		if (info.name === 'Z') info.text = Math.round(this.object.position.z * 100) / 100;
		info.position.multiplyScalar(5).add(info.positionTarget).divideScalar(6);
	}

}
