import {IoLiteMixin} from "../../lib/IoLiteMixin.js";
import {UniformsUtils, Vector3, Color, FrontSide, ShaderMaterial,
	DataTexture, RGBAFormat, FloatType, NearestFilter, ClampToEdgeWrapping, TextureLoader} from "../../lib/three.module.js";

const _colors = {
	black: new Color(0x000000),
	red: new Color(0xff0000),
	green: new Color(0x00ff00),
	blue: new Color(0x0000ff),
	white: new Color(0xffffff),
	gray: new Color(0x787878),
	yellow: new Color(0xffff00),
	cyan: new Color(0x00ffff),
	magenta: new Color(0xff00ff),
};

// TODO: dithering instead transparency
// TODO: pixel-perfect outlines

export class HelperMaterial extends IoLiteMixin(ShaderMaterial) {
	constructor(color, opacity) {
		super({
			depthTest: true,
			depthWrite: true,
			side: FrontSide,
		});

		const data = new Float32Array([
			1.0 / 17.0, 0,0,0, 9.0 / 17.0, 0,0,0, 3.0 / 17.0, 0,0,0, 11.0 / 17.0, 0,0,0,
			13.0 / 17.0, 0,0,0, 5.0 / 17.0, 0,0,0, 15.0 / 17.0, 0,0,0, 7.0 / 17.0, 0,0,0,
			4.0 / 17.0, 0,0,0, 12.0 / 17.0, 0,0,0, 2.0 / 17.0, 0,0,0, 10.0 / 17.0, 0,0,0,
			16.0 / 17.0, 0,0,0, 8.0 / 17.0, 0,0,0, 14.0 / 17.0, 0,0,0, 6.0 / 17.0, 0,0,0,
		]);
		const texture = new DataTexture( data, 4, 4, RGBAFormat, FloatType );
		texture.magFilter = NearestFilter;
		texture.minFilter = NearestFilter;

		const res = new Vector3(window.innerWidth, window.innerHeight, window.devicePixelRatio);
		color = color !== undefined ? _colors[color] : _colors['white'];
		opacity = opacity !== undefined ? opacity : 1

		this.defineProperties({
			color: { value: color, observer: 'uniformChanged'},
			opacity: { value: opacity, observer: 'uniformChanged'},
			highlight: { value: 0, observer: 'uniformChanged'},
			resolution: { value: res, observer: 'uniformChanged'},
		});

		this.uniforms = UniformsUtils.merge([this.uniforms, {
			"uColor":  {value: this.color},
			"uOpacity":  {value: this.opacity},
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

			uniform vec3 uResolution;

			void main() {
				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];

				vColor = color;
				isOutline = outline;

				vec3 nor = normalMatrix * normal;
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				float pixelRatio = uResolution.z;

				nor = (projectionMatrix * vec4(nor, 1.0)).xyz;
				nor = normalize((nor.xyz) * vec3(1., 1., 0.));

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude = outline;
					pos.z += 0.01;
				} else {
					extrude += outline;
				}

				pos.xy /= pos.w;

				float dx = nor.x * extrude * 2.2;
				float dy = nor.y * extrude * 2.2;

				pos.x += (dx) * (1.0 / uResolution.x);
				pos.y += (dy) * (1.0 / uResolution.y);

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

			void main() {

				float opacity = 1.0;
				vec3 color = vec3(1.0);
				float pixelRatio = 1.0;//uResolution.z;

				if (isOutline > 0.0) {
					color = mix(color * vec3(0.2), vec3(1.0), max(0.0, uHighlight) );
					color = mix(color, vec3(0.5), max(0.0, -uHighlight) );
				} else {
					color = uColor * vColor.rgb;
				}

				float dimming = mix(1.0, 0.2, max(0.0, -uHighlight));
				dimming = mix(dimming, dimming * 1.25, max(0.0, uHighlight));
				opacity = uOpacity * vColor.a * dimming;

				color = mix(vec3(0.5), color, dimming);

				gl_FragColor = vec4(color, 1.0);

				vec2 matCoord = ( mod(gl_FragCoord.xy / pixelRatio, 4.0) - vec2(0.5) ) / 4.0;
				vec4 ditherPattern = texture2D( tDitherMatrix, matCoord.xy );
				if (opacity < ditherPattern.r) discard;
			}
		`;
	}
	uniformChanged() {
		this.uniforms.uColor.value = this.color;
		this.uniforms.uOpacity.value = this.opacity;
		this.uniforms.uHighlight.value = this.highlight;
		this.uniforms.uResolution.value = this.resolution;
		this.uniformsNeedUpdate = true;
	}
}
