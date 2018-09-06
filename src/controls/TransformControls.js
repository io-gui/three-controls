/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Color, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {InteractiveMixin} from "../Interactive.js";
import {TransformHelper} from "../helpers/TransformHelper.js";

// Reusable utility variables
const ray = new Raycaster();
const rayTarget = new Vector3();
const tempVector = new Vector3();
const colors = {
	white: new Color(0xffffff),
	gray: new Color(0x787878)
};
const alignX = new Vector3(1, 0, 0);
const alignY = new Vector3(0, 1, 0);
const alignZ = new Vector3(0, 0, 1);

// events
const changeEvent = { type: "change" };

export const TransformControlsMixin = (superclass) => class extends InteractiveMixin(superclass) {
	constructor(props) {
		super(props);

		this.visible = false;

		this.defineProperties({
			axis: null,
			active: false,
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3(),
			plane: new Plane()
		});

		// this.add(this.planeMesh = new Mesh(new PlaneBufferGeometry(1000, 1000, 100, 100), new MeshBasicMaterial({wireframe: true})));
	}
	// TODO: document
	hasAxis(str) {
		let has = true;
		str.split('').some(a => {
			if (this.axis.indexOf(a) === -1) has = false;
		});
		return has;
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
		ray.setFromCamera(pointers[0].position, this.camera); //TODO: unhack

		const intersect = ray.intersectObjects(this.picker.children, true)[0] || false;
		if (intersect) {
			// TODO: better translateOffset update
			this.object.updateMatrixWorld();
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			//
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}
	onPointerDown(pointers) {
		if (this.axis === null || !this.object || this.active === true || pointers[0].button !== 0) return;
		ray.setFromCamera(pointers[0].position, this.camera);
		const planeIntersect = ray.ray.intersectPlane(this.plane, rayTarget);
		let space = (this.axis === 'E' || this.axis === 'XYZ') ? 'world' : this.space;
		if (planeIntersect) {
			this.object.updateMatrixWorld();
			if (this.object.parent) {
				this.object.parent.updateMatrixWorld();
			}
			this.positionStart.copy(this.object.position);
			this.quaternionStart.copy(this.object.quaternion);
			this.scaleStart.copy(this.object.scale);
			this.object.matrixWorld.decompose(this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart);
			this.pointStart.copy(planeIntersect).sub(this.worldPositionStart);
			if (space === 'local') this.pointStart.applyQuaternion(this.worldQuaternionStart.clone().inverse());
			this.active = true;
		}
	}
	onPointerMove(pointers) {
		let axis = this.axis;
		let object = this.object;
		let space = (axis === 'E' || axis === 'XYZ') ? 'world' : this.space;

		if (object === undefined || axis === null || this.active === false || pointers[0].button !== 0) return;

		ray.setFromCamera(pointers[0].position, this.camera);

		const planeIntersect = ray.ray.intersectPlane(this.plane, tempVector);

		if (!planeIntersect) return;

		this.pointEnd.copy(planeIntersect).sub(this.worldPositionStart);

		if (space === 'local') this.pointEnd.applyQuaternion(this.worldQuaternionStart.clone().inverse());

		this.transform(space);

		this.object.updateMatrixWorld();
		this.dispatchEvent(changeEvent);
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			this.active = false;
			if (pointers.removed[0].pointerType === 'touch') this.axis = null;
		} else {
			if (pointers[0].button === -1) this.axis = null;
		}
	}
	transform() {
		// TODO:
		return;
	}
	updateAxis(axis) {
		super.updateAxis(axis);
		this.highlightAxis(axis, this.axis);
	}
	highlightAxis(child, axis, force) {
		if (child.material) {
			child.material._opacity = child.material._opacity || child.material.opacity;
			child.material._color = child.material._color || child.material.color.clone();

			child.material.color.copy(child.material._color);
			child.material.opacity = child.material._opacity;

			child.material.color.lerp(colors['white'], 0.25);

			if (!this.enabled) {
				child.material.opacity *= 0.25;
				child.material.color.lerp(colors['gray'], 0.75);
			} else if (axis) {
				if (this.hasAxis(child.name) || force) {
					child.material.opacity = child.material._opacity * 2;
					child.material.color.copy(child.material._color);
				} else {
					child.material.opacity *= 0.25;
					child.material.color.lerp(colors['white'], 0.5);
				}
			}
		}
	}
	updatePlane() {
		alignX.set(1, 0, 0);
		alignY.set(0, 1, 0);
		alignZ.set(0, 0, 1);

		// TODO: this check might be unnecessary
		if (this.space === "local") { // scale always oriented to local rotation
			alignX.applyQuaternion(this.worldQuaternion);
			alignY.applyQuaternion(this.worldQuaternion);
			alignZ.applyQuaternion(this.worldQuaternion);
		}

		switch (this.axis) {
			case 'X':
				tempVector.copy(this.eye).cross(alignX);
				this.plane.normal.copy(alignX).cross(tempVector);
				break;
			case 'Y':
				tempVector.copy(this.eye).cross(alignY);
				this.plane.normal.copy(alignY).cross(tempVector);
				break;
			case 'Z':
				tempVector.copy(this.eye).cross(alignZ);
				this.plane.normal.copy(alignZ).cross(tempVector);
				break;
			case 'XY':
				this.plane.normal.copy(alignZ);
				break;
			case 'YZ':
				this.plane.normal.copy(alignX);
				break;
			case 'XZ':
				this.plane.normal.copy(alignY);
				break;
			case 'XYZ':
			case 'E':
				this.camera.getWorldDirection(this.plane.normal);
				break;
		}

		this.plane.setFromNormalAndCoplanarPoint(this.plane.normal, this.worldPosition);

		// this.parent.add(this.planeMesh);
		// this.planeMesh.position.set(0,0,0);
		// this.planeMesh.lookAt(this.plane.normal);
		// this.planeMesh.position.copy(this.worldPosition);
	}
}

export class TransformControls extends TransformControlsMixin(TransformHelper) {}
