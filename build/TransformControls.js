import { Quaternion, Vector3, Color, Matrix4, OrthographicCamera } from 'three';
import { EVENT, UNIT } from './core/Base';
import { Controls } from './core/Controls';
import { TransformHelper } from './TransformHelper';

function getFirstIntersection( intersections, includeInvisible ) {

	for ( let i = 0; i < intersections.length; i ++ ) {

		if ( intersections[ i ].object.visible || includeInvisible ) {

			return intersections[ i ];

		}

	}

	return null;

}

class TransformControls extends Controls {

	constructor( camera, domElement ) {

		super( camera, domElement );

		// TransformHelper API
		this.size = 1;
		this.showX = true;
		this.showY = true;
		this.showZ = true;
		this.showE = true;
		this.showTranslate = true;
		this.showRotate = true;
		this.showScale = true;
		this.dragging = false;
		this.active = false;
		this.space = 'world';
		this.activeMode = '';
		this.activeAxis = '';
		this.translationSnap = 0;
		this.rotationSnap = 0;
		this.scaleSnap = 0;
		this.minGrazingAngle = 30;
		this.FADE_EPS = 0.001;
		this.FADE_FACTOR = 0.25;
		this._pointStart = new Vector3();
		this._pointEnd = new Vector3();
		this._pointStartNorm = new Vector3();
		this._pointEndNorm = new Vector3();
		this.transformMatrixStart = new Matrix4();
		this.transformMatrixEnd = new Matrix4();
		this.transformMatrixOffset = new Matrix4();
		this.parentWorldPosition = new Vector3();
		this.parentWorldQuaternion = new Quaternion();
		this.parentWorldQuaternionInv = new Quaternion();
		this.parentWorldScale = new Vector3();
		this.objectWorldPositionStart = new Vector3();
		this.objectWorldQuaternionStart = new Quaternion();
		this.objectWorldScaleStart = new Vector3();
		this.objectWorldPosition = new Vector3();
		this.objectWorldQuaternion = new Quaternion();
		this.objectWorldQuaternionInv = new Quaternion();
		this.objectWorldScale = new Vector3();
		this.objectPositionStart = new Vector3();
		this.objectQuaternionStart = new Quaternion();
		this.objectQuaternionStartInv = new Quaternion();
		this.objectScaleStart = new Vector3();
		this.rotationAxis = new Vector3();
		this._tempVector = new Vector3();
		this._offsetVector = new Vector3();
		this._tempQuaternion = new Quaternion();
		this._targetColor = new Color();
		this._dirX = new Vector3( 1, 0, 0 );
		this._dirY = new Vector3( 0, 1, 0 );
		this._dirZ = new Vector3( 0, 0, 1 );
		this._dirVector = new Vector3();
		this._identityQuaternion = Object.freeze( new Quaternion() );
		this._viewportCameraPosition = new Vector3();
		this._viewportCameraQuaternion = new Quaternion();
		this._viewportCameraScale = new Vector3();
		this._viewportEye = new Vector3();
		this._cameraHelpers = new Map();
		/* eslint-disable @typescript-eslint/no-use-before-define */
		// Define properties with getters/setter
		// Setting the defined property will automatically trigger change event
		this.observeProperty( 'object' );
		this.observeProperty( 'activeAxis' );
		this.observeProperty( 'activeMode' );
		this.observeProperty( 'space' );
		this.observeProperty( 'size' );
		this.observeProperty( 'active' );
		this.observeProperty( 'dragging' );
		this.observeProperty( 'showX' );
		this.observeProperty( 'showY' );
		this.observeProperty( 'showZ' );
		this.observeProperty( 'showE' );
		this.observeProperty( 'showTranslate' );
		this.observeProperty( 'showRotate' );
		this.observeProperty( 'showScale' );


		// Deprecation warnings
		Object.defineProperty( this, 'mode', {
			set: () => {

				console.warn( 'THREE.TransformControls: "mode" has been deprecated. Use showTranslate, showScale and showRotate.' );

			}
		} );

		Object.defineProperty( this, 'camera', {
			get() {

				return camera;

			},
			set( newCamera ) {

				const oldCamera = camera;
				camera = newCamera;
				newCamera !== oldCamera && this.cameraChanged( newCamera );

			}
		} );

		this.cameraChanged( camera );

	}
	cameraChanged( newCamera ) {

		if ( this.children.length )
			this.remove( this.children[ 0 ] );

		this.add( this.getHelper( newCamera ) );

	}
	getHelper( camera ) {


		// TODO: set helper camera and domElement automatically before onBeforeRender.
		const helper = this._cameraHelpers.get( camera ) || new TransformHelper( camera, this.domElement );

		if ( helper.camera !== camera )
			console.log( helper.camera, camera );

		this._cameraHelpers.set( camera, helper );
		return helper;

	}
	dispose() {

		super.dispose();

		this._cameraHelpers.forEach( helper => {

			helper.dispose();

		} );

		this._cameraHelpers.clear();

	}
	decomposeViewportCamera( camera ) {

		camera.matrixWorld.decompose( this._viewportCameraPosition, this._viewportCameraQuaternion, this._viewportCameraScale );

		if ( camera instanceof OrthographicCamera ) {

			this._viewportEye.set( 0, 0, 1 ).applyQuaternion( this._viewportCameraQuaternion );

		} else {

			this._viewportEye.copy( this._viewportCameraPosition ).sub( this.objectWorldPosition ).normalize();

		}

		return this._viewportEye;

	}
	updateHandleMaterial( handle ) {

		const handleType = handle.userData.type;
		const handleAxis = handle.userData.axis;
		const handleTag = handle.userData.tag;

		const lerp = ( x, y, a ) => {

			return x * ( 1 - a ) + y * a;

		};

		const equals = ( c1, c2 ) => {

			return Math.abs( c1.r - c2.r ) < this.FADE_EPS && Math.abs( c1.g - c2.g ) < this.FADE_EPS && Math.abs( c1.b - c2.b ) < this.FADE_EPS;

		};

		if ( handleTag !== 'picker' ) {

			const material = handle.material;
			material.userData.color = material.userData.color || material.color.clone();
			material.userData.opacity = material.userData.opacity || material.opacity;
			material.userData.highlightColor = material.userData.highlightColor || material.color.clone().lerp( new Color( 1, 1, 1 ), 0.5 );
			material.userData.highlightOpacity = material.userData.highlightOpacity || lerp( material.opacity, 1, 0.75 );

			// highlight selected axis
			let highlight = 0;

			if ( ! this.enabled || ( this.activeMode && handleType !== this.activeMode ) ) {

				highlight = - 1;

			} else if ( this.activeAxis ) {

				if ( handleAxis === this.activeAxis ) {

					highlight = 1;

				} else if ( this.activeAxis.split( '' ).some( ( a ) => {

					return handleAxis === a;

				} ) ) {

					highlight = 1;

				} else {

					highlight = - 1;

				}

			}

			this._targetColor.copy( material.color );
			let _targetOpacity = material.opacity;

			if ( highlight === 0 ) {

				this._targetColor.lerp( material.userData.color, this.FADE_FACTOR );
				_targetOpacity = lerp( _targetOpacity, material.userData.opacity, this.FADE_FACTOR );

			} else if ( highlight === - 1 ) {

				_targetOpacity = lerp( _targetOpacity, material.userData.opacity * 0.125, this.FADE_FACTOR );
				this._targetColor.lerp( material.userData.highlightColor, this.FADE_FACTOR );

			} else if ( highlight === 1 ) {

				_targetOpacity = lerp( _targetOpacity, material.userData.highlightOpacity, this.FADE_FACTOR );
				this._targetColor.lerp( material.userData.highlightColor, this.FADE_FACTOR );

			}

			if ( ! equals( material.color, this._targetColor ) || ! ( Math.abs( material.opacity - _targetOpacity ) < this.FADE_EPS ) ) {

				material.color.copy( this._targetColor );
				material.opacity = _targetOpacity;


				// TODO: use animation API instead
				requestAnimationFrame( () => {


					// TODO: unhack
					this.needsAnimationFrame = true;

				} );

			}

		}

	}
	updateHandle( handle ) {

		this.updateHandleMaterial( handle );

		if ( handle.userData.type === 'scale' && this.space === 'world' ) {

			if ( [ 'XYZX', 'XYZY', 'XYZZ' ].indexOf( handle.userData.axis ) === - 1 )
				handle.visible = false;

		}

	}
	decomposeMatrices() {

		super.decomposeMatrices();

		if ( this.object ) {

			this.object.updateMatrixWorld();

			if ( this.object.parent === null ) {

				console.error( 'TransformControls: The attached 3D object must be a part of the scene graph.' );

			} else {

				this.object.parent.matrixWorld.decompose( this.parentWorldPosition, this.parentWorldQuaternion, this.parentWorldScale );

			}

			this.object.matrixWorld.decompose( this.objectWorldPosition, this.objectWorldQuaternion, this.objectWorldScale );
			this.parentWorldQuaternionInv.copy( this.parentWorldQuaternion ).invert();
			this.objectWorldQuaternionInv.copy( this.objectWorldQuaternion ).invert();

		}


		// This assumes TransformControls instance is in world frame.
		this.position.copy( this.objectWorldPosition );
		this.quaternion.copy( this.space === 'local' ? this.objectWorldQuaternion : this._identityQuaternion );

	}
	updateMatrixWorld() {

		super.updateMatrixWorld();

		// Se helper visibility properties.
		const helper = this.getHelper( this.camera );
		helper.size = this.size;
		helper.showX = this.showX;
		helper.showY = this.showY;
		helper.showZ = this.showZ;
		helper.showE = this.showE;
		helper.showTranslate = this.showTranslate;
		helper.showRotate = this.showRotate;
		helper.showScale = this.showScale;

		for ( let i = 0; i < helper.children.length; i ++ ) {

			this.updateHandle( helper.children[ i ] );

		}


		// TODO: Optimize!
		super.updateMatrixWorld();

	}
	getPlaneNormal( cameraQuaternion ) {

		this._dirX.set( 1, 0, 0 ).applyQuaternion( this.space === 'local' ? this.objectWorldQuaternion : this._identityQuaternion );
		this._dirY.set( 0, 1, 0 ).applyQuaternion( this.space === 'local' ? this.objectWorldQuaternion : this._identityQuaternion );
		this._dirZ.set( 0, 0, 1 ).applyQuaternion( this.space === 'local' ? this.objectWorldQuaternion : this._identityQuaternion );


		// Align the plane for current transform mode, axis and space.
		switch ( this.activeMode ) {

			case 'translate':

			case 'scale':
				switch ( this.activeAxis ) {

					case 'X':
						this._dirVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirX ).cross( this._dirX );
						break;

					case 'Y':
						this._dirVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirY ).cross( this._dirY );
						break;

					case 'Z':
						this._dirVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize().cross( this._dirZ ).cross( this._dirZ );
						break;

					case 'XY':
						this._dirVector.copy( this._dirZ );
						break;

					case 'YZ':
						this._dirVector.copy( this._dirX );
						break;

					case 'XZ':
						this._dirVector.copy( this._dirY );
						break;

					case 'XYZ':

					case 'XYZX':

					case 'XYZY':

					case 'XYZZ':

					case 'E':
						this._dirVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize();
						break;

				}

