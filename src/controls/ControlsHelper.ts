import { WebGLRenderer, Scene, Mesh, Line, Vector3, Euler, Camera, PerspectiveCamera, OrthographicCamera,
  DoubleSide, LineBasicMaterial, MeshBasicMaterial, Vector4, Color} from '../../../three';

export const gizmoMaterial = new MeshBasicMaterial( {
  depthTest: false,
  depthWrite: false,
  transparent: true,
  side: DoubleSide,
  fog: false,
  toneMapped: false
} );

export const gizmoLineMaterial = new LineBasicMaterial( {
  depthTest: false,
  depthWrite: false,
  transparent: true,
  linewidth: 1,
  fog: false,
  toneMapped: false
} );

export interface ControlsHelperGeometrySpec {
  name: string,
  color: Vector4,
  position?: Vector3,
  rotation?: Euler,
  scale?: Vector3,
  thickness?: number,
  outlineThickness?: number,
  tag?: string,
  mode?: string,
}

const _cameraPosition = new Vector3();
const _position = new Vector3();

export class ControlsHelper extends Mesh {
  camera: PerspectiveCamera | OrthographicCamera = new PerspectiveCamera();
  //
  enabled = true;
  axis: 'X' | 'Y' | 'Z' | 'XY' | 'YZ' | 'XZ' | 'XYZ' | 'XYZE' | 'E' | '' = '';
  mode = '';
  size = 1;
  dragging = false;
  showX = true;
  showY = true;
  showZ = true;
  //
  eye = new Vector3();
  sizeAttenuation = 1;
  constructor( gizmoMap?: [ Mesh | Line, ControlsHelperGeometrySpec ][] ) {
    super();
    if ( gizmoMap ) {
      for ( let i = gizmoMap.length; i --; ) {

        const object = gizmoMap[ i ][ 0 ].clone();
        const gizmoSpec = gizmoMap[ i ][ 1 ];

        if (object instanceof Mesh) {
          object.material = gizmoMaterial.clone();
        } else if (object instanceof Line) {
          object.material = gizmoLineMaterial.clone();
        }
        (object.material as MeshBasicMaterial).color.setRGB( gizmoSpec.color.x, gizmoSpec.color.y, gizmoSpec.color.z );
        (object.material as MeshBasicMaterial).opacity = gizmoSpec.color.w;

        object.name = gizmoSpec.name;
        object.userData = {
          tag: gizmoSpec.tag,
          mode: gizmoSpec.mode,
          axis: gizmoSpec.name,
        };
        if ( gizmoSpec.position ) object.position.copy( gizmoSpec.position );
        if ( gizmoSpec.rotation ) object.rotation.copy( gizmoSpec.rotation );
        if ( gizmoSpec.scale ) object.scale.copy( gizmoSpec.scale );

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
  //
  onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
    this.camera = camera as PerspectiveCamera | OrthographicCamera;
  }
  //
  updateHandleTransform( handle: Mesh ) {
    handle.quaternion.copy( this.quaternion ).inverse();
    handle.position.set( 0, 0, 0 );
    handle.scale.set( 1, 1, 1 ).multiplyScalar( this.sizeAttenuation * this.size / 7 );
  }
  //
  updateHandleVisibility( handle: Mesh ) {
    // Hide disabled axes
    handle.visible = true;
    if ( handle.name.indexOf( 'X' ) !== - 1 && !this.showX ) handle.visible = false
    if ( handle.name.indexOf( 'Y' ) !== - 1 && !this.showY ) handle.visible = false
    if ( handle.name.indexOf( 'Z' ) !== - 1 && !this.showZ ) handle.visible = false
    if ( handle.name.indexOf( 'E' ) !== - 1 && ( !this.showX || !this.showY || !this.showZ ) ) handle.visible = false

    // axis selected axis
    if ( handle.userData.tag !== 'picker' ) {
      const material = handle.material as MeshBasicMaterial;

      material.userData.opacity = material.userData.opacity || material.opacity;
      material.userData.color = material.userData.color || material.color.clone();

      material.color.copy( material.userData.color );
      material.opacity = material.userData.opacity;
      if ( ! this.enabled || (this.mode && handle.userData.mode !== this.mode ) ) {
        material.opacity = material.userData.opacity * 0.125;
        material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
      } else if ( this.axis ) {
        if ( handle.name === this.axis ) {
          material.opacity = 1.0;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        } else if ( this.axis.split( '' ).some( function ( a ) {
          return handle.name === a;
        } ) ) {
          material.opacity = 1.0;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        } else {
          material.opacity = material.userData.opacity * 0.125;
          material.color.lerp( new Color( 1, 1, 1 ), 0.5 );
        }
      }
    }
  }
  //
  updateMatrixWorld() {
    super.updateMatrixWorld();
    _position.setFromMatrixPosition( this.matrixWorld );
    _cameraPosition.setFromMatrixPosition( this.camera.matrixWorld );
    this.eye.copy( _cameraPosition ).sub( _position ).normalize();

    this.sizeAttenuation = 1;
    if ( this.camera instanceof OrthographicCamera ) {
      this.sizeAttenuation = ( this.camera.top - this.camera.bottom ) / this.camera.zoom;
    } else if ( this.camera instanceof PerspectiveCamera ) {
      this.sizeAttenuation = _position.distanceTo( _cameraPosition ) * Math.min( 1.9 * Math.tan( Math.PI * this.camera.fov / 360 ) / this.camera.zoom, 7 );
    }

    for ( let i = 0; i < this.children.length; i ++ ) {
      this.updateHandleVisibility( this.children[ i ] as Mesh );
      this.updateHandleTransform( this.children[ i ] as Mesh );
    }
  }
}
