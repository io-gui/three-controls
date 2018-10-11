import {OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Corner2Geometry, PlaneGeometry, colors} from "./HelperGeometries.js";

const AXIS_HIDE_TRESHOLD = 0.99;
const PLANE_HIDE_TRESHOLD = 0.1;
const AXIS_FLIP_TRESHOLD = 0;

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const coneGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const translateArrowGeometry = new HelperGeometry([
	[coneGeometry, {position: [0, 0.8, 0]}],
	[new CylinderBufferGeometry(EPS, EPS, 0.5, 5, 1, true), {position: [0, 0.525, 0], thickness: 1}],
]);

const translateCornerGeometry = new HelperGeometry([
	[new PlaneGeometry(), {color: colors['whiteTransparent'], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new Corner2Geometry(), {color: [1,1,0.25], scale: 0.2, rotation: [HPI, 0, PI]}],
]);

const translatePickerGeometry = new HelperGeometry(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, true), {color: colors['whiteTransparent'], position: [0, 0.5, 0]});

const cornerPickerGeometry = new HelperGeometry(new PlaneGeometry(), {color: colors['whiteTransparent'], scale: 0.3, outlineThickness: 0});

const handleGeometry = {
	X: new HelperGeometry(translateArrowGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(translateArrowGeometry, {color: colors['green']}),
	Z: new HelperGeometry(translateArrowGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(translateCornerGeometry, {position: [0.25, 0.25, 0], color: colors['yellow']}),
	YZ: new HelperGeometry(translateCornerGeometry, {position: [0, 0.25, 0.25], color: colors['cyan'], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(translateCornerGeometry, {position: [0.25, 0, 0.25], color: colors['magenta'], rotation: [HPI, 0, 0]}),
};

const pickerGeometry = {
	X: new HelperGeometry(translatePickerGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(translatePickerGeometry, {color: colors['green']}),
	Z: new HelperGeometry(translatePickerGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(cornerPickerGeometry, {color: colors['yellow'], position: [0.15, 0.15, 0]}),
	YZ: new HelperGeometry(cornerPickerGeometry, {color: colors['cyan'], position: [0, 0.15, 0.15], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(cornerPickerGeometry, {color: colors['magenta'], position: [0.15, 0, 0.15], rotation: [HPI, 0, 0]}),
	XYZ: new HelperGeometry(new OctahedronBufferGeometry(1, 0), {color: colors['whiteTransparent'], scale: 0.2}),
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
			hideX: { value: false, observer: 'paramChanged' },
			hideY: { value: false, observer: 'paramChanged' },
			hideZ: { value: false, observer: 'paramChanged' },
			hideXY: { value: false, observer: 'paramChanged' },
			hideYZ: { value: false, observer: 'paramChanged' },
			hideXZ: { value: false, observer: 'paramChanged' },
			flipX: { value: false, observer: 'paramChanged' },
			flipY: { value: false, observer: 'paramChanged' },
			flipZ: { value: false, observer: 'paramChanged' }
		});
	}
	objectChanged() {
		super.objectChanged();
		this.paramChanged();
	}
	paramChanged() {
		super.paramChanged();
		this.traverseAxis(axis => {
			// Hide axis facing the camera
			if ((axis.name == 'X' || axis.name == 'XYZ') && this.hideX) axis.hidden = true;
			if ((axis.name == 'Y' || axis.name == 'XYZ') && this.hideY) axis.hidden = true;
			if ((axis.name == 'Z' || axis.name == 'XYZ') && this.hideZ) axis.hidden = true;
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
