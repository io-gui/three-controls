import {Object3D, Line, Vector3, Euler, Quaternion, Matrix4, Box3} from "../../lib/three.module.js";
import {TransformHelper} from "./TransformHelper.js";
import {Corner2Geometry, PlaneGeometry, LineGeometry} from "./HelperGeometries.js";
import {HelperMesh} from "./HelperMesh.js";
import {HelperGeometry} from "./HelperGeometry.js";

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

const cornerHandle = new HelperGeometry([
	[new Corner2Geometry(), {rotation: [-HPI, 0, 0]}],
	[new PlaneGeometry(), {color: [1, 1, 1, 0.25], position: [0.5, 0.5, 0]}]
]);

const edgeHandle = new HelperGeometry([
	[new LineGeometry()],
	[new PlaneGeometry(), {color: [1, 1, 1, 0.25], position: [0.5, 0, 0]}],
]);

const cornerPicker = new HelperGeometry([
	[new PlaneGeometry(), {position: [0.75, 0.75, 0], color: [1, 1, 1, 0.125], scale: [1.5, 1.5, 1]}]
]);

const edgePicker = new HelperGeometry([
	[new PlaneGeometry(), {position: [0.75, 0, 0], color: [1, 1, 1, 0.125], scale: [1.5, 1, 1]}],
]);

const handleGeometry = {
	X_yp: new HelperGeometry(edgeHandle, {color: [0.5, 1, 0.5], rotation: [HPI, -HPI, 0]}),
	X_yn: new HelperGeometry(edgeHandle, {color: [0.5, 1, 0.5], rotation: [HPI, HPI, 0]}),
	X_zp: new HelperGeometry(edgeHandle, {color: [0.5, 0.5, 1], rotation: [0, HPI, 0]}),
	X_zn: new HelperGeometry(edgeHandle, {color: [0.5, 0.5, 1], rotation: [0, -HPI, 0]}),
	X_zp_yp: new HelperGeometry(cornerHandle, {color: [0.5, 1, 1], rotation: [-HPI, HPI, 0]}),
	X_zn_yn: new HelperGeometry(cornerHandle, {color: [0.5, 1, 1], rotation: [0, -HPI, 0]}),
	X_zp_yn: new HelperGeometry(cornerHandle, {color: [0.5, 1, 1], rotation: [0, HPI, 0]}),
	X_zn_yp: new HelperGeometry(cornerHandle, {color: [0.5, 1, 1], rotation: [HPI, -HPI, 0]}),

	Y_zp: new HelperGeometry(edgeHandle, {color: [0.5, 0.5, 1], rotation: [-HPI, 0, HPI]}),
	Y_zn: new HelperGeometry(edgeHandle, {color: [0.5, 0.5, 1], rotation: [HPI, 0, HPI]}),
	Y_xp: new HelperGeometry(edgeHandle, {color: [1, 0.5, 0.5], rotation: [HPI, PI, 0]}),
	Y_xn: new HelperGeometry(edgeHandle, {color: [1, 0.5, 0.5], rotation: [-HPI, 0, 0]}),
	Y_xp_zp: new HelperGeometry(cornerHandle, {color: [1, 0.5, 1], rotation: [-HPI, 0, HPI]}),
	Y_xn_zn: new HelperGeometry(cornerHandle, {color: [1, 0.5, 1], rotation: [HPI, 0, 0]}),
	Y_xp_zn: new HelperGeometry(cornerHandle, {color: [1, 0.5, 1], rotation: [HPI, 0, HPI]}),
	Y_xn_zp: new HelperGeometry(cornerHandle, {color: [1, 0.5, 1], rotation: [HPI, 0, -HPI]}),

	Z_yp: new HelperGeometry(edgeHandle, {color: [0.5, 1, 0.5], rotation: [0, 0, -HPI]}),
	Z_yn: new HelperGeometry(edgeHandle, {color: [0.5, 1, 0.5], rotation: [0, 0, HPI]}),
	Z_xp: new HelperGeometry(edgeHandle, {color: [1, 0.5, 0.5], rotation: [0, PI, 0]}),
	Z_xn: new HelperGeometry(edgeHandle, {color: [1, 0.5, 0.5], rotation: [0, 0, 0]}),
	Z_xp_yp: new HelperGeometry(cornerHandle, {color: [1, 1, 0.5], rotation: [PI, 0, HPI]}),
	Z_xn_yn: new HelperGeometry(cornerHandle, {color: [1, 1, 0.5], rotation: [PI, 0, -HPI]}),
	Z_xp_yn: new HelperGeometry(cornerHandle, {color: [1, 1, 0.5], rotation: [0, 0, HPI]}),
	Z_xn_yp: new HelperGeometry(cornerHandle, {color: [1, 1, 0.5], rotation: [PI, 0, 0]}),
};

