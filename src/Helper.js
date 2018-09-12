/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Quaternion} from "../lib/three.module.js";
import {IoLiteMixin} from "../lib/IoLiteMixin.js";
import {Animation} from "./Animation.js";

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

export class Helper extends IoLiteMixin(Object3D) {
	get isHelper() {return true;}
	constructor(props = {}) {
		super();
		this.defineProperties({
			domElement: props.domElement || null,
			object: props.object || null,
			camera: props.camera || null,
			space: 'local',
			size: 0,
			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(),
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			cameraScale: new Vector3(),
			eye: new Vector3(),
			animation: new Animation()
		});
		this.animation.addEventListener('update', () => {
			this.dispatchEvent({type: 'change'});
		});
	}
	updateHelperMatrix() {
		if (this.object) {
			this.object.updateMatrixWorld();
			this.matrix.copy(this.object.matrix);
			this.matrixWorld.copy(this.object.matrixWorld);
		} else {
			super.updateMatrixWorld(); // TODO: camera?
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
	updateMatrixWorld( force, camera ) {
		if (camera) this.camera = camera; // TODO

		this.updateHelperMatrix(camera);
		this.matrixWorldNeedsUpdate = false;

		for (let i = 0, l = this.children.length; i < l; i ++) {
			this.children[i].updateMatrixWorld(true, camera);
		}
	}
}
// TODO: dispose
