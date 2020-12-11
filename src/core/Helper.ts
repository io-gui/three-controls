import { Vector3, Vector4, Euler, Quaternion, WebGLRenderer, Scene, Mesh, Line, Camera, PerspectiveCamera, OrthographicCamera, DoubleSide, LineBasicMaterial, MeshBasicMaterial } from 'three';

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

export class Helper extends Mesh {
  camera: PerspectiveCamera | OrthographicCamera = new PerspectiveCamera();
  eye = new Vector3();
  protected readonly _cameraPosition = new Vector3();
  protected readonly _cameraQuaternion = new Quaternion();
  protected readonly _cameraScale = new Vector3();
  protected readonly _position = new Vector3();
  protected readonly _quaternion = new Quaternion();
  protected readonly _scale = new Vector3();
  constructor( helperMap?: [ Mesh | Line, HelperGeometrySpec ][] ) {
    super();
    if ( helperMap ) {
      for ( let i = helperMap.length; i --; ) {

        const object = helperMap[ i ][ 0 ].clone();
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
  onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
    this.camera = camera as PerspectiveCamera | OrthographicCamera;
  }
  updateMatrixWorld() {
    super.updateMatrixWorld();
    this.matrixWorld.decompose( this._position, this._quaternion, this._scale );
    this.camera.matrixWorld.decompose( this._cameraPosition, this._cameraQuaternion, this._cameraScale ); 
    if ( this.camera instanceof PerspectiveCamera ) {
      this.eye.copy( this._cameraPosition ).sub( this._position ).normalize();
    } else if ( this.camera instanceof OrthographicCamera ) {
      this.eye.set( 0, 0, 1 ).applyQuaternion( this._cameraQuaternion );
    }
  }
}
