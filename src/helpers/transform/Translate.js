import {OctahedronBufferGeometry, CylinderBufferGeometry, PlaneBufferGeometry} from "../../../../three.js/src/Three.js";
import {HelperGeometry, colors} from "../HelperGeometry.js";
import {TransformHelper} from "../Transform.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = PI / 2;
const EPS = 0.000001;

const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1);

const coneGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const translateArrowGeometry = new HelperGeometry([
	[coneGeometry, {position: [0, 0.8, 0]}],
	[new CylinderBufferGeometry(EPS, EPS, 0.5, 5, 1, true), {position: [0, 0.525, 0], thickness: 1}],
]);

const translateCornerGeometry = new HelperGeometry([
	[planeGeometry, {color: colors['whiteTransparent'], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new CylinderBufferGeometry(EPS, EPS, 0.2, 4, 2, true), {position: [0, -0.1, 0], rotation: [0, 0, 0], thickness: 1}],
	[new CylinderBufferGeometry(EPS, EPS, 0.2, 4, 2, true), {position: [-0.1, 0, 0], rotation: [0, 0, HPI], thickness: 1}],
]);

const translatePickerGeometry = new HelperGeometry(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, true), {color: colors['whiteTransparent'], position: [0, 0.5, 0]});

const cornerPickerGeometry = new HelperGeometry(planeGeometry, {color: colors['whiteTransparent'], scale: 0.3, outlineThickness: 0});

const translateGuideGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 10.45, 5, 1, true), {thickness: 1, outlineThickness: 0}],
]);

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

const guideGeometry = {
	X: new HelperGeometry(translateGuideGeometry, {color: colors['red'], opacity: 0.5, rotation: [0, 0, -HPI], depthBias: -5}),
	Y: new HelperGeometry(translateGuideGeometry, {color: colors['green'], opacity: 0.5, depthBias: -5}),
	Z: new HelperGeometry(translateGuideGeometry, {color: colors['blue'], opacity: 0.5, rotation: [HPI, 0, 0], depthBias: -5}),
};

export class TransformHelperTranslate extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	get guideGeometry() {
		return guideGeometry;
	}
	get textGeometry() {
		return {
			X: {position: [1.2, 0, 0], color: 'red'},
			Y: {position: [0, 1.2, 0], color: 'green'},
			Z: {position: [0, 0, 1.2], color: 'blue'},
		};
	}
}
