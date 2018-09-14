/**
 * @author arodic / https://github.com/arodic
 */

import {Mesh, Vector3, BufferGeometry} from "../../lib/three.module.js";
import {HelperGeometry} from "./HelperGeometry.js";
import {HelperMaterial} from "./HelperMaterial.js";

export class HelperMesh extends Mesh {
	constructor(geometry, props = {}) {
		super();
		this.geometry = geometry;
		this.material = new HelperMaterial(props.color || 'white', props.opacity || 1);
		this.scaleTarget = new Vector3(1, 1, 1);
		this.hidden = false;
		this.highlight = 0;
		this.name = props.name;
	}
}
