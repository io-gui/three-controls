import {IoLiteMixin} from "../../lib/IoLiteMixin.js";
import {UniformsUtils, Color, DoubleSide, ShaderMaterial} from "../../../three.js/build/three.module.js";

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
		});

		this.defineProperties({
			color: color !== undefined ? _colors[color] : _colors['white'],
			opacity: opacity !== undefined ? opacity : 1,
			side: DoubleSide,
			transparent: true,
			highlight: 0,
			// wireframe: true
		});


		this.uniforms = UniformsUtils.merge([this.uniforms, {
			"uColor":  {value: this.color},
			"uOpacity":  {value: this.opacity},
			"uHighlight":  {value: this.highlight}
		}]);

		this.vertexShader = `
			attribute vec4 color;
			attribute float outline;
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			void main() {
				vColor = color;
				vOutline = outline;
				vNormal = normalize( normalMatrix * normal );
				vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];
				vec3 sNormal = normalize(vec3(vNormal.x, vNormal.y, 0));

				float extrude = 0.0;
				if (outline > 0.0) {
					extrude += 0.0015 * outline;
					pos.z += .1;
				} else {
					extrude += 0.001 * -outline;
				}
				pos.x += sNormal.x * extrude * (pos.w) * aspect;
				pos.y += sNormal.y * extrude * (pos.w);

				gl_Position = pos;
			}
		`;
		this.fragmentShader = `
			varying vec4 vColor;
			varying vec3 vNormal;
			varying float vOutline;
			uniform vec3 uColor;
			uniform float uOpacity;
			uniform float uHighlight;
			void main() {
				if (vOutline > 0.0) {
					vec4 c = mix(vec4( 0.0, 0.0, 0.0, 1.0 ), vec4( 1.0, 1.0, 1.0, 2.0 ), max(0.0, uHighlight) );
					c = mix(c, vec4( 0.5, 0.5, 0.5, 1.0 * 0.15 ), max(0.0, -uHighlight) );
					gl_FragColor = c;
					return;
				}
				float dimming = mix(1.0, 0.2, max(0.0, -uHighlight));
				dimming = mix(dimming, dimming * 2.0, max(0.0, uHighlight));
				gl_FragColor = vec4( uColor * vColor.rgb, uOpacity * vColor.a * dimming );
			}
		`;
	}
	colorChanged() {
		this.uniforms.uColor.value = this.color;
		this.uniformsNeedUpdate = true;
	}
	opacityChanged() {
		this.uniforms.uOpacity.value = this.opacity;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
		this.uniformsNeedUpdate = true;
	}
	highlightChanged() {
		this.uniforms.uHighlight.value = this.highlight;
		// this.transparent = this.opacity < 1 || this.highlight === -1;
		this.uniformsNeedUpdate = true;
	}
}
