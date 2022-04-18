import { Object3D, WebGLCubeRenderTarget, CubeCamera, LightProbe, WebGLRenderer, Scene } from "three";
import { LightProbeHelper } from 'three/examples/jsm/helpers/LightProbeHelper.js';
export declare class LightProbeRig extends Object3D {
    lightProbe: LightProbe;
    lightProbeHelper: LightProbeHelper;
    cubeRenderTarget: WebGLCubeRenderTarget;
    cubeCamera: CubeCamera;
    constructor(resolution?: number);
    update(renderer: WebGLRenderer, scene: Scene): void;
}
