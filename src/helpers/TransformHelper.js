import {Vector3} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {ConeGeometry, OctahedronGeometry} from "./HelperGeometries.js";

const coneGeometry = new ConeGeometry();
const octahedronGeometry = new OctahedronGeometry();

export class TransformHelper extends Helper {
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: true,
			showY: true,
			showZ: true,
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
	}
	showXChanged() {
		this.animation.startAnimation(4);
	}
	showYChanged() {
		this.animation.startAnimation(4);
	}
	showZChanged() {
		this.animation.startAnimation(4);
	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups(groups) {
		const meshes = [];
		for (let name in groups) {
			const mesh = new HelperMesh(groups[name], {name: name});
			mesh.has = char => {return mesh.name.search(char) !== -1;};
			mesh.is = char => {return mesh.name === char;};
			meshes.push(mesh);
		}
		return meshes;
	}
	get handlesGroup() {
		return {
			X: [{geometry: coneGeometry, color: [1,0,0], position: [0.15, 0, 0], rotation: [0, 0, -Math.PI / 2], scale: [0.5,1,0.5]}],
			Y: [{geometry: coneGeometry, color: [0,1,0], position: [0, 0.15, 0], rotation: [0, 0, 0], scale: [0.5,1,0.5]}],
			Z: [{geometry: coneGeometry, color: [0,0,1], position: [0, 0, -0.15], rotation: [Math.PI / 2, 0, 0], scale: [0.5,1,0.5]}]
		};
	}
	get pickersGroup() {
		return {
			XYZ: [{geometry: octahedronGeometry, scale: 0.5}]
		};
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		// for (let i = this.handles.length; i--;) this.updateAxis(this.handles[i]);
		// for (let i = this.pickers.length; i--;) this.updateAxis(this.pickers[i]);

		this.worldX.set(1, 0, 0).applyQuaternion(this.worldQuaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.worldQuaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.worldQuaternion);

		this.axisDotEye.set(
			this.worldX.dot(this.eye),
			this.worldY.dot(this.eye),
			this.worldZ.dot(this.eye)
		);
	}
	updateAxis(axis) {
		axis.visible = true;

		const mat = axis.material;
		const h = axis.material.highlight;

		let hidden = false;
		let highlight = 0;

		// TODO: resolve conflicts with highlight without return?
		if (axis.has("X") && !this.showX) hidden = true;
		if (axis.has("Y") && !this.showY) hidden = true;
		if (axis.has("Z") && !this.showZ) hidden = true;
		if (axis.has("E") && (!this.showX || !this.showY || !this.showZ)) hidden = true;

		if (hidden) {
			highlight = -1.5;
		} else {
			if (this.axis) {
				if (this.hasAxis(axis.name)) {
					highlight = 1;
				} else {
					highlight = -0.75;
				}
			}
		}

		mat.highlight = (10 * h + highlight) / 11;

		if (mat.highlight < -1.49) axis.visible = false;
	}
}
