import { Color, UniformsUtils, ShaderMaterial, DataTexture, RGBAFormat, FloatType, NearestFilter, DoubleSide } from 'three';

export const colors = {
	'white': [ 1, 1, 1 ],
	'whiteTransparent': [ 1, 1, 1, 0.25 ],
	'lightGray': [ 0.75, 0.75, 0.75 ],
	'gray': [ 0.5, 0.5, 0.5 ],
	'darkGray': [ 0.25, 0.25, 0.25 ],
	'red': [ 1, 0.4, 0.1 ],
	'green': [ 0.3, 0.9, 0.2 ],
	'blue': [ 0.2, 0.6, 1 ],
	'cyan': [ 0.2, 1, 1 ],
	'magenta': [ 1, 0.3, 1 ],
	'yellow': [ 1, 1, 0.2 ],
};

export class HelperMaterial extends ShaderMaterial {

	depthTest = false;
	depthWrite = false;
	transparent = true;
	side = DoubleSide;
	fog = false;
	toneMapped = false;
	linewidth = 1;
	color = new Color();
	opacity = 1;
	highlight = 1;
	dithering = false;
	constructor( props = { color: new Color( 0xffffff ), opacity: 1, depthBias: 0, highlight: 0 } ) {

		super();

		const data = new Float32Array( [
			1.0 / 17.0, 0, 0, 0, 9.0 / 17.0, 0, 0, 0, 3.0 / 17.0, 0, 0, 0, 11.0 / 17.0, 0, 0, 0,
			13.0 / 17.0, 0, 0, 0, 5.0 / 17.0, 0, 0, 0, 15.0 / 17.0, 0, 0, 0, 7.0 / 17.0, 0, 0, 0,
			4.0 / 17.0, 0, 0, 0, 12.0 / 17.0, 0, 0, 0, 2.0 / 17.0, 0, 0, 0, 10.0 / 17.0, 0, 0, 0,
			16.0 / 17.0, 0, 0, 0, 8.0 / 17.0, 0, 0, 0, 14.0 / 17.0, 0, 0, 0, 6.0 / 17.0, 0, 0, 0,
		] );

		const ditherPatternTex = new DataTexture( data, 4, 4, RGBAFormat, FloatType );
		ditherPatternTex.magFilter = NearestFilter;
		ditherPatternTex.minFilter = NearestFilter;
		const color = props.color || new Color( 0xffffff );
		const opacity = props.opacity !== undefined ? props.opacity : 1;
		this.color.copy( color );
		this.opacity = opacity;
		this.highlight = props.highlight || 1;

		this.uniforms = UniformsUtils.merge( [ this.uniforms, {
			"uColor": { value: this.color },
			"uOpacity": { value: this.opacity },
			"uHighlight": { value: this.highlight },
			"uDithering": { value: this.dithering ? 1 : 0 },
			"tDitherMatrix": { value: ditherPatternTex },
		} ] );

		this.uniforms.tDitherMatrix.value = ditherPatternTex;
		ditherPatternTex.needsUpdate = true;

		this.vertexShader = /* glsl */ `
      attribute vec4 color;
      varying vec4 vColor;
      void main() {
        float aspect = projectionMatrix[0][0] / projectionMatrix[1][1];
        vColor = color;
        vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vec3 nor = normalize(vec3(1., 1., 0.) * (normalMatrix * normal));
        gl_Position = pos;
      }
    `;

		this.fragmentShader = /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform float uDithering;
      uniform sampler2D tDitherMatrix;
      varying vec4 vColor;
      void main() {
        vec3 color = vColor.rgb * uColor;
        float opacity = vColor.a * uOpacity;

        float dimming = max(0.0, min(1.0, uHighlight));
        float highlight = max(0.0, min(1.0, uHighlight - 1.0));

        color = mix(vec3(0.5), color, dimming);
        color = mix(color, vec3(1.0), highlight * 0.25);
        opacity = min(dimming, opacity);
        opacity = min(1.0, opacity + highlight);

        vec2 matCoord = (mod(gl_FragCoord.xy, 4.0) - vec2(0.5)) / 4.0;
        vec4 ditherPattern = texture2D(tDitherMatrix, matCoord.xy);

        gl_FragColor = vec4(color, max(opacity, uDithering));

        if (max(opacity, 1.0 - uDithering) < ditherPattern.r) discard;
      }
    `;

	}
	changed() {

		this.uniforms.uColor.value = this.color;
		this.uniforms.uOpacity.value = this.opacity;
		this.uniforms.uHighlight.value = this.highlight;
		this.uniforms.uDithering.value = this.dithering ? 1 : 0;
		this.uniformsNeedUpdate = true;

	}

}

//# sourceMappingURL=HelperMaterial.js.map
