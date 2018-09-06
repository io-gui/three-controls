/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {TransformControlsMixin} from "./TransformControls.js";
import {TransformHelperScale} from "../helpers/TransformHelperScale.js";

// Reusable utility variables
const tempVector = new Vector3();

export class TransformControlsScale extends TransformControlsMixin(TransformHelperScale) {
	transform(space) {
		if (this.hasAxis('XYZ')) {
			let d = this.pointEnd.length() / this.pointStart.length();
			if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;
			tempVector.set(d, d, d);
		} else {
			tempVector.copy(this.pointEnd).divide(this.pointStart);
			if (!this.hasAxis('X')) tempVector.x = 1;
			if (!this.hasAxis('Y')) tempVector.y = 1;
			if (!this.hasAxis('Z')) tempVector.z = 1;
		}

		// Apply scale
		this.object.scale.copy(this.scaleStart).multiply(tempVector);
	}
}
