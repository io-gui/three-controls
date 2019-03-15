/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author arodic / http://github.com/arodic
 */

import * as THREE from "../../../../three.js/src/Three.js";
import {CameraControls} from "../Camera.js";

/*
 * This set of controls performs orbiting, dollying, and panning.
 * Unlike TrackballCameraControls, it maintains the "up" direction camera.up (+Y by default).
 *
 *  Orbit - left mouse / touch: one-finger move
 *  Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *  Pan - right mouse, or left mouse + ctrlKey/altKey, wasd, or arrow keys / touch: two-finger move
 */

// Temp variables
const eye = new THREE.Vector3();
const offset = new THREE.Vector3();
const offset2 = new THREE.Vector3();
const unitY = new THREE.Vector3(0, 1, 0);
const tempQuat = new THREE.Quaternion();
const tempQuatInverse = tempQuat.clone().inverse();

export class OrbitCameraControls extends CameraControls {
	constructor(props) {
		super(props);

		this.defineProperties({
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity, // PerspectiveCamera dolly limit
			minZoom: 0, // OrthographicCamera zoom limit
			maxZoom: Infinity, // OrthographicCamera zoom limit
			minPolarAngle: 0, // radians (0 to Math.PI)
			maxPolarAngle: Math.PI, // radians (0 to Math.PI)
			minAzimuthAngle: - Infinity, // radians (-Math.PI to Math.PI)
			maxAzimuthAngle: Infinity, // radians (-Math.PI to Math.PI)
			screenSpacePanning: false,
			_spherical: new THREE.Spherical()
		});
	}
	orbit(orbit) {
		// camera.up is the orbit axis
		tempQuat.setFromUnitVectors(this.camera.up, unitY);
		tempQuatInverse.copy(tempQuat).inverse();
		eye.copy(this.camera.position).sub(this.target);
		// rotate eye to "y-axis-is-up" space
		eye.applyQuaternion(tempQuat);
		// angle from z-axis around y-axis
		this._spherical.setFromVector3(eye);
		this._spherical.theta -= orbit.x;
		this._spherical.phi += orbit.y;
		// restrict theta to be between desired limits
		this._spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this._spherical.theta));
		// restrict phi to be between desired limits
		this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
	}
	dolly(dolly) {
		let dollyScale = (dolly > 0) ? 1 - dolly : 1 / (1 + dolly);
		if (this.camera.isPerspectiveCamera) {
			this._spherical.radius /= dollyScale;
		} else if (this.camera.isOrthographicCamera) {
			this.camera.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.camera.zoom * dollyScale));
		}
		this.camera.updateProjectionMatrix();

		this._spherical.makeSafe();
		// restrict radius to be between desired limits
		this._spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._spherical.radius));
	}
	pan(pan) {
		// move target to panned location

		let panLeftDist;
		let panUpDist;
		if (this.camera.isPerspectiveCamera) {
			// half of the fov is center to top of screen
			let fovFactor = Math.tan((this.camera.fov / 2) * Math.PI / 180.0);
			panLeftDist = pan.x * eye.length() * fovFactor;
			panUpDist = -pan.y * eye.length() * fovFactor;
		} else if (this.camera.isOrthographicCamera) {
			panLeftDist = pan.x * (this.camera.right - this.camera.left) / this.camera.zoom;
			panUpDist = -pan.y * (this.camera.top - this.camera.bottom) / this.camera.zoom;
		}

		// panLeft
		offset.setFromMatrixColumn(this.camera.matrix, 0);
		offset.multiplyScalar(-panLeftDist);
		offset2.copy(offset);

		// panUp
		if (this.screenSpacePanning) {
			offset.setFromMatrixColumn(this.camera.matrix, 1);
		} else {
			offset.setFromMatrixColumn(this.camera.matrix, 0);
			offset.crossVectors(this.camera.up, offset);
		}
		offset.multiplyScalar(panUpDist);
		offset2.add(offset);


		this.target.add(offset2);
		offset.setFromSpherical(this._spherical);
		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion(tempQuatInverse);
		this.camera.position.copy(this.target).add(offset);
		this.camera.lookAt(this.target);
	}
	focus() {
		console.log(this.selection);
	}
	// utility getters
	get polarAngle() {
		return this._spherical.phi;
	}
	get azimuthalAngle() {
		return this._spherical.theta;
	}
}