				break;

			case 'rotate':

			default:

				// special case for rotate
				this._dirVector.set( 0, 0, 1 ).applyQuaternion( cameraQuaternion ).normalize();

		}

		return this._dirVector;

	}
	onTrackedPointerHover( pointer ) {

		if ( ! this.object || this.active === true )
			return;

		const camera = ( this.xr && this.xr.isPresenting ) ? this.camera : pointer.camera;
		const helper = this.getHelper( camera );

		const pickers = helper.children.filter( ( child ) => {

			return child.userData.tag === 'picker';

		} );

		const intersect = getFirstIntersection( pointer.intersectObjects( pickers ), false );

		if ( intersect && ! pointer.isSimulated ) {

			this.activeMode = intersect.object.userData.type;
			this.activeAxis = intersect.object.userData.axis;

		} else {

			this.activeMode = '';
			this.activeAxis = '';

		}

	}
	onTrackedPointerDown( pointer ) {


		// TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
		this.activeAxis = '';

		// TODO: consider triggering hover from Controls.js
		// Simulates hover before down on touchscreen
		this.onTrackedPointerHover( pointer );


		// TODO: Unhack! This enables axis reset/interrupt when simulated pointer is driving gesture with inertia.
		if ( this.activeAxis === '' ) {

			this.active = false;
			this.dragging = false;

		}

		if ( ! this.object || this.dragging === true || pointer.button !== 0 )
			return;

		if ( this.activeAxis !== '' ) {

			let space = this.space;

			if ( this.activeMode === 'scale' ) {

				space = 'local';

			} else if ( this.activeAxis === 'E' || this.activeAxis === 'XYZE' || this.activeAxis === 'XYZ' ) {

				space = 'world';

			}

			if ( space === 'local' && this.activeMode === 'rotate' ) {

				const snap = this.rotationSnap;

				if ( this.activeAxis === 'X' && snap )
					this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap;

				if ( this.activeAxis === 'Y' && snap )
					this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap;

				if ( this.activeAxis === 'Z' && snap )
					this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;

			}

			this.object.updateMatrixWorld();

			if ( this.object.parent )
				this.object.parent.updateMatrixWorld();

			this.objectPositionStart.copy( this.object.position );
			this.objectQuaternionStart.copy( this.object.quaternion );
			this.objectQuaternionStartInv.copy( this.object.quaternion ).invert();
			this.objectScaleStart.copy( this.object.scale );
			this.object.matrixWorld.decompose( this.objectWorldPositionStart, this.objectWorldQuaternionStart, this.objectWorldScaleStart );
			this.dragging = true;
			this.active = true;
			this.transformMatrixStart.copy( this.object.matrix );
			this.dispatchEvent( Object.assign( { object: this.object }, EVENT.START ) );

			// TODO: Deprecate
			this.dispatchEvent( { type: 'mouseDown' } );

		}

	}
	onTrackedPointerMove( pointer ) {

		const axis = this.activeAxis;
		const mode = this.activeMode;
		const object = this.object;
		const camera = ( this.xr && this.xr.isPresenting ) ? this.camera : pointer.camera;
		this.decomposeViewportCamera( camera );
		let space = this.space;

		if ( mode === 'scale' ) {

			space = 'local';

		} else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {

			space = 'world';

		}

		if ( pointer.isSimulated )
			this.dragging = false;

		if ( ! object || axis === '' || this.active === false || pointer.button !== 0 )
			return;

		this._plane.setFromNormalAndCoplanarPoint( this.getPlaneNormal( this._viewportCameraQuaternion ), this.objectWorldPosition );
		const intersection = pointer.projectOnPlane( this._plane, this.minGrazingAngle );

		if ( ! intersection )
			return; // TODO: handle intersection miss

		this._pointStart.copy( intersection.start ).sub( this.objectWorldPositionStart );
		this._pointEnd.copy( intersection.current ).sub( this.objectWorldPositionStart );
		this._pointStartNorm.copy( this._pointStart ).normalize();
		this._pointEndNorm.copy( this._pointEnd ).normalize();

		if ( mode === 'translate' ) {


			// Apply translate
			this._offsetVector.copy( this._pointEnd ).sub( this._pointStart );

			if ( space === 'local' ) {

				this._offsetVector.applyQuaternion( this.objectQuaternionStartInv );

			}

			if ( axis.indexOf( 'X' ) === - 1 )
				this._offsetVector.x = 0;

			if ( axis.indexOf( 'Y' ) === - 1 )
				this._offsetVector.y = 0;

			if ( axis.indexOf( 'Z' ) === - 1 )
				this._offsetVector.z = 0;

			if ( space === 'local' ) {

				this._offsetVector.applyQuaternion( this.objectQuaternionStart ).divide( this.parentWorldScale );

			} else {

				this._offsetVector.applyQuaternion( this.parentWorldQuaternionInv ).divide( this.parentWorldScale );

			}

			object.position.copy( this._offsetVector ).add( this.objectPositionStart );


			// Apply translation snap
			if ( this.translationSnap ) {

				if ( space === 'local' ) {

					object.position.applyQuaternion( this._tempQuaternion.copy( this.objectQuaternionStart ).invert() );

					if ( axis.search( 'X' ) !== - 1 ) {

						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

					}

					object.position.applyQuaternion( this.objectQuaternionStart );

				}

				if ( space === 'world' ) {

					if ( object.parent ) {

						object.position.add( this.parentWorldPosition );

					}

					if ( axis.search( 'X' ) !== - 1 ) {

						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Y' ) !== - 1 ) {

						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

					}

					if ( axis.search( 'Z' ) !== - 1 ) {

						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

					}

					if ( object.parent ) {

						object.position.sub( this.parentWorldPosition );

					}

				}

			}

		} else if ( mode === 'scale' ) {

			if ( axis.search( 'XYZ' ) !== - 1 ) {

				let d = this._pointEnd.length() / this._pointStart.length();

				if ( this._pointEnd.dot( this._pointStart ) < 0 )
					d *= - 1;

				this._offsetVector.set( d, d, d );

			} else {

				this._tempVector.copy( this._pointStart );
				this._offsetVector.copy( this._pointEnd );
				this._tempVector.applyQuaternion( this.objectWorldQuaternionInv );
				this._offsetVector.applyQuaternion( this.objectWorldQuaternionInv );
				this._offsetVector.divide( this._tempVector );

				if ( axis.search( 'X' ) === - 1 ) {

					this._offsetVector.x = 1;

				}

				if ( axis.search( 'Y' ) === - 1 ) {

					this._offsetVector.y = 1;

				}

				if ( axis.search( 'Z' ) === - 1 ) {

					this._offsetVector.z = 1;

				}

			}


			// Apply scale
			object.scale.copy( this.objectScaleStart ).multiply( this._offsetVector );

			if ( this.scaleSnap ) {

				if ( axis.search( 'X' ) !== - 1 ) {

					object.scale.x = Math.round( object.scale.x / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

				if ( axis.search( 'Y' ) !== - 1 ) {

					object.scale.y = Math.round( object.scale.y / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

				if ( axis.search( 'Z' ) !== - 1 ) {

					object.scale.z = Math.round( object.scale.z / this.scaleSnap ) * this.scaleSnap || this.scaleSnap;

				}

			}

		} else if ( mode === 'rotate' ) {

			this._offsetVector.copy( this._pointEnd ).sub( this._pointStart );
			let ROTATION_SPEED = ( pointer.domElement.clientHeight / 720 );

			if ( this.xr && this.xr.isPresenting )
				ROTATION_SPEED *= 5;

			let angle = 0;

			if ( axis === 'E' ) {

				this.rotationAxis.copy( this._viewportEye );
				angle = this._pointEnd.angleTo( this._pointStart );
				angle *= ( this._pointEndNorm.cross( this._pointStartNorm ).dot( this._viewportEye ) < 0 ? 1 : - 1 );

			} else if ( axis === 'XYZE' ) {

				this.rotationAxis.copy( this._offsetVector ).cross( this._viewportEye ).normalize();
				angle = this._offsetVector.dot( this._tempVector.copy( this.rotationAxis ).cross( this._viewportEye ) ) * ROTATION_SPEED;

			} else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {

				this.rotationAxis.copy( UNIT[ axis ] );
				this._tempVector.copy( UNIT[ axis ] );

				if ( space === 'local' ) {

					this._tempVector.applyQuaternion( this.objectWorldQuaternion );

				}

				angle = this._offsetVector.dot( this._tempVector.cross( this._viewportEye ).normalize() ) * ROTATION_SPEED;

			}


			// Apply rotation snap
			if ( this.rotationSnap )
				angle = Math.round( angle / this.rotationSnap ) * this.rotationSnap;


			// Apply rotat
			if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {

				object.quaternion.copy( this.objectQuaternionStart );
				object.quaternion.multiply( this._tempQuaternion.setFromAxisAngle( this.rotationAxis, angle ) ).normalize();

			} else {

				this.rotationAxis.applyQuaternion( this.parentWorldQuaternionInv );
				object.quaternion.copy( this._tempQuaternion.setFromAxisAngle( this.rotationAxis, angle ) );
				object.quaternion.multiply( this.objectQuaternionStart ).normalize();

			}

		}

		this.updateMatrixWorld();
		this.dispatchEvent( EVENT.CHANGE );
		this.transformMatrixEnd.copy( object.matrix );
		this.transformMatrixOffset.copy( this.transformMatrixStart ).invert().multiply( this.transformMatrixEnd );
		this.dispatchEvent( Object.assign( { object: this.object, startMatrix: this.transformMatrixStart, currentMatrix: this.transformMatrixEnd }, TRANSFORM_CHANGE_EVENT ) );

	}
	onTrackedPointerUp( pointer ) {

		if ( pointer.button > 0 || ! this.object )
			return;

		if ( this.active ) { // this.activeAxis !== '' ?

			this.transformMatrixEnd.copy( this.object.matrix );
			this.transformMatrixOffset.copy( this.transformMatrixStart ).invert().multiply( this.transformMatrixEnd );
			this.dispatchEvent( Object.assign( { object: this.object, startMatrix: this.transformMatrixStart, endMatrix: this.transformMatrixEnd }, EVENT.END ) );

			// TODO: Deprecate
			this.dispatchEvent( { type: 'mouseUp' } );

		}

		this.active = false;
		this.dragging = false;
		this.activeAxis = '';
		this.activeMode = '';

	}

	// Set current object
	attach( object ) {

		this.object = object;
		this.visible = true;
		this.updateMatrixWorld();
		return this;

	}

	// Detatch from object
	detach() {

		this.object = undefined;
		this.visible = false;
		this.activeAxis = '';
		return this;

	}

	// TODO: deprecate
	getMode() {

		console.warn( 'THREE.TransformControls: getMode function has been deprecated. Use showTranslate, showScale and showRotate.' );

	}
	setMode( mode ) {

		console.warn( 'THREE.TransformControls: setMode function has been deprecated. Use showTranslate, showScale and showRotate.' );
		this.showTranslate = mode === 'translate';
		this.showRotate = mode === 'rotate';
		this.showScale = mode === 'scale';

	}
	setTranslationSnap( translationSnap ) {

		console.warn( 'THREE.TransformControls: setTranslationSnap function has been deprecated.' );
		this.translationSnap = translationSnap;

	}
	setRotationSnap( rotationSnap ) {

		console.warn( 'THREE.TransformControls: setRotationSnap function has been deprecated.' );
		this.rotationSnap = rotationSnap;

	}
	setScaleSnap( scaleSnap ) {

		console.warn( 'THREE.TransformControls: setScaleSnap function has been deprecated.' );
		this.scaleSnap = scaleSnap;

	}
	setSize( size ) {

		console.warn( 'THREE.TransformControls: setSize function has been deprecated.' );
		this.size = size;

	}
	setSpace( space ) {

		console.warn( 'THREE.TransformControls: setSpace function has been deprecated.' );
		this.space = space;

	}
	update() {

		console.warn( 'THREE.TransformControls: update function has been deprecated.' );

	}
	addEventListener( type, listener ) {

		if ( [ 'mouseDown', 'mouseUp' ].indexOf( type ) !== - 1 ) {

			console.warn( `You are using deprecated "${type}" event. Use "dragging-changed" event instead.` );
			return;

		}

		if ( type === 'objectChange' ) {

			console.warn( `You are using deprecated "${type}" event. Use "transform-changed" event instead.` );
			super.addEventListener( 'transform-changed', listener );
			return;

		}

		super.addEventListener( type, listener );

	}

}

TransformControls.isTransformControls = true;
TransformControls.type = 'TransformControls';

export const TRANSFORM_CHANGE_EVENT = { type: 'transform-changed' };

export { TransformControls };
