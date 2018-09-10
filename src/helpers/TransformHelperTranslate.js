import {TransformHelper} from "./TransformHelper.js";
import {ArrowGeometry, Corner2Geometry, OctahedronGeometry, PickerHandleGeometry, PlaneGeometry} from "./HelperGeometries.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = -0.2;

const arrowGeometry = new ArrowGeometry();
const corner2Geometry = new Corner2Geometry();
const octahedronGeometry = new OctahedronGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const planeGeometry = new PlaneGeometry();

export class TransformHelperTranslate extends TransformHelper {
	constructor(props) {
		super(props);
		this.traverse(child => {
			child.renderOrder = 200;
		});
	}
	get handlesGroup() {
		return {
			X: [{geometry: arrowGeometry, color: [1, 0.3, 0.3], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: arrowGeometry, color: [0.3, 1, 0.3]}],
			Z: [{geometry: arrowGeometry, color: [0.3, 0.3, 1], rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [
				{geometry: octahedronGeometry, color: [1, 1, 1], scale: 0.1}
			],
			XY: [
				{geometry: planeGeometry, color: [1,1,0,0.5], position: [0.15, 0.15, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,1,0.3], position: [0.3, 0.3, 0], scale: 0.15, rotation: [Math.PI / 2, 0, Math.PI]}
			],
			YZ: [
				{geometry: planeGeometry, color: [0,1,1,0.5], position: [0, 0.15, 0.15], rotation: [0, Math.PI / 2, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [0.3,1,1], position: [0, 0.3, 0.3], scale: 0.15, rotation: [0, Math.PI, -Math.PI / 2]}
			],
			XZ: [
				{geometry: planeGeometry, color: [1,0,1,0.5], position: [0.15, 0, 0.15], rotation: [-Math.PI / 2, 0, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,0.3,1], position: [0.3, 0, 0.3], scale: 0.15, rotation: [0, Math.PI, 0]}
			]
		};
	}
	get pickersGroup() {
		return {
			X: [{geometry: pickerHandleGeometry, color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: pickerHandleGeometry, color: [0.3, 1, 0.3, 0.5]}],
			Z: [{geometry: pickerHandleGeometry, color: [0.3, 0.3, 1, 0.5], rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [{geometry: octahedronGeometry, color: [0.5, 0.5, 0.5, 0.5], scale: 0.2}],
			XY: [{ geometry: planeGeometry, color: [1,1,0,0.5,0.5], position: [0.25, 0.25, 0], scale: 0.5}],
			YZ: [{ geometry: planeGeometry, color: [0,1,1,0.5,0.5], position: [0, 0.25, 0.25], rotation: [0, Math.PI / 2, 0], scale: 0.5}],
			XZ: [{ geometry: planeGeometry, color: [1,0,1,0.5,0.5], position: [0.25, 0, 0.25], rotation: [-Math.PI / 2, 0, 0], scale: 0.5}]
		};
	}
	updateAxis(axis) {
		super.updateAxis(axis);

		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;

		const mat = axis.material;
		const h = axis.material.highlight;

		let hidden = false;
		let highlight = 0;

		// Hide axis facing the camera
		if ((axis.is('X') || axis.is('XYZX')) && Math.abs(xDotE) > AXIS_HIDE_TRESHOLD) hidden = true;
		if ((axis.is('Y') || axis.is('XYZY')) && Math.abs(yDotE) > AXIS_HIDE_TRESHOLD) hidden = true;
		if ((axis.is('Z') || axis.is('XYZZ')) && Math.abs(zDotE) > AXIS_HIDE_TRESHOLD) hidden = true;
		if (axis.is('XY') && Math.abs(zDotE) < PLANE_HIDE_TRESHOLD) hidden = true;
		if (axis.is('YZ') && Math.abs(xDotE) < PLANE_HIDE_TRESHOLD) hidden = true;
		if (axis.is('XZ') && Math.abs(yDotE) < PLANE_HIDE_TRESHOLD) hidden = true;

		if (hidden) {
			highlight = -1.5;
			mat.highlight = (10 * h + highlight) / 11;
		}

		if (mat.highlight < -1.49) axis.visible = false;


		// TODO: implement flipping animation better and make sure animation loop runs while lerping.
		// Flip axis ocluded behind another axis
		if (!this.active) {
			if (axis.has('X') && xDotE < AXIS_FLIP_TRESHOLD) {
				axis.scale.x = (axis.scale.x * 5 -1 ) / 6;
			} else {
				axis.scale.x = (axis.scale.x * 5 + 1 ) / 6;
			}
			if (axis.has('Y') && yDotE < AXIS_FLIP_TRESHOLD) {
				axis.scale.y = (axis.scale.y * 5 -1 ) / 6;
			} else {
				axis.scale.y = (axis.scale.y * 5 + 1 ) / 6;
			}
			if (axis.has('Z') && zDotE < AXIS_FLIP_TRESHOLD) {
				axis.scale.z = (axis.scale.z * 5 -1 ) / 6;
			} else {
				axis.scale.z = (axis.scale.z * 5 + 1 ) / 6;
			}
		}
	}
}
