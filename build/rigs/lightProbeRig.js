import { Object3D, WebGLCubeRenderTarget, CubeCamera, LightProbe } from "three";
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper.js';
import { LightProbeGenerator } from 'three/examples/jsm/lights/LightProbeGenerator.js';

export class LightProbeRig extends Object3D {

	lightProbe = new LightProbe();
	lightProbeHelper = new LightProbeHelper( this.lightProbe, 50 );
	cubeRenderTarget;
	cubeCamera;
	constructor( resolution = 256 ) {

		super();
		this.cubeRenderTarget = new WebGLCubeRenderTarget( resolution );
		this.cubeCamera = new CubeCamera( 1, 1000, this.cubeRenderTarget );
		this.add( this.cubeCamera );
		this.add( this.lightProbe );
		this.add( this.lightProbeHelper );

	}
	update( renderer, scene ) {

		this.cubeCamera.layers.set( 1 );
		this.cubeCamera.update( renderer, scene );
		this.lightProbe.copy( LightProbeGenerator.fromCubeRenderTarget( renderer, this.cubeRenderTarget ) );
		this.lightProbe.position.copy( this.cubeCamera.position );
		this.lightProbeHelper.position.copy( this.cubeCamera.position );
		this.lightProbe.intensity = 0.5;
		this.lightProbe.layers.mask = this.layers.mask;
		this.lightProbeHelper.layers.mask = this.layers.mask;

	}

}
