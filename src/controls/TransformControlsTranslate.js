/**
 * @author arodic / https://github.com/arodic
 */
import {Vector3, Quaternion} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperTranslate} from "../helpers/TransformHelperTranslate.js";

const offset = new Vector3();

const worldPos = new Vector3();
const worldQuat = new Quaternion();
const worldQuatInv = new Quaternion();
const worldScale = new Vector3();

const parentPos = new Vector3();
const parentQuat = new Quaternion();
const parentQuatInv = new Quaternion();
const parentScale = new Vector3();

const quatInv = new Quaternion();

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

export class TransformControlsTranslate extends TransformControlsMixin(TransformHelperTranslate) {
	transform() {
		const space = (this.axis === 'XYZ') ? 'world' : this.space;

		offset.copy(this.pointEnd).sub(this.pointStart);

		this.object.matrixWorld.decompose(worldPos, worldQuat, worldScale);
		worldQuatInv.copy(worldQuat).inverse();

		this.object.parent.matrixWorld.decompose(parentPos, parentQuat, parentScale);
		parentQuatInv.copy(parentQuat).inverse();

		if (space === 'local') {
			offset.applyQuaternion(worldQuatInv);
		}

		if (!hasAxisAny('X', this.axis)) offset.x = 0;
		if (!hasAxisAny('Y', this.axis)) offset.y = 0;
		if (!hasAxisAny('Z', this.axis)) offset.z = 0;

		if (space === 'local') {
			offset.applyQuaternion(this.quaternionStart).divide(parentScale);
		} else {
			offset.applyQuaternion(parentQuatInv).divide(parentScale);
		}

		this.object.position.copy(offset).add(this.positionStart);
	}
}
