import customAnimation from "../utils/animation";

class Light {
  constructor() {
    this.instances = {};
    this.init();
  }
  init() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // soft white light
    let shadowLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.shadowLight = shadowLight;
    shadowLight.position.set(10, 30, 20);
    let basicMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
    this.shadowTarget = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.1),
      basicMaterial
    );
    this.shadowTarget.visible = false;
    this.shadowTarget.name = "shadowTarget";
    shadowLight.target = this.shadowTarget;

    shadowLight.castShadow = true;
    shadowLight.shadow.camera.near = 0.5;
    shadowLight.shadow.camera.far = 500;
    shadowLight.shadow.camera.left = -100;
    shadowLight.shadow.camera.right = 100;
    shadowLight.shadow.camera.bottom = -100;
    shadowLight.shadow.camera.top = 100;
    shadowLight.shadow.mapSize.width = 1024;
    shadowLight.shadow.mapSize.height = 1024;

    this.instances.ambientLight = ambientLight;
    this.instances.shadowLight = shadowLight;
    this.instances.shadowTarget = this.shadowTarget;
  }
  updatePosition(targetPosition) {
    customAnimation.to(0.5, this.shadowTarget.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z
    });
    customAnimation.to(0.5, this.shadowLight.position, {
      x: 10 + targetPosition.x,
      y: 30 + targetPosition.y,
      z: 20 + targetPosition.z
    });
  }
  reset() {
    this.shadowLight.position.set(10, 30, 20);
    this.shadowTarget.position.set(0, 0, 0);
  }
}

export default Light;
