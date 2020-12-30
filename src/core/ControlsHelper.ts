import { Vector3, Vector4, Euler, Mesh, Line, Material, DoubleSide, LineBasicMaterial, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera } from 'three';
import { ControlsBase, AnyCameraType } from './ControlsBase';

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

export interface HelperGeometrySpec {
  type: string,
  axis: string,
  color: Vector4,
  position?: Vector3,
  rotation?: Euler,
  scale?: Vector3,
  thickness?: number,
  outlineThickness?: number,
  tag?: string,
}

export class ControlsHelper extends ControlsBase {
  sizeAttenuation = 1;
  constructor( camera: AnyCameraType, domElement: HTMLElement, helperMap?: [ Mesh | Line, HelperGeometrySpec ][] ) {
    super( camera, domElement );
    if ( helperMap ) {
      for ( let i = helperMap.length; i --; ) {

        const object = helperMap[ i ][ 0 ].clone() as Mesh | Line;
        const helperSpec = helperMap[ i ][ 1 ];

        if (object instanceof Mesh) {
          object.material = helperMaterial.clone();
        } else if (object instanceof Line) {
          object.material = helperLineMaterial.clone();
        }
        (object.material as MeshBasicMaterial).color.setRGB( helperSpec.color.x, helperSpec.color.y, helperSpec.color.z );
        (object.material as MeshBasicMaterial).opacity = helperSpec.color.w;

        object.name = helperSpec.type + '-' + helperSpec.axis + helperSpec.tag || '';
        object.userData = {
          type: helperSpec.type,
          axis: helperSpec.axis,
          tag: helperSpec.tag,
        };
        if ( helperSpec.position ) object.position.copy( helperSpec.position );
        if ( helperSpec.rotation ) object.rotation.copy( helperSpec.rotation );
        if ( helperSpec.scale ) object.scale.copy( helperSpec.scale );

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
      if ((child as Mesh).material) ((child as Mesh).material as Material).dispose();
      if ((child as Mesh).geometry) (child as Mesh).geometry.dispose();
    });
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
