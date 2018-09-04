import {
	MeshBasicMaterial, DoubleSide, LineBasicMaterial,
	CylinderBufferGeometry, BoxBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, Vector3, Color
} from "../../../three.js/build/three.module.js";
import {AxesHelper} from "./AxesHelper.js";

// shared materials
const gizmoMaterial = new MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
});

const gizmoLineMaterial = new LineBasicMaterial({
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
});

// const variables
const red = new Color(0xff0000);
const green = new Color(0x00ff00);
const blue = new Color(0x0000ff);
const yellow = new Color(0xffff00);
const cyan = new Color(0x00ffff);
const magenta = new Color(0xff00ff);
const white = new Color(0xffffff);
const gray = new Color(0x787878);

// Reusable utility variables
const alignVector = new Vector3(0, 1, 0);

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

// Make unique material for each axis/color
const matInvisible = gizmoMaterial.clone();
matInvisible.opacity = 0.15;

const matHelper = gizmoMaterial.clone();
matHelper.opacity = 0.33;

const matRed = gizmoMaterial.clone();
matRed.color.copy(red);

const matGreen = gizmoMaterial.clone();
matGreen.color.copy(green);

const matBlue = gizmoMaterial.clone();
matBlue.color.copy(blue);

const matWhiteTransperent = gizmoMaterial.clone();
matWhiteTransperent.opacity = 0.25;

const matYellowTransparent = matWhiteTransperent.clone();
matYellowTransparent.color.copy(yellow);

const matCyanTransparent = matWhiteTransperent.clone();
matCyanTransparent.color.copy(cyan);

const matMagentaTransparent = matWhiteTransperent.clone();
matMagentaTransparent.color.copy(magenta);

const matYellow = gizmoMaterial.clone();
matYellow.color.copy(yellow);

const matLineRed = gizmoLineMaterial.clone();
matLineRed.color.copy(red);

const matLineGreen = gizmoLineMaterial.clone();
matLineGreen.color.copy(green);

const matLineBlue = gizmoLineMaterial.clone();
matLineBlue.color.copy(blue);

const matLineCyan = gizmoLineMaterial.clone();
matLineCyan.color.copy(cyan);

const matLineMagenta = gizmoLineMaterial.clone();
matLineMagenta.color.copy(magenta);

const matLineYellow = gizmoLineMaterial.clone();
matLineYellow.color.copy(yellow);

const matLineGray = gizmoLineMaterial.clone();
matLineGray.color.copy(gray);

const matLineYellowTransparent = matLineYellow.clone();
matLineYellowTransparent.opacity = 0.25;

// reusable geometry

const scaleHandleGeometry = new BoxBufferGeometry(0.125, 0.125, 0.125);

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

export class AxesScaleHelper extends AxesHelper {
	init() {
		const gizmoScale = {
			X: [
				[new Mesh(scaleHandleGeometry, matRed), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
				[new Line(lineGeometry, matLineRed), null, null, [0.8, 1, 1]]
			],
			Y: [
				[new Mesh(scaleHandleGeometry, matGreen), [0, 0.8, 0]],
				[new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2], [0.8, 1, 1]]
			],
			Z: [
				[new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]]
			],
			XY: [
				[new Mesh(scaleHandleGeometry, matYellowTransparent), [0.85, 0.85, 0], null, [2, 2, 0.2]],
				[new Line(lineGeometry, matLineYellow), [0.855, 0.98, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineYellow), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(scaleHandleGeometry, matCyanTransparent), [0, 0.85, 0.85], null, [0.2, 2, 2]],
				[new Line(lineGeometry, matLineCyan), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, matLineCyan), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(scaleHandleGeometry, matMagentaTransparent), [0.85, 0, 0.85], null, [2, 0.2, 2]],
				[new Line(lineGeometry, matLineMagenta), [0.855, 0, 0.98], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineMagenta), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XYZX: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(new BoxBufferGeometry(0.125, 0.125, 0.125), matWhiteTransperent), [0, 0, 1.1]],
			]
		};

		const pickerScale = {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0.5, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0.5, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0, 0.5], [Math.PI / 2, 0, 0]]
			],
			XY: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0.85, 0], null, [3, 3, 0.2]],
			],
			YZ: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0, 0.85, 0.85], null, [0.2, 3, 3]],
			],
			XZ: [
				[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0, 0.85], null, [3, 0.2, 3]],
			],
			XYZX: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [1.1, 0, 0]],
			],
			XYZY: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [0, 1.1, 0]],
			],
			XYZZ: [
				[new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 1.1]],
			]
		};

		const helperScale = {
			X: [
				[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			],
			Y: [
				[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']
			],
			Z: [
				[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']
			]
		};

		this.add(this.gizmo = this.setupHelper(gizmoScale));
		this.add(this.picker = this.setupHelper(pickerScale));
		this.add(this.helper = this.setupHelper(helperScale));
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
		});
		this.highlightAxis(this.axis);
		this.picker.visible = false;
	}
}
