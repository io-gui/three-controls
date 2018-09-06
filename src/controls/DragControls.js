/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import {Plane, Raycaster, Vector3} from "../../../three.js/build/three.module.js";
import {Interactive} from "../Interactive.js";

// Reusable utility variables
const plane = new Plane();
const ray = new Raycaster();
const offset = new Vector3();
const intersection = new Vector3();
let selected = null;

// TODO: original controls stick when dragout

export class DragControls extends Interactive {
	constructor(objects, domElement, props) {
		super(domElement);
		if (camera === undefined || !camera.isCamera) {
			console.warn('camera is mandatory in constructor!');
		}
		// TODO: check objects and implement selection
		this.defineProperties({
			objects: objects,
			camera: camera
		});
	}
	onPointerDown(pointers) {
		ray.setFromCamera(pointers[0].position, this.camera);
		plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(plane.normal), this.object.position);
		let intersects = ray.intersectObjects(this.objects);
		if (intersects.length > 0) {
			selected = intersects[0].object;
			if (ray.ray.intersectPlane(plane, intersection)) {
				this.active = true;
				offset.copy(intersection).sub(selected.position);
			}
		}
	}
	onPointerMove(pointers) {
		// let rect = this.domElement.getBoundingClientRect();
		ray.setFromCamera(pointers[0].position, this.camera);
		plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(plane.normal), this.object.position);
		if (selected) {
			if (ray.ray.intersectPlane(plane, intersection)) {
				selected.position.copy(intersection.sub(offset));
				this.needsUpdate = false;
			}
		}
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			selected = null;
			this.active = false;
			// domElement.style.cursor = 'auto';
		}
	}
	attach(object) {
		this.object = object;
		this.visible = true;
	}
	detach() {
		this.object = undefined;
		this.visible = false;
	}
}
