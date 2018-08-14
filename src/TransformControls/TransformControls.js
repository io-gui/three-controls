/**
 * @author arodic / https://github.com/arodic
 */

import * as THREE from "../../../three.js/build/three.module.js";
import {Control} from "../Control.js";
import {TransformControlsGizmo} from "./TransformControlsGizmo.js";
import {TransformControlsPlane} from "./TransformControlsPlane.js";

export class TransformControls extends Control {
	constructor( camera, domElement ) {

		super( domElement );

		const _gizmo = new TransformControlsGizmo();
		this.add( _gizmo );

		const _plane = new TransformControlsPlane();
		this.add( _plane );

		// Define properties with getters/setter
		// Setting the defined property will automatically trigger change event
		// Defined properties are passed down to gizmo and plane

		// TODO: better data binding
		this.addEventListener('change', function ( event ) {
			_plane[event.prop] = event.value;
			_gizmo[event.prop] = event.value;
		});

		this.defineProperties({
			camera: camera,
			object: undefined,
			axis: null,
			mode: "translate",
			translationSnap: null,
			rotationSnap: null,
			space: "world",
			size: 1,
			dragging: false,
			hideX: false,
			hideY: false,
			hideZ: false
		});

		const changeEvent = { type: "change" };

		// Reusable utility variables

		const ray = new THREE.Raycaster();

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

		const pointStart = new THREE.Vector3();
		const pointEnd = new THREE.Vector3();
		const rotationAxis = new THREE.Vector3();
		let rotationAngle = 0;

		const cameraPosition = new THREE.Vector3();
		const cameraQuaternion = new THREE.Quaternion();
		const cameraScale = new THREE.Vector3();

		const parentPosition = new THREE.Vector3();
		const parentQuaternion = new THREE.Quaternion();
		const parentScale = new THREE.Vector3();

		const worldPositionStart = new THREE.Vector3();
		const worldQuaternionStart = new THREE.Quaternion();
		const worldScaleStart = new THREE.Vector3();

		const worldPosition = new THREE.Vector3();
		const worldQuaternion = new THREE.Quaternion();
		const worldScale = new THREE.Vector3();

		const eye = new THREE.Vector3();

		const _positionStart = new THREE.Vector3();
		const _quaternionStart = new THREE.Quaternion();
		const _scaleStart = new THREE.Vector3();

		// TODO: remove properties unused in plane and gizmo

		this.defineProperties({
			parentQuaternion: parentQuaternion,
			worldPosition: worldPosition,
			worldPositionStart: worldPositionStart,
			worldQuaternion: worldQuaternion,
			worldQuaternionStart: worldQuaternionStart,
			cameraPosition: cameraPosition,
			cameraQuaternion: cameraQuaternion,
			pointStart: pointStart,
			pointEnd: pointEnd,
			rotationAxis: rotationAxis,
			rotationAngle: rotationAngle,
			eye: eye
		});

		// updateMatrixWorld  updates key transformation variables
		this.updateMatrixWorld = function () {

			if ( this.object !== undefined ) {

				this.object.updateMatrixWorld();
				this.object.parent.matrixWorld.decompose( parentPosition, parentQuaternion, parentScale );
				this.object.matrixWorld.decompose( worldPosition, worldQuaternion, worldScale );

			}

			this.camera.updateMatrixWorld();
			this.camera.matrixWorld.decompose( cameraPosition, cameraQuaternion, cameraScale );

			if ( this.camera.isPerspectiveCamera ) {

				eye.copy( cameraPosition ).sub( worldPosition ).normalize();

			} else if ( this.camera.isOrthographicCamera ) {

				eye.copy( cameraPosition ).normalize();

			}

			THREE.Object3D.prototype.updateMatrixWorld.call( this );

		};

		this.onPointerHover = function( pointers ) {

			let pointer = pointers[0];

			if ( this.object === undefined || this.dragging === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;

			ray.setFromCamera( pointer.position, this.camera );

			const intersect = ray.intersectObjects( _gizmo.picker[ this.mode ].children, true )[ 0 ] || false;

			if ( intersect ) {

				this.axis = intersect.object.name;

			} else {

				this.axis = null;

			}

		};

		this.onPointerDown = function( pointers ) {

			let pointer = pointers[0];

			if ( this.object === undefined || this.dragging === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;

			if ( ( pointer.button === 0 || pointer.button === undefined ) && this.axis !== null ) {

				ray.setFromCamera( pointer.position, this.camera );

				const planeIntersect = ray.intersectObjects( [ _plane ], true )[ 0 ] || false;

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
					this.object.parent.updateMatrixWorld();

					_positionStart.copy( this.object.position );
					_quaternionStart.copy( this.object.quaternion );
					_scaleStart.copy( this.object.scale );

					this.object.matrixWorld.decompose( worldPositionStart, worldQuaternionStart, worldScaleStart );

					pointStart.copy( planeIntersect.point ).sub( worldPositionStart );

					if ( this.space === 'local' ) pointStart.applyQuaternion( worldQuaternionStart.clone().inverse() );

				}

				this.dragging = true;

			}

		};

		this.onPointerMove = function( pointers ) {

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

			if ( object === undefined || axis === null || this.dragging === false || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;

			ray.setFromCamera( pointer.position, this.camera );

			const planeIntersect = ray.intersectObjects( [ _plane ], true )[ 0 ] || false;

			if ( planeIntersect === false ) return;

			pointEnd.copy( planeIntersect.point ).sub( worldPositionStart );

			if ( space === 'local' ) pointEnd.applyQuaternion( worldQuaternionStart.clone().inverse() );

			if ( mode === 'translate' ) {

				if ( axis.search( 'X' ) === -1 ) {
					pointEnd.x = pointStart.x;
				}
				if ( axis.search( 'Y' ) === -1 ) {
					pointEnd.y = pointStart.y;
				}
				if ( axis.search( 'Z' ) === -1 ) {
					pointEnd.z = pointStart.z;
				}

				// Apply translate

				if ( space === 'local' ) {
					object.position.copy( pointEnd ).sub( pointStart ).applyQuaternion( _quaternionStart );
				} else {
					object.position.copy( pointEnd ).sub( pointStart );
				}

				object.position.add( _positionStart );

				// Apply translation snap

				if ( this.translationSnap ) {

					if ( space === 'local' ) {

						object.position.applyQuaternion(_tempQuaternion.copy( _quaternionStart ).inverse() );

						if ( axis.search( 'X' ) !== -1 ) {
							object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
						}

						if ( axis.search( 'Y' ) !== -1 ) {
							object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
						}

						if ( axis.search( 'Z' ) !== -1 ) {
							object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
						}

						object.position.applyQuaternion( _quaternionStart );

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

					let d = pointEnd.length() / pointStart.length();

					if ( pointEnd.dot( pointStart ) < 0 ) d *= -1;

					_tempVector.set( d, d, d );

				} else {

					_tempVector.copy( pointEnd ).divide( pointStart );

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

				object.scale.copy( _scaleStart ).multiply( _tempVector );

			} else if ( mode === 'rotate' ) {

				const ROTATION_SPEED = 20 / worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );

				const quaternion = this.space === "local" ? worldQuaternion : _identityQuaternion;

				const unit = _unit[ axis ];

				if ( axis === 'E' ) {

					_tempVector.copy( pointEnd ).cross( pointStart );
					rotationAxis.copy( eye );
					rotationAngle = pointEnd.angleTo( pointStart ) * ( _tempVector.dot( eye ) < 0 ? 1 : -1 );

				} else if ( axis === 'XYZE' ) {

					_tempVector.copy( pointEnd ).sub( pointStart ).cross( eye ).normalize();
					rotationAxis.copy( _tempVector );
					rotationAngle = pointEnd.sub( pointStart ).dot( _tempVector.cross( eye ) ) * ROTATION_SPEED;

				} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

					_alignVector.copy( unit ).applyQuaternion( quaternion );

					rotationAxis.copy( unit );

					_tempVector.copy( unit );
					_tempVector2.copy( pointEnd ).sub( pointStart );
					if ( space === 'local' ) {
						_tempVector.applyQuaternion( quaternion );
						_tempVector2.applyQuaternion( worldQuaternionStart );
					}
					rotationAngle = _tempVector2.dot( _tempVector.cross( eye ).normalize() ) * ROTATION_SPEED;

				}

				// Apply rotation snap

				if ( this.rotationSnap ) rotationAngle = Math.round( rotationAngle / this.rotationSnap ) * this.rotationSnap;

				this.rotationAngle = rotationAngle;

				// Apply rotate

				if ( space === 'local' ) {

					object.quaternion.copy( _quaternionStart );
					object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) );

				} else {

					object.quaternion.copy( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) );
					object.quaternion.multiply( _quaternionStart );

				}

			}

			this.dispatchEvent( changeEvent );

		};

		this.onPointerUp = function( pointers ) {

			let pointer = pointers.removed[0];

			if ( pointer.button !== undefined && pointer.button !== 0 ) return;

			this.dragging = false;

			if ( pointer.button === undefined ) this.axis = null;

		};

	}
	// Deprication warnings
	addEventListener( type, listener ) {
		super.addEventListener( type, listener );
		if ( type === "mouseDown" ) {
			console.warn( '"mouseDown" event depricated, use "dragging-changed" or "pointerdown" event instead.' );
		}
		if ( type === "mouseUp" ) {
			console.warn( '"mouseUp" event depricated, use "dragging-changed" or "pointerup" event instead.' );
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
	update() {
		console.warn( 'TransformControls: update function has been depricated.' );
	}
}
