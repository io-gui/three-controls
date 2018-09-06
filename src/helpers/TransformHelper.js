import {
	BufferGeometry, Float32BufferAttribute, Line, Vector3, Quaternion, Color,
	DoubleSide, Mesh, MeshBasicMaterial, OctahedronBufferGeometry
} from "../../../three.js/build/three.module.js";
import {Helper} from "../Helper.js";

// Reusable utility variables
const _colors = {
	red: new Color(0xff0000),
	green: new Color(0x00ff00),
	blue: new Color(0x0000ff),
	white: new Color(0xffffff),
	gray: new Color(0x787878),
	yellow: new Color(0xffff00),
	cyan: new Color(0x00ffff),
	magenta: new Color(0xff00ff),
};
const _tempVector = new Vector3();
const _unitX = new Vector3(1, 0, 0);
const _unitY = new Vector3(0, 1, 0);
const _unitZ = new Vector3(0, 0, 1);

export class Material extends MeshBasicMaterial {
	constructor(color, opacity) {
		super({
			depthTest: false,
			depthWrite: false,
			transparent: true,
			side: DoubleSide,
			fog: false,
			color: color !== undefined ? color : _colors['white'],
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
			showZ: true,
			worldX: new Vector3(),
			worldY: new Vector3(),
			worldZ: new Vector3(),
			axisDotEye: new Vector3()
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
		const mat = new Material('white', 0.15);
		return {
			XYZ: [[new Mesh(new OctahedronBufferGeometry(0.2, 0), mat)]]
		}
	}
	updateHelperMatrix() {
		super.updateHelperMatrix();

		for (var i = this.handle.children.length; i--;) {
			this.updateAxis(this.handle.children[i]);
		}
		for (var i = this.picker.children.length; i--;) {
			this.updateAxis(this.picker.children[i]);
		}

		this.worldX.set(1, 0, 0).applyQuaternion(this.worldQuaternion);
		this.worldY.set(0, 1, 0).applyQuaternion(this.worldQuaternion);
		this.worldZ.set(0, 0, 1).applyQuaternion(this.worldQuaternion);

		this.axisDotEye.set(
			this.worldX.dot(this.eye),
			this.worldY.dot(this.eye),
			this.worldZ.dot(this.eye)
		);

		this.picker.visible = false;
	}
	combineHelperGroups(groups) {
		const _groups = super.combineHelperGroups(groups);
		for (var i = _groups.children.length; i--;) {
			let object = _groups.children[i];
			// TODO: document
			object.has = char => {return object.name.search(char) !== -1;}
			object.is = char => {return object.name === char;}
		}
		return _groups;
	}
	updateAxis(axis) {
		// Hide non-enabled Transform
		axis.visible = true;
		axis.visible = axis.visible && (!axis.has("X") || this.showX);
		axis.visible = axis.visible && (!axis.has("Y") || this.showY);
		axis.visible = axis.visible && (!axis.has("Z") || this.showZ);
		axis.visible = axis.visible && (!axis.has("E") || (this.showX && this.showY && this.showZ));
	}
}
