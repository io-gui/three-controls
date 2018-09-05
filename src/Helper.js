/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Quaternion} from "../../three.js/build/three.module.js";

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

export class Helper extends Object3D {
	get isHelper() { return true; }
	constructor(target, camera) {
		super();

		this.target = target;
		this.camera = camera;
		this.space = 'local';

		this.size = 0;

		this.worldPosition = new Vector3();
		this.worldQuaternion = new Quaternion();
		this.worldScale = new Vector3();

		this.cameraPosition = new Vector3();
		this.cameraQuaternion = new Quaternion();
		this.cameraScale = new Vector3();

		this.eye = new Vector3();
	}
	updateHelperMatrix() {
		if (this.target) {
			this.target.updateMatrixWorld();
			this.matrix.copy(this.target.matrix);
			this.matrixWorld.copy(this.target.matrixWorld);
		} else {
			super.updateMatrixWorld();
		}

		this.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);

		let eyeDistance = 1;
		if (this.camera) {
			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, this.cameraScale);
			if (this.camera.isPerspectiveCamera) {
				this.eye.copy(this.cameraPosition).sub(this.worldPosition);
				eyeDistance = this.eye.length();
				this.eye.normalize();
			} else if (this.camera.isOrthographicCamera) {
				this.eye.copy(this.cameraPosition).normalize();
			}
		}

		if (this.size || this.space == 'world') {
			if (this.size) this.worldScale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
			if (this.space === 'world') this.worldQuaternion.set(0, 0, 0, 1);
			this.matrixWorld.compose(this.worldPosition, this.worldQuaternion, this.worldScale);
		}
	}
	updateMatrixWorld() {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i ++) {
			children[i].updateMatrixWorld(true);
		}
	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	combineHelperGroups(groups) {
		const gizmo = new Object3D();
		for (let name in groups) {
			for (let i = groups[name].length; i--;) {
				const object = groups[name][i][0].clone();
				const position = groups[name][i][1];
				const rotation = groups[name][i][2];
				const scale = groups[name][i][3];
				const tag = groups[name][i][4];

				// name and tag properties are essential for picking and updating logic.
				object.name = name;
				object.tag = tag;

				if (position) { object.position.set(position[0], position[1], position[2]); }
				if (rotation) { object.rotation.set(rotation[0], rotation[1], rotation[2]); }
				if (scale) { object.scale.set(scale[0], scale[1], scale[2]); }

				object.updateMatrix();

				const tempGeometry = object.geometry.clone();
				tempGeometry.applyMatrix(object.matrix);
				object.geometry = tempGeometry;

				object.position.set(0, 0, 0);
				object.rotation.set(0, 0, 0);
				object.scale.set(1, 1, 1);
				gizmo.add(object);
			}
		}
		return gizmo;
	}
}
