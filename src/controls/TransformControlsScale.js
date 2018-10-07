/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperScale} from "../helpers/TransformHelperScale.js";

// Reusable utility variables
const tempVector = new Vector3();

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

// TODO: test and fix scale rate at various scales. Fix nefative scale gizmo flicker.

export class TransformControlsScale extends TransformControlsMixin(TransformHelperScale) {
	transform() {
		if (hasAxisAny('XYZ', this.axis)) {
			let d = this.pointEnd.length() / this.pointStart.length();
			if (this.pointEnd.dot(this.pointStart) < 0) d *= -1;
			tempVector.set(d, d, d);
		} else {
			tempVector.copy(this.pointEnd).divide(this.pointStart);
			if (!hasAxisAny('X', this.axis)) tempVector.x = 1;
			if (!hasAxisAny('Y', this.axis)) tempVector.y = 1;
			if (!hasAxisAny('Z', this.axis)) tempVector.z = 1;
		}
		// Apply scale
		// TODO: Fix inverse scale
		this.object.scale.copy(this.scaleStart).multiply(tempVector);
	}
}
