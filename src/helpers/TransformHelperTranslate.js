import {
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, PlaneBufferGeometry,
	Vector3, Quaternion
} from "../../../three.js/build/three.module.js";
import {TransformHelper, Material} from "./TransformHelper.js";

// Reusable utility variables
const alignVector = new Vector3(0, 1, 0);
const identityQuaternion = new Quaternion();

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = 0;

// reusable geometry
const arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

export class TransformHelperTranslate extends TransformHelper {
	get handlesGroup() {
		return {
			X: [
				[new Mesh(arrowGeometry, new Material('red')), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
				[new Mesh(arrowGeometry, new Material('red')), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
				[new Line(lineGeometry, new Material('red'))]
			],
			Y: [
				[new Mesh(arrowGeometry, new Material('green')), [0, 1, 0], null, null, 'fwd'],
				[new Mesh(arrowGeometry, new Material('green')), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, new Material('green')), null, [0, 0, Math.PI / 2]]
			],
			Z: [
				[new Mesh(arrowGeometry, new Material('blue')), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
				[new Mesh(arrowGeometry, new Material('blue')), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, new Material('blue')), null, [0, -Math.PI / 2, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.1, 0), new Material('white', 0.25)), [0, 0, 0], [0, 0, 0]]
			],
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
		return {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new Material('white', 0.15)), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new Material('white', 0.15)), [0, 0.6, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new Material('white', 0.15)), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), new Material('white', 0.15))]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new Material('white', 0.15)), [0.2, 0.2, 0]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new Material('white', 0.15)), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new Material('white', 0.15)), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]
			]
		};
	}
	updateAxis(axis) {
		super.updateAxis(axis);
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

		axis.visible = true;
		axis.scale.set(1,1,1);

		// Hide translate and scale axis facing the camera
		if (axis.name === 'X' || axis.name === 'XYZX') {
			if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}
		if (axis.name === 'Y' || axis.name === 'XYZY') {
			if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}
		if (axis.name === 'Z' || axis.name === 'XYZZ') {
			if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}
		if (axis.name === 'XY') {
			if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}
		if (axis.name === 'YZ') {
			if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}
		if (axis.name === 'XZ') {
			if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) < PLANE_HIDE_TRESHOLD) {
				axis.visible = false;
			}
		}

		// Flip translate and scale axis ocluded behind another axis
		if (axis.name.search('X') !== -1) {
			if (alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
				if (axis.tag === 'fwd') {
					axis.visible = false;
				} else {
					axis.scale.x *= -1;
				}
			} else if (axis.tag === 'bwd') {
				axis.visible = false;
			}
		}
		if (axis.name.search('Y') !== -1) {
			if (alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
				if (axis.tag === 'fwd') {
					axis.visible = false;
				} else {
					axis.scale.y *= -1;
				}
			} else if (axis.tag === 'bwd') {
				axis.visible = false;
			}
		}
		if (axis.name.search('Z') !== -1) {
			if (alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye) < AXIS_FLIP_TRESHOLD) {
				if (axis.tag === 'fwd') {
					axis.visible = false;
				} else {
					axis.scale.z *= -1;
				}
			} else if (axis.tag === 'bwd') {
				axis.visible = false;
			}
		}
	}
}
