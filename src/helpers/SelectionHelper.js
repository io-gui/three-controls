/**
 * @author arodic / https://github.com/arodic
 */

import {Line} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
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
				{geometry: corner3Geometry, position: [1, 1, 1], scale: 0.5, rotation: [HPI, 0, PI]},
				{geometry: corner3Geometry, position: [1, 1, -1], scale: 0.5, rotation: [HPI, 0, HPI]},
				{geometry: corner3Geometry, position: [-1, -1, -1], scale: 0.5, rotation: [-HPI, 0, -HPI]},
				{geometry: corner3Geometry, position: [-1, -1, 1], scale: 0.5, rotation: [-HPI, 0, 0]},
				{geometry: corner3Geometry, position: [-1, 1, 1], scale: 0.5, rotation: [PI/2, 0, -PI/2]},
				{geometry: corner3Geometry, position: [-1, 1, -1], scale: 0.5, rotation: [PI/2, 0, 0]},
				{geometry: corner3Geometry, position: [1, -1, -1], scale: 0.5, rotation: [0, 0, HPI]},
				{geometry: corner3Geometry, position: [1, -1, 1], scale: 0.5, rotation: [0, PI, 0]},
			]
		};
	}
	constructor(props) {
		super(props);
		const axis = new TransformHelper();
		axis.size = 0.02;
		this.add(axis);
		if (props.object && props.object.geometry) {
			this.add(new Line(props.object.geometry, new Material('white', 0.5)));
		}
	}
}
