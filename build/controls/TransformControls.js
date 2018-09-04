import { Object3D, Vector3, Quaternion, LineBasicMaterial, BufferGeometry, Float32BufferAttribute, Line, Color, MeshBasicMaterial, DoubleSide, CylinderBufferGeometry, Mesh, OctahedronBufferGeometry, PlaneBufferGeometry, TorusBufferGeometry, SphereBufferGeometry, Matrix4, BoxBufferGeometry, Raycaster, Plane } from '../../../three.js/build/three.module.js';
import { Interactive } from '../Interactive.js';

/**
 * @author arodic / https://github.com/arodic
 */

/*
 * Helper is a variant of Object3D which automatically follows its target object.
 * On matrix update, it automatically copies transform matrices from its target Object3D.
 */

const worldPosition = new Vector3();
const cameraWorldPosition = new Vector3();

const tempPosition = new Vector3();
const tempQuaternion = new Quaternion();
const tempScale = new Vector3();

class Helper extends Object3D {

	get isHelper() {

		return true;

	}
	constructor( target, camera ) {

		super();
		this.target = target;
		this.camera = camera;
		this.space = 'local';
		this.size = 0;

	}
	updateHelperMatrix() {

		let eyeDistance = 0;
		let scale = new Vector3();
		if ( this.camera && this.size ) {

			this.camera.updateMatrixWorld();
			worldPosition.setFromMatrixPosition( this.matrixWorld );
			cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );
			eyeDistance = worldPosition.distanceTo( cameraWorldPosition );
			if ( eyeDistance ) scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size );

		}
		if ( this.target ) {

			this.target.updateMatrixWorld();
			this.matrix.copy( this.target.matrix );
			this.matrixWorld.copy( this.target.matrixWorld );

		} else {

			super.updateMatrixWorld();

		}

		this.matrixWorld.decompose( tempPosition, tempQuaternion, tempScale );
		if ( this.space === 'world' ) tempQuaternion.set( 0, 0, 0, 1 );
		this.matrixWorld.compose( tempPosition, tempQuaternion, eyeDistance ? scale : tempScale );

	}
	updateMatrixWorld() {

		this.updateHelperMatrix();
		this.matrixWorldNeedsUpdate = false;
		const children = this.children;
		for ( let i = 0, l = children.length; i < l; i ++ ) {

			children[ i ].updateMatrixWorld( true );

		}

	}
	// Creates an Object3D with gizmos described in custom hierarchy definition.
	setupHelper( gizmoMap ) {

		const gizmo = new Object3D();

		for ( let name in gizmoMap ) {

			for ( let i = gizmoMap[ name ].length; i --; ) {

				const object = gizmoMap[ name ][ i ][ 0 ].clone();
				const position = gizmoMap[ name ][ i ][ 1 ];
				const rotation = gizmoMap[ name ][ i ][ 2 ];
				const scale = gizmoMap[ name ][ i ][ 3 ];
				const tag = gizmoMap[ name ][ i ][ 4 ];

				// name and tag properties are essential for picking and updating logic.
				object.name = name;
				object.tag = tag;

				if ( position ) {

					object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );

				}
				if ( rotation ) {

					object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

				}
				if ( scale ) {

					object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );

				}

				object.updateMatrix();

				const tempGeometry = object.geometry.clone();
				tempGeometry.applyMatrix( object.matrix );
				object.geometry = tempGeometry;

				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );
				gizmo.add( object );

			}

		}
		return gizmo;

	}

}

// const variables
const red = new Color( 0xff0000 );
const green = new Color( 0x00ff00 );
const blue = new Color( 0x0000ff );

// shared materials
const gizmoLineMaterial = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
} );

// Make unique material for each axis/color
const matLineRed = gizmoLineMaterial.clone();
matLineRed.color.copy( red );

const matLineGreen = gizmoLineMaterial.clone();
matLineGreen.color.copy( green );

const matLineBlue = gizmoLineMaterial.clone();
matLineBlue.color.copy( blue );

// reusable geometry
const lineGeometry = new BufferGeometry();
lineGeometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

class AxesHelper extends Helper {

	constructor( target, camera ) {

		super( target, camera );

		this.size = 0.15;
		this.showX = true;
		this.showY = true;
		this.showZ = true;

		this.init();

	}
	init() {

		const gizmoTranslate = {
			X: [[ new Line( lineGeometry, matLineRed ) ]],
			Y: [[ new Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ]]],
			Z: [[ new Line( lineGeometry, matLineBlue ), null, [ 0, - Math.PI / 2, 0 ]]]
		};
		this.add( this.setupHelper( gizmoTranslate ) );

	}
	updateHelperMatrix() {

		// Hide non-enabled axes
		this.traverse( axis => {

			axis.visible = axis.visible && ( axis.name.indexOf( "X" ) === - 1 || this.showX );
			axis.visible = axis.visible && ( axis.name.indexOf( "Y" ) === - 1 || this.showY );
			axis.visible = axis.visible && ( axis.name.indexOf( "Z" ) === - 1 || this.showZ );
			axis.visible = axis.visible && ( axis.name.indexOf( "E" ) === - 1 || ( this.showX && this.showY && this.showZ ) );

		} );
		super.updateHelperMatrix();

	}

}

// shared materials
const gizmoMaterial = new MeshBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
} );

