import blockConf from "../config/block-conf";
import customAnimation from "../utils/animation";

let { blockHeight, colors } = blockConf;
let blockWidth = 16;

class BaseBlock {
  constructor(type) {
    this.type = type || "default";
    this.height = blockHeight;
    this.width = blockWidth;
    this.status = "stop";
    this.scale = 1;
    const seed = Math.floor(Math.random() * 6);
    this.color = colors[seed];
  }
  update() {
    if (this.status == "shrink") {
      this._shrink();
    }
  }

  shrink() {
    this.status = "shrink";
  }

  _shrink() {
    const DELTA_SCALE = 0.005;
    const MIN_SCALE = 0.55;
    this.scale -= DELTA_SCALE;
    this.scale = Math.max(MIN_SCALE, this.scale);
    if (this.scale <= MIN_SCALE) {
      return;
    }
    this.instance.scale.y = this.scale;
    const deltaY = (this.height * DELTA_SCALE) / 2;
    this.instance.position.y -= deltaY;
  }

  rebound() {
    this.status = "stop";
    this.scale = 1;
    customAnimation.to(
      0.5,
      this.instance.scale,
      { y: 1 },
      TWEEN.Easing.Elastic.Out
    );
    customAnimation.to(
      0.5,
      this.instance.position,
      { y: 0 },
      TWEEN.Easing.Elastic.Out
    );
  }
  //以矩形来获取四个顶点坐标
  getVertices() {
    const vertices = [];
    const centerPosition = {
      x: this.instance.position.x,
      z: this.instance.position.z
    };
    vertices.push([
      centerPosition.x + this.width / 2,
      centerPosition.z + this.width / 2
    ]);
    vertices.push([
      centerPosition.x + this.width / 2,
      centerPosition.z - this.width / 2
    ]);
    vertices.push([
      centerPosition.x - this.width / 2,
      centerPosition.z - this.width / 2
    ]);
    vertices.push([
      centerPosition.x - this.width / 2,
      centerPosition.z + this.width / 2
    ]);
    return vertices;
  }
}

export default BaseBlock;
