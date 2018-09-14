import {OctahedronBufferGeometry, CylinderBufferGeometry} from "../../lib/three.module.js";
import {TransformHelperTranslate} from "./TransformHelperTranslate.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {Corner2Geometry, PlaneGeometry} from "./HelperGeometries.js";

const PI = Math.PI;
const HPI = Math.PI / 2;
const EPS = 0.000001;

const scaleArrowGeometry = new HelperGeometry([
	[new OctahedronBufferGeometry(1, 3), {position: [0, 0.8, 0], scale: 0.075}],
	[new CylinderBufferGeometry(EPS, EPS, 0.8, 5, 2, false), {position: [0, 0.4, 0], thickness: 1}],
]);

const pickerHandleGeometry = new HelperGeometry(new CylinderBufferGeometry(0.2, 0, 1, 4, 1, false), {position: [0, 0.5, 0]});

const handleGeometry = {
	X: new HelperGeometry(scaleArrowGeometry, {color: [1, 0.3, 0.3], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(scaleArrowGeometry, {color: [0.3, 1, 0.3]}),
	Z: new HelperGeometry(scaleArrowGeometry, {color: [0.3, 0.3, 1], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry([
		[new PlaneGeometry(), {color: [1,1,0,0.125], position: [0.725, 0.725, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [1,1,0.3], position: [0.85, 0.85, 0], scale: 0.25, rotation: [HPI, 0, PI]}],
	]),
	YZ: new HelperGeometry([
		[new PlaneGeometry(), {color: [0,1,1,0.125], position: [0, 0.725, 0.725], rotation: [0, HPI, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [0.3,1,1], position: [0, 0.85, 0.85], scale: 0.25, rotation: [0, PI, -HPI]}],
	]),
	XZ: new HelperGeometry([
		[new PlaneGeometry(), {color: [1,0,1,0.125], position: [0.725, 0, 0.725], rotation: [-HPI, 0, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [1,0.3,1], position: [0.85, 0, 0.85], scale: 0.25, rotation: [0, PI, 0]}],
	]),
	XYZX: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [1, 1, 1, 0.5], position: [1.1, 0, 0], scale: 0.075}),
	XYZY: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [1, 1, 1, 0.5], position: [0, 1.1, 0], scale: 0.075}),
	XYZZ: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [1, 1, 1, 0.5], position: [0, 0, 1.1], scale: 0.075}),
};

const pickerGeometry = {
	X: new HelperGeometry(pickerHandleGeometry, {color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -HPI]}),
	Y: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 1, 0.3, 0.5]}),
	Z: new HelperGeometry(pickerHandleGeometry, {color: [0.3, 0.3, 1, 0.5], rotation: [HPI, 0, 0]}),
	XY: new HelperGeometry(new PlaneGeometry(), {color: [1,1,0,0.5], position: [0.71, 0.71, 0], scale: 0.4}),
	YZ: new HelperGeometry(new PlaneGeometry(), {color: [0,1,1,0.5], position: [0, 0.71, 0.71], rotation: [0, HPI, 0], scale: 0.4}),
	XZ: new HelperGeometry(new PlaneGeometry(), {color: [1,0,1,0.5], position: [0.71, 0, 0.71], rotation: [-HPI, 0, 0], scale: 0.4}),
	XYZX: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [0.5, 0.5, 0.5, 0.5], position: [1.1, 0, 0], scale: 0.15}),
	XYZY: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [0.5, 0.5, 0.5, 0.5], position: [0, 1.1, 0], scale: 0.15}),
	XYZZ: new HelperGeometry(new OctahedronBufferGeometry(1, 3), {color: [0.5, 0.5, 0.5, 0.5], position: [0, 0, 1.1], scale: 0.15}),
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
