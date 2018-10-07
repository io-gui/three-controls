/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../lib/three.module.js";
import {TransformControlsMixin} from "./TransformControlsMixin.js";
import {TransformHelperStretch} from "../helpers/TransformHelperStretch.js";

// Reusable utility variables
const tempVector = new Vector3();
const tempVector2 = new Vector3();

function stringHas(str, char) {return str.search(char) !== -1;}

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

export class TransformControlsStretch extends TransformControlsMixin(TransformHelperStretch) {
	transform() {
		// TODO: make working in world space if possible?
		// TODO: test with asymetric bounding boxes!!!

		if (!hasAxisAny('x', this.axis)) this.pointEnd.x = this.pointStart.x;
		if (!hasAxisAny('y', this.axis)) this.pointEnd.y = this.pointStart.y;
		if (!hasAxisAny('z', this.axis)) this.pointEnd.z = this.pointStart.z;

		tempVector.copy(this.pointEnd).divide(this.pointStart);

		if (!hasAxisAny('x', this.axis)) tempVector.x = 1;
		if (!hasAxisAny('y', this.axis)) tempVector.y = 1;
		if (!hasAxisAny('z', this.axis)) tempVector.z = 1;

		const scaleOffset = this.scaleStart.clone().multiply(tempVector).sub(this.scaleStart).multiplyScalar(0.5);

		// Apply position

		if (stringHas(this.axis, 'xp')) {
			this.object.position.x = scaleOffset.x * (this.boundingBox.max.x - this.boundingBox.min.x) * 0.5;
		} else {
			this.object.position.x = - scaleOffset.x * (this.boundingBox.max.x - this.boundingBox.min.x) * 0.5;
		}

		if (stringHas(this.axis, 'yp')) {
			this.object.position.y = scaleOffset.y * (this.boundingBox.max.y - this.boundingBox.min.y) * 0.5;
		} else {
			this.object.position.y = - scaleOffset.y * (this.boundingBox.max.y - this.boundingBox.min.y) * 0.5;
		}

		if (stringHas(this.axis, 'zp')) {
			this.object.position.z = scaleOffset.z * (this.boundingBox.max.z - this.boundingBox.min.z) * 0.5;
		} else {
			this.object.position.z = - scaleOffset.z * (this.boundingBox.max.z - this.boundingBox.min.z) * 0.5;
		}

		// TODO: Fix nonuniform scale box
		// TODO: Fix inverse scale

		this.object.position.applyQuaternion(this.quaternionStart);
		this.object.position.add(this.positionStart);

		// Apply scale
		this.object.scale.copy(this.scaleStart).add(scaleOffset);


	}
	updatePlane() {
		const axis = this.axis;
		const normal = this.plane.normal;
		const position = new Vector3();

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
		if (this.object) position.applyMatrix4(this.object.matrixWorld);

		this.plane.setFromNormalAndCoplanarPoint(normal, position);
	}
}
