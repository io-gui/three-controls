/**
 * @author arodic / http://github.com/arodic
 */

// TODO: marquee selection

import {Raycaster, Line, LineBasicMaterial} from "../../../three.js/build/three.module.js";
import {Interactive} from "../Interactive.js";

// Temp variables
const raycaster = new Raycaster();

// @event change
const changeEvent = {type: 'change'};

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
}
