import {
	CylinderBufferGeometry, BoxBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, Vector3
} from "../../../three.js/build/three.module.js";
import {AxesHelper} from "./AxesHelper.js";

// Reusable utility variables
const alignVector = new Vector3(0, 1, 0);

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

// reusable geometry

const handleGeo = new BoxBufferGeometry(0.125, 0.125, 0.125);

const lineGeo = new BufferGeometry();
lineGeo.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

const pickerGeo = new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false);

export class AxesScaleHelper extends AxesHelper {
	init() {
		const mat = this.setupHelperMaterial.bind(this);
		const helper = {
			X: [
				[new Mesh(handleGeo, mat('red')), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
				[new Line(lineGeo, mat('red')), null, null, [0.8, 1, 1]],
				[new Line(lineGeo, mat('white', 0.33).clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			],
			Y: [
				[new Mesh(handleGeo, mat('green')), [0, 0.8, 0]],
				[new Line(lineGeo, mat('green')), null, [0, 0, Math.PI / 2], [0.8, 1, 1]],
				[new Line(lineGeo, mat('white', 0.33).clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
			],
			Z: [
				[new Mesh(handleGeo, mat('blue')), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
				[new Line(lineGeo, mat('blue')), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]],
				[new Line(lineGeo, mat('white', 0.33).clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
			],
			XY: [
				[new Mesh(handleGeo, mat('yellow', 0.25)), [0.85, 0.85, 0], null, [2, 2, 0.2]],
				[new Line(lineGeo, mat('yellow')), [0.855, 0.98, 0], null, [0.125, 1, 1]],
				[new Line(lineGeo, mat('yellow')), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(handleGeo, mat('cyan', 0.25)), [0, 0.85, 0.85], null, [0.2, 2, 2]],
				[new Line(lineGeo, mat('cyan')), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeo, mat('cyan')), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(handleGeo, mat('magenta', 0.25)), [0.85, 0, 0.85], null, [2, 0.2, 2]],
				[new Line(lineGeo, mat('magenta')), [0.855, 0, 0.98], null, [0.125, 1, 1]],
				[new Line(lineGeo, mat('magenta')), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XYZX: [
				[new Mesh(handleGeo, mat('white', 0.25)), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(handleGeo, mat('white', 0.25)), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(handleGeo, mat('white', 0.25)), [0, 0, 1.1]],
			]
		};

		const picker = {
			X: [
				[new Mesh(pickerGeo, mat('white', 0.15)), [0.5, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(pickerGeo, mat('white', 0.15)), [0, 0.5, 0]]
			],
			Z: [
				[new Mesh(pickerGeo, mat('white', 0.15)), [0, 0, 0.5], [Math.PI / 2, 0, 0]]
			],
			XY: [
				[new Mesh(handleGeo, mat('white', 0.15)), [0.85, 0.85, 0], null, [3, 3, 0.2]],
			],
			YZ: [
				[new Mesh(handleGeo, mat('white', 0.15)), [0, 0.85, 0.85], null, [0.2, 3, 3]],
			],
			XZ: [
				[new Mesh(handleGeo, mat('white', 0.15)), [0.85, 0, 0.85], null, [3, 0.2, 3]],
			],
			XYZX: [
				[new Mesh(handleGeo, mat('white', 0.15)), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(handleGeo, mat('white', 0.15)), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(handleGeo, mat('white', 0.15)), [0, 0, 1.1]],
			]
		};

		this.add(this.setupHelper(helper));
		this.add(this.picker = this.setupHelper(picker));
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		const quaternion = this.worldQuaternion;

		// highlight selected axis
		this.traverse(handle => {

			// Hide translate and scale axis facing the camera
			const AXIS_HIDE_TRESHOLD = 0.99;
			const PLANE_HIDE_TRESHOLD = 0.2;
			const AXIS_FLIP_TRESHOLD = -0.4;

			if (handle !== this) {
				handle.visible = true;
				handle.scale.set(1,1,1);
			}

			if (handle.name === 'X' || handle.name === 'XYZX') {
				if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'Y' || handle.name === 'XYZY') {
				if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'Z' || handle.name === 'XYZZ') {
				if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'XY') {
				if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'YZ') {
				if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'XZ') {
				if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}

			// Flip translate and scale axis ocluded behind another axis
			if (handle.name.search('X') !== -1) {
				if (alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
					if (handle.tag === 'fwd') {
						handle.visible = false;
					} else {
						handle.scale.x *= -1;
					}
				} else if (handle.tag === 'bwd') {
					handle.visible = false;
				}
			}
			if (handle.name.search('Y') !== -1) {
				if (alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
					if (handle.tag === 'fwd') {
						handle.visible = false;
					} else {
						handle.scale.y *= -1;
					}
				} else if (handle.tag === 'bwd') {
					handle.visible = false;
				}
			}
			if (handle.name.search('Z') !== -1) {
				if (alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
					if (handle.tag === 'fwd') {
						handle.visible = false;
					} else {
						handle.scale.z *= -1;
					}
				} else if (handle.tag === 'bwd') {
					handle.visible = false;
				}
			}
			this.highlightAxis(handle, this.axis);
		});
		this.picker.visible = false;
	}
}
