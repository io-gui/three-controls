import { Mesh, Line, DoubleSide, LineBasicMaterial, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera } from 'three';
import { ControlsBase } from './Base';

export const helperMaterial = new MeshBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	side: DoubleSide,
	fog: false,
	toneMapped: false
} );

export const helperLineMaterial = new LineBasicMaterial( {
	depthTest: false,
	depthWrite: false,
	transparent: true,
	linewidth: 1,
	fog: false,
	toneMapped: false
} );

export class Helper extends ControlsBase {

	constructor( camera, domElement, helperMap ) {

		super( camera, domElement );
		this.sizeAttenuation = 1;

		if ( helperMap ) {

			for ( let i = helperMap.length; i --; ) {

				const object = helperMap[ i ][ 0 ].clone();
				const helperSpec = helperMap[ i ][ 1 ];

				if ( object instanceof Mesh ) {

					object.material = helperMaterial.clone();

				} else if ( object instanceof Line ) {

					object.material = helperLineMaterial.clone();

				}

				object.material.color.setRGB( helperSpec.color.x, helperSpec.color.y, helperSpec.color.z );
				object.material.opacity = helperSpec.color.w;
				object.name = helperSpec.type + '-' + helperSpec.axis + helperSpec.tag || '';

				object.userData = {
					type: helperSpec.type,
					axis: helperSpec.axis,
					tag: helperSpec.tag,
				};

				if ( helperSpec.position )
					object.position.copy( helperSpec.position );

				if ( helperSpec.rotation )
					object.rotation.copy( helperSpec.rotation );

				if ( helperSpec.scale )
					object.scale.copy( helperSpec.scale );

				object.updateMatrix();
				const tempGeometry = object.geometry.clone();
				tempGeometry.applyMatrix4( object.matrix );
				object.geometry = tempGeometry;
				object.renderOrder = Infinity;
				object.position.set( 0, 0, 0 );
				object.rotation.set( 0, 0, 0 );
				object.scale.set( 1, 1, 1 );
				this.add( object );

			}

		}

	}
	dispose() {

		super.dispose();

		this.traverse( child => {

			if ( child.material )
				child.material.dispose();

			if ( child.geometry )
				child.geometry.dispose();

		} );

	}
	decomposeMatrices() {

		super.decomposeMatrices();
		const camera = this.camera;
		this.sizeAttenuation = 1;

		if ( camera instanceof OrthographicCamera ) {

			this.sizeAttenuation = ( camera.top - camera.bottom ) / camera.zoom;

		} else if ( camera instanceof PerspectiveCamera ) {

			this.sizeAttenuation = this.worldPosition.distanceTo( this.cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * camera.fov / 360 ) / camera.zoom, 7 );

		}

		this.sizeAttenuation *= 720 / this.domElement.clientHeight / window.devicePixelRatio;

	}

}
