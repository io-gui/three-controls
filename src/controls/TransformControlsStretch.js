/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperStretch} from "../helpers/TransformHelperStretch.js";
export class TransformControlsStretch extends TransformControlsMixin(TransformHelperStretch) {
	transform() {
	}
	updatePlane() {
		const axis = this.axis;
		const normal = this.plane.normal;
		const position = new Vector3();
		const camera = this.scene.currentCamera;

		if (axis && axis[0] === 'X') {
			normal.copy(this.worldX);
			position.set(
				this.boundingBox.max.x,
				(this.boundingBox.max.y + this.boundingBox.min.y),
				(this.boundingBox.max.z + this.boundingBox.min.z)
			);
		}
		if (axis && axis[0] === 'Y') {
			normal.copy(this.worldY);
			position.set(
				(this.boundingBox.max.x + this.boundingBox.min.x),
				this.boundingBox.max.y,
				(this.boundingBox.max.z + this.boundingBox.min.z)
			);
		}
		if (axis && axis[0] === 'Z') {
			normal.copy(this.worldZ);
			position.set(
				(this.boundingBox.max.x + this.boundingBox.min.x),
				(this.boundingBox.max.y + this.boundingBox.min.y),
				this.boundingBox.max.z
			);
		}

		// TODO: test
		position.applyMatrix4(this.object.matrixWorld);

		this.plane.setFromNormalAndCoplanarPoint(normal, position);
	}
}
