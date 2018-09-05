import {
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, PlaneBufferGeometry,
	Vector3, Quaternion
} from "../../../three.js/build/three.module.js";
import {AxesHelper, AxisMaterial} from "./AxesHelper.js";

// Reusable utility variables
const alignVector = new Vector3(0, 1, 0);
const identityQuaternion = new Quaternion();

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

// reusable geometry
const arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

export class AxesTranslateHelper extends AxesHelper {
	get handlesGroup() {
		return {
			X: [
				[new Mesh(arrowGeometry, new AxisMaterial('red')), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
				[new Mesh(arrowGeometry, new AxisMaterial('red')), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
				[new Line(lineGeometry, new AxisMaterial('red'))]
			],
			Y: [
				[new Mesh(arrowGeometry, new AxisMaterial('green')), [0, 1, 0], null, null, 'fwd'],
				[new Mesh(arrowGeometry, new AxisMaterial('green')), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, new AxisMaterial('green')), null, [0, 0, Math.PI / 2]]
			],
			Z: [
				[new Mesh(arrowGeometry, new AxisMaterial('blue')), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
				[new Mesh(arrowGeometry, new AxisMaterial('blue')), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, new AxisMaterial('blue')), null, [0, -Math.PI / 2, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.1, 0), new AxisMaterial('white', 0.25)), [0, 0, 0], [0, 0, 0]]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new AxisMaterial('yellow', 0.25)), [0.15, 0.15, 0]],
				[new Line(lineGeometry, new AxisMaterial('yellow')), [0.18, 0.3, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, new AxisMaterial('yellow')), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new AxisMaterial('cyan', 0.25)), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
				[new Line(lineGeometry, new AxisMaterial('cyan')), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, new AxisMaterial('cyan')), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), new AxisMaterial('magenta', 0.25)), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, new AxisMaterial('magenta')), [0.18, 0, 0.3], null, [0.125, 1, 1]],
				[new Line(lineGeometry, new AxisMaterial('magenta')), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			]
		};
	}
	get pickersGroup() {
		return {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new AxisMaterial('white', 0.15)), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new AxisMaterial('white', 0.15)), [0, 0.6, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), new AxisMaterial('white', 0.15)), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), new AxisMaterial('white', 0.15))]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new AxisMaterial('white', 0.15)), [0.2, 0.2, 0]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new AxisMaterial('white', 0.15)), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), new AxisMaterial('white', 0.15)), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]
			]
		};
	}
	updateHelperMatrix() {
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

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
		super.updateHelperMatrix();
	}
}
