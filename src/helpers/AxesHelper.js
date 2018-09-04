import {BufferGeometry, Float32BufferAttribute, Line} from "../../../three.js/build/three.module.js";
import {Helper} from "../Helper.js";


// reusable geometry
const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute('position', new Float32BufferAttribute([0, 0, 0,	1, 0, 0], 3));

export class AxesHelper extends Helper {
	constructor(target, camera) {
		super(target, camera);

		this.size = 0.15;
		this.showX = true;
		this.showY = true;
		this.showZ = true;

		this.init();
	}
	init() {
		const gizmoTranslate = {
			X: [[new Line(lineGeometry, this.setupHelperMaterial('red', true))]],
			Y: [[new Line(lineGeometry, this.setupHelperMaterial('green', true)), null, [0, 0, Math.PI / 2]]],
			Z: [[new Line(lineGeometry, this.setupHelperMaterial('blue', true)), null, [0, -Math.PI / 2, 0]]]
		};
		this.add(this.setupHelper(gizmoTranslate));
	}
	updateHelperMatrix() {
		// Hide non-enabled axes
		this.traverse(axis => {
			axis.visible = axis.visible && (axis.name.indexOf("X") === -1 || this.showX);
			axis.visible = axis.visible && (axis.name.indexOf("Y") === -1 || this.showY);
			axis.visible = axis.visible && (axis.name.indexOf("Z") === -1 || this.showZ);
			axis.visible = axis.visible && (axis.name.indexOf("E") === -1 || (this.showX && this.showY && this.showZ));
		});
		super.updateHelperMatrix();
	}
	highlightAxis(axis) {
		this.traverse(child => {
			if (child.material) {
				child.material._opacity = child.material._opacity || child.material.opacity;
				child.material._color = child.material._color || child.material.color.clone();

				child.material.color.copy(child.material._color);
				child.material.opacity = child.material._opacity;

				child.material.color.lerp(this.colors['white'], 0.25);

				if (!this.enabled) {
					child.material.opacity *= 0.25;
					child.material.color.lerp(this.colors['gray'], 0.75);
				} else if (axis) {
					if (child.name === axis) {
						child.material.opacity = child.material._opacity * 2;
						child.material.color.copy(child.material._color);
					} else if (axis.split('').some(function(a) {return child.name === a;})) {
						child.material.opacity = child.material._opacity * 2;
						child.material.color.copy(child.material._color);
					} else {
						child.material.opacity *= 0.25;
						child.material.color.lerp(this.colors['white'], 0.5);
					}
				}
			}
		});
	}
}
