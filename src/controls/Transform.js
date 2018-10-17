/**
 * @author arodic / https://github.com/arodic
 */

import {Raycaster, Vector3, Quaternion, Plane} from "../../lib/three.module.js";
import {InteractiveMixin} from "./Interactive.js";

// Reusable utility variables
const _ray = new Raycaster();
const _rayTarget = new Vector3();
const _tempVector = new Vector3();

// events
const changeEvent = { type: "change" };

export const TransformControlsMixin = (superclass) => class extends InteractiveMixin(superclass) {
	constructor(props) {
		super(props);

		this.pointStart = new Vector3();
		this.pointEnd = new Vector3();

		this.positionStart = new Vector3();
		this.quaternionStart = new Quaternion();
		this.scaleStart = new Vector3();

		this.parentPosition = new Vector3();
		this.parentQuaternion = new Quaternion();
		this.parentQuaternionInv = new Quaternion();
		this.parentScale = new Vector3();

		this.worldPosition = new Vector3();
		this.worldQuaternion = new Quaternion();
		this.worldQuaternionInv = new Quaternion();
		this.worldScale = new Vector3();

		this._plane = new Plane();
		this.objectChanged();

		// this.add(this._planeDebugMesh = new Mesh(new PlaneBufferGeometry(1000, 1000, 10, 10), new MeshBasicMaterial({wireframe: true, transparent: true, opacity: 0.2})));
	}
	objectChanged() {
		super.objectChanged();
		let hasObject = this.object ? true : false;
		this.visible = hasObject;
		this.enabled = hasObject;
		if (!hasObject) {
			this.active = false;
			this.axis = null;
		}
		this.animation.startAnimation(1.5);
	}
	// TODO: better animation trigger
	// TODO: also trigger on object change
	// TODO: Debug stalling animations on hover
	enabledChanged(value) {
		super.enabledChanged(value);
		this.animation.startAnimation(0.5);
	}
	axisChanged() {
		super.axisChanged();
		this.updatePlane();
	}
	activeChanged() {
		this.animation.startAnimation(0.5);
	}
	onPointerHover(pointers) {
		if (!this.object || this.active === true) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const intersect = _ray.intersectObjects(this.pickers, true)[0] || false;

		this.axis = intersect ? intersect.object.name : null;
	}
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const planeIntersect = _ray.ray.intersectPlane(this._plane, _rayTarget);

		if (planeIntersect) {
			this.object.updateMatrixWorld();
			this.object.matrix.decompose(this.positionStart, this.quaternionStart, this.scaleStart);
			this.object.parent.matrixWorld.decompose(this.parentPosition, this.parentQuaternion, this.parentScale);
			this.object.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);

			this.parentQuaternionInv.copy(this.parentQuaternion).inverse();
			this.worldQuaternionInv.copy(this.worldQuaternion).inverse();

			this.pointStart.copy(planeIntersect).sub(this.worldPosition);
			this.active = true;
		}
	}
	onPointerMove(pointers) {
		if (this.object === undefined || this.axis === null || this.active === false || pointers[0].button !== 0) return;

		_ray.setFromCamera(pointers[0].position, this.camera);
		const planeIntersect = _ray.ray.intersectPlane(this._plane, _tempVector);

		if (planeIntersect) {
			this.pointEnd.copy(planeIntersect).sub(this.worldPosition);
			this.transform();
			this.object.updateMatrixWorld();
			this.dispatchEvent(changeEvent);
		}

	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			if (pointers.removed[0].pointerType === 'touch') this.axis = null;
			this.active = false;
		} else if (pointers[0].button === -1) {
			this.axis = null;
			this.active = false;
		}
	}
	transform() {}
	updateAxis(axis) {
		super.updateAxis(axis);
		if (!this.enabled) axis.material.highlight = (10 * axis.material.highlight - 2.5) / 11;
	}
	updateGuide(axis) {
		super.updateGuide(axis);
		if (this.active === true) {
			let offset = new Vector3().copy(this.positionStart).sub(this.object.position).divide(this.scale);
			axis.position.copy(offset);
			if (this.space === 'local') {
				axis.position.applyQuaternion(this.worldQuaternionInv);
				let quatOffset = new Quaternion().copy(this.quaternionStart.clone().inverse()).multiply(this.object.quaternion);
				axis.quaternion.copy(quatOffset.clone().inverse());
			}
		} else {
			axis.position.set(0, 0, 0);
			axis.quaternion.set(0, 0, 0, 1);
		}
	}
	updatePlane() {
		const normal = this._plane.normal;
		const axis = this.axis ? this.axis.split('_').pop() : null;

		if (axis === 'X') normal.copy(this.worldX).cross(_tempVector.copy(this.eye).cross(this.worldX));
		if (axis === 'Y') normal.copy(this.worldY).cross(_tempVector.copy(this.eye).cross(this.worldY));
		if (axis === 'Z') normal.copy(this.worldZ).cross(_tempVector.copy(this.eye).cross(this.worldZ));
		if (axis === 'XY') normal.copy(this.worldZ);
		if (axis === 'YZ') normal.copy(this.worldX);
		if (axis === 'XZ') normal.copy(this.worldY);
		if (axis === 'XYZ' || axis === 'E') this.camera.getWorldDirection(normal);

		this._plane.setFromNormalAndCoplanarPoint(normal, this.position);

		// this.parent.add(this._planeDebugMesh);
		// this._planeDebugMesh.position.set(0,0,0);
		// this._planeDebugMesh.lookAt(normal);
		// this._planeDebugMesh.position.copy(this.position);
	}
};
