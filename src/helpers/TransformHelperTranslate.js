import {
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, PlaneBufferGeometry,
	Vector3, Quaternion
} from "../../../three.js/build/three.module.js";
import {TransformHelper, Material} from "./TransformHelper.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = 0;

export class TransformHelperTranslate extends TransformHelper {
	get handlesGroup() {
		const arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);
		const lineGeometry = new BufferGeometry();
		lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));
		return {
			X: [
				[new Mesh(arrowGeometry, new Material('red')), [1, 0, 0], [0, 0, -Math.PI / 2], null],
				[new Line(lineGeometry, new Material('red'))]
			],
			Y: [
				[new Mesh(arrowGeometry, new Material('green')), [0, 1, 0], null, null],
				[new Line(lineGeometry, new Material('green')), null, [0, 0, Math.PI / 2]]
			],
			Z: [
				[new Mesh(arrowGeometry, new Material('blue')), [0, 0, 1], [Math.PI / 2, 0, 0], null],
				[new Line(lineGeometry, new Material('blue')), null, [0, -Math.PI / 2, 0]]
			],
			XYZ: [[new Mesh(new OctahedronBufferGeometry(0.1, 0), new Material('white', 0.25)), [0, 0, 0], [0, 0, 0]]],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new Material('yellow', 0.25)), [0.15, 0.15, 0]],
				[new Line(lineGeometry, new Material('yellow')), [0.18, 0.3, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, new Material('yellow')), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new Material('cyan', 0.25)), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
				[new Line(lineGeometry, new Material('cyan')), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, new Material('cyan')), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new Material('magenta', 0.25)), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, new Material('magenta')), [0.18, 0, 0.3], null, [0.125, 1, 1]],
				[new Line(lineGeometry, new Material('magenta')), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			]
		};
	}
	get pickersGroup() {
		const cylGeo = new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false);
		const planeGeo = new PlaneBufferGeometry(0.4, 0.4);
		const mat = new Material('white', 0.15);
		return {
			X: [[new Mesh(cylGeo, mat), [0.6, 0, 0], [0, 0, -Math.PI / 2]]],
			Y: [[new Mesh(cylGeo, mat), [0, 0.6, 0]]],
			Z: [[new Mesh(cylGeo, mat), [0, 0, 0.6], [Math.PI / 2, 0, 0]]],
			XYZ: [[new Mesh(new OctahedronBufferGeometry(0.2, 0), mat)]],
			XY: [[new Mesh(planeGeo, mat), [0.2, 0.2, 0]]],
			YZ: [[new Mesh(planeGeo, mat), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]],
			XZ: [[new Mesh(planeGeo, mat), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]]
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
		if (axis.is('XY') && Math.abs(xDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;
		if (axis.is('YZ') && Math.abs(yDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;
		if (axis.is('XZ') && Math.abs(zDotE) < PLANE_HIDE_TRESHOLD) axis.visible = false;

		// Flip axis ocluded behind another axis
		axis.scale.set(1,1,1);
		if (axis.has('X') && xDotE < AXIS_FLIP_TRESHOLD) axis.scale.x *= -1;
		if (axis.has('Y') && yDotE < AXIS_FLIP_TRESHOLD) axis.scale.y *= -1;
		if (axis.has('Z') && zDotE < AXIS_FLIP_TRESHOLD) axis.scale.z *= -1;
	}
}
