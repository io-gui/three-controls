import {TorusBufferGeometry, OctahedronBufferGeometry, CylinderBufferGeometry, PlaneBufferGeometry} from "../../../../three.js/src/Three.js";
import {HelperGeometry, colors} from "../HelperGeometry.js";
import {TransformHelper} from "../Transform.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const QPI = HPI / 2;
const EPS = 0.000001;

const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1);

const coneGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const translateArrowGeometry = new HelperGeometry([
	[coneGeometry, {position: [0, 0.7, 0]}],
	[new CylinderBufferGeometry(EPS, EPS, 0.45, 5, 1, true), {position: [0, 0.5, 0], thickness: 1}],
]);

const scaleArrowGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2), {position: [0, 0.9, 0]}],
	[new CylinderBufferGeometry(EPS, EPS, 0.65, 5, 1, true), {position: [0, 0.6, 0], thickness: 1}],
]);

const scaleUniformArrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.2, 5, 1, true), {position: [0, -0.13, 0], thickness: 1}],
	[new OctahedronBufferGeometry(0.04, 2)],
]);

const translateCornerGeometry = new HelperGeometry([
	[planeGeometry, {color: colors['whiteTransparent'], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new CylinderBufferGeometry(EPS, EPS, 0.2, 4, 2, true), {position: [0, -0.1, 0], rotation: [0, 0, 0], thickness: 1}],
	[new CylinderBufferGeometry(EPS, EPS, 0.2, 4, 2, true), {position: [-0.1, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
]);

const scaleCornerGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[planeGeometry, {color: colors['whiteTransparent'], position: [0, -0.06, 0], scale: [0.06, 0.1, 0.06], outlineThickness: 0}],
	[planeGeometry, {color: colors['whiteTransparent'], position: [-0.06, 0, 0], scale: [0.1, 0.06, 0.06], outlineThickness: 0}],
]);

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 6, HPI/2 ), {thickness: 1, rotation: [0, 0, HPI - HPI/4]}],
	[new TorusBufferGeometry( 0.96, 0.04, 2, 2, HPI/2/3 ), {color: [1, 1, 1, 0.25], rotation: [0, 0, HPI - HPI/4/3], scale: [1, 1, 0.01], outlineThickness: 0}],
	[coneGeometry, {position: [0.37, 0.93, 0], rotation: [0, 0, -2.035], scale: 0.75}],
	[coneGeometry, {position: [-0.37, 0.93, 0], rotation: [0, 0, 2.035], scale: 0.75}],
]);

const translatePickerGeometry = new HelperGeometry(new CylinderBufferGeometry(0.15, 0, 0.6, 4, 1, true), {color: colors['whiteTransparent'], position: [0, 0.5, 0]});

const scalePickerGeometry = new HelperGeometry(new OctahedronBufferGeometry(0.1, 0), {color: colors['whiteTransparent']});

const rotatePickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 4, 4, HPI/1.5 ), {color: colors['whiteTransparent'], rotation: [0, 0, HPI - HPI/3]});

const cornerPickerGeometry = new HelperGeometry(planeGeometry, {color: colors['whiteTransparent'], scale: 0.3, outlineThickness: 0});

const translateGuideGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 25, 5, 1, true), {thickness: 1, outlineThickness: 0}],
]);

const rotateGuideGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 64 ), {thickness: 1, outlineThickness: 0}],
	[new CylinderBufferGeometry(EPS, EPS, 10, 5, 1, true), {position: [0, 1, 0], rotation: [0, 0, HPI], thickness: 1, outlineThickness: 0}],
]);

