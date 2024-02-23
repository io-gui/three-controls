import { IoElement, RegisterIoElement } from 'io-gui';
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, SphereGeometry, MeshBasicMaterial } from 'three';
import { OrbitControls, TransformHelper } from './build/index.js';

export class ThreeControlsDemo extends IoElement {
  static get Style() {
    return /* css */`
      :host {
        display: flex;
        position: relative;
        height: 100%;
        flex-direction: column;
        overflow: hidden;
      }
      :host > div {
        margin: auto;
      }
    `;
  }
  static get Properties() {
    return {};
  }
  constructor(properties = {}) {
    super(properties);
    this.template([['div', 'This page is not ready yet.']]);

    const scene = new Scene();

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const controls = new OrbitControls(camera, this);
    controls.addEventListener('change', () => {
      renderer.render(scene, camera);
    });


    const renderer = new WebGLRenderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.appendChild(renderer.domElement);

    // const sphere = new Mesh(
    //   new SphereGeometry(5, 32, 32),
    //   new MeshBasicMaterial({ color: 0xff0000 })
    // );
    // scene.add(sphere);

    const transformHelper = new TransformHelper(camera, renderer.domElement);
    transformHelper.dithering = true;
    scene.add(transformHelper);
    // transformHelper.updateMatrixWorld(true);

    renderer.render(scene, camera);
  }
}
RegisterIoElement(ThreeControlsDemo);