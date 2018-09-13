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
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 * Additional Helpers will auto-scale in view space if size property is set.
 */

export class Helper extends IoLiteMixin(Object3D) {
	get isHelper() {return true;}
	constructor(props = {}) {
		super();
		this.defineProperties({
			object: props.object || null,
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
				this.eye.copy(_cameraPosition).normalize();
			}
			// TODO: test helper size in orthographic cameras.
			if (this.size) this.scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
		}
		if (this.space === 'world') this.quaternion.set(0, 0, 0, 1);
		this.matrixWorld.compose(this.position, this.quaternion, this.scale);
	}
	updateMatrixWorld( force ) {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		for (let i = this.children.length; i--;) {
			this.children[i].updateMatrixWorld( force );
		}
	}
}
// TODO: dispose
