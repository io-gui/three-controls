import {Object3D, Line, Vector3, Euler, Quaternion, Matrix4} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {Corner2Geometry, PlaneGeometry, LineGeometry} from "./HelperGeometries.js";
import {HelperMesh} from "./HelperMesh.js";

const HPI = Math.PI / 2;
const PI = Math.PI;

// Reusable utility variables
const _vector = new Vector3();
const _boxVector = new Vector3();
const _wScale = new Vector3();
const _euler = new Euler();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _m0 = new Matrix4();
const _m1 = new Matrix4();
const _m2 = new Matrix4();
const _one = new Vector3(1, 1, 1);

const cornerHandle = new HelperMesh([
	{geometry: new Corner2Geometry(), color: [1, 1, 1], rotation: [-HPI, 0, 0]},
	{geometry: new PlaneGeometry(), color: [1, 1, 1, 0.5], position: [0.5, 0.5, 0]}
]).geometry;

const edgeHandle = new HelperMesh([
	{geometry: new LineGeometry(), color: [1, 1, 1], position: [0, 0, 0]},
	{geometry: new PlaneGeometry(), color: [1, 1, 1, 0.5], position: [0.5, 0, 0]},
]).geometry;

const cornerPicker = new HelperMesh([
	{geometry: new PlaneGeometry(), position: [0.5, 0.5, 0]}
]).geometry;

const edgePicker = new HelperMesh([
	{geometry: new PlaneGeometry(), position: [0.5, 0, 0]},
]).geometry;

