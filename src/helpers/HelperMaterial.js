import {IoLiteMixin} from "../../lib/IoLiteMixin.js";
import {IoCoreMixin} from "../../../io/build/io-core.js";
import {UniformsUtils, Vector3, Color, FrontSide, ShaderMaterial,
	DataTexture, RGBAFormat, FloatType, NearestFilter} from "../../../three.js/src/Three.js";

// TODO: pixel-perfect outlines
export class HelperMaterial extends IoCoreMixin(ShaderMaterial) {
	static get properties() {
		return {
			depthTest: true,
			depthWrite: true,
			transparent: false,
			side: FrontSide,
			//
			color: Color,
			opacity: 1,
			depthBias: Number,
			highlight: Number,
			resolution: Vector3,
		};
	}
	constructor(props = {}) {
		super({
			transparent: !!props.opacity,
			opacity: props.opacity !== undefined ? props.opacity : 1,
		});
		this.connect(window); // TODO: GC warning!;

		this.depthBias = props.depthBias || 0;
		this.highlight = props.highlight || 0;
		this.color = props.color || new Color(0xffffff);
		this.resolution = new Vector3(window.innerWidth, window.innerHeight, window.devicePixelRatio);

		const data = new Float32Array([
			1.0 / 17.0, 0,0,0, 9.0 / 17.0, 0,0,0, 3.0 / 17.0, 0,0,0, 11.0 / 17.0, 0,0,0,
			13.0 / 17.0, 0,0,0, 5.0 / 17.0, 0,0,0, 15.0 / 17.0, 0,0,0, 7.0 / 17.0, 0,0,0,
			4.0 / 17.0, 0,0,0, 12.0 / 17.0, 0,0,0, 2.0 / 17.0, 0,0,0, 10.0 / 17.0, 0,0,0,
			16.0 / 17.0, 0,0,0, 8.0 / 17.0, 0,0,0, 14.0 / 17.0, 0,0,0, 6.0 / 17.0, 0,0,0,
		]);
		const texture = new DataTexture( data, 4, 4, RGBAFormat, FloatType );
		texture.magFilter = NearestFilter;
		texture.minFilter = NearestFilter;

		this.uniforms = UniformsUtils.merge([this.uniforms, {
			"uColor":  {value: this.color},
			"uOpacity":  {value: this.opacity},
			"uDepthBias":  {value: this.depthBias},
			"uHighlight":  {value: this.highlight},
			"uResolution":  {value: this.resolution},
			"tDitherMatrix":  {value: texture},
		}]);

		this.uniforms.tDitherMatrix.value = texture;
		texture.needsUpdate = true;

		this.vertexShader = `

			attribute vec4 color;
			attribute float outline;

			varying vec4 vColor;
			varying float isOutline;
			varying vec2 vUv;

			uniform vec3 uResolution;
			uniform float uDepthBias;
			uniform float uHighlight;

			void main() {
				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];

				vColor = color;
				isOutline = outline;

				vec3 nor = normalMatrix * normal;
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				// nor = (projectionMatrix * vec4(nor, 1.0)).xyz;
				nor = normalize((nor.xyz) * vec3(1., 1., 0.));

				pos.z -= uDepthBias * 0.1;
				pos.z -= uHighlight;

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude = outline;
					pos.z += 0.01;
					pos.z = max(-0.99, pos.z);
				} else {
					extrude -= outline;
					pos.z = max(-1.0, pos.z);
				}

				pos.xy /= pos.w;

				float dx = nor.x * extrude * 2.2;
				float dy = nor.y * extrude * 2.2;

				pos.x += (dx) * (1.0 / uResolution.x);
				pos.y += (dy) * (1.0 / uResolution.y);

				vUv = uv;

				pos.xy *= pos.w;

				gl_Position = pos;
			}
		`;
		this.fragmentShader = `
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uHighlight;
			uniform vec3 uResolution;
			uniform sampler2D tDitherMatrix;

			varying vec4 vColor;
			varying float isOutline;
			varying vec2 vUv;

			void main() {

				float opacity = 1.0;
				vec3 color = vColor.rgb;

				if (isOutline > 0.0) {
					color = mix(color * vec3(0.25), vec3(1.0), max(0.0, uHighlight) );
					color = mix(color, vColor.rgb, max(0.0, -uHighlight) );
				}

				float dimming = mix(1.0, 0.0, max(0.0, -uHighlight));
				dimming = mix(dimming, 2.0, max(0.0, uHighlight));
				opacity = vColor.a * dimming;

				color = mix(vec3(0.5), saturate(color), dimming);

				gl_FragColor = vec4(color, uOpacity);

				opacity = opacity - mod(opacity, 0.25) + 0.25;

				vec2 matCoord = ( mod(gl_FragCoord.xy, 4.0) - vec2(0.5) ) / 4.0;
				vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );
				if (opacity < ditherPattern.r) discard;
			}
		`;
	}
	changed() {
		if (this.uniforms.uColor) {
			this.uniforms.uColor.value = this.color;
			this.uniforms.uOpacity.value = this.opacity;
			this.uniforms.uDepthBias.value = this.depthBias;
			this.uniforms.uHighlight.value = this.highlight;
			this.uniforms.uResolution.value = this.resolution;
			this.uniformsNeedUpdate = true;
		}
	}
}

HelperMaterial.Register = IoCoreMixin.Register;
