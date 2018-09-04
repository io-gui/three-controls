import {
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, TorusBufferGeometry,
	SphereBufferGeometry, Vector3, Matrix4, Quaternion
} from "../../../three.js/build/three.module.js";
import {AxesHelper} from "./AxesHelper.js";

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
				[new Line(CircleGeometry(1, 0.5), this.setupHelperMaterial('red', true))],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.setupHelperMaterial('red')), [0, 0, 0.99], null, [1, 3, 1]],
			],
			Y: [
				[new Line(CircleGeometry(1, 0.5), this.setupHelperMaterial('green', true)), null, [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.setupHelperMaterial('green')), [0, 0, 0.99], null, [3, 1, 1]],
			],
			Z: [
				[new Line(CircleGeometry(1, 0.5), this.setupHelperMaterial('blue', true)), null, [0, Math.PI / 2, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.04, 0), this.setupHelperMaterial('blue')), [0.99, 0, 0], null, [1, 3, 1]],
			],
			E: [
				[new Line(CircleGeometry(1.25, 1), this.setupHelperMaterial('yellow', true, 0.25)), null, [0, Math.PI / 2, 0]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.setupHelperMaterial('yellow', true, 0.25)), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.setupHelperMaterial('yellow', true, 0.25)), [-1.17, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.setupHelperMaterial('yellow', true, 0.25)), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
				[new Mesh(new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false), this.setupHelperMaterial('yellow', true, 0.25)), [0, 1.17, 0], [0, 0, 0], [1, 1, 0.001]],
			],
			XYZE: [
				[new Line(CircleGeometry(1, 1), this.setupHelperMaterial('gray', true)), null, [0, Math.PI / 2, 0]],
				[new Line(CircleGeometry(0.2, 1), this.setupHelperMaterial('gray', true)), null, [0, Math.PI / 2, 0]],
			]
		};

		const helperRotate = {
			AXIS: [
				[new Line(lineGeometry, this.setupHelperMaterial('white', false, 0.33).clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']
			]
		};

		const pickerRotate = {
			X: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), this.setupHelperMaterial('white', false, 0.15)), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [0, 0, 1]]
			],
			Y: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), this.setupHelperMaterial('white', false, 0.15)), [0, 0, 0], [Math.PI / 2, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [0, 0, 1]]
			],
			Z: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), this.setupHelperMaterial('white', false, 0.15)), [0, 0, 0], [0, 0, -Math.PI / 2]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [1, 0, 0]]
			],
			E: [
				[new Mesh(new TorusBufferGeometry(1.25, 0.03, 2, 24), this.setupHelperMaterial('white', false, 0.15))],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [-1.25, 0, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [0, 1.25, 0]],
				[new Mesh(new OctahedronBufferGeometry(0.2, 0), this.setupHelperMaterial('white', false, 0.15)), [0, -1.25, 0]]
			],
			XYZE: [
				[new Mesh(new SphereBufferGeometry(0.22, 10, 3), this.setupHelperMaterial('white', false, 0.15))]
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
