import { Vector3, Color, Quaternion, Matrix4, BufferGeometry, Float32BufferAttribute, Uint16BufferAttribute, UniformsUtils,
  FrontSide, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter
} from 'three';

import { BufferGeometryUtils } from './_BufferGeometryUtils.js';
import { HelperGeometrySpec } from '../Helper.js';

// Reusable utility variables
const _position = new Vector3();
const _quaternion = new Quaternion();
const _scale = new Vector3();
const _matrix = new Matrix4();

export const colors = {
  'white': [1, 1, 1],
  'whiteTransparent': [1, 1, 1, 0.25],
  'gray': [0.75, 0.75, 0.75],
  'red': [1, 0.3, 0.2],
  'green': [0.2, 1, 0.2],
  'blue': [0.2, 0.3, 1],
  'cyan': [0.2, 1, 1],
  'magenta': [1, 0.3, 1],
  'yellow': [1, 1, 0.2],
};

export class HelperGeometry extends BufferGeometry {
  constructor(chunks: [BufferGeometry, HelperGeometrySpec][]) {
    super();

    this.index = new Uint16BufferAttribute([], 1);
    this.setAttribute('position', new Float32BufferAttribute([], 3));
    this.setAttribute('uv', new Float32BufferAttribute([], 2));
    this.setAttribute('color', new Float32BufferAttribute([], 4));
    this.setAttribute('normal', new Float32BufferAttribute([], 3));
    this.setAttribute('outline', new Float32BufferAttribute([], 1));

    const chunkGeometries = [];

    for (let i = chunks.length; i--;) {

      const chunk = chunks[i];

      const chunkGeo = chunk[0].clone();
      chunkGeometries.push(chunkGeo);

      const chunkProp: Record<string, any> = chunk[1] || {};

      const color = chunkProp.color || [];

      const thickness = (chunkProp.thickness || -0) / 2;
      const outlineThickness = chunkProp.outlineThickness !== undefined ? chunkProp.outlineThickness : 1;

      _position.set(0, 0, 0);
      _quaternion.set(0, 0, 0, 1);
      _scale.set(1, 1, 1);

      if (chunkProp.position) _position.copy(chunkProp.position);
      if (chunkProp.rotation) _quaternion.setFromEuler(chunkProp.rotation);
      if (chunkProp.scale) _scale.copy(chunkProp.scale);
      _matrix.compose(_position, _quaternion, _scale);

      chunkGeo.applyMatrix4(_matrix);

      // TODO: investigate proper indexing!
      if (chunkGeo.index === null) {
        const indices = [];
        for (let j = 0; j < chunkGeo.attributes.position.count - 2; j+=3) {
          indices.push(j + 0);
          indices.push(j + 1);
          indices.push(j + 2);
        }
        chunkGeo.index = new Uint16BufferAttribute(indices, 1);
      }

      const vertCount = chunkGeo.attributes.position.count;

      if (!chunkGeo.attributes.color) {
        chunkGeo.setAttribute('color', new Float32BufferAttribute(new Array(vertCount * 4), 4));
      }

      const colorArray = chunkGeo.attributes.color.array as Array<number>;
      for (let j = 0; j < vertCount; j++) {
        const r = j * 4 + 0; colorArray[r] = color.x !== undefined ? color.x : colorArray[r];
        const g = j * 4 + 1; colorArray[g] = color.y !== undefined ? color.y : colorArray[g];
        const b = j * 4 + 2; colorArray[b] = color.z !== undefined ? color.z : colorArray[b];
        const a = j * 4 + 3; colorArray[a] = color.w !== undefined ? color.w : colorArray[a] || 1;
      }

      // Duplicate geometry and add outline attribute
      //TODO: enable outline overwrite (needs to know if is outline or not in combined geometry)
      if (!chunkGeo.attributes.outline) {
        const outlineArray = [];
        for (let j = 0; j < vertCount; j++) {
          outlineArray[j] = -thickness;
        }

        chunkGeo.setAttribute( 'outline', new Float32BufferAttribute(outlineArray, 1));
        BufferGeometryUtils.mergeBufferGeometries([chunkGeo, chunkGeo], false, chunkGeo);
        // chunkGeo.merge(chunkGeo);

        const outlineArray2 = (chunkGeo.attributes.outline as Float32BufferAttribute).array as Array<number>;
        if (outlineThickness) {
          for (let j = 0; j < vertCount; j++) {
            outlineArray2[(vertCount + j)] = outlineThickness + thickness;
          }
        }

        const array = chunkGeo.index.array as Array<number>;
        for (let j = array.length / 2; j < array.length; j+=3) {
          const a = array[j + 1];
          const b = array[j + 2];
          array[j + 1] = b;
          array[j + 2] = a;
        }
      }

      const outlineArray2 = chunkGeo.attributes.outline.array as Array<number>;
      for (let j = 0; j < chunkGeo.attributes.outline.array.length; j++) {
        if (chunkGeo.attributes.outline.array[j] < 0) {
          if (chunkProp.thickness !== undefined) outlineArray2[j] = -thickness;
        } else {
          if (chunkProp.outlineThickness !== undefined) outlineArray2[j] = outlineThickness + thickness;
        }
      }

      // this.merge(chunkGeo);
    }

    BufferGeometryUtils.mergeBufferGeometries(chunkGeometries, false, this);
  }
}

