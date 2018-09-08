/**
 * @author arodic / https://github.com/arodic
 */

import {Line} from "../../lib/three.module.js";
import {Helper} from "../Helper.js";
import {TransformHelper} from "./TransformHelper.js";
import {HelperMaterial as Material} from "./HelperMaterial.js";

export class SelectionHelper extends Helper {
	constructor(props) {
		super(props);
		const axis = new TransformHelper();
		axis.size = 0.02;
		this.add(axis);
		if (props.object && props.object.geometry) {
			this.add(new Line(props.object.geometry, new Material('white', 0.5)));
		}
	}
}
