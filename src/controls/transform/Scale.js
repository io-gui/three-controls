/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../../../three.js/src/Three.js";
import {TransformControlsMixin} from "../Transform.js";
import {TransformHelperScale} from "../../helpers/transform/Scale.js";

// Reusable utility variables
const scaleFactor = new Vector3();
const EPS = 0.000001;

export class ScaleTransformControls extends TransformControlsMixin(TransformHelperScale) {
	transform() {
		if (this.axis === 'XYZ') {

			let refVector = this.pointStart.clone().normalize();
			let factor = this.pointEnd.dot(refVector) / this.pointStart.dot(refVector);
			scaleFactor.set(factor, factor, factor);

		} else {

			scaleFactor.set(
				this.pointEnd.dot(this.worldX) / this.pointStart.dot(this.worldX),
				this.pointEnd.dot(this.worldY) / this.pointStart.dot(this.worldY),
				this.pointEnd.dot(this.worldZ) / this.pointStart.dot(this.worldZ),
			);

			if (this.axis.indexOf('X') === -1) scaleFactor.x = 1;
			if (this.axis.indexOf('Y') === -1) scaleFactor.y = 1;
			if (this.axis.indexOf('Z') === -1) scaleFactor.z = 1;
		}

		this.object.scale.copy(this.scaleStart).multiply(scaleFactor);
		this.object.scale.set(
			Math.max(this.object.scale.x, EPS),
			Math.max(this.object.scale.y, EPS),
			Math.max(this.object.scale.z, EPS),
		);
	}
}
