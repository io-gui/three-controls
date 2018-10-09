import {Vector3, Object3D, OctahedronBufferGeometry} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {Corner3Geometry} from "./HelperGeometries.js";
import {Animation} from "../../lib/Animation.js";

function stringHas(str, char) {return str.search(char) !== -1;}

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

class HelperMeshes extends Array {
	constructor(groupDef) {
		super();
		for (let name in groupDef) {
			const mesh = new HelperMesh(groupDef[name], {name: name});
			this.push(mesh);
			this[name] = mesh;
		}
	}
}

const handleGeometry = {
	XYZ: new Corner3Geometry()
};

const pickerGeometry = {
	XYZ: new OctahedronBufferGeometry(1, 0)
};

export class TransformHelper extends Helper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: {value: true, observer: 'paramChanged'},
			showY: {value: true, observer: 'paramChanged'},
			showZ: {value: true, observer: 'paramChanged'},
			axis: null,
		});

		this.worldX = new Vector3();
		this.worldY = new Vector3();
		this.worldZ = new Vector3();
		this.axisDotEye = new Vector3();
		this.size = 0.05;

		this.handles = new HelperMeshes(this.handleGeometry);
		this.pickers = new HelperMeshes(this.pickerGeometry);

		if (this.handles.length) this.add(...this.handles);
		if (this.pickers.length) this.add(...this.pickers);

		// Hide pickers
		for (let i = 0; i < this.pickers.length; i++) this.pickers[i].material.visible = false;

		this.animation = new Animation();

		this.animation.addEventListener('update', () => {
			this.dispatchEvent({type: 'change'});
		});
	}
	traverseAxis(callback) {
		for (let i = this.handles.length; i--;) callback(this.handles[i]);
		for (let i = this.pickers.length; i--;) callback(this.pickers[i]);
	}
	spaceChanged() {
		this.animateScaleUp();
	}
	objectChanged() {
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
		this.traverseAxis(axis => {
			axis.highlight = this.axis ? hasAxisAny(axis.name, this.axis) ? 1 : -0.75 : 0;
		});
		this.animation.startAnimation(0.5);
	}
	paramChanged() {
		this.traverseAxis(axis => {
			axis.hidden = false;
			if (stringHas(axis.name, "X") && !this.showX) axis.hidden = true;
			if (stringHas(axis.name, "Y") && !this.showY) axis.hidden = true;
			if (stringHas(axis.name, "Z") && !this.showZ) axis.hidden = true;
			if (stringHas(axis.name, "E") && (!this.showX || !this.showY || !this.showZ)) axis.hidden = true;
		});
		this.animation.startAnimation(0.5);
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();
		this.worldX.set(1, 0, 0).applyQuaternion(this.quaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.quaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.quaternion);
		this.axisDotEye.set(this.worldX.dot(this.eye), this.worldY.dot(this.eye), this.worldZ.dot(this.eye));
		this.traverseAxis(axis => this.updateAxis(axis));
	}
	// TODO: optimize, make less ugly and framerate independent!
	updateAxis(axis) {
		axis.visible = true;
		let highlight = axis.hidden ? -1.5 : axis.highlight || 0;
		axis.material.highlight = (4 * axis.material.highlight + highlight) / 5;
		if (axis.material.highlight < -1.49) axis.visible = false;
		axis.scale.multiplyScalar(5).add(axis.scaleTarget).divideScalar(6);
	}
}
