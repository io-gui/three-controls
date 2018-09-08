/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperScale} from "../helpers/TransformHelperScale.js";

// Reusable utility variables
const tempVector = new Vector3();

export class TransformControlsScale extends TransformControlsMixin(TransformHelperScale) {
	transform() {
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
