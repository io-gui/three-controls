import {
	Mesh, PlaneBufferGeometry, MeshBasicMaterial, DoubleSide,
	Vector3, Matrix4, Quaternion, Object3D
} from "../../../three.js/build/three.module.js";

export class TransformControlsPlane extends Mesh {
	constructor() {

		super(
			new PlaneBufferGeometry( 100000, 100000, 2, 2 ),
			new MeshBasicMaterial( { visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1 } )
		);

		this.type = 'TransformControlsPlane';

		const unitX = new Vector3( 1, 0, 0 );
		const unitY = new Vector3( 0, 1, 0 );
		const unitZ = new Vector3( 0, 0, 1 );

		const tempVector = new Vector3();
		const dirVector = new Vector3();
		const alignVector = new Vector3();
		const tempMatrix = new Matrix4();
		const identityQuaternion = new Quaternion();

		this.updateMatrixWorld = function() {

			this.position.copy( this.worldPosition );

			if ( this.mode === 'scale' ) this.space = 'local'; // scale always oriented to local rotation

			unitX.set( 1, 0, 0 ).applyQuaternion( this.space === "local" ? this.worldQuaternion : identityQuaternion );
			unitY.set( 0, 1, 0 ).applyQuaternion( this.space === "local" ? this.worldQuaternion : identityQuaternion );
			unitZ.set( 0, 0, 1 ).applyQuaternion( this.space === "local" ? this.worldQuaternion : identityQuaternion );

			// Align the plane for current transform mode, axis and this.space.
			alignVector.copy( unitY );

			switch ( this.mode ) {
				case 'translate':
				case 'scale':
					switch ( this.axis ) {
						case 'X':
							alignVector.copy( this.eye ).cross( unitX );
							dirVector.copy( unitX ).cross( alignVector );
							break;
						case 'Y':
							alignVector.copy( this.eye ).cross( unitY );
							dirVector.copy( unitY ).cross( alignVector );
							break;
						case 'Z':
							alignVector.copy( this.eye ).cross( unitZ );
							dirVector.copy( unitZ ).cross( alignVector );
							break;
						case 'XY':
							dirVector.copy( unitZ );
							break;
						case 'YZ':
							dirVector.copy( unitX );
							break;
						case 'XZ':
							alignVector.copy( unitZ );
							dirVector.copy( unitY );
							break;
						case 'XYZ':
						case 'E':
							dirVector.set( 0, 0, 0 );
							break;
					}
					break;
				case 'rotate':
				default:
					// special case for rotate
					dirVector.set( 0, 0, 0 );
			}
			if ( dirVector.length() === 0 ) {
				// If in rotate mode, make the plane parallel to camera
				this.quaternion.copy( this.cameraQuaternion );
			} else {
				tempMatrix.lookAt( tempVector.set( 0, 0, 0 ), dirVector, alignVector );
				this.quaternion.setFromRotationMatrix( tempMatrix );
			}
			Object3D.prototype.updateMatrixWorld.call( this );
		};
	}
}