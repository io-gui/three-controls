import {
	CylinderBufferGeometry, BoxBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, Vector3
} from "../../../three.js/build/three.module.js";
import {Material} from "./TransformHelper.js";
import {TransformHelperTranslate} from "./TransformHelperTranslate.js";

export class TransformHelperScale extends TransformHelperTranslate {
	get handlesGroup() {
		const handleGeo = new BoxBufferGeometry(0.125, 0.125, 0.125);
		const lineGeo = new BufferGeometry();
		lineGeo.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));
		return {
			X: [
				[new Mesh(handleGeo, new Material('red')), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
				[new Line(lineGeo, new Material('red')), null, null, [0.8, 1, 1]],
				[new Line(lineGeo, new Material('white', 0.33).clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			],
			Y: [
				[new Mesh(handleGeo, new Material('green')), [0, 0.8, 0]],
				[new Line(lineGeo, new Material('green')), null, [0, 0, Math.PI / 2], [0.8, 1, 1]],
				[new Line(lineGeo, new Material('white', 0.33).clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
			],
			Z: [
				[new Mesh(handleGeo, new Material('blue')), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
				[new Line(lineGeo, new Material('blue')), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]],
				[new Line(lineGeo, new Material('white', 0.33).clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
			],
			XY: [
				[new Mesh(handleGeo, new Material('yellow', 0.25)), [0.85, 0.85, 0], null, [2, 2, 0.2]],
				[new Line(lineGeo, new Material('yellow')), [0.855, 0.98, 0], null, [0.125, 1, 1]],
				[new Line(lineGeo, new Material('yellow')), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(handleGeo, new Material('cyan', 0.25)), [0, 0.85, 0.85], null, [0.2, 2, 2]],
				[new Line(lineGeo, new Material('cyan')), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeo, new Material('cyan')), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(handleGeo, new Material('magenta', 0.25)), [0.85, 0, 0.85], null, [2, 0.2, 2]],
				[new Line(lineGeo, new Material('magenta')), [0.855, 0, 0.98], null, [0.125, 1, 1]],
				[new Line(lineGeo, new Material('magenta')), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XYZX: [[new Mesh(handleGeo, new Material('white', 0.25)), [1.1, 0, 0]]],
			XYZY: [[new Mesh(handleGeo, new Material('white', 0.25)), [0, 1.1, 0]]],
			XYZZ: [[new Mesh(handleGeo, new Material('white', 0.25)), [0, 0, 1.1]]]
		};
	}
	get pickersGroup() {
		const pickerGeo = new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false);
		const handleGeo = new BoxBufferGeometry(0.125, 0.125, 0.125);
		return {
			X: [[new Mesh(pickerGeo, new Material('white', 0.15)), [0.5, 0, 0], [0, 0, -Math.PI / 2]]],
			Y: [[new Mesh(pickerGeo, new Material('white', 0.15)), [0, 0.5, 0]]],
			Z: [[new Mesh(pickerGeo, new Material('white', 0.15)), [0, 0, 0.5], [Math.PI / 2, 0, 0]]],
			XY: [[new Mesh(handleGeo, new Material('white', 0.15)), [0.85, 0.85, 0], null, [3, 3, 0.2]]],
			YZ: [[new Mesh(handleGeo, new Material('white', 0.15)), [0, 0.85, 0.85], null, [0.2, 3, 3]]],
			XZ: [[new Mesh(handleGeo, new Material('white', 0.15)), [0.85, 0, 0.85], null, [3, 0.2, 3]]],
			XYZX: [[new Mesh(handleGeo, new Material('white', 0.15)), [1.1, 0, 0]]],
			XYZY: [[new Mesh(handleGeo, new Material('white', 0.15)), [0, 1.1, 0]]],
			XYZZ: [[new Mesh(handleGeo, new Material('white', 0.15)), [0, 0, 1.1]]]
		};
	}
	updateHelperMatrix() {
		this.space = 'local';
		super.updateHelperMatrix();
	}
}
