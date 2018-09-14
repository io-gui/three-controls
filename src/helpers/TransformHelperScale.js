import {TransformHelperTranslate} from "./TransformHelperTranslate.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {ScaleArrowGeometry, PickerHandleGeometry, Corner2Geometry, PlaneGeometry, GeosphereGeometry} from "./HelperGeometries.js";

const handleGeometry = {
	X: new HelperGeometry(new ScaleArrowGeometry(), {color: [1, 0.3, 0.3], rotation: [0, 0, -Math.PI / 2]}),
	Y: new HelperGeometry(new ScaleArrowGeometry(), {color: [0.3, 1, 0.3]}),
	Z: new HelperGeometry(new ScaleArrowGeometry(), {color: [0.3, 0.3, 1], rotation: [Math.PI / 2, 0, 0]}),
	XY: new HelperGeometry([
		[new PlaneGeometry(), {color: [1,1,0,0.125], position: [0.725, 0.725, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [1,1,0.3], position: [0.85, 0.85, 0], scale: 0.25, rotation: [Math.PI / 2, 0, Math.PI]}],
	]),
	YZ: new HelperGeometry([
		[new PlaneGeometry(), {color: [0,1,1,0.125], position: [0, 0.725, 0.725], rotation: [0, Math.PI / 2, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [0.3,1,1], position: [0, 0.85, 0.85], scale: 0.25, rotation: [0, Math.PI, -Math.PI / 2]}],
	]),
	XZ: new HelperGeometry([
		[new PlaneGeometry(), {color: [1,0,1,0.125], position: [0.725, 0, 0.725], rotation: [-Math.PI / 2, 0, 0], scale: 0.25}],
		[new Corner2Geometry(), {color: [1,0.3,1], position: [0.85, 0, 0.85], scale: 0.25, rotation: [0, Math.PI, 0]}],
	]),
	XYZX: new HelperGeometry(new GeosphereGeometry(), {color: [1, 1, 1, 0.5], position: [1.1, 0, 0], scale: 0.075}),
	XYZY: new HelperGeometry(new GeosphereGeometry(), {color: [1, 1, 1, 0.5], position: [0, 1.1, 0], scale: 0.075}),
	XYZZ: new HelperGeometry(new GeosphereGeometry(), {color: [1, 1, 1, 0.5], position: [0, 0, 1.1], scale: 0.075}),
};

const pickerGeometry = {
	X: new HelperGeometry(new PickerHandleGeometry(), {color: [1, 0.3, 0.3, 0.5], rotation: [0, 0, -Math.PI / 2]}),
	Y: new HelperGeometry(new PickerHandleGeometry(), {color: [0.3, 1, 0.3, 0.5]}),
	Z: new HelperGeometry(new PickerHandleGeometry(), {color: [0.3, 0.3, 1, 0.5], rotation: [Math.PI / 2, 0, 0]}),
	XY: new HelperGeometry(new PlaneGeometry(), {color: [1,1,0,0.5], position: [0.71, 0.71, 0], scale: 0.4}),
	YZ: new HelperGeometry(new PlaneGeometry(), {color: [0,1,1,0.5], position: [0, 0.71, 0.71], rotation: [0, Math.PI / 2, 0], scale: 0.4}),
	XZ: new HelperGeometry(new PlaneGeometry(), {color: [1,0,1,0.5], position: [0.71, 0, 0.71], rotation: [-Math.PI / 2, 0, 0], scale: 0.4}),
	XYZX: new HelperGeometry(new GeosphereGeometry(), {color: [0.5, 0.5, 0.5, 0.5], position: [1.1, 0, 0], scale: 0.15}),
	XYZY: new HelperGeometry(new GeosphereGeometry(), {color: [0.5, 0.5, 0.5, 0.5], position: [0, 1.1, 0], scale: 0.15}),
	XYZZ: new HelperGeometry(new GeosphereGeometry(), {color: [0.5, 0.5, 0.5, 0.5], position: [0, 0, 1.1], scale: 0.15}),
};

export class TransformHelperScale extends TransformHelperTranslate {
	get handlesGroup() {
		return handleGeometry;
	}
	get pickersGroup() {
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
