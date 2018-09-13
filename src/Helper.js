/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Quaternion} from "../lib/three.module.js";
import {IoLiteMixin} from "../lib/IoLiteMixin.js";
import {Animation} from "./Animation.js";

// Reusable utility variables
const _tempVector = new Vector3();

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

export class Helper extends IoLiteMixin(Object3D) {
	get isHelper() {return true;}
	constructor(props = {}) {
		super();
		this.defineProperties({
			object: props.object || null,
			space: 'local',
			size: 0,

			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(),
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			eye: new Vector3(),

			animation: new Animation()

		});

		this.animation.addEventListener('update', () => {
			this.dispatchEvent({type: 'change'});
		});

	}
	updateHelperMatrix() {

		if (this.object) {
			this.matrix.copy(this.object.matrix);
			this.matrixWorld.copy(this.object.matrixWorld);
		} else {
			super.updateMatrixWorld();
		}

		this.matrixWorld.decompose(this.worldPosition, this.worldQuaternion, this.worldScale);

		let eyeDistance = 1;

		const camera = this.scene.currentCamera;

		if (camera) {
			camera.matrixWorld.decompose(this.cameraPosition, this.cameraQuaternion, _tempVector);
			if (camera.isPerspectiveCamera) {
				this.eye.copy(this.cameraPosition).sub(this.worldPosition);
				eyeDistance = this.eye.length();
				this.eye.normalize();
			} else if (camera.isOrthographicCamera) {
				this.eye.copy(this.cameraPosition).normalize();
			}
		}

		if (this.size) this.worldScale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
		if (this.space === 'world') this.worldQuaternion.set(0, 0, 0, 1);

		this.matrixWorld.compose(this.worldPosition, this.worldQuaternion, this.worldScale);
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
