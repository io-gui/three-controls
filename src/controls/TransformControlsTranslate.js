/**
 * @author arodic / https://github.com/arodic
 */

import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperTranslate} from "../helpers/TransformHelperTranslate.js";

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

export class TransformControlsTranslate extends TransformControlsMixin(TransformHelperTranslate) {
	transform() {
		if (!hasAxisAny('X', this.axis)) this.pointEnd.x = this.pointStart.x;
		if (!hasAxisAny('Y', this.axis)) this.pointEnd.y = this.pointStart.y;
		if (!hasAxisAny('Z', this.axis)) this.pointEnd.z = this.pointStart.z;

		if (this.space === 'local') {
			this.object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
		} else {
			this.object.position.copy(this.pointEnd).sub(this.pointStart);
		}
		this.object.position.add(this.positionStart);
	}
}
