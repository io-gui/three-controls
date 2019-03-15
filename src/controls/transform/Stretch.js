/**
 * @author arodic / https://github.com/arodic
 */

import {Vector3} from "../../../../three.js/src/Three.js";
import {TransformControlsMixin} from "../Transform.js";
import {TransformHelperStretch} from "../../helpers/transform/Stretch.js";

// Reusable utility variables
const offset = new Vector3();
const scaleFactor = new Vector3();
const EPS = 0.000001;

function hasAxisAny(str, chars) {
	let has = true;
	str.split('').some(a => { if (chars.indexOf(a) === -1) has = false; });
	return has;
}

// TODO: fix toggle space>freescale

export class StretchTransformControls extends TransformControlsMixin(TransformHelperStretch) {
	transform() {
		// TODO: test with asymetric bounding boxes!!!
		offset.copy(this.pointEnd).sub(this.pointStart);

		scaleFactor.set(
			this.pointEnd.dot(this.worldX) / this.pointStart.dot(this.worldX),
			this.pointEnd.dot(this.worldY) / this.pointStart.dot(this.worldY),
			this.pointEnd.dot(this.worldZ) / this.pointStart.dot(this.worldZ),
		);

		if (this.axis.indexOf('x') === -1) scaleFactor.x = 1;
		if (this.axis.indexOf('y') === -1) scaleFactor.y = 1;
		if (this.axis.indexOf('z') === -1) scaleFactor.z = 1;

		offset.applyQuaternion(this.worldQuaternionInv);

		if (!hasAxisAny('x', this.axis)) offset.x = 0;
		if (!hasAxisAny('y', this.axis)) offset.y = 0;
		if (!hasAxisAny('z', this.axis)) offset.z = 0;

		const scaleOffset = this.scaleStart.clone().multiply(scaleFactor).sub(this.scaleStart).multiplyScalar(0.5);
		scaleOffset.set(
			Math.max(scaleOffset.x, -this.scaleStart.x + EPS),
			Math.max(scaleOffset.y, -this.scaleStart.y + EPS),
			Math.max(scaleOffset.z, -this.scaleStart.z + EPS),
		);

		// Apply position

		if (this.axis.indexOf('xp') !== -1) {
			this.object.position.x = scaleOffset.x * (this.boundingBox.max.x - this.boundingBox.min.x) * 0.5;
		} else {
			this.object.position.x = - scaleOffset.x * (this.boundingBox.max.x - this.boundingBox.min.x) * 0.5;
		}

		if (this.axis.indexOf('yp') !== -1) {
			this.object.position.y = scaleOffset.y * (this.boundingBox.max.y - this.boundingBox.min.y) * 0.5;
		} else {
			this.object.position.y = - scaleOffset.y * (this.boundingBox.max.y - this.boundingBox.min.y) * 0.5;
		}

		if (this.axis.indexOf('zp') !== -1) {
			this.object.position.z = scaleOffset.z * (this.boundingBox.max.z - this.boundingBox.min.z) * 0.5;
		} else {
			this.object.position.z = - scaleOffset.z * (this.boundingBox.max.z - this.boundingBox.min.z) * 0.5;
		}

		this.object.position.applyQuaternion(this.quaternionStart);
		this.object.position.add(this.positionStart);

		// Apply scale
		this.object.scale.copy(this.scaleStart).add(scaleOffset);
	}
	updatePlane() {
		const normal = this._plane.normal;
		const position = new Vector3();

		if (this.axis && this.axis[0] === 'X') {
			normal.copy(this.worldX);
			position.set(
				this.boundingBox.max.x,
				(this.boundingBox.max.y + this.boundingBox.min.y),
				(this.boundingBox.max.z + this.boundingBox.min.z)
			);
		}
		if (this.axis && this.axis[0] === 'Y') {
			normal.copy(this.worldY);
			position.set(
				(this.boundingBox.max.x + this.boundingBox.min.x),
				this.boundingBox.max.y,
				(this.boundingBox.max.z + this.boundingBox.min.z)
			);
		}
		if (this.axis && this.axis[0] === 'Z') {
			normal.copy(this.worldZ);
			position.set(
				(this.boundingBox.max.x + this.boundingBox.min.x),
				(this.boundingBox.max.y + this.boundingBox.min.y),
				this.boundingBox.max.z
			);
		}

		if (this.object) position.applyMatrix4(this.object.matrixWorld);

		this._plane.setFromNormalAndCoplanarPoint(normal, position);

		// this.parent.add(this._planeDebugMesh);
		// this._planeDebugMesh.position.set(0,0,0);
		// this._planeDebugMesh.lookAt(normal);
		// this._planeDebugMesh.position.copy(position);
	}
}