export class TransformHelperStretch extends TransformHelper {
	get handlesGroup() {
		return {
			X_yp: [{geometry: edgeHandle, color: [0.5, 1, 0.5], rotation: [HPI, -HPI, 0]}],
			X_yn: [{geometry: edgeHandle, color: [0.5, 1, 0.5], rotation: [HPI, HPI, 0]}],
			X_zp: [{geometry: edgeHandle, color: [0.5, 0.5, 1], rotation: [0, HPI, 0]}],
			X_zn: [{geometry: edgeHandle, color: [0.5, 0.5, 1], rotation: [0, -HPI, 0]}],
			X_zp_yp: [{geometry: cornerHandle, color: [0.5, 1, 1], rotation: [-HPI, HPI, 0]}],
			X_zn_yn: [{geometry: cornerHandle, color: [0.5, 1, 1], rotation: [0, -HPI, 0]}],
			X_zp_yn: [{geometry: cornerHandle, color: [0.5, 1, 1], rotation: [0, HPI, 0]}],
			X_zn_yp: [{geometry: cornerHandle, color: [0.5, 1, 1], rotation: [HPI, -HPI, 0]}],

			Y_zp: [{geometry: edgeHandle, color: [0.5, 0.5, 1], rotation: [-HPI, 0, HPI]}],
			Y_zn: [{geometry: edgeHandle, color: [0.5, 0.5, 1], rotation: [HPI, 0, HPI]}],
			Y_xp: [{geometry: edgeHandle, color: [1, 0.5, 0.5], rotation: [HPI, PI, 0]}],
			Y_xn: [{geometry: edgeHandle, color: [1, 0.5, 0.5], rotation: [-HPI, 0, 0]}],
			Y_xp_zp: [{geometry: cornerHandle, color: [1, 0.5, 1], rotation: [-HPI, 0, HPI]}],
			Y_xn_zn: [{geometry: cornerHandle, color: [1, 0.5, 1], rotation: [HPI, 0, 0]}],
			Y_xp_zn: [{geometry: cornerHandle, color: [1, 0.5, 1], rotation: [HPI, 0, HPI]}],
			Y_xn_zp: [{geometry: cornerHandle, color: [1, 0.5, 1], rotation: [HPI, 0, -HPI]}],

			Z_yp: [{geometry: edgeHandle, color: [0.5, 1, 0.5], rotation: [0, 0, -HPI]}],
			Z_yn: [{geometry: edgeHandle, color: [0.5, 1, 0.5], rotation: [0, 0, HPI]}],
			Z_xp: [{geometry: edgeHandle, color: [1, 0.5, 0.5], rotation: [0, PI, 0]}],
			Z_xn: [{geometry: edgeHandle, color: [1, 0.5, 0.5], rotation: [0, 0, 0]}],
			Z_xp_yp: [{geometry: cornerHandle, color: [1, 1, 0.5], rotation: [PI, 0, HPI]}],
			Z_xn_yn: [{geometry: cornerHandle, color: [1, 1, 0.5], rotation: [PI, 0, -HPI]}],
			Z_xp_yn: [{geometry: cornerHandle, color: [1, 1, 0.5], rotation: [0, 0, HPI]}],
			Z_xn_yp: [{geometry: cornerHandle, color: [1, 1, 0.5], rotation: [PI, 0, 0]}],
		};
	}
	get pickersGroup() {
		return {
			// X_yp: [{geometry: edgePicker, color: [0.5, 1, 0.5], rotation: [HPI, -HPI, 0]}],
			// X_yn: [{geometry: edgePicker, color: [0.5, 1, 0.5], rotation: [HPI, HPI, 0]}],
			// X_zp: [{geometry: edgePicker, color: [0.5, 0.5, 1], rotation: [0, HPI, 0]}],
			// X_zn: [{geometry: edgePicker, color: [0.5, 0.5, 1], rotation: [0, -HPI, 0]}],
			// X_zp_yp: [{geometry: cornerPicker, color: [0.5, 1, 1], rotation: [-HPI, HPI, 0]}],
			// X_zn_yn: [{geometry: cornerPicker, color: [0.5, 1, 1], rotation: [0, -HPI, 0]}],
			// X_zp_yn: [{geometry: cornerPicker, color: [0.5, 1, 1], rotation: [0, HPI, 0]}],
			// X_zn_yp: [{geometry: cornerPicker, color: [0.5, 1, 1], rotation: [HPI, -HPI, 0]}],
			//
			// Y_zp: [{geometry: edgePicker, color: [0.5, 0.5, 1], rotation: [-HPI, 0, HPI]}],
			// Y_zn: [{geometry: edgePicker, color: [0.5, 0.5, 1], rotation: [HPI, 0, HPI]}],
			// Y_xp: [{geometry: edgePicker, color: [1, 0.5, 0.5], rotation: [HPI, PI, 0]}],
			// Y_xn: [{geometry: edgePicker, color: [1, 0.5, 0.5], rotation: [-HPI, 0, 0]}],
			// Y_xp_zp: [{geometry: cornerPicker, color: [1, 0.5, 1], rotation: [-HPI, 0, HPI]}],
			// Y_xn_zn: [{geometry: cornerPicker, color: [1, 0.5, 1], rotation: [HPI, 0, 0]}],
			// Y_xp_zn: [{geometry: cornerPicker, color: [1, 0.5, 1], rotation: [HPI, 0, HPI]}],
			// Y_xn_zp: [{geometry: cornerPicker, color: [1, 0.5, 1], rotation: [HPI, 0, -HPI]}],
			//
			// Z_yp: [{geometry: edgePicker, color: [0.5, 1, 0.5], rotation: [0, 0, -HPI]}],
			// Z_yn: [{geometry: edgePicker, color: [0.5, 1, 0.5], rotation: [0, 0, HPI]}],
			// Z_xp: [{geometry: edgePicker, color: [1, 0.5, 0.5], rotation: [0, PI, 0]}],
			// Z_xn: [{geometry: edgePicker, color: [1, 0.5, 0.5], rotation: [0, 0, 0]}],
			// Z_xp_yp: [{geometry: cornerPicker, color: [1, 1, 0.5], rotation: [PI, 0, HPI]}],
			// Z_xn_yn: [{geometry: cornerPicker, color: [1, 1, 0.5], rotation: [PI, 0, -HPI]}],
			// Z_xp_yn: [{geometry: cornerPicker, color: [1, 1, 0.5], rotation: [0, 0, HPI]}],
			// Z_xn_yp: [{geometry: cornerPicker, color: [1, 1, 0.5], rotation: [PI, 0, 0]}],
		};
	}
	objectChanged() {
		super.objectChanged();

		let bbMax;
		let bbMin;

		if (this.object) {
			if (this.object.geometry) {
				if (!this.object.geometry.boundingBox) this.object.geometry.computeBoundingBox();
				bbMax = this.object.geometry.boundingBox.max;
				bbMin = this.object.geometry.boundingBox.min;
			} else if (this.object.boundingBox) {
				bbMax = this.object.boundingBox.max;
				bbMin = this.object.boundingBox.min;
			}
		}


		if (bbMax && bbMin) {
			this.handles['X_yp'].position.set(bbMax.x, bbMax.y, 0);
			this.handles['X_yn'].position.set(bbMax.x, bbMin.y, 0);
			this.handles['X_zp'].position.set(bbMax.x, 0, bbMax.z);
			this.handles['X_zn'].position.set(bbMax.x, 0, bbMin.z);
			this.handles['X_zp_yp'].position.set(bbMax.x, bbMax.y, bbMax.z);
			this.handles['X_zn_yn'].position.set(bbMax.x, bbMin.y, bbMin.z);
			this.handles['X_zp_yn'].position.set(bbMax.x, bbMin.y, bbMax.z);
			this.handles['X_zn_yp'].position.set(bbMax.x, bbMax.y, bbMin.z);

			this.handles['Y_zp'].position.set(0, bbMax.y, bbMax.z);
			this.handles['Y_zn'].position.set(0, bbMax.y, bbMin.z);
			this.handles['Y_xp'].position.set(bbMax.x, bbMax.y, 0);
			this.handles['Y_xn'].position.set(bbMin.x, bbMax.y, 0);
			this.handles['Y_xp_zp'].position.set(bbMax.x, bbMax.y, bbMax.z);
			this.handles['Y_xn_zn'].position.set(bbMin.x, bbMax.y, bbMin.z);
			this.handles['Y_xp_zn'].position.set(bbMax.x, bbMax.y, bbMin.z);
			this.handles['Y_xn_zp'].position.set(bbMin.x, bbMax.y, bbMax.z);

			this.handles['Z_yp'].position.set(0, bbMax.y, bbMax.z);
			this.handles['Z_yn'].position.set(0, bbMin.y, bbMax.z);
			this.handles['Z_xp'].position.set(bbMax.x, 0, bbMax.z);
			this.handles['Z_xn'].position.set(bbMin.x, 0, bbMax.z);
			this.handles['Z_xp_yp'].position.set(bbMax.x, bbMax.y, bbMax.z);
			this.handles['Z_xn_yn'].position.set(bbMin.x, bbMin.y, bbMax.z);
			this.handles['Z_xp_yn'].position.set(bbMax.x, bbMin.y, bbMax.z);
			this.handles['Z_xn_yp'].position.set(bbMin.x, bbMax.y, bbMax.z);

		}
	}
	// constructor(props) {
	// 	super(props);
	// 	this.size = 3;
	// }
	updateMatrixWorld( force, camera ) {
		if (camera) this.camera = camera; // TODO

		this.updateHelperMatrix(camera);
		this.matrixWorldNeedsUpdate = false;

		if (!this.object) return;

		this.object.matrixWorld.decompose(_vector, _quaternion, _scale);
		_m1.compose(this.worldPosition, this.worldQuaternion, _one);

		_scale.x = Math.abs(_scale.x);
		_scale.y = Math.abs(_scale.y);
		_scale.z = Math.abs(_scale.z);

		for (let i = 0; i < 24; i ++) {
			let handle = this.children[i];
			let name = this.children[i].name;

			_boxVector.copy(handle.position).multiply(_scale);

			_wScale.copy(this.worldScale);

			_wScale.x *= 0.125;
			_wScale.y *= 0.125;
			_wScale.z *= 0.125;

			let _x = Math.min(_wScale.x, Math.abs(_boxVector.x) / 3);
			let _y = Math.min(_wScale.y, Math.abs(_boxVector.y) / 3);
			let _z = Math.min(_wScale.z, Math.abs(_boxVector.z) / 3);

			if (name == 'X_yp' || name == 'X_yn') {
				_wScale.y = _y;
				// _wScale.z = Math.max(_boxVector.x * _scale.x, _z) * 2 - _x * 3;
			}

			if (name == 'X_zp' || name == 'X_zn') {
				_wScale.z = _z;
				// _wScale.y = Math.max(_boxVector.x, _y) * 2;// - _z / 3;
			}
			if (name == 'X_zp_yp' || name == 'X_zn_yn') {
				_wScale.y = _y;
				_wScale.z = _z;
			// 	_wScale.z = _y / 8;
			}
			if (name == 'X_zp_yn' || name == 'X_zn_yp') {
				_wScale.y = _y;
				_wScale.z = _z;
			// 	_wScale.z = _y / 8;
			}

			if (name == 'Y_zp' || name == 'Y_zn') {
				_wScale.z = _z;
			// 	_wScale.x = Math.max(_boxVector.z) * 2 - _z / 4;
			}
			if (name == 'Y_xp' || name == 'Y_xn') {
				_wScale.x = _x;
			// 	_wScale.z = Math.max(_boxVector.x) * 2 - _x / 4;
			}
			if (name == 'Y_xp_zp' || name == 'Y_xn_zn') {
				_wScale.z = _x;
				_wScale.x = _z;
			}
			if (name == 'Y_xp_zn' || name == 'Y_xn_zp') {
				_wScale.z = _x;
				_wScale.x = _z;
			}

			if (name == 'Z_yp' || name == 'Z_yn') {
				_wScale.y = _y;
			// 	_wScale.x = Math.abs(_boxVector.y) * 2 - _y / 4;
			}
			if (name == 'Z_xp' || name == 'Z_xn') {
				_wScale.x = _x;
			// 	_wScale.y = Math.abs(_boxVector.x) * 2 - _x / 4;
			}
			if (name == 'Z_xp_yp' || name == 'Z_xn_yn') {
				_wScale.y = _y;
				_wScale.x = _x;
			}
			if (name == 'Z_xp_yn' || name == 'Z_xn_yp') {
				_wScale.y = _y;
				_wScale.x = _x;
			}

			_m2.compose(_boxVector, new Quaternion, _wScale);
			handle.matrixWorld.copy(_m1).multiply(_m2);
		}

	}
}
