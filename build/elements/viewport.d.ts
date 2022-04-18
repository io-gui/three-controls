import { IoElement } from "@iogui/iogui";
import { WebGLRenderer, Scene, PerspectiveCamera, Texture } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { LightProbeRig } from '../rigs/lightProbeRig.js';
import { OrbitControls, TransformControls } from '../controls/index.js';
import './renderer.js';
export declare class ThreeViewport extends IoElement {
    static get Style(): string;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    controls: OrbitControls;
    transformControls: TransformControls;
    scene: Scene;
    lightProbeRig: LightProbeRig;
    renderPass: RenderPass;
    bokehPass: BokehPass;
    composer: EffectComposer;
    envMap: null | Texture;
    static get Properties(): {
        tabindex: number;
    };
    constructor(properties?: Record<string, any>);
    connectedCallback(): void;
    disconnectedCallback(): void;
    onResized(): void;
    loadIbl(url: string, onLoad: any, onProgress: any, onError: any): void;
    loadModel(url: string, onLoad: any, onProgress: any, onError: any): void;
    render(): void;
}
