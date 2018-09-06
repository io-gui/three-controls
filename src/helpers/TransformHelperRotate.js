import {
	CylinderBufferGeometry, BufferGeometry, Float32BufferAttribute,
	Mesh, Line, OctahedronBufferGeometry, TorusBufferGeometry,
	SphereBufferGeometry, Vector3, Matrix4, Quaternion, Euler
} from "../../../three.js/build/three.module.js";
import {TransformHelper, Material} from "./TransformHelper.js";

// Reusable utility variables
const tempVector = new Vector3(0, 0, 0);
const alignVector = new Vector3(0, 1, 0);
const zeroVector = new Vector3(0, 0, 0);
const lookAtMatrix = new Matrix4();
const tempQuaternion = new Quaternion();
const identityQuaternion = new Quaternion();
const tempEuler = new Euler(0, 0, 0);

const unitX = new Vector3(1, 0, 0);
const unitY = new Vector3(0, 1, 0);
const unitZ = new Vector3(0, 0, 1);

// Custom CircleGeometry for lines
function CircleGeometry(radius, segments, thetaStart, thetaLength) {
	const geometry = new BufferGeometry();
	const vertices = [];
	for (let i = 0; i <= segments * 1; ++i) {
		let step = i / segments * thetaLength + thetaStart;
		vertices.push(0, Math.cos(step) * radius, Math.sin(step) * radius);
	}
	geometry.addAttribute('position', new Float32BufferAttribute(vertices, 3));
	return geometry;
}

export class TransformHelperRotate extends TransformHelper {
	get handlesGroup() {
		const circleGeo = CircleGeometry(1, 64, 0, Math.PI * 2);
		const halfCircleGeo = CircleGeometry(1, 32, 0, Math.PI);
		const arrowGeo = new CylinderBufferGeometry(0.03, 0, 0.15, 4, 1, false);
		const axisHandleGeo = new OctahedronBufferGeometry(0.04, 0);
		return {
			X: [
				[new Line(halfCircleGeo, new Material('red'))],
				[new Mesh(axisHandleGeo, new Material('red')), [0, 0, 0.99], null, [1, 3, 1]],
			],
			Y: [
				[new Line(halfCircleGeo, new Material('green')), null, [0, 0, -Math.PI / 2]],
				[new Mesh(axisHandleGeo, new Material('green')), [0, 0, 0.99], null, [3, 1, 1]],
			],
			Z: [
				[new Line(halfCircleGeo, new Material('blue')), null, [0, Math.PI / 2, 0]],
				[new Mesh(axisHandleGeo, new Material('blue')), [0.99, 0, 0], null, [1, 3, 1]],
			],
			E: [
				[new Line(circleGeo, new Material('yellow', 0.25)), null, [0, Math.PI / 2, 0], [1.25, 1.25, 1.25]],
				[new Mesh(arrowGeo, new Material('yellow', 0.25)), [1.17, 0, 0], [0, 0, -Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(arrowGeo, new Material('yellow', 0.25)), [-1.17, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.001]],
				[new Mesh(arrowGeo, new Material('yellow', 0.25)), [0, -1.17, 0], [Math.PI, 0, 0], [1, 1, 0.001]],
				[new Mesh(arrowGeo, new Material('yellow', 0.25)), [0, 1.17, 0], [0, 0, 0], [1, 1, 0.001]],
			],
			XYZ: [
				[new Line(circleGeo, new Material('gray')), null, [0, Math.PI / 2, 0]],
				[new Line(circleGeo, new Material('gray')), null, [0, Math.PI / 2, 0], [0.25, 0.25, 0.25]],
			]
		};
	}
	get pickersGroup() {
		const diamondGeo = new OctahedronBufferGeometry(0.2, 0);
		return {
			X: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), new Material('white', 0.15)), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [0, 0, 1]]
			],
			Y: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), new Material('white', 0.15)), [0, 0, 0], [Math.PI / 2, 0, 0]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [0, 0, 1]]
			],
			Z: [
				[new Mesh(new TorusBufferGeometry(1, 0.03, 4, 24, Math.PI), new Material('white', 0.15)), [0, 0, 0], [0, 0, -Math.PI / 2]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [1, 0, 0]]
			],
			E: [
				[new Mesh(new TorusBufferGeometry(1.25, 0.03, 2, 24), new Material('white', 0.15))],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [1.25, 0, 0]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [-1.25, 0, 0]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [0, 1.25, 0]],
				[new Mesh(diamondGeo, new Material('white', 0.15)), [0, -1.25, 0]]
			],
			XYZ: [[new Mesh(new SphereBufferGeometry(0.33, 10, 3), new Material('white', 0.15))]]
		};
	}
	updateAxis(axis){
		super.updateAxis(axis);
		axis.quaternion.copy(identityQuaternion);
		if (axis.has("E") || axis.has("XYZ")) {
			axis.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(alignVector, zeroVector, tempVector));
		}
		if (axis.is('X')) {
			tempQuaternion.setFromAxisAngle(unitX, Math.atan2(-alignVector.y, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.is('Y')) {
			tempQuaternion.setFromAxisAngle(unitY, Math.atan2(alignVector.x, alignVector.z));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
		if (axis.is('Z')) {
			tempQuaternion.setFromAxisAngle(unitZ, Math.atan2(alignVector.y, alignVector.x));
			tempQuaternion.multiplyQuaternions(identityQuaternion, tempQuaternion);
			axis.quaternion.copy(tempQuaternion);
		}
	}
	updateHelperMatrix() {
		// TODO: simplify rotation handle logic
		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;
		// Align handles to current local or world rotation
		tempQuaternion.copy(quaternion).inverse();
		alignVector.copy(this.eye).applyQuaternion(tempQuaternion);
		tempVector.copy(unitY).applyQuaternion(tempQuaternion);
		super.updateHelperMatrix();
	}
}
