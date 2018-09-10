import {TransformHelper} from "./TransformHelper.js";
import {ArrowGeometry, Corner2Geometry, OctahedronGeometry, PickerHandleGeometry, PlaneGeometry} from "./HelperGeometries.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = -0.2;

const arrowGeometry = new ArrowGeometry();
const corner2Geometry = new Corner2Geometry();
const octahedronGeometry = new OctahedronGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const planeGeometry = new PlaneGeometry();

function stringHas(str, char) {return str.search(char) !== -1;};

export class TransformHelperTranslate extends TransformHelper {
	constructor(props) {
		super(props);
		this.defineProperties({
			hideX: false,
			hideY: false,
			hideZ: false,
			hideXY: false,
			hideYZ: false,
			hideXZ: false,
			flipX: false,
			flipY: false,
			flipZ: false
		})
		this.traverse(child => {
			child.renderOrder = 200;
		});
	}
	hideXChanged() { this.updateHidden(); }
	hideYChanged() { this.updateHidden(); }
	hideZChanged() { this.updateHidden(); }
	hideXYChanged() { this.updateHidden(); }
	hideYZChanged() { this.updateHidden(); }
	hideXZChanged() { this.updateHidden(); }
	flipXChanged() { this.updateHidden(); }
	flipYChanged() { this.updateHidden(); }
	flipZChanged() { this.updateHidden(); }
	updateHidden() {
		this.animation.startAnimation(4);
		this.updateAxis();
	}
	get handlesGroup() {
		return {
			X: [{geometry: arrowGeometry, color: [1, 0.3, 0.3], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: arrowGeometry, color: [0.3, 1, 0.3]}],
			Z: [{geometry: arrowGeometry, color: [0.3, 0.3, 1], rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [
				{geometry: octahedronGeometry, color: [1, 1, 1], scale: 0.1}
			],
			XY: [
				{geometry: planeGeometry, color: [1,1,0,0.5], position: [0.15, 0.15, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,1,0.3], position: [0.3, 0.3, 0], scale: 0.15, rotation: [Math.PI / 2, 0, Math.PI]}
			],
			YZ: [
				{geometry: planeGeometry, color: [0,1,1,0.5], position: [0, 0.15, 0.15], rotation: [0, Math.PI / 2, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [0.3,1,1], position: [0, 0.3, 0.3], scale: 0.15, rotation: [0, Math.PI, -Math.PI / 2]}
			],
			XZ: [
				{geometry: planeGeometry, color: [1,0,1,0.5], position: [0.15, 0, 0.15], rotation: [-Math.PI / 2, 0, 0], scale: 0.3},
				{geometry: corner2Geometry, color: [1,0.3,1], position: [0.3, 0, 0.3], scale: 0.15, rotation: [0, Math.PI, 0]}
			]
		};
	}
	get pickersGroup() {
		return {
			X: [{geometry: pickerHandleGeometry, color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: pickerHandleGeometry, color: [0.3, 1, 0.3, 0.5]}],
			Z: [{geometry: pickerHandleGeometry, color: [0.3, 0.3, 1, 0.5], rotation: [Math.PI / 2, 0, 0]}],
			XYZ: [{geometry: octahedronGeometry, color: [0.5, 0.5, 0.5, 0.5], scale: 0.2}],
			XY: [{ geometry: planeGeometry, color: [1,1,0,0.5,0.5], position: [0.25, 0.25, 0], scale: 0.5}],
			YZ: [{ geometry: planeGeometry, color: [0,1,1,0.5,0.5], position: [0, 0.25, 0.25], rotation: [0, Math.PI / 2, 0], scale: 0.5}],
			XZ: [{ geometry: planeGeometry, color: [1,0,1,0.5,0.5], position: [0.25, 0, 0.25], rotation: [-Math.PI / 2, 0, 0], scale: 0.5}]
		};
	}
	updateAxis() {
		this.traverse(axis => {
			if (axis !== this) { // TODO: conside better loop

				axis.hidden = false;
				if (stringHas(axis.name, "X") && !this.showX) axis.hidden = true;
				if (stringHas(axis.name, "Y") && !this.showY) axis.hidden = true;
				if (stringHas(axis.name, "Z") && !this.showZ) axis.hidden = true;
				if (stringHas(axis.name, "E") && (!this.showX || !this.showY || !this.showZ)) axis.hidden = true;

				// Hide axis facing the camera
				if ((axis.name == 'X' || axis.name == 'XYZX') && this.hideX) axis.hidden = true;
				if ((axis.name == 'Y' || axis.name == 'XYZY') && this.hideY) axis.hidden = true;
				if ((axis.name == 'Z' || axis.name == 'XYZZ') && this.hideZ) axis.hidden = true;
				if (axis.name == 'XY' && this.hideXY) axis.hidden = true;
				if (axis.name == 'YZ' && this.hideYZ) axis.hidden = true;
				if (axis.name == 'XZ' && this.hideXZ) axis.hidden = true;

				// Flip axis
				if (stringHas(axis.name, 'X')) axis.flipX = this.flipX ? -1 : 1;
				if (stringHas(axis.name, 'Y')) axis.flipY = this.flipY ? -1 : 1;
				if (stringHas(axis.name, 'Z')) axis.flipZ = this.flipZ ? -1 : 1;
			}
		});
	}
	// TODO: optimize!
	updateAxisMaterial(axis) {
		super.updateAxisMaterial(axis);
		if (axis.flipX) axis.scale.x = (axis.scale.x * 5 + axis.flipX ) / 6;
		if (axis.flipY) axis.scale.y = (axis.scale.y * 5 + axis.flipY ) / 6;
		if (axis.flipZ) axis.scale.z = (axis.scale.z * 5 + axis.flipZ ) / 6;
	}
	updateHelperMatrix() {
		const xDotE = this.axisDotEye.x;
		const yDotE = this.axisDotEye.y;
		const zDotE = this.axisDotEye.z;

		// Hide axis facing the camera
		if (!this.active) { // skip while controls are active
			this.hideX = Math.abs(xDotE) > AXIS_HIDE_TRESHOLD;
			this.hideY = Math.abs(yDotE) > AXIS_HIDE_TRESHOLD;
			this.hideZ = Math.abs(zDotE) > AXIS_HIDE_TRESHOLD;
			this.hideXY = Math.abs(zDotE) < PLANE_HIDE_TRESHOLD;
			this.hideYZ = Math.abs(xDotE) < PLANE_HIDE_TRESHOLD;
			this.hideXZ = Math.abs(yDotE) < PLANE_HIDE_TRESHOLD;
			this.flipX = xDotE < AXIS_FLIP_TRESHOLD;
			this.flipY = yDotE < AXIS_FLIP_TRESHOLD;
			this.flipZ = zDotE < AXIS_FLIP_TRESHOLD;
		}

		super.updateHelperMatrix();


	}
}
