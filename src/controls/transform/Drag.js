/**
 * @author arodic / https://github.com/arodic
 */

import {TransformControlsMixin} from "../Transform.js";
import {TransformHelper} from "../../helpers/Transform.js";

// TODO: Drag Controls should use object as picker and no handle.
export class DragTransformControls extends TransformControlsMixin(TransformHelper) {
	transform(space) {
		if (space === 'local') {
			this.object.position.copy(this.pointEnd).sub(this.pointStart).applyQuaternion(this.quaternionStart);
		} else {
			this.object.position.copy(this.pointEnd).sub(this.pointStart);
		}
		this.object.position.add(this.positionStart);
	}
}