const gizmoLineMaterial$1 = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
} );

// const variables
const red$1 = new Color( 0xff0000 );
const green$1 = new Color( 0x00ff00 );
const blue$1 = new Color( 0x0000ff );
const yellow = new Color( 0xffff00 );
const cyan = new Color( 0x00ffff );
const magenta = new Color( 0xff00ff );
const white = new Color( 0xffffff );
const gray = new Color( 0x787878 );

// Reusable utility variables
const alignVector = new Vector3( 0, 1, 0 );
const identityQuaternion = new Quaternion();

const unitX = new Vector3( 1, 0, 0 );
const unitY = new Vector3( 0, 1, 0 );
const unitZ = new Vector3( 0, 0, 1 );

// Make unique material for each axis/color
const matInvisible = gizmoMaterial.clone();
matInvisible.opacity = 0.15;

const matHelper = gizmoMaterial.clone();
matHelper.opacity = 0.33;

const matRed = gizmoMaterial.clone();
matRed.color.copy( red$1 );

const matGreen = gizmoMaterial.clone();
matGreen.color.copy( green$1 );

const matBlue = gizmoMaterial.clone();
matBlue.color.copy( blue$1 );

const matWhiteTransperent = gizmoMaterial.clone();
matWhiteTransperent.opacity = 0.25;

const matYellowTransparent = matWhiteTransperent.clone();
matYellowTransparent.color.copy( yellow );

const matCyanTransparent = matWhiteTransperent.clone();
matCyanTransparent.color.copy( cyan );

const matMagentaTransparent = matWhiteTransperent.clone();
matMagentaTransparent.color.copy( magenta );

const matYellow = gizmoMaterial.clone();
matYellow.color.copy( yellow );

const matLineRed$1 = gizmoLineMaterial$1.clone();
matLineRed$1.color.copy( red$1 );

const matLineGreen$1 = gizmoLineMaterial$1.clone();
matLineGreen$1.color.copy( green$1 );

const matLineBlue$1 = gizmoLineMaterial$1.clone();
matLineBlue$1.color.copy( blue$1 );

const matLineCyan = gizmoLineMaterial$1.clone();
matLineCyan.color.copy( cyan );

const matLineMagenta = gizmoLineMaterial$1.clone();
matLineMagenta.color.copy( magenta );

const matLineYellow = gizmoLineMaterial$1.clone();
matLineYellow.color.copy( yellow );

const matLineGray = gizmoLineMaterial$1.clone();
matLineGray.color.copy( gray );

const matLineYellowTransparent = matLineYellow.clone();
matLineYellowTransparent.opacity = 0.25;

// reusable geometry

const arrowGeometry = new CylinderBufferGeometry( 0, 0.05, 0.2, 12, 1, false );

const lineGeometry$1 = new BufferGeometry();
lineGeometry$1.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

// Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position
function TranslateHelperGeometry() {

	const geometry = new BufferGeometry();
	geometry.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );
	return geometry;

}

class AxesTranslateHelper extends AxesHelper {

