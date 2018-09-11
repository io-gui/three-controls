/**
 * @author arodic / https://github.com/arodic
 */

import {Line} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {HelperMesh} from "./HelperMesh.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperMaterial as Material} from "./HelperMaterial.js";
import {Corner3Geometry} from "./HelperGeometries.js";

const HPI = Math.PI / 2;
const PI = Math.PI;

const corner3Geometry = new Corner3Geometry();

export class SelectionHelper extends Helper {
	get handlesGroup() {
		return {
			XYZ: [
				{geometry: corner3Geometry, position: [1, 1, 1], scale: 0.5, rotation: [HPI, 0, PI], thickness: 3},
				{geometry: corner3Geometry, position: [1, 1, -1], scale: 0.5, rotation: [HPI, 0, HPI], thickness: 3},
				{geometry: corner3Geometry, position: [-1, -1, -1], scale: 0.5, rotation: [-HPI, 0, -HPI], thickness: 3},
				{geometry: corner3Geometry, position: [-1, -1, 1], scale: 0.5, rotation: [-HPI, 0, 0], thickness: 3},
				{geometry: corner3Geometry, position: [-1, 1, 1], scale: 0.5, rotation: [PI/2, 0, -PI/2], thickness: 3},
				{geometry: corner3Geometry, position: [-1, 1, -1], scale: 0.5, rotation: [PI/2, 0, 0], thickness: 3},
				{geometry: corner3Geometry, position: [1, -1, -1], scale: 0.5, rotation: [0, 0, HPI], thickness: 3},
				{geometry: corner3Geometry, position: [1, -1, 1], scale: 0.5, rotation: [0, PI, 0], thickness: 3},
			]
		};
	}
	constructor(props) {
		super(props);
		const axis = new TransformHelper();
		axis.size = 0.03;
		this.add(axis);
		if (props.object && props.object.geometry) {
			this.add(new Line(props.object.geometry, new Material('white', 0.5)));
		}
		this.handles = this.combineHelperGroups(this.handlesGroup);
		if (this.handles.length) this.add(...this.handles);
	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups(groups) {
		const meshes = [];
		for (let name in groups) {
			const mesh = new HelperMesh(groups[name], {name: name});
			mesh.scale.set(100, 100, 100);
			meshes.push(mesh);
		}
		return meshes;
	}
}
