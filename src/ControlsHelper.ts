import { Vector3, Vector4, Euler, Quaternion, WebGLRenderer, Scene, Mesh, Line, Camera, PerspectiveCamera, OrthographicCamera, DoubleSide, LineBasicMaterial, MeshBasicMaterial } from 'three';

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

export class ControlsHelper extends Mesh {
  camera: PerspectiveCamera | OrthographicCamera = new PerspectiveCamera();
  eye = new Vector3();
  protected readonly _cameraPosition = new Vector3();
  protected readonly _cameraQuaternion = new Quaternion();
  protected readonly _cameraScale = new Vector3();
  protected readonly _position = new Vector3();
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

        object.name = gizmoSpec.type + '-' + gizmoSpec.axis + gizmoSpec.tag || '';
        object.userData = {
          type: gizmoSpec.type,
          axis: gizmoSpec.axis,
          tag: gizmoSpec.tag,
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
  updateMatrixWorld() {
    super.updateMatrixWorld();
    this._position.setFromMatrixPosition( this.matrixWorld );
    if ( this.camera instanceof PerspectiveCamera ) {
      this.eye.copy( this._cameraPosition ).sub( this._position ).normalize();
    } else if ( this.camera instanceof OrthographicCamera ) {
      this.eye.set( 0, 0, 1 ).applyQuaternion( this._cameraQuaternion );
    }
  }
}
