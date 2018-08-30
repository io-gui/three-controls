/**
 * @author arodic / https://github.com/arodic
 */

import {Line, LineBasicMaterial} from "../../../three.js/build/three.module.js";
import {Helper} from "../Helper.js";

const helperMat = new LineBasicMaterial({ depthTest: false, transparent: true });

export class SelectionHelper extends Helper {
  constructor(target) {
    super(target);
    this.add(new Line(target.geometry, helperMat));
  }
}
