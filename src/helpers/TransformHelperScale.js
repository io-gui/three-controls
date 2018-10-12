import {OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {PlaneGeometry, colors} from "./HelperGeometries.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;

const scaleArrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.5, 5, 1, true), {position: [0, 0.5, 0], thickness: 1}],
	[new OctahedronBufferGeometry(0.05, 2), {position: [0, 0.8, 0]}],
]);

const scaleUniformArrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.1, 5, 1, true), {position: [0, 0.9, 0], thickness: 1}],
	[new OctahedronBufferGeometry(0.05, 2), {position: [0, 1, 0]}],
]);

const scaleCornerGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.05, 2)],
	[new PlaneGeometry(), {color: colors['whiteTransparent'], position: [0, -0.1, 0], scale: [0.1, 0.2, 0.1], outlineThickness: 0}],
	[new PlaneGeometry(), {color: colors['whiteTransparent'], position: [-0.1, 0, 0], scale: [0.2, 0.1, 0.1], outlineThickness: 0}],
]);

const scalePickerGeometry = new HelperGeometry(new CylinderBufferGeometry(0.15, 0, 0.8, 4, 1, true), {color: colors['whiteTransparent'], position: [0, 0.5, 0]});

const scaleCornerPickerGeometry = new HelperGeometry(new OctahedronBufferGeometry(0.2, 0), {color: colors['whiteTransparent']});

const handleGeometry = {
	X: new HelperGeometry(scaleArrowGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(scaleArrowGeometry, {color: colors['green']}),
	Z: new HelperGeometry(scaleArrowGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry([
		[scaleCornerGeometry, {position: [0.8, 0.8, 0], color: colors['yellow']}],
	]),
	YZ: new HelperGeometry([
		[scaleCornerGeometry, {position: [0, 0.8, 0.8], color: colors['cyan'], rotation: [0, -HPI, 0]}],
	]),
	XZ: new HelperGeometry([
		[scaleCornerGeometry, {position: [0.8, 0, 0.8], color: colors['magenta'], rotation: [HPI, 0, 0]}],
	]),
	XYZ: new HelperGeometry([
		[scaleUniformArrowGeometry, {color: colors['gray'], rotation: [0, 0, -HPI]}],
		[scaleUniformArrowGeometry, {color: colors['gray']}],
		[scaleUniformArrowGeometry, {color: colors['gray'], rotation: [HPI, 0, 0]}],
	]),
};

const pickerGeometry = {
	X: new HelperGeometry(scalePickerGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(scalePickerGeometry, {color: colors['green']}),
	Z: new HelperGeometry(scalePickerGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(scaleCornerPickerGeometry, {color: colors['yellow'], position: [0.75, 0.75, 0]}),
	YZ: new HelperGeometry(scaleCornerPickerGeometry, {color: colors['cyan'], position: [0, 0.75, 0.75], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(scaleCornerPickerGeometry, {color: colors['magenta'], position: [0.75, 0, 0.75], rotation: [HPI, 0, 0]}),
	XYZ: new HelperGeometry([
		[new OctahedronBufferGeometry(0.1, 1), {color: colors['whiteTransparent'], position: [1, 0, 0]}],
		[new OctahedronBufferGeometry(0.1, 1), {color: colors['whiteTransparent'], position: [0, 1, 0]}],
		[new OctahedronBufferGeometry(0.1, 1), {color: colors['whiteTransparent'], position: [0, 0, 1]}],
	]),
};

export class TransformHelperScale extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	paramChanged() {
		super.paramChanged();
		this.traverseAxis(axis => {
			// Hide per-axis scale in world mode
			if ((axis.name == 'X' || axis.name == 'Y' || axis.name == 'Z') && this.space === 'world') axis.hidden = true;
			if ((axis.name == 'XY' || axis.name == 'YZ' || axis.name == 'XZ') && this.space === 'world') axis.hidden = true;
		});
	}
}
