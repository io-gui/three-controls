import { Vector3, Quaternion } from '../../../three.js/build/three.module.js';
import { ViewportControls } from './ViewportControls.js';

/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 * @author arodic / https://github.com/arodic
 */

/*
 * This set of controls performs orbiting, dollying, and panning.
 *
 *    Orbit - left mouse / touch: one-finger move
 *    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
 *    Pan - right mouse, or left mouse + ctrl/metaKey, wasd, or arrow keys / touch: two-finger move
 */

// Temp variables
const eye = new Vector3();
const panDirection = new Vector3();
const eyeDirection = new Vector3();
const rotationAxis = new Vector3();
const rotationQuat = new Quaternion();
const upDirection = new Vector3();
const sideDirection = new Vector3();
const moveDirection = new Vector3();

class TrackballControls extends ViewportControls {

	constructor( camera, domElement ) {

		super( camera, domElement );

		this.defineProperties( {
			minDistance: 0, // PerspectiveCamera dolly limit
			maxDistance: Infinity // PerspectiveCamera dolly limit
		} );

	}
	orbitUpdate( orbit ) {

		eye.copy( this.camera.position ).sub( this.target );

		eyeDirection.copy( eye ).normalize();
		upDirection.copy( this.camera.up ).normalize();
		sideDirection.crossVectors( upDirection, eyeDirection ).normalize();
		upDirection.setLength( orbit.y );
		sideDirection.setLength( orbit.x );
		moveDirection.copy( upDirection.add( sideDirection ) );
		rotationAxis.crossVectors( moveDirection, eye ).normalize();
		rotationQuat.setFromAxisAngle( rotationAxis, orbit.length() );
		eye.applyQuaternion( rotationQuat );
		this.camera.up.applyQuaternion( rotationQuat );

	}
	dollyUpdate( dolly ) {

		let dollyScale = ( dolly > 0 ) ? 1 - dolly : 1 / ( 1 + dolly );
		eye.multiplyScalar( dollyScale );

	}
	panUpdate( pan ) {

		panDirection.copy( eye ).cross( this.camera.up ).setLength( pan.x * eye.length() );
		panDirection.add( upDirection.copy( this.camera.up ).setLength( - pan.y * eye.length() ) );
		this.camera.position.add( panDirection );
		this.target.add( panDirection );

		this.camera.position.addVectors( this.target, eye );
		this.camera.lookAt( this.target );

	}

}

export { TrackballControls };
