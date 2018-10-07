import {Vector3, Matrix4, Quaternion, OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {TransformHelperTranslate} from "./TransformHelperTranslate.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Corner2Geometry, PlaneGeometry} from "./HelperGeometries.js";

// Reusable utility variables
const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const cornerGeometry = new HelperGeometry([
	[new PlaneGeometry(), {color: [1,1,1,0.125], position: [-0.1, -0.1, 0], scale: 0.2, outlineThickness: 0}],
	[new Corner2Geometry(), {color: [1,1,0.25], scale: 0.2, rotation: [HPI, 0, PI]}],
]);

const arrowGeometry = new HelperGeometry([
	[new CylinderBufferGeometry(EPS, EPS, 0.5, 5, 2, false), {position: [0, 0.525, 0], thickness: 1}],
	[new OctahedronBufferGeometry(0.05, 2), {position: [0, 0.8, 0]}],
]);

const pickerHandleGeometry = new HelperGeometry(new CylinderBufferGeometry(0.2, 0, 0.8, 4, 1, false), {position: [0, 0.5, 0]});

const handleGeometry = {
	X: new HelperGeometry(arrowGeometry, {color: [1, 0.3, 0.3], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(arrowGeometry, {color: [0.3, 1, 0.3]}),
	Z: new HelperGeometry(arrowGeometry, {color: [0.3, 0.3, 1], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(cornerGeometry, {position: [0.8, 0.8, 0], color: [1,1,0.3]}),
	YZ: new HelperGeometry(cornerGeometry, {position: [0, 0.8, 0.8], color: [0.3,1,1], rotation: [0, -HPI, 0]}),
	XZ: new HelperGeometry(cornerGeometry, {position: [0.8, 0, 0.8], color: [1,0.3,1], rotation: [HPI, 0, 0]}),
	XYZX: new HelperGeometry(new OctahedronBufferGeometry(0.05, 2), {color: [0.75, 0.75, 0.75], position: [0.8, 0.8, 0]}),
	XYZY: new HelperGeometry(new OctahedronBufferGeometry(0.05, 2), {color: [0.75, 0.75, 0.75], position: [0, 0.8, 0.8]}),
	XYZZ: new HelperGeometry(new OctahedronBufferGeometry(0.05, 2), {color: [0.75, 0.75, 0.75], position: [0.8, 0, 0.8]}),
};

const pickerGeometry = {
	X: new HelperGeometry(pickerHandleGeometry, {color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 1, 0.3, 0.5]}),
	Z: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 0.3, 1, 0.5], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(new PlaneGeometry(), {color: [1,1,0,0.5], position: [0.6, 0.6, 0], scale: 0.4}),
	YZ: new HelperGeometry(new PlaneGeometry(), {color: [0,1,1,0.5], position: [0, 0.6, 0.6], rotation: [0, HPI, 0], scale: 0.4}),
	XZ: new HelperGeometry(new PlaneGeometry(), {color: [1,0,1,0.5], position: [0.6, 0, 0.6], rotation: [-HPI, 0, 0], scale: 0.4}),
	XYZX: new HelperGeometry(new OctahedronBufferGeometry(0.1, 1), {color: [0.5, 0.5, 0.5, 0.5], position: [0.82, 0.82, 0]}),
	XYZY: new HelperGeometry(new OctahedronBufferGeometry(0.1, 1), {color: [0.5, 0.5, 0.5, 0.5], position: [0, 0.82, 0.82]}),
	XYZZ: new HelperGeometry(new OctahedronBufferGeometry(0.1, 1), {color: [0.5, 0.5, 0.5, 0.5], position: [0.82, 0, 0.82]}),
};

export class TransformHelperScale extends TransformHelperTranslate {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	updateHelperMatrix() {
		this.space = 'local';
		super.updateHelperMatrix();
		// TODO: optimize!
		for (let i = this.handles.length; i--;) this.updateAxisMaterial(this.handles[i]);
		for (let i = this.pickers.length; i--;) this.updateAxisMaterial(this.pickers[i]);
	}
}
