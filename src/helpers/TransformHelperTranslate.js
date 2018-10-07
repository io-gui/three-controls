import {OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Corner2Geometry, PlaneGeometry} from "./HelperGeometries.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.2;
const AXIS_FLIP_TRESHOLD = -0.2;

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const pickerHandleGeometry = new HelperGeometry(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), {position: [0, 0.5, 0]});

const arrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.5, 5, 2, false), {position: [0, 0.525, 0], thickness: 1}],
	[new OctahedronBufferGeometry(0.03, 2), {position: [0, 0.8, 0]}],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 2, true), {position: [0, 0.9, 0]}],
]);

const cornerGeometry = new HelperGeometry([
	[new PlaneGeometry(), {color: [1,1,1,0.125], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new Corner2Geometry(), {color: [1,1,0.25], scale: 0.2, rotation: [HPI, 0, PI]}],
]);

const handleGeometry = {
	X: new HelperGeometry(arrowGeometry, {color: [1, 0.3, 0.3], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(arrowGeometry, {color: [0.3, 1, 0.3]}),
	Z: new HelperGeometry(arrowGeometry, {color: [0.3, 0.3, 1], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(cornerGeometry, {position: [0.25, 0.25, 0], color: [1,1,0.25]}),
	YZ: new HelperGeometry(cornerGeometry, {position: [0, 0.25, 0.25], color: [0.25,1,1], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(cornerGeometry, {position: [0.25, 0, 0.25], color: [1,0.25,1], rotation: [HPI, 0, 0]}),
};

const pickerGeometry = {
	X: new HelperGeometry(pickerHandleGeometry, {color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 1, 0.3, 0.5]}),
	Z: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 0.3, 1, 0.5], rotation: [HPI, 0, 0]}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 0), {color: [0.5, 0.5, 0.5, 0.5], scale: 0.2}),
	XY: new HelperGeometry(new PlaneGeometry(), {color: [1,1,0,0.5,0.5], position: [0.25, 0.25, 0], scale: 0.5}),
	YZ: new HelperGeometry(new PlaneGeometry(), {color: [0,1,1,0.5,0.5], position: [0, 0.25, 0.25], rotation: [0, HPI, 0], scale: 0.5}),
	XZ: new HelperGeometry(new PlaneGeometry(), {color: [1,0,1,0.5,0.5], position: [0.25, 0, 0.25], rotation: [-HPI, 0, 0], scale: 0.5})
};

function stringHas(str, char) {return str.search(char) !== -1;}

export class TransformHelperTranslate extends TransformHelper {
	get isTransformHelperTranslate() { return true; }
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	constructor(props) {
		super(props);
		this.depthBias = 1;
		this.defineProperties({
			hideX: { value: false, observer: 'updateAxes' },
			hideY: { value: false, observer: 'updateAxes' },
			hideZ: { value: false, observer: 'updateAxes' },
			hideXY: { value: false, observer: 'updateAxes' },
			hideYZ: { value: false, observer: 'updateAxes' },
			hideXZ: { value: false, observer: 'updateAxes' },
			flipX: { value: false, observer: 'updateAxes' },
			flipY: { value: false, observer: 'updateAxes' },
			flipZ: { value: false, observer: 'updateAxes' }
		});
	}
	objectChanged() {
		super.objectChanged();
		this.updateAxes();
	}
	updateAxes() {
		this.animation.startAnimation(0.5);
		this.traverse(axis => {
			if (axis === this) return; // TODO: conside better loop
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
			if (stringHas(axis.name, 'X')) axis.scaleTarget.x = this.flipX ? -1 : 1;
			if (stringHas(axis.name, 'Y')) axis.scaleTarget.y = this.flipY ? -1 : 1;
			if (stringHas(axis.name, 'Z')) axis.scaleTarget.z = this.flipZ ? -1 : 1;
		});
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

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
	}
}
