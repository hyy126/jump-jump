import BaseBlock from "./base";
import blockConf from "../config/block-conf";
import utils from "../utils";

class Cylinder extends BaseBlock {
  constructor(x, y, z, name, size, cb) {
    super("Cylinder");
    this.width = size || this.width;
    // let geometry = new THREE.CylinderGeometry(
    //   this.width / 2,
    //   this.width / 2,
    //   this.height,
    //   120
    // );
    // let material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    // this.instance = new THREE.Mesh(geometry, material);
    if (name === "color") {
      //let randomColor = utils.getRandomHslColor();
      const innerMaterial = new THREE.MeshLambertMaterial({
        color: 0xd8d0d1
      });
      const outerMaterial = new THREE.MeshLambertMaterial({
        color: this.color
      });

      const innerHeight = 3;
      const outerHeight = (blockConf.blockHeight - innerHeight) / 2;
      const outerGeometry = new THREE.CylinderGeometry(
        this.width / 2,
        this.width / 2,
        outerHeight,
        120
      );
      const innerGeometry = new THREE.CylinderGeometry(
        this.width / 2,
        this.width / 2,
        innerHeight,
        120
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

export default Cylinder;
