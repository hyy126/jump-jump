import Camera from "./Camera";
import Cylinder from "../block/Cylinder";
import Cuboid from "../block/Cuboid";
import Light from "./Light";
import ground from "../objects/ground";
import background from "../objects/background";

import bottle from "../objects/bottle";
import blockConf from "../config/block-conf.js";
import bottleConf from "../config/bottle-conf";
import event from "../utils/event.js";
import audioManage from "../modules/audioManage";
import tailSystem from "../objects/tail";

class Scene {
  constructor(canvas) {
    this.instance = null;
    this.currentBlock = null;
    this.targetBlock = null;
    this.checkingHit = false;
    this.axis = null;
    this.combo = 0;
    this.init(canvas);
    this.now = Date.now();
    this.lastFrameTime = Date.now();
  }
  init(canvas) {
    this.instance = new THREE.Scene();
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
      preserveDrawingBuffer: true
    });
    //开启阴影
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.camera = new Camera();
    // this.axesHelper = new THREE.AxesHelper(100);
    // this.instance.add(this.axesHelper);
    this.instance.add(this.camera.instance);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    this.initLight();
    this.addGround();
    this.initBacground();
    this.initBottle();
    this.addInitBlock();
    this.tailSystem = tailSystem;
    this.tailSystem.init(this.instance, this.bottle);
    //this.addControl();
    this.render();
  }
  initBottle() {
    this.bottle = bottle;
    this.bottle.init();
    this.instance.add(this.bottle.obj);
    this.bottle.initDown();
  }
  addGround() {
    this.ground = ground;
    ground.init();
    this.instance.add(ground.instance);
  }
  //初始化背景
  initBacground() {
    this.background = background;
    background.init();
    background.instance.position.z = -84;
    this.camera.instance.add(background.instance);
  }
  //光线
  initLight() {
    this.light = new Light();
    for (let i in this.light.instances) {
      this.instance.add(this.light.instances[i]);
    }
  }
  //添加block
  addInitBlock() {
    let cuboid = new Cuboid(-15, 0, 0, "well", 16, () => {
      this.instance.add(cuboid.instance);
    });
    let cylinder = new Cylinder(23, 0, 0, "color");
    this.currentBlock = cuboid;
    this.targetBlock = cylinder;
    this.instance.add(cylinder.instance);
    this.setDirection(0);
  }
  setDirection(direction) {
    const currentPosision = {
      x: this.bottle.obj.position.x,
      z: this.bottle.obj.position.z
    };

    this.axis = new THREE.Vector3(
      this.targetBlock.x - currentPosision.x,
      0,
      this.targetBlock.z - currentPosision.z
    );
    this.axis.normalize();
    this.bottle.setDirection(direction, this.axis);
  }
  addControl() {
    new THREE.OrbitControls(this.camera.instance, this.renderer.domElement);
  }
  //
  updateNextBlock() {
    const seed = Math.round(Math.random());
    const type = seed ? "cuboid" : "cylinder";
    const direction = Math.round(Math.random()); // 0 -> x 1 -> y
    const width = Math.round(Math.random() * 12) + 8;
    const distance = Math.round(Math.random() * 20) + 20;
    this.currentBlock = this.targetBlock;
    const targetPosition = (this.targetPosition = {});
    targetPosition.y = this.targetBlock.instance.position.y;
    if (direction == 0) {
      // x
      targetPosition.x = this.currentBlock.instance.position.x + distance;
      targetPosition.z = this.currentBlock.instance.position.z;
    } else if (direction == 1) {
      // z
      targetPosition.x = this.currentBlock.instance.position.x;
      targetPosition.z = this.currentBlock.instance.position.z - distance;
    }

    if (type == "cuboid") {
      this.targetBlock = new Cuboid(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
        "color",
        width
      );
    } else {
      this.targetBlock = new Cylinder(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
        "color",
        width
      );
    }
    this.instance.add(this.targetBlock.instance);
    this.setDirection(direction);
    const cameraTargetPosition = {
      x:
        (this.currentBlock.instance.position.x +
          this.targetBlock.instance.position.x) /
        2,
      y:
        (this.currentBlock.instance.position.y +
          this.targetBlock.instance.position.y) /
        2,
      z:
        (this.currentBlock.instance.position.z +
          this.targetBlock.instance.position.z) /
        2
    };

    this.updateCameraPosition(cameraTargetPosition);
    this.ground.updatePosition(cameraTargetPosition);
  }
  updateCameraPosition(targetPosition) {
    this.camera.updatePosition(targetPosition);
    this.light.updatePosition(targetPosition);
  }
  updateScoreEvent(score) {
    event.emit("scorechange", score);
  }
  checkBottleHit() {
    let _that = this;
    if (
      this.bottle.obj.position.y <= blockConf.blockHeight / 2 &&
      this.bottle.status === "jump" &&
      this.bottle.flyingTime > 0.3
    ) {
      this.checkingHit = false;
      if (
        this.bottle.hit == bottleConf.jumpResult.HIT_NEXT_BLOCK_CENTER ||
        this.bottle.hit == bottleConf.jumpResult.HIT_NEXT_BLOCK_NORMAL ||
        this.bottle.hit == bottleConf.jumpResult.HIT_CURRENT_BLOCK
      ) {
        this.bottle.stop();
        this.bottle.obj.position.y = blockConf.blockHeight / 2;
        this.bottle.obj.position.x = this.bottle.destination[0];
        this.bottle.obj.position.z = this.bottle.destination[1];
        if (this.bottle.hit !== bottleConf.jumpResult.HIT_CURRENT_BLOCK) {
          let score = 1;
          if (this.bottle.hit === bottleConf.jumpResult.HIT_NEXT_BLOCK_CENTER) {
            this.combo++;
            score = 2 * this.combo;
            let combo = this.combo > 8 ? 8 : this.combo;
            audioManage.play("combo" + combo, "play");
          } else {
            this.combo = 0;
            audioManage.play("success", "play");
          }
          this.updateScoreEvent(score);
          this.updateNextBlock();
        }
      } else {
        this.bottle.stop();
        this.combo = 0;
        //前倾
        if (
          this.bottle.hit === bottleConf.jumpResult.GAME_OVER_NEXT_BLOCK_BACK ||
          this.bottle.hit === bottleConf.jumpResult.GAME_OVER_CURRENT_BLOCK_BACK
        ) {
          this.bottle.forerake();
          tilt();
        }
        //后倾
        else if (
          this.bottle.hit === bottleConf.jumpResult.GAME_OVER_NEXT_BLOCK_FRONT
        ) {
          this.bottle.hypsokinesis();
          tilt();
        } else {
          this.bottle.straight();
          audioManage.play("fall", "play");
          this.bottle.obj.position.y = blockConf.blockHeight / 2;
          setTimeout(() => {
            gameover();
          }, 1500);
        }

        function tilt() {
          audioManage.play("fall_from_block", "play");
          _that.bottle.obj.position.y = blockConf.blockHeight / 2;
          setTimeout(() => {
            gameover();
          }, 1500);
        }

        function gameover() {
          alert("游戏结束");
          _that.restart();
          _that.updateScoreEvent(0);
        }
      }
    }
  }
  restart() {
    this.deleteObjectsfromScene();
    this.camera.reset();
    this.light.reset();
    this.bottle.reset();
    this.ground.reset();
    //this.updateScore('0')
    this.addInitBlock();
    this.addGround();
    this.initBottle();
  }
  deleteObjectsfromScene() {
    let obj = this.instance.getObjectByName("block");
    while (obj) {
      this.instance.remove(obj);
      if (obj.geometry) {
        obj.geometry.dispose();
      }
      if (obj.material) {
        obj.material.dispose();
      }
      obj = this.instance.getObjectByName("block");
    }
    this.instance.remove(this.bottle.obj);
    this.instance.remove(this.ground.instance);
  }
  render(time) {
    this.now = Date.now();
    const tickTime = this.now - this.lastFrameTime;

    this.bottle.update();
    if (this.currentBlock) {
      this.currentBlock.update();
    }
    if (this.checkingHit) {
      this.checkBottleHit();
    }
    if (this.tailSystem) {
      this.tailSystem.update(tickTime);
    }
    this.renderer.render(this.instance, this.camera.instance);
    TWEEN.update(time);
    if (this.stats) {
      this.stats.update();
    }
    this.lastFrameTime = Date.now();
    if (this.bottle.isGatherParticle) {
      this.bottle.whitegeometry.verticesNeedUpdate = true;
      this.bottle.greengeometry.verticesNeedUpdate = true;
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

export default Scene;
