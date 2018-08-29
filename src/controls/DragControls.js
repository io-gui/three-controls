/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

import {Plane, Raycaster, Vector3} from "../../../three.js/build/three.module.js";
import {Interactive} from "../Interactive.js";

const _plane = new Plane();
const _raycaster = new Raycaster();
const _offset = new Vector3();
const _intersection = new Vector3();
let _selected = null;

// TODO: original controls stick when dragout

export class DragControls extends Interactive {
	constructor(objects, camera, domElement) {
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
		_raycaster.setFromCamera(pointers[0].position, this.camera);
		_plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(_plane.normal), this.object.position);
		let intersects = _raycaster.intersectObjects(this.objects);
		if (intersects.length > 0) {
			_selected = intersects[ 0 ].object;
			if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
				this.active = true;
				_offset.copy(_intersection).sub(_selected.position);
			}
		}
	}
	onPointerMove(pointers) {
		// let rect = this.domElement.getBoundingClientRect();
		_raycaster.setFromCamera(pointers[0].position, this.camera);
		_plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(_plane.normal), this.object.position);
		if (_selected) {
			if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
				_selected.position.copy(_intersection.sub(_offset));
				this.needsUpdate = false;
			}
		}
	}
	onPointerUp(pointers) {
		if (pointers.length === 0) {
			_selected = null;
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