const handleGeometry = {
	T_X: new HelperGeometry(translateArrowGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	T_Y: new HelperGeometry(translateArrowGeometry, {color: colors['green']}),
	T_Z: new HelperGeometry(translateArrowGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	T_XY: new HelperGeometry(translateCornerGeometry, {color: colors['yellow'], position: [0.25, 0.25, 0]}),
	T_YZ: new HelperGeometry(translateCornerGeometry, {color: colors['cyan'], position: [0, 0.25, 0.25], rotation: [0, -HPI, 0]}),
	T_XZ: new HelperGeometry(translateCornerGeometry, {color: colors['magenta'], position: [0.25, 0, 0.25], rotation: [HPI, 0, 0]}),

	R_X: new HelperGeometry(rotateHandleGeometry, {color: colors['red'], rotation: [QPI, HPI, 0]}),
	R_Y: new HelperGeometry(rotateHandleGeometry, {color: colors['green'], rotation: [HPI, 0, -HPI/2]}),
	R_Z: new HelperGeometry(rotateHandleGeometry, {color: colors['blue'], rotation: [0, 0, -QPI]}),

	S_X: new HelperGeometry(scaleArrowGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	S_Y: new HelperGeometry(scaleArrowGeometry, {color: colors['green']}),
	S_Z: new HelperGeometry(scaleArrowGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	S_XY: new HelperGeometry(scaleCornerGeometry, {color: colors['yellow'], position: [0.9, 0.9, 0]}),
	S_YZ: new HelperGeometry(scaleCornerGeometry, {color: colors['cyan'], position: [0, 0.9, 0.9], rotation: [0, -HPI, 0]}),
	S_XZ: new HelperGeometry(scaleCornerGeometry, {color: colors['magenta'], position: [0.9, 0, 0.9], rotation: [HPI, 0, 0]}),
	S_XYZ: new HelperGeometry([
		[scaleUniformArrowGeometry, {color: colors['gray'], position: [1.1, 0, 0], rotation: [0, 0, -HPI]}],
		[scaleUniformArrowGeometry, {color: colors['gray'], position: [0, 1.1, 0]}],
		[scaleUniformArrowGeometry, {color: colors['gray'], position: [0, 0, 1.1], rotation: [HPI, 0, 0]}],
	]),
};

const pickerGeometry = {
	T_X: new HelperGeometry(translatePickerGeometry, {color: colors['red'], rotation: [0, 0, -HPI]}),
	T_Y: new HelperGeometry(translatePickerGeometry, {color: colors['green']}),
	T_Z: new HelperGeometry(translatePickerGeometry, {color: colors['blue'], rotation: [HPI, 0, 0]}),
	T_XY: new HelperGeometry(cornerPickerGeometry, {color: colors['yellow'], position: [0.15, 0.15, 0]}),
	T_YZ: new HelperGeometry(cornerPickerGeometry, {color: colors['cyan'], position: [0, 0.15, 0.15], rotation: [0, -HPI, 0]}),
	T_XZ: new HelperGeometry(cornerPickerGeometry, {color: colors['magenta'], position: [0.15, 0, 0.15], rotation: [HPI, 0, 0]}),
	T_XYZ: new HelperGeometry(new OctahedronBufferGeometry(0.2, 0), {color: colors['whiteTransparent']}),

	R_X: new HelperGeometry(rotatePickerGeometry, {color: colors['red'], rotation: [QPI, HPI, 0]}),
	R_Y: new HelperGeometry(rotatePickerGeometry, {color: colors['green'], rotation: [HPI, 0, -HPI/2]}),
	R_Z: new HelperGeometry(rotatePickerGeometry, {color: colors['blue'], rotation: [0, 0, -QPI]}),

	S_X: new HelperGeometry(scalePickerGeometry, {color: colors['red'], position: [0.9, 0, 0], rotation: [0, 0, -HPI], scale: 1.5}),
	S_Y: new HelperGeometry(scalePickerGeometry, {color: colors['green'], position: [0, 0.9, 0], scale: 1.5}),
	S_Z: new HelperGeometry(scalePickerGeometry, {color: colors['blue'], position: [0, 0, 0.9], rotation: [HPI, 0, 0], scale: 1.5}),
	S_XY: new HelperGeometry(scalePickerGeometry, {color: colors['yellow'], position: [0.9, 0.9, 0]}),
	S_YZ: new HelperGeometry(scalePickerGeometry, {color: colors['cyan'], position: [0, 0.9, 0.9], rotation: [0, -HPI, 0]}),
	S_XZ: new HelperGeometry(scalePickerGeometry, {color: colors['magenta'], position: [0.9, 0, 0.9], rotation: [HPI, 0, 0]}),
	S_XYZ: new HelperGeometry([
		[scalePickerGeometry, {color: colors['gray'], position: [1.1, 0, 0]}],
		[scalePickerGeometry, {color: colors['gray'], position: [0, 1.1, 0]}],
		[scalePickerGeometry, {color: colors['gray'], position: [0, 0, 1.1]}],
	]),
};

const guideGeometry = {
	T_X: new HelperGeometry(translateGuideGeometry, {color: colors['red'], opacity: 0.5, rotation: [0, 0, -HPI]}),
	T_Y: new HelperGeometry(translateGuideGeometry, {color: colors['green'], opacity: 0.5}),
	T_Z: new HelperGeometry(translateGuideGeometry, {color: colors['blue'], opacity: 0.5, rotation: [HPI, 0, 0]}),

	R_X: new HelperGeometry(rotateGuideGeometry, {color: colors['red'], opacity: 0.5, rotation: [QPI, HPI, 0]}),
	R_Y: new HelperGeometry(rotateGuideGeometry, {color: colors['green'], opacity: 0.5, rotation: [HPI, 0, -HPI/2]}),
	R_Z: new HelperGeometry(rotateGuideGeometry, {color: colors['blue'], opacity: 0.5, rotation: [0, 0, -QPI]}),

	S_X: new HelperGeometry(translateGuideGeometry, {color: colors['red'], opacity: 0.5, rotation: [0, 0, -HPI]}),
	S_Y: new HelperGeometry(translateGuideGeometry, {color: colors['green'], opacity: 0.5}),
	S_Z: new HelperGeometry(translateGuideGeometry, {color: colors['blue'], opacity: 0.5, rotation: [HPI, 0, 0]}),
};

export class TransformHelperCombined extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	get guideGeometry() {
		return guideGeometry;
	}
	setAxis(axis) {
		super.setAxis(axis);
		// Hide per-axis scale in world mode
		if ((axis.name == 'S_X' || axis.name == 'S_Y' || axis.name == 'S_Z') && this.space === 'world') axis.hidden = true;
		if ((axis.name == 'S_XY' || axis.name == 'S_YZ' || axis.name == 'S_XZ') && this.space === 'world') axis.hidden = true;

		if (axis.name == 'R_Z' && this.hideXY) axis.hidden = true;
		if (axis.name == 'R_X' && this.hideYZ) axis.hidden = true;
		if (axis.name == 'R_Y' && this.hideXZ) axis.hidden = true;
	}
}
