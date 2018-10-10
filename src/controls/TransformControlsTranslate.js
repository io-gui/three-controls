/**
 * @author arodic / https://github.com/arodic
 */
import {Vector3} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperTranslate} from "../helpers/TransformHelperTranslate.js";

const offset = new Vector3();

export class TransformControlsTranslate extends TransformControlsMixin(TransformHelperTranslate) {
	transform() {
		offset.copy(this.pointEnd).sub(this.pointStart);

		if (this.space === 'local' && this.axis !== 'XYZ') {
			offset.applyQuaternion(this.worldQuaternionStartInv);
		}

		if (this.axis.indexOf('X') === -1) offset.x = 0;
		if (this.axis.indexOf('Y') === -1) offset.y = 0;
		if (this.axis.indexOf('Z') === -1) offset.z = 0;

		if (this.space === 'local' && this.axis !== 'XYZ') {
			offset.applyQuaternion(this.quaternionStart).divide(this.parentScaleStart);
		} else {
			offset.applyQuaternion(this.parentQuaternionStartInv).divide(this.parentScaleStart);
		}

		this.object.position.copy(offset).add(this.positionStart);
	}
}
