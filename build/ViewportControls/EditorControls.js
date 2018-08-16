import { Vector3, Box3, Matrix3, Spherical } from '../../../three.js/build/three.module.js';
import { ViewportControls } from './ViewportControls.js';

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author arodic / http://github.com/arodic
 */

// Temp variables
const delta = new Vector3();
const box = new Box3();
const normalMatrix = new Matrix3();
const spherical = new Spherical();

// events
const changeEvent = { type: 'change' };

class EditorControls extends ViewportControls {

	orbitUpdate( orbit ) {

		delta.copy( this.camera.position ).sub( this.target );
		spherical.setFromVector3( delta );
		spherical.theta -= orbit.x;
		spherical.phi += orbit.y;
		spherical.makeSafe();
		delta.setFromSpherical( spherical );
		this.camera.position.copy( this.target ).add( delta );
		this.camera.lookAt( this.target );

	}
	dollyUpdate( dolly ) {

		delta.set( 0, 0, dolly );
		let distance = this.camera.position.distanceTo( this.target );
		delta.multiplyScalar( distance * this.dollySpeed );
		if ( delta.length() > distance ) return;
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.camera.matrix ) );
		this.camera.position.add( delta );

	}
	panUpdate( pan ) {

		let distance = this.camera.position.distanceTo( this.target );
		delta.set( - pan.x, - pan.y, 0 );
		delta.multiplyScalar( distance );
		delta.applyMatrix3( normalMatrix.getNormalMatrix( this.camera.matrix ) );
		this.camera.position.add( delta );
		this.target.add( delta );

	}
	focus( target ) {

		let distance;
		box.setFromObject( target );
		if ( box.isEmpty() === false ) {

			this.center.copy( box.getCenter() );
			distance = box.getBoundingSphere().radius;

		} else {

			// Focusing on an Group, AmbientLight, etc
			this.center.setFromMatrixPosition( target.matrixWorld );
			distance = 0.1;

		}
		delta.set( 0, 0, 1 );
		delta.applyQuaternion( this.camera.quaternion );
		delta.multiplyScalar( distance * 4 );
		this.camera.position.copy( this.target ).add( delta );

		this.dispatchEvent( changeEvent );

	}

}

export { EditorControls };
