import {TransformHelperTranslate} from "./TransformHelperTranslate.js";
import {Corner2Geometry, PlaneGeometry, LineGeometry} from "./HelperGeometries.js";
import {HelperMesh} from "./HelperMesh.js";

const HPI = Math.PI / 2;
const PI = Math.PI;

const cornerHandle = new HelperMesh([
	{geometry: new Corner2Geometry(), color: [1, 1, 1], rotation: [-HPI, 0, 0], thickness: 2},
	{geometry: new PlaneGeometry(), color: [1, 1, 1, 0.2], position: [0.51, 0.51, 0], scale: 0.98}
]).geometry;

const edgeHandle = new HelperMesh([
	{geometry: new LineGeometry(), color: [1, 1, 1], position: [0, 0, 0], thickness: 2},
	{geometry: new PlaneGeometry(), color: [1, 1, 1, 0.2], position: [0.51, 0, 0], scale: 0.98},
]).geometry;

const cornerPicker = new HelperMesh([
	{geometry: new PlaneGeometry(), position: [0.5, 0.5, 0]}
]).geometry;

const edgePicker = new HelperMesh([
	{geometry: new PlaneGeometry(), position: [0.5, 0, 0]},
]).geometry;

export class TransformHelperFreescale extends TransformHelperTranslate {
	get handlesGroup() {
		return {
			X_yp: [{geometry: edgeHandle, color: [0.5, 1, 0.5], position: [1, 0.988, 0], rotation: [HPI, -HPI, 0], scale: [0.25, 1, 0.25]}],
			X_yn: [{geometry: edgeHandle, color: [0.5, 1, 0.5], position: [1, -0.988, 0], rotation: [HPI, HPI, 0], scale: [0.25, 1, 0.25]}],
			X_zp: [{geometry: edgeHandle, color: [0.5, 0.5, 1], position: [1, 0, 0.988], rotation: [0, HPI, 0], scale: [0.25, 1, 0.25]}],
			X_zn: [{geometry: edgeHandle, color: [0.5, 0.5, 1], position: [1, 0, -0.988], rotation: [0, -HPI, 0], scale: [0.25, 1, 0.25]}],
			//
			Y_zp: [{geometry: edgeHandle, color: [0.5, 0.5, 1], position: [0, 1, 0.988], rotation: [-HPI, 0, HPI], scale: [0.25, 1, 0.25]}],
			Y_zn: [{geometry: edgeHandle, color: [0.5, 0.5, 1], position: [0, 1, -0.988], rotation: [HPI, 0, HPI], scale: [0.25, 1, 0.25]}],
			Y_xp: [{geometry: edgeHandle, color: [1, 0.5, 0.5], position: [0.988, 1, 0], rotation: [HPI, PI, 0], scale: [0.25, 1, 0.25]}],
			Y_xn: [{geometry: edgeHandle, color: [1, 0.5, 0.5], position: [-0.988, 1, 0], rotation: [-HPI, 0, 0], scale: [0.25, 1, 0.25]}],
			//
			Z_yp: [{geometry: edgeHandle, color: [0.5, 1, 0.5], position: [0, 0.988, 1], rotation: [0, 0, -HPI], scale: [0.25, 1, 0.25]}],
			Z_yn: [{geometry: edgeHandle, color: [0.5, 1, 0.5], position: [0, -0.988, 1], rotation: [0, 0, HPI], scale: [0.25, 1, 0.25]}],
			Z_xp: [{geometry: edgeHandle, color: [1, 0.5, 0.5], position: [0.988, 0, 1], rotation: [0, PI, 0], scale: [0.25, 1, 0.25]}],
			Z_xn: [{geometry: edgeHandle, color: [1, 0.5, 0.5], position: [-0.988, 0, 1], rotation: [0, 0, 0], scale: [0.25, 1, 0.25]}],
			//
			X_zp_yp: [{geometry: cornerHandle, color: [0.5, 1, 1], position: [1, 0.988, 0.988], rotation: [-HPI, HPI, 0], scale: 0.25}],
			X_zn_yn: [{geometry: cornerHandle, color: [0.5, 1, 1], position: [1, -0.988, -0.988], rotation: [0, -HPI, 0], scale: 0.25}],
			X_zp_yn: [{geometry: cornerHandle, color: [0.5, 1, 1], position: [1, 0.988, -0.988], rotation: [HPI, -HPI, 0], scale: 0.25}],
			X_zn_yp: [{geometry: cornerHandle, color: [0.5, 1, 1], position: [1, -0.988, 0.988], rotation: [0, HPI, 0], scale: 0.25}],

			Y_xp_zp: [{geometry: cornerHandle, color: [1, 0.5, 1], position: [0.988, 1, 0.988], rotation: [-HPI, 0, HPI], scale: 0.25}],
			Y_xn_zn: [{geometry: cornerHandle, color: [1, 0.5, 1], position: [-0.988, 1, -0.988], rotation: [HPI, 0, 0], scale: 0.25}],
			Y_xp_zn: [{geometry: cornerHandle, color: [1, 0.5, 1], position: [0.988, 1, -0.988], rotation: [HPI, 0, HPI], scale: 0.25}],
			Y_xn_zp: [{geometry: cornerHandle, color: [1, 0.5, 1], position: [-0.988, 1, 0.988], rotation: [HPI, 0, -HPI], scale: 0.25}],
			//
			Z_xp_yp: [{geometry: cornerHandle, color: [1, 1, 0.5], position: [0.988, 0.988, 1], rotation: [PI, 0, HPI], scale: 0.25}],
			Z_xn_yn: [{geometry: cornerHandle, color: [1, 1, 0.5], position: [-0.988, -0.988, 1], rotation: [PI, 0, -HPI], scale: 0.25}],
			Z_xp_yn: [{geometry: cornerHandle, color: [1, 1, 0.5], position: [0.988, -0.988, 1], rotation: [0, 0, HPI], scale: 0.25}],
			Z_xn_yp: [{geometry: cornerHandle, color: [1, 1, 0.5], position: [-0.988, 0.988, 1], rotation: [PI, 0, 0], scale: 0.25}],
		};
	}
	get pickersGroup() {
		return {
			X_yp: [{geometry: edgePicker, position: [1, 0.988, 0], rotation: [HPI, -HPI, 0], scale: [0.25, 1, 0.25]}],
			X_yn: [{geometry: edgePicker, position: [1, -0.988, 0], rotation: [HPI, HPI, 0], scale: [0.25, 1, 0.25]}],
			X_zp: [{geometry: edgePicker, position: [1, 0, 0.988], rotation: [0, HPI, 0], scale: [0.25, 1, 0.25]}],
			X_zn: [{geometry: edgePicker, position: [1, 0, -0.988], rotation: [0, -HPI, 0], scale: [0.25, 1, 0.25]}],
			//
			Y_zp: [{geometry: edgePicker, position: [0, 1, 0.988], rotation: [-HPI, 0, HPI], scale: [0.25, 1, 0.25]}],
			Y_zn: [{geometry: edgePicker, position: [0, 1, -0.988], rotation: [HPI, 0, HPI], scale: [0.25, 1, 0.25]}],
			Y_xp: [{geometry: edgePicker, position: [0.988, 1, 0], rotation: [HPI, PI, 0], scale: [0.25, 1, 0.25]}],
			Y_xn: [{geometry: edgePicker, position: [-0.988, 1, 0], rotation: [-HPI, 0, 0], scale: [0.25, 1, 0.25]}],
			//
			Z_yp: [{geometry: edgePicker, position: [0, 0.988, 1], rotation: [0, 0, -HPI], scale: [0.25, 1, 0.25]}],
			Z_yn: [{geometry: edgePicker, position: [0, -0.988, 1], rotation: [0, 0, HPI], scale: [0.25, 1, 0.25]}],
			Z_xp: [{geometry: edgePicker, position: [0.988, 0, 1], rotation: [0, PI, 0], scale: [0.25, 1, 0.25]}],
			Z_xn: [{geometry: edgePicker, position: [-0.988, 0, 1], rotation: [0, 0, 0], scale: [0.25, 1, 0.25]}],
			//
			X_zp_yp: [{geometry: cornerPicker, position: [1, 0.988, 0.988], rotation: [-HPI, HPI, 0], scale: 0.25}],
			X_zn_yn: [{geometry: cornerPicker, position: [1, -0.988, -0.988], rotation: [0, -HPI, 0], scale: 0.25}],
			X_zp_yn: [{geometry: cornerPicker, position: [1, 0.988, -0.988], rotation: [HPI, -HPI, 0], scale: 0.25}],
			X_zn_yp: [{geometry: cornerPicker, position: [1, -0.988, 0.988], rotation: [0, HPI, 0], scale: 0.25}],

			Y_xp_zp: [{geometry: cornerPicker, position: [0.988, 1, 0.988], rotation: [-HPI, 0, HPI], scale: 0.25}],
			Y_xn_zn: [{geometry: cornerPicker, position: [-0.988, 1, -0.988], rotation: [HPI, 0, 0], scale: 0.25}],
			Y_xp_zn: [{geometry: cornerPicker, position: [0.988, 1, -0.988], rotation: [HPI, 0, HPI], scale: 0.25}],
			Y_xn_zp: [{geometry: cornerPicker, position: [-0.988, 1, 0.988], rotation: [HPI, 0, -HPI], scale: 0.25}],
			//
			Z_xp_yp: [{geometry: cornerPicker, position: [0.988, 0.988, 1], rotation: [PI, 0, HPI], scale: 0.25}],
			Z_xn_yn: [{geometry: cornerPicker, position: [-0.988, -0.988, 1], rotation: [PI, 0, -HPI], scale: 0.25}],
			Z_xp_yn: [{geometry: cornerPicker, position: [0.988, -0.988, 1], rotation: [0, 0, HPI], scale: 0.25}],
			Z_xn_yp: [{geometry: cornerPicker, position: [-0.988, 0.988, 1], rotation: [PI, 0, 0], scale: 0.25}],
		};
	}
	// updateAxis(axis) {
	// 	super.updateAxis(axis);
	// 	axis.renderOrder = Infinity;
	// }
}
