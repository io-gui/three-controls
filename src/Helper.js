/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Quaternion} from "../lib/three.module.js";
import {IoLiteMixin} from "../lib/IoLiteMixin.js";

// Reusable utility variables
const _cameraPosition = new Vector3();
const _cameraQuaternion = new Quaternion();
const _cameraScale = new Vector3();

/*
 * Helper extends Object3D to automatically follow its target `object` by copying transform matrices from it.
 * If `space` property is set to "world", helper wil orient itself in world space.
 * Helpers will auto-scale in view space if `size` property is non-zero.
 */

export class Helper extends IoLiteMixin(Object3D) {
	constructor(props = {}) {
		super();

		this.defineProperties({
			object: props.object || null,
			camera: props.camera || null,
			space: 'local',
			size: 0
		});

		this.eye = new Vector3();
	}
	updateHelperMatrix() {
		if (this.object) {
			this.matrix.copy(this.object.matrix);
			this.matrixWorld.copy(this.object.matrixWorld);
		} else {
			super.updateMatrixWorld();
		}

		this.matrixWorld.decompose(this.position, this.quaternion, this.scale);

		const camera = this.scene.currentCamera;
		if (camera) {
			let eyeDistance = 1;
			camera.matrixWorld.decompose(_cameraPosition, _cameraQuaternion, _cameraScale);
			if (camera.isPerspectiveCamera) {
				this.eye.copy(_cameraPosition).sub(this.position);
				eyeDistance = this.eye.length();
				this.eye.normalize();
			} else if (camera.isOrthographicCamera) {
				eyeDistance = 3 * (camera.top - camera.bottom) / camera.zoom; // TODO: not sure why 3 works
				this.eye.copy(_cameraPosition).normalize();
			}
			if (this.size) this.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
		}
		if (this.space === 'world') this.quaternion.set(0, 0, 0, 1);

		this.matrixWorld.compose(this.position, this.quaternion, this.scale);
	}
	updateMatrixWorld( force ) {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		for (let i = this.children.length; i--;) this.children[i].updateMatrixWorld( force );
	}
}
