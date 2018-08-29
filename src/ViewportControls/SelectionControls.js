/**
 * @author arodic / http://github.com/arodic
 */

import {Vector2, Vector3, Raycaster, Object3D, LineBasicMaterial, Line} from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";

// Temp variables
const raycaster = new Raycaster();
let intersects;

// Events
const changeEvent = { type: 'change' };
const mat = new LineBasicMaterial({ depthTest: false, transparent: true });

export class SelectionControls extends Control {
	constructor( camera, domElement, scene, selection ) {
		super( domElement );

		this.defineProperties({
			camera: camera,
			scene: scene,
			selection: selection
		});
	}
	select(position, add) {
		raycaster.setFromCamera( position, this.camera );
		intersects = raycaster.intersectObjects(this.scene.children, true);
		if ( intersects.length > 0 ) {
			var object = intersects[ 0 ].object;
			// TODO: handle helper selection
			if (add) {
				this.selection.toggle(intersects[ 0 ].object);
			} else {
				this.selection.replace(intersects[ 0 ].object);
			}
		} else {
			this.selection.clear();
		}

		for (let i = this.children.length; i--;) {
			this.remove(this.children[i]);
		}
		for (let i = 0; i < this.selection.selected.length; i++) {
			let _helper = new Line( this.selection.selected[i].geometry, mat );
			// TODO: fix scewed helpers with rotated and scaled hierarchy
			_helper._src = this.selection.selected[i];
			this.selection.selected[i].matrixWorld.decompose( _helper.position, _helper.quaternion, _helper.scale );
			this.add(_helper)
		}

		this.dispatchEvent(changeEvent);
	}
	onPointerUp( pointers ) {
		if ( !this.enabled ) return;
		if ( pointers.length === 0 ) {
			let dist = pointers.removed[0].distance.length();
			if (dist < 0.01) {
				this.select(pointers.removed[0].position, pointers.removed[0].ctrlKey);
			}
		}
	}
	updateMatrixWorld() {
    for (var i = 0; i < this.children.length; i++) {
      let _helper = this.children[i];
      _helper._src.matrixWorld.decompose( _helper.position, _helper.quaternion, _helper.scale );
    }
    super.updateMatrixWorld();
  }
}
