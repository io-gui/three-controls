/**
 * @author arodic / https://github.com/arodic
 */

import {Mesh, Vector3} from "../../lib/three.module.js";
import {HelperMaterial} from "./HelperMaterial.js";

export class HelperMesh extends Mesh {
	constructor(geometry) {
		super();
		const props = geometry.props || {};
		this.geometry = geometry;
		this.material = new HelperMaterial(props);
		this.scaleTarget = new Vector3(1, 1, 1);
		this.hidden = false;
		this.highlight = props.highlight || 0;
	}
}
