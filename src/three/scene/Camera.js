import config from "../config/sceneConfig";
import customAnimation from "../utils/animation";
let { frustsize, frustheight } = config;

class Camera {
  constructor() {
    this.instance = null;
    this.init();
  }
  init() {
    let aspect = window.innerHeight / window.innerWidth;
    this.instance = new THREE.OrthographicCamera(
      -frustsize,
      frustsize,
      frustheight,
      -frustheight,
      -100,
      85
    );
    this.instance.position.set(-10, 10, 10);
    this.target = new THREE.Vector3(0, 0, 0);
    this.instance.lookAt(this.target);
  }
  updatePosition(newTargetPosition) {
    customAnimation.to(0.5, this.instance.position, {
      x: newTargetPosition.x - 10,
      y: newTargetPosition.y + 10,
      z: newTargetPosition.z + 10
    });
    customAnimation.to(0.5, this.target, {
      x: newTargetPosition.x,
      y: newTargetPosition.y,
      z: newTargetPosition.z
    });
  }
  reset() {
    this.instance.position.set(-10, 10, 10);
    this.target = new THREE.Vector3(0, 0, 0);
  }
}

export default Camera;