export class HelperMaterial extends ShaderMaterial {
  depthTest = true;
  depthWrite = true;
  transparent = false;
  side = FrontSide;
  color = new Color();
  opacity = 1;
  depthBias = 0;
  highlight = 0;
  resolution = new Vector3();
  constructor(props = {
    color: new Color(0xffffff),
    opacity: 1,
    depthBias: 0,
    highlight: 0
  }) {
    super();

    const data = new Float32Array([
      1.0 / 17.0, 0,0,0, 9.0 / 17.0, 0,0,0, 3.0 / 17.0, 0,0,0, 11.0 / 17.0, 0,0,0,
      13.0 / 17.0, 0,0,0, 5.0 / 17.0, 0,0,0, 15.0 / 17.0, 0,0,0, 7.0 / 17.0, 0,0,0,
      4.0 / 17.0, 0,0,0, 12.0 / 17.0, 0,0,0, 2.0 / 17.0, 0,0,0, 10.0 / 17.0, 0,0,0,
      16.0 / 17.0, 0,0,0, 8.0 / 17.0, 0,0,0, 14.0 / 17.0, 0,0,0, 6.0 / 17.0, 0,0,0,
    ]);
    const texture = new DataTexture( data, 4, 4, RGBAFormat, FloatType );
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;

    const color = props.color || new Color(0xffffff);
    const opacity = props.opacity !== undefined ? props.opacity : 1;

    this.color.copy(color);
    this.opacity = opacity;
    this.depthBias = props.depthBias || 0;
    this.highlight = props.highlight || 0;
    this.resolution.set(window.innerWidth, window.innerHeight, window.devicePixelRatio);

    this.uniforms = UniformsUtils.merge([this.uniforms, {
      "uColor": {value: this.color},
      "uOpacity": {value: this.opacity},
      "uDepthBias": {value: this.depthBias},
      "uHighlight": {value: this.highlight},
      "uResolution": {value: this.resolution},
      "tDitherMatrix": {value: texture},
    }]);

    this.uniforms.tDitherMatrix.value = texture;
    texture.needsUpdate = true;

    this.vertexShader = /* glsl */`

      attribute vec4 color;
      attribute float outline;

      varying vec4 vColor;
      varying float isOutline;

      uniform vec3 uResolution;
      uniform float uDepthBias;
      uniform float uHighlight;

      void main() {
        float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];

        vColor = color;
        isOutline = outline;

        vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        vec3 nor = normalize(vec3(1., 1., 0.) * (normalMatrix * normal));

        pos.xyz /= pos.w;

        pos.z -= uDepthBias * 0.1;
        pos.z -= uHighlight;

        pos.x = floor(pos.x * uResolution.x * 1.0 - 0.5) / uResolution.x / 1.0;
        pos.y = floor(pos.y * uResolution.y * 1.0 - 0.5) / uResolution.y / 1.0;

        float extrude = 0.0;
        if (outline > 0.0) {
          extrude = outline;
          pos.z += 0.000001;
          pos.z = max(-0.99, pos.z);
        } else {
          extrude -= outline;
          pos.z = max(-1.0, pos.z);
        }
        float dx = nor.x * extrude * 4.0;
        float dy = nor.y * extrude * 4.0;

        pos.x += dx * (1.0 / uResolution.z) / uResolution.x;
        pos.y += dy * (1.0 / uResolution.z) / uResolution.y;

        pos.xyz *= pos.w;

        gl_Position = pos;
      }
    `;
    this.fragmentShader = /* glsl */`
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform sampler2D tDitherMatrix;

      varying vec4 vColor;
      varying float isOutline;

      void main() {

        float opacity = 1.0;
        vec3 color = vColor.rgb;

        if (isOutline > 0.0) {
          color = mix(color * vec3(0.25), vec3(1.0), max(0.0, uHighlight) );
          color = mix(color, vColor.rgb, max(0.0, -uHighlight) );
          color = vec3(1.0, 1.0, 1.0);
        }

        float dimming = mix(1.0, 0.0, max(0.0, -uHighlight));
        dimming = mix(dimming, 2.0, max(0.0, uHighlight));
        opacity = vColor.a * dimming;

        color = mix(vec3(0.5), color, dimming); // TODO: saturate color

        gl_FragColor = vec4(color, uOpacity);

        opacity = opacity - mod(opacity, 0.25) + 0.25;

        vec2 matCoord = ( mod(gl_FragCoord.xy, 4.0) - vec2(0.5) ) / 4.0;
        vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );
        if (opacity < ditherPattern.r) discard;
      }
    `;
  }
  changed() {
    if (this.uniforms) {
      this.uniforms.uColor.value = this.color;
      this.uniforms.uOpacity.value = this.opacity;
      this.uniforms.uDepthBias.value = this.depthBias;
      this.uniforms.uHighlight.value = this.highlight;
      this.uniforms.uResolution.value = this.resolution;
      this.uniformsNeedUpdate = true;
    }
  }
}