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

const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position
function TranslateHelperGeometry() {
	const geometry = new BufferGeometry();
	geometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3));
	return geometry;
}

export class AxesTranslateOffsetHelper extends AxesHelper {
	get handlesGroup() {
		return {
			X: [
				[new Line(lineGeometry, new AxisMaterial('white')), [-1e3, 0, 0], null, [1e6, 1, 1]]
			],
			Y: [
				[new Line(lineGeometry, new AxisMaterial('white')), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1]]
			],
			Z: [
				[new Line(lineGeometry, new AxisMaterial('white')), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1]]
			],
			START: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), new AxisMaterial('white', false, 0.33)), null, null, null]
			],
			END: [
				[new Mesh(new OctahedronBufferGeometry(0.01, 2), new AxisMaterial('white', false, 0.33)), null, null, null]
			],
			DELTA: [
				[new Line(TranslateHelperGeometry(), new AxisMaterial('white', false, 0.33)), null, null, null]
			]
		};
	}
	constructor(target, camera) {
		super(target, camera);
		this.worldPositionStart = new Vector3();
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

		this.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);
		this.matrixWorld.compose(this.worldPositionStart, this.worldQuaternion, this.worldScale);

		// highlight selected axis
		this.traverse(handle => {

			// Hide translate and scale axis facing the camera
			const AXIS_HIDE_TRESHOLD = 0.99;
			const PLANE_HIDE_TRESHOLD = 0.2;
			const AXIS_FLIP_TRESHOLD = -0.4;

			if (handle !== this) {
				handle.visible = !!this.axis;
				handle.scale.set(1,1,1);
			}

			if (handle.name === 'X') {
				if (Math.abs(alignVector.copy(unitX).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'Y') {
				if (Math.abs(alignVector.copy(unitY).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}
			if (handle.name === 'Z') {
				if (Math.abs(alignVector.copy(unitZ).applyQuaternion(quaternion).dot(this.eye)) > AXIS_HIDE_TRESHOLD) {
					handle.visible = false;
				}
			}

			this.highlightAxis(handle, this.axis);
		});
	}
}
