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
			showX: {value: true, observer: 'updateAxes'},
			showY: {value: true, observer: 'updateAxes'},
			showZ: {value: true, observer: 'updateAxes'},
			axis: null,
		});

		this.worldX = new Vector3();
		this.worldY = new Vector3();
		this.worldZ = new Vector3();
		this.axisDotEye = new Vector3();
		this.size = 0.15;

		this.handles = new HelperMeshes(this.handleGeometry);
		this.pickers = new HelperMeshes(this.pickerGeometry);

		if (this.handles.length) this.add(...this.handles)
		if (this.pickers.length) this.add(...this.pickers)

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
	objectChanged() {
		this.animation.startAnimation(0.5);
		this.traverseAxis(axis => {
			axis.scale.set(0.0001, 0.0001, 0.0001);
			axis.scaleTarget.set(1, 1, 1);
		});
	}
	axisChanged() {
		this.animation.startAnimation(0.5);
		this.traverseAxis(axis => {
			axis.highlight = 0;
			if (this.axis) {
				if (hasAxisAny(axis.name, this.axis)) {
					axis.highlight = 1;
				} else {
					axis.highlight = -0.75;
				}
			}
		});
	}
	updateAxes() {
		this.animation.startAnimation(0.5);
		this.traverseAxis(axis => {
			axis.hidden = false;
			if (stringHas(axis.name, "X") && !this.showX) axis.hidden = true;
			if (stringHas(axis.name, "Y") && !this.showY) axis.hidden = true;
			if (stringHas(axis.name, "Z") && !this.showZ) axis.hidden = true;
			if (stringHas(axis.name, "E") && (!this.showX || !this.showY || !this.showZ)) axis.hidden = true;
		});
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();
		this.worldX.set(1, 0, 0).applyQuaternion(this.quaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.quaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.quaternion);
		this.axisDotEye.set(
			this.worldX.dot(this.eye),
			this.worldY.dot(this.eye),
			this.worldZ.dot(this.eye)
		);
		if (this.animation._active) this.traverseAxis(axis => this.updateAxisMaterial(axis));
	}
	// TODO: optimize, make less ugly and more framerate independent!
	updateAxisMaterial(axis) {
		axis.visible = true;
		const h = axis.material.highlight || 0;
		let highlight = axis.hidden ? -1.5 : axis.highlight || 0;
		axis.material.highlight = (4 * h + highlight) / 5;
		if (axis.material.highlight < -1.49) axis.visible = false;
		axis.scale.multiplyScalar(5).add(axis.scaleTarget).divideScalar(6);
	}
}
