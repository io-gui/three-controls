import {BufferGeometry, Float32BufferAttribute, Line, Color, DoubleSide, MeshBasicMaterial} from "../../../three.js/build/three.module.js";
import {Helper} from "../Helper.js";

const colors = {
	red: new Color(0xff0000),
	green: new Color(0x00ff00),
	blue: new Color(0x0000ff),
	white: new Color(0xffffff),
	gray: new Color(0x787878),
	yellow: new Color(0xffff00),
	cyan: new Color(0x00ffff),
	magenta: new Color(0xff00ff),
};

export class Material extends MeshBasicMaterial {
	constructor(color, opacity) {
		super({
			depthTest: false,
			depthWrite: false,
			transparent: true,
			side: DoubleSide,
			fog: false,
			color: color !== undefined ? color : colors['white'],
			opacity: opacity !== undefined ? opacity : 1
		});
	}
}

// reusable geometry
const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

export class TransformHelper extends Helper {
	constructor(props) {
		super(props);

		this.defineProperties({
			showX: true,
			showY: true,
			showZ: true
		});
		this.size = 0.1;

		this.add(this.handle = this.combineHelperGroups(this.handlesGroup));
		this.add(this.picker = this.combineHelperGroups(this.pickersGroup));
	}
	get handlesGroup() {
		return {
			X: [[new Line(lineGeometry, new Material('red', true))]],
			Y: [[new Line(lineGeometry, new Material('green', true)), null, [0, 0, Math.PI / 2]]],
			Z: [[new Line(lineGeometry, new Material('blue', true)), null, [0, -Math.PI / 2, 0]]]
		}
	}
	get pickersGroup() {
		return {}
	}
	updateHelperMatrix() {
		for (var i = 0; i < this.handle.children.length; i++) {
			this.updateAxis(this.handle.children[i]);
		}
		for (var i = 0; i < this.picker.children.length; i++) {
			this.updateAxis(this.picker.children[i]);
		}
		this.picker.visible = false;
		super.updateHelperMatrix();
	}
	updateAxis(axis) {
		// Hide non-enabled Transform
		axis.visible = axis.visible && (axis.name.indexOf("X") === -1 || this.showX);
		axis.visible = axis.visible && (axis.name.indexOf("Y") === -1 || this.showY);
		axis.visible = axis.visible && (axis.name.indexOf("Z") === -1 || this.showZ);
		axis.visible = axis.visible && (axis.name.indexOf("E") === -1 || (this.showX && this.showY && this.showZ));
	}
}
