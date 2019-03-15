/**
 * @author arodic / https://github.com/arodic
 */

import {IoCoreMixin} from "../../../io/build/io-core.js";
import {Sprite, Vector3, Texture, Color, SpriteMaterial} from "../../../three.js/src/Three.js";

export class TextHelper extends IoCoreMixin(Sprite) {
	static get properties() {
		return {
			text: '',
			color: 'black',
			size: 0.6,
		};
	}
	constructor(props = {}) {
		super(new SpriteMaterial());
		this.connect(window); // TODO: GC warning!;

		this.scaleTarget = new Vector3(1, 1, 1);
		this.color = props.color;

		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.texture = new Texture(this.canvas);

		this.material.map = this.texture;

		this.canvas.width = 256;
		this.canvas.height = 64;

		this.scale.set(1, 0.25, 1);
		this.scale.multiplyScalar(this.size);

		this.position.set(props.pos[0], props.pos[1], props.pos[2]);
	}
	textChanged() {
		const ctx = this.ctx;
		const canvas = this.canvas;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.font = 'bold ' + canvas.height * 0.9 + 'px monospace';

		ctx.fillStyle = this.color;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.strokeStyle = 'black';
		ctx.lineWidth = canvas.height / 8;

		ctx.strokeText(this.text, canvas.width / 2, canvas.height / 2);
		ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);

		ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

		ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);

		this.texture.needsUpdate = true;
	}
}

TextHelper.Register = IoCoreMixin.Register;
