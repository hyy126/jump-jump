import config from "../config/sceneConfig";

let { frustsize, frustheight } = config;
class Background {
  constructor() {}

  init() {
    const geometry = new THREE.PlaneGeometry(frustsize * 2, frustheight * 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xd7dbe6
    });
    this.instance = new THREE.Mesh(geometry, material);
  }
}

export default new Background();
