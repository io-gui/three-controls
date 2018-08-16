/**
 * @author arodic / https://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {ObjectControls} from "./ObjectControls.js";
import {TransformControlsGizmo} from "./TransformControlsGizmo.js";
import {TransformControlsPlane} from "./TransformControlsPlane.js";

// Reusable utility variables
const _ray = new THREE.Raycaster();
const _tempVector = new THREE.Vector3();
const _tempVector2 = new THREE.Vector3();
const _tempQuaternion = new THREE.Quaternion();
const _unit = {
	X: new THREE.Vector3( 1, 0, 0 ),
	Y: new THREE.Vector3( 0, 1, 0 ),
	Z: new THREE.Vector3( 0, 0, 1 )
};
const _identityQuaternion = new THREE.Quaternion();
const _alignVector = new THREE.Vector3();

// events
const changeEvent = { type: "change" };

export class TransformControls extends ObjectControls {
	get isTransformControls() { return true; }
	constructor( camera, domElement ) {

		super( domElement );

		this._gizmo = new TransformControlsGizmo();
		this.add( this._gizmo );

		this._plane = new TransformControlsPlane();
		this.add( this._plane );

		this.defineProperties({
			camera: camera,
			object: undefined,
			axis: null,
			mode: "translate",
			translationSnap: null,
			rotationSnap: null,
			space: "world",
			size: 1,
			hideX: false,
			hideY: false,
			hideZ: false,
			// TODO: remove properties unused in plane and gizmo
			pointStart: new THREE.Vector3(),
			pointEnd: new THREE.Vector3(),
			rotationAxis: new THREE.Vector3(),
			rotationAngle: 0,
			cameraPosition: new THREE.Vector3(),
			cameraQuaternion: new THREE.Quaternion(),
			cameraScale: new THREE.Vector3(),
			worldPositionStart: new THREE.Vector3(),
			worldQuaternionStart: new THREE.Quaternion(),
			worldScaleStart: new THREE.Vector3(), // TODO: remove
			worldPosition: new THREE.Vector3(),
			worldQuaternion: new THREE.Quaternion(),
			worldScale: new THREE.Vector3(),// TODO: remove
			eye: new THREE.Vector3(),
			positionStart: new THREE.Vector3(),
			quaternionStart: new THREE.Quaternion(),
			scaleStart: new THREE.Vector3()
		});


		// TODO: implement better data binding
		// Defined properties are passed down to gizmo and plane
		for ( let prop in this._properties ) {
			this._plane[prop] = this._properties[prop];
			this._gizmo[prop] = this._properties[prop];
		}
		this.addEventListener( 'change', function ( event ) {
			this._plane[event.prop] = event.value;
			this._gizmo[event.prop] = event.value;
		});
	}
	updateMatrixWorld() {
		if ( this.object !== undefined ) {
			this.object.updateMatrixWorld();
			this.object.matrixWorld.decompose( this.worldPosition, this.worldQuaternion, this.worldScale );
		}
		this.camera.updateMatrixWorld();
		this.camera.matrixWorld.decompose( this.cameraPosition, this.cameraQuaternion, this.cameraScale );
		if ( this.camera.isPerspectiveCamera ) {
			this.eye.copy( this.cameraPosition ).sub( this.worldPosition ).normalize();
		} else if ( this.camera.isOrthographicCamera ) {
			this.eye.copy( this.cameraPosition ).normalize();
		}
		super.updateMatrixWorld();
	}
	onPointerHover( pointers ) {
		let pointer = pointers[0];
		if ( this.object === undefined || this.active === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;
		_ray.setFromCamera( pointer.position, this.camera );
		const intersect = _ray.intersectObjects( this._gizmo.picker[ this.mode ].children, true )[ 0 ] || false;
		if ( intersect ) {
			this.axis = intersect.object.name;
		} else {
			this.axis = null;
		}
	}
	onPointerDown( pointers ) {
		let pointer = pointers[0];
		if ( this.object === undefined || this.active === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;
		if ( ( pointer.button === 0 || pointer.button === undefined ) && this.axis !== null ) {
			_ray.setFromCamera( pointer.position, this.camera );
			const planeIntersect = _ray.intersectObjects( [ this._plane ], true )[ 0 ] || false;
			if ( planeIntersect ) {
				if ( this.mode === 'scale') {
					this.space = 'local';
				} else if ( this.axis === 'E' ||  this.axis === 'XYZE' ||  this.axis === 'XYZ' ) {
					this.space = 'world';
				}
				if ( this.space === 'local' && this.mode === 'rotate' ) {
					const snap = this.rotationSnap;
					if ( this.axis === 'X' && snap ) this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap;
					if ( this.axis === 'Y' && snap ) this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap;
					if ( this.axis === 'Z' && snap ) this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;
				}
				this.object.updateMatrixWorld();
				if ( this.object.parent ) {
					this.object.parent.updateMatrixWorld();
				}
				this.positionStart.copy( this.object.position );
				this.quaternionStart.copy( this.object.quaternion );
				this.scaleStart.copy( this.object.scale );
				this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart );
				this.pointStart.copy( planeIntersect.point ).sub( this.worldPositionStart );
				if ( this.space === 'local' ) this.pointStart.applyQuaternion( this.worldQuaternionStart.clone().inverse() );
			}
			this.active = true;
		}
	}
	onPointerMove( pointers ) {

		let pointer = pointers[0];

		let axis = this.axis;
		let mode = this.mode;
		let object = this.object;
		let space = this.space;

		if ( mode === 'scale') {
			space = 'local';
		} else if ( axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ' ) {
			space = 'world';
		}

		if ( object === undefined || axis === null || this.active === false || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;

		_ray.setFromCamera( pointer.position, this.camera );

		const planeIntersect = _ray.intersectObjects( [ this._plane ], true )[ 0 ] || false;

		if ( planeIntersect === false ) return;

		this.pointEnd.copy( planeIntersect.point ).sub( this.worldPositionStart );

		if ( space === 'local' ) this.pointEnd.applyQuaternion( this.worldQuaternionStart.clone().inverse() );

		// Apply translate
		if ( mode === 'translate' ) {
			if ( axis.search( 'X' ) === -1 ) {
				this.pointEnd.x = this.pointStart.x;
			}
			if ( axis.search( 'Y' ) === -1 ) {
				this.pointEnd.y = this.pointStart.y;
			}
			if ( axis.search( 'Z' ) === -1 ) {
				this.pointEnd.z = this.pointStart.z;
			}
			if ( space === 'local' ) {
				object.position.copy( this.pointEnd ).sub( this.pointStart ).applyQuaternion( this.quaternionStart );
			} else {
				object.position.copy( this.pointEnd ).sub( this.pointStart );
			}
			object.position.add( this.positionStart );

			// Apply translation snap
			if ( this.translationSnap ) {
				if ( space === 'local' ) {
					object.position.applyQuaternion(_tempQuaternion.copy( this.quaternionStart ).inverse() );
					if ( axis.search( 'X' ) !== -1 ) {
						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
					}
					if ( axis.search( 'Y' ) !== -1 ) {
						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
					}
					if ( axis.search( 'Z' ) !== -1 ) {
						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
					}
					object.position.applyQuaternion( this.quaternionStart );
				}
				if ( space === 'world' ) {
					if ( object.parent ) {
						object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
					}
					if ( axis.search( 'X' ) !== -1 ) {
						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
					}
					if ( axis.search( 'Y' ) !== -1 ) {
						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
					}
					if ( axis.search( 'Z' ) !== -1 ) {
						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
					}
					if ( object.parent ) {
						object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
					}
				}
			}
		} else if ( mode === 'scale' ) {
			if ( axis.search( 'XYZ' ) !== -1 ) {
				let d = this.pointEnd.length() / this.pointStart.length();
				if ( this.pointEnd.dot( this.pointStart ) < 0 ) d *= -1;
				_tempVector.set( d, d, d );
			} else {
				_tempVector.copy( this.pointEnd ).divide( this.pointStart );
				if ( axis.search( 'X' ) === -1 ) {
					_tempVector.x = 1;
				}
				if ( axis.search( 'Y' ) === -1 ) {
					_tempVector.y = 1;
				}
				if ( axis.search( 'Z' ) === -1 ) {
					_tempVector.z = 1;
				}
			}

			// Apply scale
			object.scale.copy( this.scaleStart ).multiply( _tempVector );

		} else if ( mode === 'rotate' ) {
			const ROTATION_SPEED = 20 / this.worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );
			const quaternion = this.space === "local" ? this.worldQuaternion : _identityQuaternion;
			const unit = _unit[ axis ];

			if ( axis === 'E' ) {
				_tempVector.copy( this.pointEnd ).cross( this.pointStart );
				this.rotationAxis.copy( this.eye );
				this.rotationAngle = this.pointEnd.angleTo( this.pointStart ) * ( _tempVector.dot( this.eye ) < 0 ? 1 : -1 );
			} else if ( axis === 'XYZE' ) {
				_tempVector.copy( this.pointEnd ).sub( this.pointStart ).cross( this.eye ).normalize();
				this.rotationAxis.copy( _tempVector );
				this.rotationAngle = this.pointEnd.sub( this.pointStart ).dot( _tempVector.cross( this.eye ) ) * ROTATION_SPEED;
			} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {
				_alignVector.copy( unit ).applyQuaternion( quaternion );
				this.rotationAxis.copy( unit );
				_tempVector.copy( unit );
				_tempVector2.copy( this.pointEnd ).sub( this.pointStart );
				if ( space === 'local' ) {
					_tempVector.applyQuaternion( quaternion );
					_tempVector2.applyQuaternion( this.worldQuaternionStart );
				}
				this.rotationAngle = _tempVector2.dot( _tempVector.cross( this.eye ).normalize() ) * ROTATION_SPEED;
			}

			// Apply rotation snap
			if ( this.rotationSnap ) this.rotationAngle = Math.round( this.rotationAngle / this.rotationSnap ) * this.rotationSnap;

			// Apply rotate
			if ( space === 'local' ) {
				object.quaternion.copy( this.quaternionStart );
				object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );
			} else {
				object.quaternion.copy( _tempQuaternion.setFromAxisAngle( this.rotationAxis, this.rotationAngle ) );
				object.quaternion.multiply( this.quaternionStart );
			}
		}
		this.dispatchEvent( changeEvent );
	}
	onPointerUp( pointers ) {
		if ( pointers.length === 0) {
			this.active = false;
			this.axis = null;
		} else {
			if ( pointers[0].button === undefined ) this.axis = null;
		}
	}
	attach( object ) {
		this.object = object;
		this.visible = true;
	}
	detach() {
		this.object = undefined;
		this.visible = false;
	}
	// Deprication warnings
	addEventListener( type, listener ) {
		super.addEventListener( type, listener );
		if ( type === "mouseDown" ) {
			console.warn( '"mouseDown" event depricated, use "active-changed" or "pointerdown" event instead.' );
		}
		if ( type === "mouseUp" ) {
			console.warn( '"mouseUp" event depricated, use "active-changed" or "pointerup" event instead.' );
		}
		if ( type === "objectChange" ) {
			console.warn( '"objectChange" event depricated, use "change" event instead.' );
		}
	}
	getMode() {
		console.warn( 'TransformControls: getMode function has been depricated.' );
		return this.mode;
	}
	setMode( mode ) {
		this.mode = mode;
		console.warn( 'TransformControls: setMode function has been depricated.' );
	}
	setTranslationSnap( translationSnap ) {
		this.translationSnap = translationSnap;
		console.warn( 'TransformControls: setTranslationSnap function has been depricated.' );
	}
	setRotationSnap( rotationSnap ) {
		this.rotationSnap = rotationSnap;
		console.warn( 'TransformControls: setRotationSnap function has been depricated.' );
	}
	setSize( size ) {
		this.size = size;
		console.warn( 'TransformControls: setSize function has been depricated.' );
	}
	setSpace( space ) {
		this.space = space;
		console.warn( 'TransformControls: setSpace function has been depricated.' );
	}
}