const pickerGeometry = {
	X_yp: new HelperGeometry(edgePicker, {color: [0.5, 1, 0.5], rotation: [HPI, -HPI, 0]}),
	X_yn: new HelperGeometry(edgePicker, {color: [0.5, 1, 0.5], rotation: [HPI, HPI, 0]}),
	X_zp: new HelperGeometry(edgePicker, {color: [0.5, 0.5, 1], rotation: [0, HPI, 0]}),
	X_zn: new HelperGeometry(edgePicker, {color: [0.5, 0.5, 1], rotation: [0, -HPI, 0]}),
	X_zp_yp: new HelperGeometry(cornerPicker, {color: [0.5, 1, 1], rotation: [-HPI, HPI, 0]}),
	X_zn_yn: new HelperGeometry(cornerPicker, {color: [0.5, 1, 1], rotation: [0, -HPI, 0]}),
	X_zp_yn: new HelperGeometry(cornerPicker, {color: [0.5, 1, 1], rotation: [0, HPI, 0]}),
	X_zn_yp: new HelperGeometry(cornerPicker, {color: [0.5, 1, 1], rotation: [HPI, -HPI, 0]}),

	Y_zp: new HelperGeometry(edgePicker, {color: [0.5, 0.5, 1], rotation: [-HPI, 0, HPI]}),
	Y_zn: new HelperGeometry(edgePicker, {color: [0.5, 0.5, 1], rotation: [HPI, 0, HPI]}),
	Y_xp: new HelperGeometry(edgePicker, {color: [1, 0.5, 0.5], rotation: [HPI, PI, 0]}),
	Y_xn: new HelperGeometry(edgePicker, {color: [1, 0.5, 0.5], rotation: [-HPI, 0, 0]}),
	Y_xp_zp: new HelperGeometry(cornerPicker, {color: [1, 0.5, 1], rotation: [-HPI, 0, HPI]}),
	Y_xn_zn: new HelperGeometry(cornerPicker, {color: [1, 0.5, 1], rotation: [HPI, 0, 0]}),
	Y_xp_zn: new HelperGeometry(cornerPicker, {color: [1, 0.5, 1], rotation: [HPI, 0, HPI]}),
	Y_xn_zp: new HelperGeometry(cornerPicker, {color: [1, 0.5, 1], rotation: [HPI, 0, -HPI]}),

	Z_yp: new HelperGeometry(edgePicker, {color: [0.5, 1, 0.5], rotation: [0, 0, -HPI]}),
	Z_yn: new HelperGeometry(edgePicker, {color: [0.5, 1, 0.5], rotation: [0, 0, HPI]}),
	Z_xp: new HelperGeometry(edgePicker, {color: [1, 0.5, 0.5], rotation: [0, PI, 0]}),
	Z_xn: new HelperGeometry(edgePicker, {color: [1, 0.5, 0.5], rotation: [0, 0, 0]}),
	Z_xp_yp: new HelperGeometry(cornerPicker, {color: [1, 1, 0.5], rotation: [PI, 0, HPI]}),
	Z_xn_yn: new HelperGeometry(cornerPicker, {color: [1, 1, 0.5], rotation: [PI, 0, -HPI]}),
	Z_xp_yn: new HelperGeometry(cornerPicker, {color: [1, 1, 0.5], rotation: [0, 0, HPI]}),
	Z_xn_yp: new HelperGeometry(cornerPicker, {color: [1, 1, 0.5], rotation: [PI, 0, 0]}),
};

