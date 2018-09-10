/**
 * @author arodic / https://github.com/arodic
 */

import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperTranslate} from "../helpers/TransformHelperTranslate.js";

export class TransformControlsTranslate extends TransformControlsMixin(TransformHelperTranslate) {
	transform() {
		if (!this.hasAxis('X')) this.pointEnd.x = this.pointStart.x;
		if (!this.hasAxis('Y')) this.pointEnd.y = this.pointStart.y;
		if (!this.hasAxis('Z')) this.pointEnd.z = this.pointStart.z;

		if (this.space === 'local') {
			this.object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
		} else {
			this.object.position.copy(this.pointEnd).sub(this.pointStart);
		}
		this.object.position.add(this.positionStart);
	}
}
