import {
	MeshBasicMaterial, DoubleSide, LineBasicMaterial,
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, TorusBufferGeometry,
	SphereBufferGeometry, Vector3, Matrix4, Quaternion, Color
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
const tempVector = new Vector3(0, 0, 0);
const alignVector = new Vector3(0, 1, 0);
const zeroVector = new Vector3(0, 0, 0);
const lookAtMatrix = new Matrix4();
const tempQuaternion = new Quaternion();
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

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

function CircleGeometry(radius, arc) {
	const geometry = new BufferGeometry();
	const vertices = [];
	for (let i = 0; i <= 64 * arc; ++i) {
		vertices.push(0, Math.cos(i / 32 * Math.PI) * radius, Math.sin(i / 32 * Math.PI) * radius);
	}
	geometry.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	return geometry;
}

export class AxesRotateHelper extends AxesHelper {
	init() {
		const gizmoRotate = {
			X: [
				[new Line(CircleGeometry(1, 0.5), matLineRed)],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matRed), [0, 0, 0.99], null, [1, 3, 1]],
			],
			Y: [
				[new Line(CircleGeometry(1, 0.5), matLineGreen), null, [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matGreen), [0, 0, 0.99], null, [3, 1, 1]],
			],
			Z: [
				[new Line(CircleGeometry(1, 0.5), matLineBlue), null, [0, Math.PI / 2, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), matBlue), [0.99, 0, 0], null, [1, 3, 1]],
			],
			E: [
				[new Line(CircleGeometry(1.25, 1), matLineYellowTransparent), null, [0, Math.PI / 2, 0]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [-1.17, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent), [0, 1.17, 0], [0, 0, 0], [1, 1, 0.001]],
			],
			XYZE: [
				[new Line(CircleGeometry(1, 1), matLineGray), null, [0, Math.PI / 2, 0]],
				[new Line(CircleGeometry(0.2, 1), matLineGray), null, [0, Math.PI / 2, 0]],
			]
		};

		const helperRotate = {
			AXIS: [
				[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			]
		};

		const pickerRotate = {
			X: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 0, 1]]
			],
			Y: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 0, 1]]
			],
			Z: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [1, 0, 0]]
			],
			E: [
				[new Mesh(new TorusBufferGeometry(1.25, 0.03, 2, 24), matInvisible)],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [-1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, 1.25, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), matInvisible), [0, -1.25, 0]]
			],
			XYZE: [
				[new Mesh(new SphereBufferGeometry(0.22, 10, 3), matInvisible)]
			]
		};

		this.add(this.gizmo = this.setupHelper(gizmoRotate));
		this.add(this.picker = this.setupHelper(pickerRotate));
		this.add(this.helper = this.setupHelper(helperRotate));
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

		// highlight selected axis
		this.traverse(handle => {

			// Align handles to current local or world rotation
			handle.quaternion.copy(identityQuaternion);

			// Align handles to current local or world rotation
			tempQuaternion.copy(quaternion).inverse();
			alignVector.copy(this.eye).applyQuaternion(tempQuaternion);
			tempVector.copy(unitY).applyQuaternion(tempQuaternion);

			if (handle.name.search("E") !== - 1) {
				handle.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(alignVector, zeroVector, tempVector));
			}
			if (handle.name === 'X') {
				tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
				tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
				handle.quaternion.copy(tempQuaternion);
			}
			if (handle.name === 'Y') {
				tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
				tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
				handle.quaternion.copy(tempQuaternion);
			}
			if (handle.name === 'Z') {
				tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
				tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
				handle.quaternion.copy(tempQuaternion);
			}

			if (handle !== this) {
				handle.visible = true;
				handle.scale.set(1,1,1);
			} else {
				handle.quaternion.copy(this.worldQuaternion);
			}
		});
		this.highlightAxis(this.axis);
		this.picker.visible = false;
	}
}
