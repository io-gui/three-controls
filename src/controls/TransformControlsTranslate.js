/**
 * @author arodic / https://github.com/arodic
 */

import {Object3D, Raycaster, Vector3, Quaternion, Plane, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {TransformControlsMixin} from "./TransformControls.js";
import {TransformHelperTranslate} from "../helpers/TransformHelperTranslate.js";

export class TransformControlsTranslate extends TransformControlsMixin(TransformHelperTranslate) {
	transform(space) {
		if (!this.hasAxis('X')) this.pointEnd.x = this.pointStart.x;
		if (!this.hasAxis('Y')) this.pointEnd.y = this.pointStart.y;
		if (!this.hasAxis('Z')) this.pointEnd.z = this.pointStart.z;

		if (space === 'local') {
			this.object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
		} else {
			this.object.position.copy(this.pointEnd).sub(this.pointStart);
		}
		this.object.position.add(this.positionStart);
	}
}
