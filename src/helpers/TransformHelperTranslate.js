import {TransformHelper} from "./TransformHelper.js";
import {ArrowGeometry, Corner2Geometry, OctahedronGeometry, PickerHandleGeometry, PlaneGeometry} from "./HelperGeometries.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = 0;

const arrowGeometry = new ArrowGeometry();
const corner2Geometry = new Corner2Geometry();
const octahedronGeometry = new OctahedronGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const planeGeometry = new PlaneGeometry();

export class TransformHelperTranslate extends TransformHelper {
	get handlesGroup() {
		return {
			X: [{geometry: arrowGeometry, color: [1, 0.3, 0.3], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: arrowGeometry, color: [0.3, 1, 0.3]}],
			Z: [{geometry: arrowGeometry, color: [0.3, 0.3, 1], rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [
				{geometry: octahedronGeometry, scale: 0.075}
			],
			XY: [
				{geometry: planeGeometry, color: [1,1,0,0.25], position: [0.15, 0.15, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,1,0.3], position: [0.32, 0.32, 0], scale: 0.15, rotation: [Math.PI / 2, 0, Math.PI]}
			],
			YZ: [
				{geometry: planeGeometry, color: [0,1,1,0.25], position: [0, 0.15, 0.15], rotation: [0, Math.PI / 2, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [0.3,1,1], position: [0, 0.32, 0.32], scale: 0.15, rotation: [0, Math.PI, -Math.PI / 2]}
			],
			XZ: [
				{geometry: planeGeometry, color: [1,0,1,0.25], position: [0.15, 0, 0.15], rotation: [-Math.PI / 2, 0, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,0.3,1], position: [0.32, 0, 0.32], scale: 0.15, rotation: [0, Math.PI, 0]}
			]
		};
	}
	get pickersGroup() {
		return {
			X: [{geometry: pickerHandleGeometry, rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: pickerHandleGeometry}],
			Z: [{geometry: pickerHandleGeometry, rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [{ geometry: octahedronGeometry, scale: 0.4}],
			XY: [{ geometry: planeGeometry, position: [0.25, 0.25, 0], scale: 0.5}],
			YZ: [{ geometry: planeGeometry, position: [0, 0.25, 0.25], rotation: [0, Math.PI / 2, 0], scale: 0.5}],
			XZ: [{ geometry: planeGeometry, position: [0.25, 0, 0.25], rotation: [-Math.PI / 2, 0, 0], scale: 0.5}]
		};
	}
	updateAxis(axis) {
		super.updateAxis(axis);

		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;

		// Hide translate and scale axis facing the camera
		if ((axis.is('X') || axis.is('XYZX')) && Math.abs(xDotE) > AXIS_HIDE_TRESHOLD) axis.visible = false;
		if ((axis.is('Y') || axis.is('XYZY')) && Math.abs(yDotE) > AXIS_HIDE_TRESHOLD) axis.visible = false;
		if ((axis.is('Z') || axis.is('XYZZ')) && Math.abs(zDotE) > AXIS_HIDE_TRESHOLD) axis.visible = false;
		if (axis.is('XY') && Math.abs(zDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;
		if (axis.is('YZ') && Math.abs(xDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;
		if (axis.is('XZ') && Math.abs(yDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;

		// Flip axis ocluded behind another axis
		axis.scale.set(1,1,1);
		if (axis.has('X') && xDotE < AXIS_FLIP_TRESHOLD) axis.scale.x *= -1;
		if (axis.has('Y') && yDotE < AXIS_FLIP_TRESHOLD) axis.scale.y *= -1;
		if (axis.has('Z') && zDotE < AXIS_FLIP_TRESHOLD) axis.scale.z *= -1;
	}
}
