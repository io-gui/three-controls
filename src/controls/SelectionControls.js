/**
 * @author arodic / http://github.com/arodic
 */

import {Raycaster, Line, LineBasicMaterial} from "../../../three.js/build/three.module.js";
import {Interactive} from "../Interactive.js";

const helperMat = new LineBasicMaterial({ depthTest: false, transparent: true });

// Temp variables
const raycaster = new Raycaster();

// Events
const changeEvent = { type: 'change' };

export class SelectionControls extends Interactive {
	constructor(camera, domElement, scene, selection) {
		super(domElement);

		this.defineProperties({
			camera: camera,
			scene: scene,
			selection: selection
		});
	}
	select(position, add) {
		raycaster.setFromCamera(position, this.camera);
		const intersects = raycaster.intersectObjects(this.scene.children, true);
		if (intersects.length > 0) {
			const object = intersects[0].object;
			// TODO: handle helper selection
			if (add) {
				this.selection.toggle(object);
			} else {
				this.selection.replace(object);
			}
		} else {
			this.selection.clear();
		}

		for (let i = this.children.length; i--;) {
			this.remove(this.children[i]);
		}
		for (let i = 0; i < this.selection.selected.length; i++) {
			const _helper = new Line(this.selection.selected[i].geometry, helperMat);
			_helper._src = this.selection.selected[i];
			_helper.matrixAutoUpdate = false;
			this.selection.selected[i].updateMatrixWorld();
			this.selection.selected[i].matrixWorld.decompose(_helper.position, _helper.quaternion, _helper.scale);
			this.add(_helper);
		}

		this.dispatchEvent(changeEvent);
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			const dist = pointers.removed[0].distance.length();
			if (dist < 0.01) {
				this.select(pointers.removed[0].position, pointers.removed[0].ctrlKey);
			}
		}
	}
	updateMatrixWorld() {
		super.updateMatrixWorld();
		for (let i = 0; i < this.children.length; i++) {
			const _helper = this.children[i];
			_helper.matrixWorld.copy(_helper._src.matrixWorld);
		}
	}
}
