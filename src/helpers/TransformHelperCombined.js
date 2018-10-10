import {Vector3, Matrix4, Quaternion, TorusBufferGeometry, SphereBufferGeometry, OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {TransformHelper} from "./TransformHelper.js";
import {Corner2Geometry, PlaneGeometry} from "./HelperGeometries.js";

// Reusable utility variables
const _worldY = new Vector3(0, 0, 0);
const _zero = new Vector3(0, 0, 0);
const _lookAtMatrix = new Matrix4();
const _tempQuaternion = new Quaternion();
const _identityQuaternion = new Quaternion();

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);

function stringHas(str, char) {return str.search(char) !== -1;}

const circleGeometry = new HelperGeometry(new OctahedronBufferGeometry( 1, 3 ), {scale: [1, 0.01, 1]});

const ringGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 128 ), {rotation: [HPI, 0, 0], thickness: 1});

const halfRingGeometry = new HelperGeometry(new TorusBufferGeometry( 1, EPS, 8, 64, PI ), {rotation: [HPI, 0, 0], thickness: 1});

const ringPickerGeometry = new HelperGeometry(new TorusBufferGeometry( 1, 0.1, 3, 12 ), {rotation: [HPI, 0, 0]});

const arrowGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new CylinderBufferGeometry(0, 0.03, 0.2, 8, 1, true), {position: [0, 0.1, 0]}],
]);

const translateArrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.35, 5, 1, false), {position: [0, 0.45, 0], thickness: 1}],
	[arrowGeometry, {position: [0, 0.6, 0]}],
	[new OctahedronBufferGeometry(0.03, 2), {position: [0, 0.9, 0]}]
]);

const cornerGeometry = new HelperGeometry([
	[new PlaneGeometry(), {color: [1,1,1,0.125], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new Corner2Geometry(), {color: [1,1,0.25], scale: 0.2, rotation: [HPI, 0, PI]}],
]);

const rotateHandleGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, EPS, 4, 6, HPI/2 ), {thickness: 1, rotation: [0, 0, HPI - HPI/4]}],
	[new TorusBufferGeometry( 0.975, 0.025, 2, 2, HPI/2/3 ), {color: [1, 1, 1, 0.25], rotation: [0, 0, HPI - HPI/4/3], scale: [1, 1, 0.01], outlineThickness: 0}],
	[arrowGeometry, {position: [0.37, 0.93, 0], rotation: [0, 0, -2.035]}],
	[arrowGeometry, {position: [-0.37, 0.93, 0], rotation: [0, 0, 2.035]}],
]);

const rotatePickerGeometry = new HelperGeometry([
	[new TorusBufferGeometry( 1, 0.03, 4, 8, HPI/2 ), {rotation: [0, 0, HPI - HPI/4]}],
	[new OctahedronBufferGeometry(1, 0), {position: [0, 0.992, 0], scale: 0.2}],
]);

const scale2HandleGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(0.03, 2)],
	[new PlaneGeometry(), {color: [1,1,1,0.125], position: [0, -0.06, 0], scale: [0.06, 0.1, 0.06], outlineThickness: 0}],
	[new PlaneGeometry(), {color: [1,1,1,0.125], position: [-0.06, 0, 0], scale: [0.1, 0.06, 0.06], outlineThickness: 0}],
]);

const handleGeometry = {
	X: new HelperGeometry([
		[rotateHandleGeometry, {color: [1, 0.3, 0.3], rotation: [HPI / 2, PI / 2, 0]}],
		[translateArrowGeometry, {color: [1, 0.3, 0.3], rotation: [0, 0, -HPI]}],
	]),
	Y: new HelperGeometry([
		[rotateHandleGeometry, {color: [0.3, 1, 0.3], rotation: [PI / 2, 0, -HPI/2]}],
		[translateArrowGeometry, {color: [0.3, 1, 0.3]}],
	]),
	Z: new HelperGeometry([
		[rotateHandleGeometry, {color: [0.3, 0.3, 1], rotation: [0, 0, -HPI / 2]}],
		[translateArrowGeometry, {color: [0.3, 0.3, 1], rotation: [HPI, 0, 0]}],
	]),
	XY: new HelperGeometry(cornerGeometry, {position: [0.25, 0.25, 0], color: [1,1,0.25]}),
	YZ: new HelperGeometry(cornerGeometry, {position: [0, 0.25, 0.25], color: [0.25,1,1], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(cornerGeometry, {position: [0.25, 0, 0.25], color: [1,0.25,1], rotation: [HPI, 0, 0]}),
	S_XY: new HelperGeometry([
		[scale2HandleGeometry, {color: [1, 1, 0], position: [0.9, 0.9, 0]}]
	]),
	S_YZ: new HelperGeometry([
		[scale2HandleGeometry, {color: [0, 1, 1], position: [0, 0.9, 0.9], rotation: [0, -HPI, 0]}]
	]),
	S_XZ: new HelperGeometry([
		[scale2HandleGeometry, {color: [1, 0, 1], position: [0.9, 0, 0.9], rotation: [HPI, 0, 0]}]
	]),
	S_XYZX: new HelperGeometry(new OctahedronBufferGeometry(0.03, 2), {color: [0.75, 0.75, 0.75], position: [1.025, 0, 0]}),
	S_XYZY: new HelperGeometry(new OctahedronBufferGeometry(0.03, 2), {color: [0.75, 0.75, 0.75], position: [0, 1.025, 0]}),
	S_XYZZ: new HelperGeometry(new OctahedronBufferGeometry(0.03, 2), {color: [0.75, 0.75, 0.75], position: [0, 0, 1.025]}),
};

const pickerGeometry = {};

export class TransformHelperCombined extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
}
