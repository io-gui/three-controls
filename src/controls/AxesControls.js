/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {InteractiveMixin} from "../Interactive.js";

// Reusable utility variables
const _ray = new Raycaster();
const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1)
};
const _identityQuaternion = new Quaternion();
const _alignVector = new Vector3();
const _alignX = new Vector3(1, 0, 0);
const _alignY = new Vector3(0, 1, 0);
const _alignZ = new Vector3(0, 0, 1);
// events
const changeEvent = { type: "change" };

export const AxesControls = (superclass) => class extends InteractiveMixin(superclass) {
	constructor(props) {
		super(props); // TODO

		this.visible = false;

		this.defineProperties({
			axis: null,
				translationSnap: null,
				rotationSnap: null,
			active: false,
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
				rotationAxis: new Vector3(),
				rotationAngle: 0,
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3(),
			_plane: new Plane()
		});
	}
	objectChanged(value) {
		let hasObject = value ? true : false;
		this.visible = hasObject;
		if (!hasObject) {
			this.active = false;
			this.axis = null;
		}
	}
	updateHelperMatrix() {
		if (this.object) {
			this.object.updateMatrixWorld();
			this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);
		}
		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this.cameraScale);
		if (this.camera.isPerspectiveCamera) {
			this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();
		} else if (this.camera.isOrthographicCamera) {
			this.eye.copy(this.cameraPosition).normalize();
		}
		super.updateHelperMatrix();
		this.updatePlane();
	}
	onPointerHover(pointers) {
		if (!this.object || this.active === true) return;
		_ray.setFromCamera(pointers[0].position, this.camera); //TODO: unhack

		const intersect = _ray.intersectObjects(this.picker.children, true)[0] || false;
		if (intersect) {
			// TODO: better translateOffset update
			this.object.updateMatrixWorld();
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			this.active = false;
			if (pointers.removed[0].pointerType === 'touch') this.axis = null;
		} else {
			if (pointers[0].button === -1) this.axis = null;
		}
	}
	updatePlane() {
		_alignX.set(1, 0, 0);
		_alignY.set(0, 1, 0);
		_alignZ.set(0, 0, 1);

		if (this.space === "local") { // scale always oriented to local rotation
			_alignX.applyQuaternion(this.worldQuaternion);
			_alignY.applyQuaternion(this.worldQuaternion);
			_alignZ.applyQuaternion(this.worldQuaternion);
		}

		switch (this.axis) {
			case 'X':
			_alignVector.copy(this.eye).cross(_alignX);
			this._plane.normal.copy(_alignX).cross(_alignVector);
			break;
			case 'Y':
			_alignVector.copy(this.eye).cross(_alignY);
			this._plane.normal.copy(_alignY).cross(_alignVector);
			break;
			case 'Z':
			_alignVector.copy(this.eye).cross(_alignZ);
			this._plane.normal.copy(_alignZ).cross(_alignVector);
			break;
			case 'XY':
			this._plane.normal.copy(_alignZ);
			break;
			case 'YZ':
			this._plane.normal.copy(_alignX);
			break;
			case 'XZ':
			this._plane.normal.copy(_alignY);
			break;
			case 'XYZ':
			case 'E':
			this.camera.getWorldDirection(this._plane.normal);
			break;
		}

		this._plane.setFromNormalAndCoplanarPoint(this._plane.normal, this.worldPosition);
	}
}
