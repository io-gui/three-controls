/**
 * @author arodic / https://github.com/arodic
 */
import {Vector3} from "../../../../three.js/src/Three.js";
import {TransformControlsMixin} from "../Transform.js";
import {TransformHelperTranslate} from "../../helpers/transform/Translate.js";

const offset = new Vector3();

export class TranslateTransformControls extends TransformControlsMixin(TransformHelperTranslate) {
	transform() {
		offset.copy(this.pointEnd).sub(this.pointStart);

		if (this.space === 'local' && this.axis !== 'XYZ') {
			offset.applyQuaternion(this.worldQuaternionInv);
		}

		if (this.axis.indexOf('X') === -1) offset.x = 0;
		if (this.axis.indexOf('Y') === -1) offset.y = 0;
		if (this.axis.indexOf('Z') === -1) offset.z = 0;

		if (this.space === 'local' && this.axis !== 'XYZ') {
			offset.applyQuaternion(this.quaternionStart).divide(this.parentScale);
		} else {
			offset.applyQuaternion(this.parentQuaternionInv).divide(this.parentScale);
		}

		this.object.position.copy(offset).add(this.positionStart);
	}
}
