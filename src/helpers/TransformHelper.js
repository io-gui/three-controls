import {Vector3} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {ConeGeometry, OctahedronGeometry} from "./HelperGeometries.js";

const coneGeometry = new ConeGeometry();
const octahedronGeometry = new OctahedronGeometry();

function stringHas(str, char) {return str.search(char) !== -1;}

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

export class TransformHelper extends Helper {
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: {value: true, observer: 'updateAxis'},
			showY: {value: true, observer: 'updateAxis'},
			showZ: {value: true, observer: 'updateAxis'},
			axis: null,
			worldX: new Vector3(),
			worldY: new Vector3(),
			worldZ: new Vector3(),
			axisDotEye: new Vector3()
		});
		this.size = 0.15;

		this.handles = this.combineHelperGroups(this.handlesGroup);
		this.pickers = this.combineHelperGroups(this.pickersGroup);
		if (this.handles.length) this.add(...this.handles);
		if (this.pickers.length) this.add(...this.pickers);

		this.traverse(child => child.renderOrder = 100);

		// Hide pickers
		for (let i = 0; i < this.pickers.length; i++) this.pickers[i].material.visible = false;
	}
	axisChanged() {
		this.animation.startAnimation(4);
		this.traverse(axis => {
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
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups(groups) {
		const meshes = [];
		for (let name in groups) {
			meshes.push(new HelperMesh(groups[name], {name: name}));
		}
		return meshes;
	}
	get handlesGroup() {
		return {
			X: [{geometry: coneGeometry, color: [1,0,0], position: [0.15, 0, 0], rotation: [0, 0, -Math.PI / 2], scale: [0.5,1,0.5]}],
			Y: [{geometry: coneGeometry, color: [0,1,0], position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [0.5,1,0.5]}],
			Z: [{geometry: coneGeometry, color: [0,0,1], position: [0, 0, 0.15], rotation: [Math.PI / 2, 0, 0], scale: [0.5,1,0.5]}]
		};
	}
	get pickersGroup() {
		return {
			XYZ: [{geometry: octahedronGeometry, scale: 0.5}]
		};
	}
	updateAxis() {
		this.animation.startAnimation(4);
		this.traverse(axis => {
			axis.hidden = false;
			if (stringHas(axis.name, "X") && !this.showX) axis.hidden = true;
			if (stringHas(axis.name, "Y") && !this.showY) axis.hidden = true;
			if (stringHas(axis.name, "Z") && !this.showZ) axis.hidden = true;
			if (stringHas(axis.name, "E") && (!this.showX || !this.showY || !this.showZ)) axis.hidden = true;
		});
	}
	updateMatrixWorld( force, camera ) {
		if (camera) this.camera = camera; // TODO
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i ++) {
			children[i].updateMatrixWorld(true, camera);
		}
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		this.worldX.set(1, 0, 0).applyQuaternion(this.worldQuaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.worldQuaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.worldQuaternion);

		this.axisDotEye.set(
			this.worldX.dot(this.eye),
			this.worldY.dot(this.eye),
			this.worldZ.dot(this.eye)
		);

		if (this.animation._active) {
			for (let i = this.handles.length; i--;) this.updateAxisMaterial(this.handles[i]);
			for (let i = this.pickers.length; i--;) this.updateAxisMaterial(this.pickers[i]);
		}
	}
	// TODO: optimize!
	updateAxisMaterial(axis) {
		axis.visible = true;

		const mat = axis.material;
		const h = axis.material.highlight || 0;

		let highlight = axis.hidden ? -1.5 : axis.highlight || 0;

		mat.highlight = (4 * h + highlight) / 5;

		if (mat.highlight < -1.49) axis.visible = false;
	}
}
