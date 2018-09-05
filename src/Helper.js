/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Vector3, Color, Quaternion, DoubleSide, MeshBasicMaterial} from "../../three.js/build/three.module.js";

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

const worldPosition = new Vector3();
const cameraWorldPosition = new Vector3();

const tempPosition = new Vector3();
const tempQuaternion = new Quaternion();
const tempScale = new Vector3();

const helperMaterial = new MeshBasicMaterial({
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
});

export class Helper extends Object3D {
	get isHelper() { return true; }
	constructor(target, camera) {
		super();
		this.target = target;
		this.camera = camera;
		this.space = 'local';
		// const variables
		this.colors = {
			red: new Color(0xff0000),
			green: new Color(0x00ff00),
			blue: new Color(0x0000ff),
			white: new Color(0xffffff),
			gray: new Color(0x787878),
			yellow: new Color(0xffff00),
			cyan: new Color(0x00ffff),
			magenta: new Color(0xff00ff),
		};
		this.size = 0;
	}
	updateHelperMatrix() {
		let eyeDistance = 0;
		let scale = new Vector3();
		if (this.target) {
			this.target.updateMatrixWorld();
			this.matrix.copy(this.target.matrix);
			this.matrixWorld.copy(this.target.matrixWorld);
		} else {
			super.updateMatrixWorld();
		}

		if (this.camera && this.size) {
			this.camera.updateMatrixWorld();
			worldPosition.setFromMatrixPosition(this.matrixWorld);
			cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);
			eyeDistance = worldPosition.distanceTo(cameraWorldPosition);
			if (eyeDistance) scale.set(1, 1, 1).multiplyScalar(eyeDistance * this.size);
		}

		this.matrixWorld.decompose(tempPosition, tempQuaternion, tempScale);
		if (this.space === 'world') tempQuaternion.set(0, 0, 0, 1);
		this.matrixWorld.compose(tempPosition, tempQuaternion, eyeDistance ? scale : tempScale);
	}
	updateMatrixWorld() {
		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i ++) {
			children[i].updateMatrixWorld(true);
		}
	}
	setupHelperMaterial(color, opacity) {
		const material = helperMaterial.clone();
		material.color.set(this.colors[color]);
		if (opacity !== undefined) material.opacity = opacity;
		return material;
	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	setupHelper(gizmoMap) {
		const gizmo = new Object3D();

		for (let name in gizmoMap) {
			for (let i = gizmoMap[name].length; i--;) {
				const object = gizmoMap[name][i][0].clone();
				const position = gizmoMap[name][i][1];
				const rotation = gizmoMap[name][i][2];
				const scale = gizmoMap[name][i][3];
				const tag = gizmoMap[name][i][4];

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
