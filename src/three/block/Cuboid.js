import BaseBlock from "./base";
import utils from "../utils";
import blockConf from "../config/block-conf";

let loader = new THREE.TextureLoader();
class Cuboid extends BaseBlock {
  constructor(x, y, z, name, size, cb) {
    super("Cuboid");
    this.width = size || this.width;

    // let geometry = new THREE.BoxGeometry(this.width, this.height, this.width);
    // let material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    // this.instance = new THREE.Mesh(geometry, material);
    // option.call(this);

    if (name === "color") {
      const innerMaterial = new THREE.MeshLambertMaterial({
        color: 0xd8d0d1
      });
      const outerMaterial = new THREE.MeshLambertMaterial({
        color: this.color
      });

      const innerHeight = 3;
      const outerHeight = (blockConf.blockHeight - innerHeight) / 2;
      const outerGeometry = new THREE.BoxGeometry(
        this.width,
        outerHeight,
        this.width
      );
      const innerGeometry = new THREE.BoxGeometry(
        this.width,
        innerHeight,
        this.width
      );

      const totalMesh = new THREE.Object3D();
      const topMesh = new THREE.Mesh(outerGeometry, outerMaterial);
      topMesh.position.y = (innerHeight + outerHeight) / 2;
      topMesh.receiveShadow = true;
      topMesh.castShadow = true;
      const middleMesh = new THREE.Mesh(innerGeometry, innerMaterial);
      middleMesh.receiveShadow = true;
      middleMesh.castShadow = true;
      const bottomMesh = new THREE.Mesh(outerGeometry, outerMaterial);
      bottomMesh.position.y = -(innerHeight + outerHeight) / 2;
      bottomMesh.receiveShadow = true;
      bottomMesh.castShadow = true;
      totalMesh.add(topMesh);
      totalMesh.add(middleMesh);
      totalMesh.add(bottomMesh);
      this.instance = totalMesh;
      option.call(this);
    } else if (name === "well") {
      const geometry = new THREE.BoxGeometry(
        this.width,
        this.height,
        this.width
      );
      utils.mapUv(280, 428, geometry, 1, 0, 0, 280, 148); // front
      utils.mapUv(280, 428, geometry, 2, 0, 148, 280, 428); // top
      utils.mapUv(280, 428, geometry, 4, 0, 0, 280, 148, true); // right
      loader.load("../../../img/well.png", texture => {
        const material = new THREE.MeshLambertMaterial({
          map: texture
        });
        this.instance = new THREE.Mesh(geometry, material);
        option.call(this);
      });
    }

    function option() {
      this.instance.receiveShadow = true;
      this.instance.castShadow = true;
      this.instance.name = "block";
      this.instance.position.x = this.x = x;
      this.instance.position.y = this.y = y;
      this.instance.position.z = this.z = z;

      if (cb) {
        cb();
      }
    }
  }
}

export default Cuboid;