export class TransformHelperStretch extends TransformHelper {
	get handleGeometry() {
		return handleGeometry;
	}
	get pickerGeometry() {
		return pickerGeometry;
	}
	objectChanged() {
		super.objectChanged();

		this.boundingBox = new Box3();

		if (this.object) {
			if (this.object.geometry) {
				if (!this.object.geometry.boundingBox) this.object.geometry.computeBoundingBox();
				this.boundingBox.copy(this.object.geometry.boundingBox);
			} else if (this.object.boundingBox) {
				this.boundingBox.copy(this.object.boundingBox);
			}
		}

		let max = this.boundingBox.max;
		let min = this.boundingBox.min;


		if (max && min) {
			this.handles['X_yp'].position.set(max.x, max.y, 0);
			this.handles['X_yn'].position.set(max.x, min.y, 0);
			this.handles['X_zp'].position.set(max.x, 0, max.z);
			this.handles['X_zn'].position.set(max.x, 0, min.z);
			this.handles['X_zp_yp'].position.set(max.x, max.y, max.z);
			this.handles['X_zn_yn'].position.set(max.x, min.y, min.z);
			this.handles['X_zp_yn'].position.set(max.x, min.y, max.z);
			this.handles['X_zn_yp'].position.set(max.x, max.y, min.z);

			this.handles['Y_zp'].position.set(0, max.y, max.z);
			this.handles['Y_zn'].position.set(0, max.y, min.z);
			this.handles['Y_xp'].position.set(max.x, max.y, 0);
			this.handles['Y_xn'].position.set(min.x, max.y, 0);
			this.handles['Y_xp_zp'].position.set(max.x, max.y, max.z);
			this.handles['Y_xn_zn'].position.set(min.x, max.y, min.z);
			this.handles['Y_xp_zn'].position.set(max.x, max.y, min.z);
			this.handles['Y_xn_zp'].position.set(min.x, max.y, max.z);

			this.handles['Z_yp'].position.set(0, max.y, max.z);
			this.handles['Z_yn'].position.set(0, min.y, max.z);
			this.handles['Z_xp'].position.set(max.x, 0, max.z);
			this.handles['Z_xn'].position.set(min.x, 0, max.z);
			this.handles['Z_xp_yp'].position.set(max.x, max.y, max.z);
			this.handles['Z_xn_yn'].position.set(min.x, min.y, max.z);
			this.handles['Z_xp_yn'].position.set(max.x, min.y, max.z);
			this.handles['Z_xn_yp'].position.set(min.x, max.y, max.z);

			this.pickers['X_yp'].position.set(max.x, max.y, 0);
			this.pickers['X_yn'].position.set(max.x, min.y, 0);
			this.pickers['X_zp'].position.set(max.x, 0, max.z);
			this.pickers['X_zn'].position.set(max.x, 0, min.z);
			this.pickers['X_zp_yp'].position.set(max.x, max.y, max.z);
			this.pickers['X_zn_yn'].position.set(max.x, min.y, min.z);
			this.pickers['X_zp_yn'].position.set(max.x, min.y, max.z);
			this.pickers['X_zn_yp'].position.set(max.x, max.y, min.z);

			this.pickers['Y_zp'].position.set(0, max.y, max.z);
			this.pickers['Y_zn'].position.set(0, max.y, min.z);
			this.pickers['Y_xp'].position.set(max.x, max.y, 0);
			this.pickers['Y_xn'].position.set(min.x, max.y, 0);
			this.pickers['Y_xp_zp'].position.set(max.x, max.y, max.z);
			this.pickers['Y_xn_zn'].position.set(min.x, max.y, min.z);
			this.pickers['Y_xp_zn'].position.set(max.x, max.y, min.z);
			this.pickers['Y_xn_zp'].position.set(min.x, max.y, max.z);

			this.pickers['Z_yp'].position.set(0, max.y, max.z);
			this.pickers['Z_yn'].position.set(0, min.y, max.z);
			this.pickers['Z_xp'].position.set(max.x, 0, max.z);
			this.pickers['Z_xn'].position.set(min.x, 0, max.z);
			this.pickers['Z_xp_yp'].position.set(max.x, max.y, max.z);
			this.pickers['Z_xn_yn'].position.set(min.x, min.y, max.z);
			this.pickers['Z_xp_yn'].position.set(max.x, min.y, max.z);
			this.pickers['Z_xn_yp'].position.set(min.x, max.y, max.z);

		}
	}
	updateMatrixWorld( force ) {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;

		if (!this.object) return;

		this.object.matrixWorld.decompose(_vector, _quaternion, _scale);
		_m1.compose(this.position, this.quaternion, _one);

		let scaledBoundingBox = this.boundingBox.clone();
		scaledBoundingBox.min.multiply(_scale);
		scaledBoundingBox.max.multiply(_scale);

		_scale.x = Math.abs(_scale.x);
		_scale.y = Math.abs(_scale.y);
		_scale.z = Math.abs(_scale.z);

		for (let i = 0; i < this.children.length; i ++) {
			let handle = this.children[i];
			let name = this.children[i].name;

			_boxVector.copy(handle.position).multiply(_scale);

			_wScale.copy(this.scale);

			_wScale.x *= 0.1;
			_wScale.y *= 0.1;
			_wScale.z *= 0.1;

			let _bx = Math.abs(scaledBoundingBox.min.x) + Math.abs(scaledBoundingBox.max.x);
			let _by = Math.abs(scaledBoundingBox.min.y) + Math.abs(scaledBoundingBox.max.y);
			let _bz = Math.abs(scaledBoundingBox.min.z) + Math.abs(scaledBoundingBox.max.z);

			let _x = Math.min(_wScale.x, _bx / 4);
			let _y = Math.min(_wScale.y, _by / 4);
			let _z = Math.min(_wScale.z, _bz / 4);

			if (name == 'X_yp' || name == 'X_yn') {
				_wScale.y = _y;
				_wScale.z = _bz - _z * 3;
			}

			if (name == 'X_zp' || name == 'X_zn') {
				_wScale.z = _z;
				_wScale.y = _by - _y * 3;
			}
			if (name == 'X_zp_yp' || name == 'X_zn_yn') {
				_wScale.y = _y;
				_wScale.z = _z;
			}
			if (name == 'X_zp_yn' || name == 'X_zn_yp') {
				_wScale.y = _y;
				_wScale.z = _z;
			}

			if (name == 'Y_zp' || name == 'Y_zn') {
				_wScale.z = _z;
				_wScale.x = _bx - _x * 3;
			}
			if (name == 'Y_xp' || name == 'Y_xn') {
				_wScale.x = _x;
				_wScale.z = _bz - _z * 3;
			}
			if (name == 'Y_xp_zp' || name == 'Y_xn_zn') {
				_wScale.x = _x;
				_wScale.z = _z;
			}
			if (name == 'Y_xp_zn' || name == 'Y_xn_zp') {
				_wScale.x = _x;
				_wScale.z = _z;
			}

			if (name == 'Z_yp' || name == 'Z_yn') {
				_wScale.y = _y;
				_wScale.x = _bx - _x * 3;
			}
			if (name == 'Z_xp' || name == 'Z_xn') {
				_wScale.x = _x;
				_wScale.y = _by - _y * 3;
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
