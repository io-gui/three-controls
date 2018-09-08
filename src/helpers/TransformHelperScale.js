import {TransformHelperTranslate} from "./TransformHelperTranslate.js";
import {ScaleArrowGeometry, PickerHandleGeometry, Corner2Geometry, PlaneGeometry, GeosphereGeometry} from "./HelperGeometries.js";

const scaleArrowGeometry = new ScaleArrowGeometry();
const pickerHandleGeometry = new PickerHandleGeometry();
const corner2Geometry = new Corner2Geometry();
const planeGeometry = new PlaneGeometry();
const geosphereGeometry = new GeosphereGeometry();

export class TransformHelperScale extends TransformHelperTranslate {
	get handlesGroup() {
		return {
			X: [{geometry: scaleArrowGeometry, color: [1, 0.3, 0.3], rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: scaleArrowGeometry, color: [0.3, 1, 0.3]}],
			Z: [{geometry: scaleArrowGeometry, color: [0.3, 0.3, 1], rotation: [Math.PI / 2, 0, 0]}],
			XY: [
				{geometry: planeGeometry, color: [1,1,0,0.25], position: [0.71, 0.71, 0], scale: 0.25},
				{geometry: corner2Geometry, color: [1,1,0.3], position: [0.85, 0.85, 0], scale: 0.25, rotation: [Math.PI / 2, 0, Math.PI]}
			],
			YZ: [
				{geometry: planeGeometry, color: [0,1,1,0.25], position: [0, 0.71, 0.71], rotation: [0, Math.PI / 2, 0], scale: 0.25},
				{geometry: corner2Geometry, color: [0.3,1,1], position: [0, 0.85, 0.85], scale: 0.25, rotation: [0, Math.PI, -Math.PI / 2]}
			],
			XZ: [
				{geometry: planeGeometry, color: [1,0,1,0.25], position: [0.71, 0, 0.71], rotation: [-Math.PI / 2, 0, 0], scale: 0.25},
				{geometry: corner2Geometry, color: [1,0.3,1], position: [0.85, 0, 0.85], scale: 0.25, rotation: [0, Math.PI, 0]}
			],
			XYZX: [{geometry: geosphereGeometry, position: [1.1, 0, 0], scale: 0.075}],
			XYZY: [{geometry: geosphereGeometry, position: [0, 1.1, 0], scale: 0.075}],
			XYZZ: [{geometry: geosphereGeometry, position: [0, 0, 1.1], scale: 0.075}]
		};
	}
	get pickersGroup() {
		return {
			X: [{geometry: pickerHandleGeometry, rotation: [0, 0, -Math.PI / 2]}],
			Y: [{geometry: pickerHandleGeometry}],
			Z: [{geometry: pickerHandleGeometry, rotation: [Math.PI / 2, 0, 0]}],
			XY: [{geometry: planeGeometry, position: [0.71, 0.71, 0], scale: 0.4}],
			YZ: [{geometry: planeGeometry, position: [0, 0.71, 0.71], rotation: [0, Math.PI / 2, 0], scale: 0.4}],
			XZ: [{geometry: planeGeometry, position: [0.71, 0, 0.71], rotation: [-Math.PI / 2, 0, 0], scale: 0.4}],
			XYZX: [{geometry: geosphereGeometry, position: [1.1, 0, 0], scale: 0.15}],
			XYZY: [{geometry: geosphereGeometry, position: [0, 1.1, 0], scale: 0.15}],
			XYZZ: [{geometry: geosphereGeometry, position: [0, 0, 1.1], scale: 0.15}]
		};
	}
	updateHelperMatrix() {
		this.space = 'local';
		super.updateHelperMatrix();
	}
}
