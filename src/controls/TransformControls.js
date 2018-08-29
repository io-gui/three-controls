/**
 * @author arodic / https://github.com/arodic
 */

import {Raycaster, Vector3, Quaternion} from "../../../three.js/build/three.module.js";
import {Interactive} from "../Interactive.js";
import {TransformControlsGizmo} from "./TransformControlsGizmo.js";
import {TransformControlsPlane} from "./TransformControlsPlane.js";

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

// events
const changeEvent = { type: "change" };

export class TransformControls extends Interactive {
	constructor(camera, domElement) {

		super(domElement);

		this.visible = false;

		this._gizmo = new TransformControlsGizmo();
		this.add(this._gizmo);

		this._plane = new TransformControlsPlane();
		this.add(this._plane);

		this.defineProperties({
			camera: camera,
			object: null,
			axis: null,
			mode: "translate",
			translationSnap: null,
			rotationSnap: null,
			space: "world",
			size: 1,
			showX: true,
			showY: true,
			showZ: true,
			// TODO: remove properties unused in plane and gizmo
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
			rotationAxis: new Vector3(),
			rotationAngle: 0,
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			cameraScale: new Vector3(),
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(),// TODO: remove
			eye: new Vector3(),
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3()
		});

		// TODO: implement better data binding
		// Defined properties are passed down to gizmo and plane
		for (let prop in this._properties) {
			this._plane[prop] = this._properties[prop];
			this._gizmo[prop] = this._properties[prop];
		}
		this.addEventListener('change', function (event) {
			this._plane[event.prop] = event.value;
			this._gizmo[event.prop] = event.value;
		});
	}
	objectChanged(value) {
		const hasObject = value ? true : false;
		this.visible = hasObject;
		if (!hasObject) {
			this.active = false;
			this.axis = null;
		}
	}
	updateMatrixWorld() {
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
		super.updateMatrixWorld();
	}
	onPointerHover(pointers) {
		if (!this.object || this.active === true) return;
		_ray.setFromCamera(pointers[0].position, this.camera);
		const intersect = _ray.intersectObjects(this._gizmo.picker[ this.mode ].children, true)[ 0 ] || false;
		if (intersect) {
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.intersectObjects([ this._plane ], true)[ 0 ] || false;
		let space = this.space;
		if (planeIntersect) {
			if (this.mode === 'scale') {
				space = 'local';
			} else if (this.axis === 'E' ||  this.axis === 'XYZE' ||  this.axis === 'XYZ') {
				space = 'world';
			}
			if (space === 'local' && this.mode === 'rotate') {
				const snap = this.rotationSnap;
				if (this.axis === 'X' && snap) this.object.rotation.x = Math.round(this.object.rotation.x / snap) * snap;
				if (this.axis === 'Y' && snap) this.object.rotation.y = Math.round(this.object.rotation.y / snap) * snap;
				if (this.axis === 'Z' && snap) this.object.rotation.z = Math.round(this.object.rotation.z / snap) * snap;
			}
			this.object.updateMatrixWorld();
			if (this.object.parent) {
				this.object.parent.updateMatrixWorld();
			}
			this.positionStart.copy(this.object.position);
			this.quaternionStart.copy(this.object.quaternion);
			this.scaleStart.copy(this.object.scale);
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart);
			if (space === 'local') this.pointStart.applyQuaternion(this.worldQuaternionStart.clone().inverse());
		}

		this.active = true;
	}
	onPointerMove(pointers) {
		let axis = this.axis;
		let mode = this.mode;
		let object = this.object;
		let space = this.space;

		if (mode === 'scale') {
			space = 'local';
		} else if (axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ') {
			space = 'world';
		}

		if (object === undefined || axis === null || this.active === false || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = _ray.intersectObjects([ this._plane ], true)[ 0 ] || false;

		if (planeIntersect === false) return;

		this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		// Apply translate
		if (mode === 'translate') {
			if (axis.search('X') === -1) {
				this.pointEnd.x = this.pointStart.x;
			}
			if (axis.search('Y') === -1) {
				this.pointEnd.y = this.pointStart.y;
			}
			if (axis.search('Z') === -1) {
				this.pointEnd.z = this.pointStart.z;
			}
			if (space === 'local') {
				object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
			} else {
				object.position.copy(this.pointEnd).sub(this.pointStart);
			}
			object.position.add(this.positionStart);

			// Apply translation snap
			if (this.translationSnap) {
				if (space === 'local') {
					object.position.applyQuaternion(_tempQuaternion.copy(this.quaternionStart).inverse());
					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}
					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}
					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}
					object.position.applyQuaternion(this.quaternionStart);
				}
				if (space === 'world') {
					if (object.parent) {
						object.position.add(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}
					if (axis.search('X') !== -1) {
						object.position.x = Math.round(object.position.x / this.translationSnap) * this.translationSnap;
					}
					if (axis.search('Y') !== -1) {
						object.position.y = Math.round(object.position.y / this.translationSnap) * this.translationSnap;
					}
					if (axis.search('Z') !== -1) {
						object.position.z = Math.round(object.position.z / this.translationSnap) * this.translationSnap;
					}
					if (object.parent) {
						object.position.sub(_tempVector.setFromMatrixPosition(object.parent.matrixWorld));
					}
				}
			}
		} else if (mode === 'scale') {
			if (axis.search('XYZ') !== -1) {
				let d = this.pointEnd.length() / this.pointStart.length();
				if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;
				_tempVector.set(d, d, d);
			} else {
				_tempVector.copy(this.pointEnd).divide(this.pointStart);
				if (axis.search('X') === -1) {
					_tempVector.x = 1;
				}
				if (axis.search('Y') === -1) {
					_tempVector.y = 1;
				}
				if (axis.search('Z') === -1) {
					_tempVector.z = 1;
				}
			}

			// Apply scale
			object.scale.copy(this.scaleStart).multiply(_tempVector);

		} else if (mode === 'rotate') {
			const ROTATION_SPEED = 20 / this.worldPosition.distanceTo(_tempVector.setFromMatrixPosition(this.camera.matrixWorld));
			const quaternion = this.space === "local" ? this.worldQuaternion : _identityQuaternion;
			const unit = _unit[ axis ];

			if (axis === 'E') {
				_tempVector.copy(this.pointEnd).cross(this.pointStart);
				this.rotationAxis.copy(this.eye);
				this.rotationAngle = this.pointEnd.angleTo(this.pointStart) * (_tempVector.dot(this.eye) < 0 ? 1 : -1);
			} else if (axis === 'XYZE') {
				_tempVector.copy(this.pointEnd).sub(this.pointStart).cross(this.eye).normalize();
				this.rotationAxis.copy(_tempVector);
				this.rotationAngle = this.pointEnd.sub(this.pointStart).dot(_tempVector.cross(this.eye)) * ROTATION_SPEED;
			} else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
				_alignVector.copy(unit).applyQuaternion(quaternion);
				this.rotationAxis.copy(unit);
				_tempVector.copy(unit);
				_tempVector2.copy(this.pointEnd).sub(this.pointStart);
				if (space === 'local') {
					_tempVector.applyQuaternion(quaternion);
					_tempVector2.applyQuaternion(this.worldQuaternionStart);
				}
				this.rotationAngle = _tempVector2.dot(_tempVector.cross(this.eye).normalize()) * ROTATION_SPEED;
			}

			// Apply rotation snap
			if (this.rotationSnap) this.rotationAngle = Math.round(this.rotationAngle / this.rotationSnap) * this.rotationSnap;

			// Apply rotate
			if (space === 'local') {
				object.quaternion.copy(this.quaternionStart);
				object.quaternion.multiply(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
			} else {
				object.quaternion.copy(_tempQuaternion.setFromAxisAngle(this.rotationAxis, this.rotationAngle));
				object.quaternion.multiply(this.quaternionStart);
			}
		}
		this.dispatchEvent(changeEvent);
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			this.active = false;
			this.axis = null;
		} else {
			if (pointers[0].button === -1) this.axis = null;
		}
	}
}