	init() {

		const gizmoTranslate = {
			X: [
				[ new Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, - Math.PI / 2 ], null, 'fwd' ],
				[ new Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, Math.PI / 2 ], null, 'bwd' ],
				[ new Line( lineGeometry$1, matLineRed$1 ) ]
			],
			Y: [
				[ new Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], null, null, 'fwd' ],
				[ new Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], [ Math.PI, 0, 0 ], null, 'bwd' ],
				[ new Line( lineGeometry$1, matLineGreen$1 ), null, [ 0, 0, Math.PI / 2 ]]
			],
			Z: [
				[ new Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ Math.PI / 2, 0, 0 ], null, 'fwd' ],
				[ new Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ - Math.PI / 2, 0, 0 ], null, 'bwd' ],
				[ new Line( lineGeometry$1, matLineBlue$1 ), null, [ 0, - Math.PI / 2, 0 ]]
			],
			XYZ: [
				[ new Mesh( new OctahedronBufferGeometry( 0.1, 0 ), matWhiteTransperent ), [ 0, 0, 0 ], [ 0, 0, 0 ]]
			],
			XY: [
				[ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matYellowTransparent ), [ 0.15, 0.15, 0 ]],
				[ new Line( lineGeometry$1, matLineYellow ), [ 0.18, 0.3, 0 ], null, [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$1, matLineYellow ), [ 0.3, 0.18, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]]
			],
			YZ: [
				[ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matCyanTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ]],
				[ new Line( lineGeometry$1, matLineCyan ), [ 0, 0.18, 0.3 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$1, matLineCyan ), [ 0, 0.3, 0.18 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
			],
			XZ: [
				[ new Mesh( new PlaneBufferGeometry( 0.295, 0.295 ), matMagentaTransparent ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ]],
				[ new Line( lineGeometry$1, matLineMagenta ), [ 0.18, 0, 0.3 ], null, [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$1, matLineMagenta ), [ 0.3, 0, 0.18 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
			]
		};

		const pickerTranslate = {
			X: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
			],
			Y: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0.6, 0 ]]
			],
			Z: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ]]
			],
			XYZ: [
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible ) ]
			],
			XY: [
				[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0.2, 0 ]]
			],
			YZ: [
				[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ]]
			],
			XZ: [
				[ new Mesh( new PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ]]
			]
		};

		const helperTranslate = {
			START: [
				[ new Mesh( new OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			END: [
				[ new Mesh( new OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
			],
			DELTA: [
				[ new Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]
			],
			X: [
				[ new Line( lineGeometry$1, matHelper.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new Line( lineGeometry$1, matHelper.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new Line( lineGeometry$1, matHelper.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		this.add( this.gizmo = this.setupHelper( gizmoTranslate ) );
		this.add( this.picker = this.setupHelper( pickerTranslate ) );
		this.add( this.helper = this.setupHelper( helperTranslate ) );

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion;

		// highlight selected axis
		this.traverse( handle => {

			// Hide translate and scale axis facing the camera
			const AXIS_HIDE_TRESHOLD = 0.99;
			const PLANE_HIDE_TRESHOLD = 0.2;
			const AXIS_FLIP_TRESHOLD = - 0.4;

			if ( handle !== this ) {

				handle.visible = true;
				handle.scale.set( 1, 1, 1 );

			}

			if ( handle.name === 'X' || handle.name === 'XYZX' ) {

				if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'Y' || handle.name === 'XYZY' ) {

				if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {

				if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'XY' ) {

				if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'YZ' ) {

				if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'XZ' ) {

				if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}

			// Flip translate and scale axis ocluded behind another axis
			if ( handle.name.search( 'X' ) !== - 1 ) {

				if ( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.x *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}
			if ( handle.name.search( 'Y' ) !== - 1 ) {

				if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.y *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}
			if ( handle.name.search( 'Z' ) !== - 1 ) {

				if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.z *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}


			if ( handle.material ) {

				handle.material._opacity = handle.material._opacity || handle.material.opacity;
				handle.material._color = handle.material._color || handle.material.color.clone();

				handle.material.color.copy( handle.material._color );
				handle.material.opacity = handle.material._opacity;

				handle.material.color.lerp( white, 0.25 );

				if ( ! this.enabled ) {

					handle.material.opacity *= 0.25;
					handle.material.color.lerp( gray, 0.75 );

				} else if ( this.axis ) {

					if ( handle.name === this.axis ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else if ( this.axis.split( '' ).some( function ( a ) {

						return handle.name === a;

					} ) ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else {

						handle.material.opacity *= 0.25;
						handle.material.color.lerp( white, 0.5 );

					}

				}

			}

		} );
		this.picker.visible = false;

	}

}

// shared materials
const gizmoMaterial$1 = new MeshBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
} );

const gizmoLineMaterial$2 = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
} );

// const variables
const red$2 = new Color( 0xff0000 );
const green$2 = new Color( 0x00ff00 );
const blue$2 = new Color( 0x0000ff );
const yellow$1 = new Color( 0xffff00 );
const cyan$1 = new Color( 0x00ffff );
const magenta$1 = new Color( 0xff00ff );
const white$1 = new Color( 0xffffff );
const gray$1 = new Color( 0x787878 );

// Reusable utility variables
const tempVector = new Vector3( 0, 0, 0 );
const alignVector$1 = new Vector3( 0, 1, 0 );
const zeroVector = new Vector3( 0, 0, 0 );
const lookAtMatrix = new Matrix4();
const tempQuaternion$1 = new Quaternion();
const identityQuaternion$1 = new Quaternion();

const unitX$1 = new Vector3( 1, 0, 0 );
const unitY$1 = new Vector3( 0, 1, 0 );
const unitZ$1 = new Vector3( 0, 0, 1 );

// Make unique material for each axis/color
const matInvisible$1 = gizmoMaterial$1.clone();
matInvisible$1.opacity = 0.15;

const matHelper$1 = gizmoMaterial$1.clone();
matHelper$1.opacity = 0.33;

const matRed$1 = gizmoMaterial$1.clone();
matRed$1.color.copy( red$2 );

const matGreen$1 = gizmoMaterial$1.clone();
matGreen$1.color.copy( green$2 );

const matBlue$1 = gizmoMaterial$1.clone();
matBlue$1.color.copy( blue$2 );

const matWhiteTransperent$1 = gizmoMaterial$1.clone();
matWhiteTransperent$1.opacity = 0.25;

const matYellowTransparent$1 = matWhiteTransperent$1.clone();
matYellowTransparent$1.color.copy( yellow$1 );

const matCyanTransparent$1 = matWhiteTransperent$1.clone();
matCyanTransparent$1.color.copy( cyan$1 );

const matMagentaTransparent$1 = matWhiteTransperent$1.clone();
matMagentaTransparent$1.color.copy( magenta$1 );

const matYellow$1 = gizmoMaterial$1.clone();
matYellow$1.color.copy( yellow$1 );

const matLineRed$2 = gizmoLineMaterial$2.clone();
matLineRed$2.color.copy( red$2 );

const matLineGreen$2 = gizmoLineMaterial$2.clone();
matLineGreen$2.color.copy( green$2 );

const matLineBlue$2 = gizmoLineMaterial$2.clone();
matLineBlue$2.color.copy( blue$2 );

const matLineCyan$1 = gizmoLineMaterial$2.clone();
matLineCyan$1.color.copy( cyan$1 );

const matLineMagenta$1 = gizmoLineMaterial$2.clone();
matLineMagenta$1.color.copy( magenta$1 );

const matLineYellow$1 = gizmoLineMaterial$2.clone();
matLineYellow$1.color.copy( yellow$1 );

const matLineGray$1 = gizmoLineMaterial$2.clone();
matLineGray$1.color.copy( gray$1 );

const matLineYellowTransparent$1 = matLineYellow$1.clone();
matLineYellowTransparent$1.opacity = 0.25;

// reusable geometry

const lineGeometry$2 = new BufferGeometry();
lineGeometry$2.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

function CircleGeometry( radius, arc ) {

	const geometry = new BufferGeometry();
	const vertices = [];
	for ( let i = 0; i <= 64 * arc; ++ i ) {

		vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );

	}
	geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	return geometry;

}

class AxesRotateHelper extends AxesHelper {

	init() {

		const gizmoRotate = {
			X: [
				[ new Line( CircleGeometry( 1, 0.5 ), matLineRed$2 ) ],
				[ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matRed$1 ), [ 0, 0, 0.99 ], null, [ 1, 3, 1 ]],
			],
			Y: [
				[ new Line( CircleGeometry( 1, 0.5 ), matLineGreen$2 ), null, [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matGreen$1 ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ]],
			],
			Z: [
				[ new Line( CircleGeometry( 1, 0.5 ), matLineBlue$2 ), null, [ 0, Math.PI / 2, 0 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), matBlue$1 ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ]],
			],
			E: [
				[ new Line( CircleGeometry( 1.25, 1 ), matLineYellowTransparent$1 ), null, [ 0, Math.PI / 2, 0 ]],
				[ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent$1 ), [ 1.17, 0, 0 ], [ 0, 0, - Math.PI / 2 ], [ 1, 1, 0.001 ]],
				[ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent$1 ), [ - 1.17, 0, 0 ], [ 0, 0, Math.PI / 2 ], [ 1, 1, 0.001 ]],
				[ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent$1 ), [ 0, - 1.17, 0 ], [ Math.PI, 0, 0 ], [ 1, 1, 0.001 ]],
				[ new Mesh( new CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent$1 ), [ 0, 1.17, 0 ], [ 0, 0, 0 ], [ 1, 1, 0.001 ]],
			],
			XYZE: [
				[ new Line( CircleGeometry( 1, 1 ), matLineGray$1 ), null, [ 0, Math.PI / 2, 0 ]],
				[ new Line( CircleGeometry( 0.2, 1 ), matLineGray$1 ), null, [ 0, Math.PI / 2, 0 ]],
			]
		};

		const helperRotate = {
			AXIS: [
				[ new Line( lineGeometry$2, matHelper$1.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		const pickerRotate = {
			X: [
				[ new Mesh( new TorusBufferGeometry( 1, 0.03, 4, 24, Math.PI ), matInvisible$1 ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 0, 0, 1 ]]
			],
			Y: [
				[ new Mesh( new TorusBufferGeometry( 1, 0.03, 4, 24, Math.PI ), matInvisible$1 ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 0, 0, 1 ]]
			],
			Z: [
				[ new Mesh( new TorusBufferGeometry( 1, 0.03, 4, 24, Math.PI ), matInvisible$1 ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 1, 0, 0 ]]
			],
			E: [
				[ new Mesh( new TorusBufferGeometry( 1.25, 0.03, 2, 24 ), matInvisible$1 ) ],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 1.25, 0, 0 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ - 1.25, 0, 0 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 0, 1.25, 0 ]],
				[ new Mesh( new OctahedronBufferGeometry( 0.2, 0 ), matInvisible$1 ), [ 0, - 1.25, 0 ]]
			],
			XYZE: [
				[ new Mesh( new SphereBufferGeometry( 0.22, 10, 3 ), matInvisible$1 ) ]
			]
		};

		this.add( this.gizmo = this.setupHelper( gizmoRotate ) );
		this.add( this.picker = this.setupHelper( pickerRotate ) );
		this.add( this.helper = this.setupHelper( helperRotate ) );

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		const quaternion = this.space === "local" ? this.worldQuaternion : identityQuaternion$1;

		// highlight selected axis
		this.traverse( handle => {

			// Align handles to current local or world rotation
			handle.quaternion.copy( identityQuaternion$1 );

			// Align handles to current local or world rotation
			tempQuaternion$1.copy( quaternion ).inverse();
			alignVector$1.copy( this.eye ).applyQuaternion( tempQuaternion$1 );
			tempVector.copy( unitY$1 ).applyQuaternion( tempQuaternion$1 );

			if ( handle.name.search( "E" ) !== - 1 ) {

				handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( alignVector$1, zeroVector, tempVector ) );

			}
			if ( handle.name === 'X' ) {

				tempQuaternion$1.setFromAxisAngle( unitX$1, Math.atan2( - alignVector$1.y, alignVector$1.z ) );
				tempQuaternion$1.multiplyQuaternions( identityQuaternion$1, tempQuaternion$1 );
				handle.quaternion.copy( tempQuaternion$1 );

			}
			if ( handle.name === 'Y' ) {

				tempQuaternion$1.setFromAxisAngle( unitY$1, Math.atan2( alignVector$1.x, alignVector$1.z ) );
				tempQuaternion$1.multiplyQuaternions( identityQuaternion$1, tempQuaternion$1 );
				handle.quaternion.copy( tempQuaternion$1 );

			}
			if ( handle.name === 'Z' ) {

				tempQuaternion$1.setFromAxisAngle( unitZ$1, Math.atan2( alignVector$1.y, alignVector$1.x ) );
				tempQuaternion$1.multiplyQuaternions( identityQuaternion$1, tempQuaternion$1 );
				handle.quaternion.copy( tempQuaternion$1 );

			}

			if ( handle !== this ) {

				handle.visible = true;
				handle.scale.set( 1, 1, 1 );

			} else {

				handle.quaternion.copy( this.worldQuaternion );

			}

			if ( handle.material ) {

				handle.material._opacity = handle.material._opacity || handle.material.opacity;
				handle.material._color = handle.material._color || handle.material.color.clone();

				handle.material.color.copy( handle.material._color );
				handle.material.opacity = handle.material._opacity;

				handle.material.color.lerp( white$1, 0.25 );

				if ( ! this.enabled ) {

					handle.material.opacity *= 0.25;
					handle.material.color.lerp( gray$1, 0.75 );

				} else if ( this.axis ) {

					if ( handle.name === this.axis ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else if ( this.axis.split( '' ).some( function ( a ) {

						return handle.name === a;

					} ) ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else {

						handle.material.opacity *= 0.25;
						handle.material.color.lerp( white$1, 0.5 );

					}

				}

			}

		} );
		this.picker.visible = false;

	}

}

// shared materials
const gizmoMaterial$2 = new MeshBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false
} );

const gizmoLineMaterial$3 = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false
} );

// const variables
const red$3 = new Color( 0xff0000 );
const green$3 = new Color( 0x00ff00 );
const blue$3 = new Color( 0x0000ff );
const yellow$2 = new Color( 0xffff00 );
const cyan$2 = new Color( 0x00ffff );
const magenta$2 = new Color( 0xff00ff );
const white$2 = new Color( 0xffffff );
const gray$2 = new Color( 0x787878 );

// Reusable utility variables
const alignVector$2 = new Vector3( 0, 1, 0 );

const unitX$2 = new Vector3( 1, 0, 0 );
const unitY$2 = new Vector3( 0, 1, 0 );
const unitZ$2 = new Vector3( 0, 0, 1 );

// Make unique material for each axis/color
const matInvisible$2 = gizmoMaterial$2.clone();
matInvisible$2.opacity = 0.15;

const matHelper$2 = gizmoMaterial$2.clone();
matHelper$2.opacity = 0.33;

const matRed$2 = gizmoMaterial$2.clone();
matRed$2.color.copy( red$3 );

const matGreen$2 = gizmoMaterial$2.clone();
matGreen$2.color.copy( green$3 );

const matBlue$2 = gizmoMaterial$2.clone();
matBlue$2.color.copy( blue$3 );

const matWhiteTransperent$2 = gizmoMaterial$2.clone();
matWhiteTransperent$2.opacity = 0.25;

const matYellowTransparent$2 = matWhiteTransperent$2.clone();
matYellowTransparent$2.color.copy( yellow$2 );

const matCyanTransparent$2 = matWhiteTransperent$2.clone();
matCyanTransparent$2.color.copy( cyan$2 );

const matMagentaTransparent$2 = matWhiteTransperent$2.clone();
matMagentaTransparent$2.color.copy( magenta$2 );

const matYellow$2 = gizmoMaterial$2.clone();
matYellow$2.color.copy( yellow$2 );

const matLineRed$3 = gizmoLineMaterial$3.clone();
matLineRed$3.color.copy( red$3 );

const matLineGreen$3 = gizmoLineMaterial$3.clone();
matLineGreen$3.color.copy( green$3 );

const matLineBlue$3 = gizmoLineMaterial$3.clone();
matLineBlue$3.color.copy( blue$3 );

const matLineCyan$2 = gizmoLineMaterial$3.clone();
matLineCyan$2.color.copy( cyan$2 );

const matLineMagenta$2 = gizmoLineMaterial$3.clone();
matLineMagenta$2.color.copy( magenta$2 );

const matLineYellow$2 = gizmoLineMaterial$3.clone();
matLineYellow$2.color.copy( yellow$2 );

const matLineGray$2 = gizmoLineMaterial$3.clone();
matLineGray$2.color.copy( gray$2 );

const matLineYellowTransparent$2 = matLineYellow$2.clone();
matLineYellowTransparent$2.opacity = 0.25;

// reusable geometry

const scaleHandleGeometry = new BoxBufferGeometry( 0.125, 0.125, 0.125 );

const lineGeometry$3 = new BufferGeometry();
lineGeometry$3.addAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );

class AxesScaleHelper extends AxesHelper {

	init() {

		const gizmoScale = {
			X: [
				[ new Mesh( scaleHandleGeometry, matRed$2 ), [ 0.8, 0, 0 ], [ 0, 0, - Math.PI / 2 ]],
				[ new Line( lineGeometry$3, matLineRed$3 ), null, null, [ 0.8, 1, 1 ]]
			],
			Y: [
				[ new Mesh( scaleHandleGeometry, matGreen$2 ), [ 0, 0.8, 0 ]],
				[ new Line( lineGeometry$3, matLineGreen$3 ), null, [ 0, 0, Math.PI / 2 ], [ 0.8, 1, 1 ]]
			],
			Z: [
				[ new Mesh( scaleHandleGeometry, matBlue$2 ), [ 0, 0, 0.8 ], [ Math.PI / 2, 0, 0 ]],
				[ new Line( lineGeometry$3, matLineBlue$3 ), null, [ 0, - Math.PI / 2, 0 ], [ 0.8, 1, 1 ]]
			],
			XY: [
				[ new Mesh( scaleHandleGeometry, matYellowTransparent$2 ), [ 0.85, 0.85, 0 ], null, [ 2, 2, 0.2 ]],
				[ new Line( lineGeometry$3, matLineYellow$2 ), [ 0.855, 0.98, 0 ], null, [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$3, matLineYellow$2 ), [ 0.98, 0.855, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]]
			],
			YZ: [
				[ new Mesh( scaleHandleGeometry, matCyanTransparent$2 ), [ 0, 0.85, 0.85 ], null, [ 0.2, 2, 2 ]],
				[ new Line( lineGeometry$3, matLineCyan$2 ), [ 0, 0.855, 0.98 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$3, matLineCyan$2 ), [ 0, 0.98, 0.855 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
			],
			XZ: [
				[ new Mesh( scaleHandleGeometry, matMagentaTransparent$2 ), [ 0.85, 0, 0.85 ], null, [ 2, 0.2, 2 ]],
				[ new Line( lineGeometry$3, matLineMagenta$2 ), [ 0.855, 0, 0.98 ], null, [ 0.125, 1, 1 ]],
				[ new Line( lineGeometry$3, matLineMagenta$2 ), [ 0.98, 0, 0.855 ], [ 0, - Math.PI / 2, 0 ], [ 0.125, 1, 1 ]]
			],
			XYZX: [
				[ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent$2 ), [ 1.1, 0, 0 ]],
			],
			XYZY: [
				[ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent$2 ), [ 0, 1.1, 0 ]],
			],
			XYZZ: [
				[ new Mesh( new BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent$2 ), [ 0, 0, 1.1 ]],
			]
		};

		const pickerScale = {
			X: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible$2 ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ]]
			],
			Y: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible$2 ), [ 0, 0.5, 0 ]]
			],
			Z: [
				[ new Mesh( new CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible$2 ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ]]
			],
			XY: [
				[ new Mesh( scaleHandleGeometry, matInvisible$2 ), [ 0.85, 0.85, 0 ], null, [ 3, 3, 0.2 ]],
			],
			YZ: [
				[ new Mesh( scaleHandleGeometry, matInvisible$2 ), [ 0, 0.85, 0.85 ], null, [ 0.2, 3, 3 ]],
			],
			XZ: [
				[ new Mesh( scaleHandleGeometry, matInvisible$2 ), [ 0.85, 0, 0.85 ], null, [ 3, 0.2, 3 ]],
			],
			XYZX: [
				[ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible$2 ), [ 1.1, 0, 0 ]],
			],
			XYZY: [
				[ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible$2 ), [ 0, 1.1, 0 ]],
			],
			XYZZ: [
				[ new Mesh( new BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible$2 ), [ 0, 0, 1.1 ]],
			]
		};

		const helperScale = {
			X: [
				[ new Line( lineGeometry$3, matHelper$2.clone() ), [ - 1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
			],
			Y: [
				[ new Line( lineGeometry$3, matHelper$2.clone() ), [ 0, - 1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
			],
			Z: [
				[ new Line( lineGeometry$3, matHelper$2.clone() ), [ 0, 0, - 1e3 ], [ 0, - Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
			]
		};

		this.add( this.gizmo = this.setupHelper( gizmoScale ) );
		this.add( this.picker = this.setupHelper( pickerScale ) );
		this.add( this.helper = this.setupHelper( helperScale ) );

	}
	updateHelperMatrix() {

		super.updateHelperMatrix();

		const quaternion = this.worldQuaternion;

		// highlight selected axis
		this.traverse( handle => {

			// Hide translate and scale axis facing the camera
			const AXIS_HIDE_TRESHOLD = 0.99;
			const PLANE_HIDE_TRESHOLD = 0.2;
			const AXIS_FLIP_TRESHOLD = - 0.4;

			if ( handle !== this ) {

				handle.visible = true;
				handle.scale.set( 1, 1, 1 );

			}

			if ( handle.name === 'X' || handle.name === 'XYZX' ) {

				if ( Math.abs( alignVector$2.copy( unitX$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'Y' || handle.name === 'XYZY' ) {

				if ( Math.abs( alignVector$2.copy( unitY$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {

				if ( Math.abs( alignVector$2.copy( unitZ$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'XY' ) {

				if ( Math.abs( alignVector$2.copy( unitZ$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'YZ' ) {

				if ( Math.abs( alignVector$2.copy( unitX$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}
			if ( handle.name === 'XZ' ) {

				if ( Math.abs( alignVector$2.copy( unitY$2 ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {

					handle.visible = false;

				}

			}

			// Flip translate and scale axis ocluded behind another axis
			if ( handle.name.search( 'X' ) !== - 1 ) {

				if ( alignVector$2.copy( unitX$2 ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.x *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}
			if ( handle.name.search( 'Y' ) !== - 1 ) {

				if ( alignVector$2.copy( unitY$2 ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.y *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}
			if ( handle.name.search( 'Z' ) !== - 1 ) {

				if ( alignVector$2.copy( unitZ$2 ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {

					if ( handle.tag === 'fwd' ) {

						handle.visible = false;

					} else {

						handle.scale.z *= - 1;

					}

				} else if ( handle.tag === 'bwd' ) {

					handle.visible = false;

				}

			}


			if ( handle.material ) {

				handle.material._opacity = handle.material._opacity || handle.material.opacity;
				handle.material._color = handle.material._color || handle.material.color.clone();

				handle.material.color.copy( handle.material._color );
				handle.material.opacity = handle.material._opacity;

				handle.material.color.lerp( white$2, 0.25 );

				if ( ! this.enabled ) {

					handle.material.opacity *= 0.25;
					handle.material.color.lerp( gray$2, 0.75 );

				} else if ( this.axis ) {

					if ( handle.name === this.axis ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else if ( this.axis.split( '' ).some( function ( a ) {

						return handle.name === a;

					} ) ) {

						handle.material.opacity = handle.material._opacity * 2;
						handle.material.color.copy( handle.material._color );

					} else {

						handle.material.opacity *= 0.25;
						handle.material.color.lerp( white$2, 0.5 );

					}

				}

			}

		} );
		this.picker.visible = false;

	}

}

/**
 * @author arodic / https://github.com/arodic
 */

// Reusable utility variables
const _ray = new Raycaster();
const _tempVector = new Vector3();
const _tempVector2 = new Vector3();
const _tempQuaternion = new Quaternion();
const _unit = {
	X: new Vector3( 1, 0, 0 ),
	Y: new Vector3( 0, 1, 0 ),
	Z: new Vector3( 0, 0, 1 )
};
const _identityQuaternion = new Quaternion();
const _alignVector = new Vector3();
const _plane = new Plane();

// events
const changeEvent = { type: "change" };

class TransformControls extends Interactive {

	constructor( camera, domElement ) {

		super( domElement );

		this.visible = false;

		this._gizmo = {
			'translate': new AxesTranslateHelper(),
			'rotate': new AxesRotateHelper(),
			'scale': new AxesScaleHelper()
		};

		this.add( this._gizmo.translate );
		this.add( this._gizmo.rotate );
		this.add( this._gizmo.scale );

		this.defineProperties( {
			camera: camera,
			object: null,
			axis: null,
			mode: "translate",
			translationSnap: null,
			rotationSnap: null,
			space: "local",
			active: false,
			size: 0.1,
			showX: true,
			showY: true,
			showZ: true,
			// TODO: remove properties unused in plane and gizmo
			pointStart: new Vector3(),
			pointEnd: new Vector3(),
			rotationAxis: new Vector3(),
			rotationAngle: 0,
			cameraPosition: new Vector3(),
			cameraQuaternion: new Quaternion(),
			cameraScale: new Vector3(),
			worldPositionStart: new Vector3(),
			worldQuaternionStart: new Quaternion(),
			worldScaleStart: new Vector3(), // TODO: remove
			worldPosition: new Vector3(),
			worldQuaternion: new Quaternion(),
			worldScale: new Vector3(), // TODO: remove
			eye: new Vector3(),
			positionStart: new Vector3(),
			quaternionStart: new Quaternion(),
			scaleStart: new Vector3()
		} );

		// TODO: implement better data binding
		// Defined properties are passed down to gizmo and plane
		for ( let prop in this._properties ) {

			this._gizmo.translate[ prop ] = this._properties[ prop ];
			this._gizmo.rotate[ prop ] = this._properties[ prop ];
			this._gizmo.scale[ prop ] = this._properties[ prop ];

		}
		this.addEventListener( 'change', function ( event ) {

			this._gizmo.translate[ event.prop ] = event.value;
			this._gizmo.rotate[ event.prop ] = event.value;
			this._gizmo.scale[ event.prop ] = event.value;

		} );
		this.modeChanged( this.mode );
		this.objectChanged( this.object );

	}
	modeChanged( value ) {

		this._gizmo.translate.visible = value === 'translate';
		this._gizmo.rotate.visible = value === 'rotate';
		this._gizmo.scale.visible = value === 'scale';

	}
	objectChanged( value ) {

		let hasObject = value ? true : false;
		this.visible = hasObject;
		if ( ! hasObject ) {

			this.active = false;
			this.axis = null;

		}
		this._gizmo.translate.target = value;
		this._gizmo.rotate.target = value;
		this._gizmo.scale.target = value;

	}
	updateMatrixWorld() {

		if ( this.object ) {

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

		if ( ! this.object || this.active === true ) return;
		_ray.setFromCamera( pointers[ 0 ].position, this.camera );
		// TODO: remove and unhack
		this.object.matrixWorld.decompose( this.worldPositionStart, this.worldQuaternionStart, this.worldScaleStart );
		//
		const intersect = _ray.intersectObjects( this._gizmo[ this.mode ].picker.children, true )[ 0 ] || false;
		if ( intersect ) {

			this.axis = intersect.object.name;

		} else {

			this.axis = null;

		}

	}
	onPointerDown( pointers ) {

		if ( this.axis === null || ! this.object || this.active === true || pointers[ 0 ].button !== 0 ) return;

		_ray.setFromCamera( pointers[ 0 ].position, this.camera );

		const planeIntersect = this.intersectPlane();
		let space = this.space;
		if ( planeIntersect ) {

			if ( this.mode === 'scale' ) {

				space = 'local';

			} else if ( this.axis === 'E' || this.axis === 'XYZE' || this.axis === 'XYZ' ) {

				space = 'world';

			}
			if ( space === 'local' && this.mode === 'rotate' ) {

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
			this.pointStart.copy( planeIntersect ).sub( this.worldPositionStart );
			if ( space === 'local' ) this.pointStart.applyQuaternion( this.worldQuaternionStart.clone().inverse() );

		}

		this.active = true;

	}
	onPointerMove( pointers ) {

		let axis = this.axis;
		let mode = this.mode;
		let object = this.object;
		let space = this.space;

		if ( mode === 'scale' ) {

			space = 'local';

		} else if ( axis === 'E' || axis === 'XYZE' || axis === 'XYZ' ) {

			space = 'world';

		}

		if ( object === undefined || axis === null || this.active === false || pointers[ 0 ].button !== 0 ) return;

		_ray.setFromCamera( pointers[ 0 ].position, this.camera );

		const planeIntersect = this.intersectPlane();

		if ( ! planeIntersect ) return;

		this.pointEnd.copy( planeIntersect ).sub( this.worldPositionStart );

		if ( space === 'local' ) this.pointEnd.applyQuaternion( this.worldQuaternionStart.clone().inverse() );

		// Apply translate
		if ( mode === 'translate' ) {

			if ( axis.search( 'X' ) === - 1 ) {

				this.pointEnd.x = this.pointStart.x;

			}
			if ( axis.search( 'Y' ) === - 1 ) {

				this.pointEnd.y = this.pointStart.y;

			}
			if ( axis.search( 'Z' ) === - 1 ) {

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

					object.position.applyQuaternion( _tempQuaternion.copy( this.quaternionStart ).inverse() );
					if ( axis.search( 'X' ) !== - 1 ) {

						object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;

					}
					if ( axis.search( 'Y' ) !== - 1 ) {

						object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;

					}
					if ( axis.search( 'Z' ) !== - 1 ) {

						object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;

					}
					object.position.applyQuaternion( this.quaternionStart );

				}
				if ( space === 'world' ) {

					if ( object.parent ) {

						object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

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

						object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );

					}

				}

			}

		} else if ( mode === 'scale' ) {

			if ( axis.search( 'XYZ' ) !== - 1 ) {

				let d = this.pointEnd.length() / this.pointStart.length();
				if ( this.pointEnd.dot( this.pointStart ) < 0 ) d *= - 1;
				_tempVector.set( d, d, d );

			} else {

				_tempVector.copy( this.pointEnd ).divide( this.pointStart );
				if ( axis.search( 'X' ) === - 1 ) {

					_tempVector.x = 1;

				}
				if ( axis.search( 'Y' ) === - 1 ) {

					_tempVector.y = 1;

				}
				if ( axis.search( 'Z' ) === - 1 ) {

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
				this.rotationAngle = this.pointEnd.angleTo( this.pointStart ) * ( _tempVector.dot( this.eye ) < 0 ? 1 : - 1 );

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
		this.object.updateMatrixWorld();
		this.dispatchEvent( changeEvent );

	}
	onPointerUp( pointers ) {

		if ( pointers.length === 0 ) {

			this.active = false;
			this.axis = null;

		} else {

			if ( pointers[ 0 ].button === - 1 ) this.axis = null;

		}

	}
	intersectPlane() {

		const _alignX = new Vector3( 1, 0, 0 );
		const _alignY = new Vector3( 0, 1, 0 );
		const _alignZ = new Vector3( 0, 0, 1 );
		const _alignVector = new Vector3();

		_alignX.set( 1, 0, 0 );
		_alignY.set( 0, 1, 0 );
		_alignZ.set( 0, 0, 1 );

		if ( this.space === "local" || this.mode === 'scale' ) { // scale always oriented to local rotation

			_alignX.applyQuaternion( this.worldQuaternion );
			_alignY.applyQuaternion( this.worldQuaternion );
			_alignZ.applyQuaternion( this.worldQuaternion );

		}

		switch ( this.mode ) {

			case 'translate':
			case 'scale':
				switch ( this.axis ) {

					case 'X':
						_alignVector.copy( this.eye ).cross( _alignX );
						_plane.normal.copy( _alignX ).cross( _alignVector );
						break;
					case 'Y':
						_alignVector.copy( this.eye ).cross( _alignY );
						_plane.normal.copy( _alignY ).cross( _alignVector );
						break;
					case 'Z':
						_alignVector.copy( this.eye ).cross( _alignZ );
						_plane.normal.copy( _alignZ ).cross( _alignVector );
						break;
					case 'XY':
						_plane.normal.copy( _alignZ );
						break;
					case 'YZ':
						_plane.normal.copy( _alignX );
						break;
					case 'XZ':
						_plane.normal.copy( _alignY );
						break;
					case 'XYZ':
					case 'E':
						this.camera.getWorldDirection( _plane.normal );
						break;

				}
				break;
			case 'rotate':
			default:
				this.camera.getWorldDirection( _plane.normal );

		}
		_plane.setFromNormalAndCoplanarPoint( _plane.normal, this.worldPosition );
		return _ray.ray.intersectPlane( _plane, _tempVector );

	}

}

export { TransformControls };
