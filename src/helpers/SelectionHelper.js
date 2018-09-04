/**
 * @author arodic / https://github.com/arodic
 */

import {Line, LineBasicMaterial} from "../../../three.js/build/three.module.js";
import {Helper} from "../Helper.js";
import {AxesHelper} from "./AxesHelper.js";

const helperMat = new LineBasicMaterial({ depthTest: false, transparent: true });

export class SelectionHelper extends Helper {
  constructor(target, camera) {
    super(target, camera);
    const axis = new AxesHelper(target, camera);
    axis.size = 0.05;
    this.add(axis);
    this.add(new Line(target.geometry, helperMat));
  }
}
