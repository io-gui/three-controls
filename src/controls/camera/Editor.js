/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../../three.js/src/Three.js";
import {CameraControls} from "../Camera.js";

// Reusable utility variables
const center = new THREE.Vector3();
const delta = new THREE.Vector3();
const box = new THREE.Box3();
const normalMatrix = new THREE.Matrix3();
const spherical = new THREE.Spherical();
const sphere = new THREE.Sphere();

export class EditorCameraControls extends CameraControls {
	orbit(orbit) {
		delta.copy(this.camera.position).sub(this.target);
		spherical.setFromVector3(delta);
		spherical.theta -= orbit.x;
		spherical.phi += orbit.y;
		spherical.makeSafe();
		delta.setFromSpherical(spherical);
		this.camera.position.copy(this.target).add(delta);
		this.camera.lookAt(this.target);
	}
	dolly(dolly) {
		delta.set(0, 0, dolly);
		let distance = this.camera.position.distanceTo(this.target);
		delta.multiplyScalar(distance * this.dollySpeed);
		if (delta.length() > distance) return;
		delta.applyMatrix3(normalMatrix.getNormalMatrix(this.camera.matrix));
		this.camera.position.add(delta);
	}
	pan(pan) {
		let distance = this.camera.position.distanceTo(this.target);
		delta.set(-pan.x, -pan.y, 0);
		delta.multiplyScalar(distance);
		delta.applyMatrix3(normalMatrix.getNormalMatrix(this.camera.matrix));
		this.camera.position.add(delta);
		this.target.add(delta);
	}
	focus() {
		if (this.object) {
			let distance;
			box.setFromObject(this.object);
			if (box.isEmpty() === false) {
				this.target.copy(box.getCenter(center));
				distance = box.getBoundingSphere(sphere).radius;
			} else {
				// Focusing on an Group, AmbientLight, etc
				this.target.setFromMatrixPosition(this.object.matrixWorld);
				distance = 0.1;
			}
			delta.set(0, 0, 1);
			delta.applyQuaternion(this.camera.quaternion);
			delta.multiplyScalar(distance * 4);
			this.camera.position.copy(this.target).add(delta);
		}
	}
}
