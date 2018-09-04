import {
	MeshBasicMaterial, DoubleSide, LineBasicMaterial,
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, PlaneBufferGeometry,
	Vector3, Quaternion, Color
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
const identityQuaternion = new Quaternion();

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

const arrowGeometry = new CylinderBufferGeometry(0, 0.05, 0.2, 12, 1, false);

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position
function TranslateHelperGeometry() {
	const geometry = new BufferGeometry();
	geometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
	return geometry;
}

export class AxesTranslateHelper extends AxesHelper {
	init() {
		const gizmoTranslate = {
			X: [
				[new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
				[new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
				[new Line(lineGeometry, matLineRed)]
			],
			Y: [
				[new Mesh(arrowGeometry, matGreen), [0, 1, 0], null, null, 'fwd'],
				[new Mesh(arrowGeometry, matGreen), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2]]
			],
			Z: [
				[new Mesh(arrowGeometry, matBlue), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
				[new Mesh(arrowGeometry, matBlue), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
				[new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.1, 0), matWhiteTransperent), [0, 0, 0], [0, 0, 0]]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matYellowTransparent), [0.15, 0.15, 0]],
				[new Line(lineGeometry, matLineYellow), [0.18, 0.3, 0], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineYellow), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matCyanTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
				[new Line(lineGeometry, matLineCyan), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
				[new Line(lineGeometry, matLineCyan), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.295, 0.295), matMagentaTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]],
				[new Line(lineGeometry, matLineMagenta), [0.18, 0, 0.3], null, [0.125, 1, 1]],
				[new Line(lineGeometry, matLineMagenta), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]]
			]
		};

		const pickerTranslate = {
			X: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
			],
			Y: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0.6, 0]]
			],
			Z: [
				[new Mesh(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
			],
			XYZ: [
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible)]
			],
			XY: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0.2, 0.2, 0]]
			],
			YZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]
			],
			XZ: [
				[new Mesh(new PlaneBufferGeometry(0.4, 0.4), matInvisible), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]
			]
		};

		const helperTranslate = {
			START: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), matHelper), null, null, null, 'helper']
			],
			END: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), matHelper), null, null, null, 'helper']
			],
			DELTA: [
				[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']
			],
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

		this.add(this.gizmo = this.setupHelper(gizmoTranslate));
		this.add(this.picker = this.setupHelper(pickerTranslate));
		this.add(this.helper = this.setupHelper(helperTranslate));
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

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
		});
		this.highlightAxis(this.axis);
		this.picker.visible = false;
	}
}
