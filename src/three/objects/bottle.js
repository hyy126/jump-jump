import bottleConf from "../config/bottle-conf";
import blockConf from "../config/block-conf";
import customAnimation from "../utils/animation";
import audioManage from "../modules/audioManage";
let { blockHeight } = blockConf;
let { initPosition, headRadius } = bottleConf;

//let basicMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

class Bottle {
  constructor() {
    //跳跃轴
    this.axis = null;
    //跳跃结果
    this.hit = null;
    this.status = "stop";
    this.scaleY = 1;
    //跳跃方向
    this.direction = 0;
    //每次的飞行时间
    this.flyingTime = 0;
    //跳跃两个方向的速度
    this.velocity = {
      vx: 0,
      vy: 0
    };
    this.isGatherParticle = false;
  }

  init() {
    this.obj = new THREE.Object3D();
    this.obj.position.set(initPosition.x, initPosition.y + 30, initPosition.z);
    this.obj.name = "bottle";

    this.bottle = new THREE.Object3D();
    this.human = new THREE.Object3D();
    this.body = new THREE.Object3D();
    //加载纹理
    this.loadTexture();
    this.initHead();
    this.initBottom();
    this.initMiddle();
    this.initBodyHeader();
    this.human.add(this.head);
    this.human.add(this.body);
    this.bottle.add(this.human);
    //调整 bottle中心位置
    this.bottle.position.y = 2;
    this.obj.add(this.bottle);

    this.initParticle();
  }

  resetParticle() {
    this.cachePoint.forEach(point => {
      let randomPoint = this.initRandomPoint();
      point.x = randomPoint.x;
      point.y = randomPoint.y;
      point.z = randomPoint.z;
    });
  }

  gatherParticle() {
    let i = -1;
    let that = this;
    let timer = setInterval(() => {
      if (this.isGatherParticle === false) {
        clearInterval(timer);
        timer = null;
      }
      if (i === 14) {
        that.resetParticle();
        i = -1;
      }
      i++;
      that.cachePoint[i].x = that.cachePoint[i].cache.x;
      that.cachePoint[i].y = that.cachePoint[i].cache.y;
      that.cachePoint[i].z = that.cachePoint[i].cache.z;
      //console.log(that.cachePoint[i], that.destination);
      customAnimation.to(Math.random() / 4 + 0.3, that.cachePoint[i], {
        x: 0,
        y: 0,
        z: 0
      });
    }, 100);
  }

  initRandomPoint() {
    const minDistance = 10;
    const maxDistance = 15;
    let point = new THREE.Vector3();
    const x =
      (minDistance + Math.random() * (maxDistance - minDistance)) *
      (1 - 2 * Math.random());
    const z =
      (minDistance + Math.random() * (maxDistance - minDistance)) *
      (1 - 2 * Math.random());
    const y = 2;
    point.x = 0;
    point.y = 0;
    point.z = 0;
    point.cache = {
      x,
      y,
      z
    };
    return point;
  }

  //init particle around bottle
  initParticle() {
    this.whitegeometry = new THREE.Geometry();
    this.greengeometry = new THREE.Geometry();

    this.cachePoint = [];
    for (let i = 0; i < 15; i++) {
      let point = this.initRandomPoint();
      this.cachePoint.push(point);
      if (i % 2 === 0) {
        this.greengeometry.vertices.push(point);
      } else {
        this.whitegeometry.vertices.push(point);
      }
    }
    let material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 5
    });
    let greenmaterial = new THREE.PointsMaterial({
      color: 0x9aff9a,
      size: 5
    });
    this.whitegeometrypoints = new THREE.Points(this.whitegeometry, material);
    this.greengeometrypoints = new THREE.Points(
      this.greengeometry,
      greenmaterial
    );
    this.whitegeometrypoints.visible = false;
    this.whitegeometrypoints.visible = false;
    this.obj.add(this.whitegeometrypoints);
    this.obj.add(this.greengeometrypoints);
  }

  setDirection(direction, axis) {
    this.direction = direction;
    this.axis = axis;
  }

  initHead() {
    this.head = new THREE.Mesh(
      new THREE.OctahedronGeometry(headRadius),
      this.material.bottomMaterial
    );
    this.head.position.y = 8.8;
  }

  initBottom() {
    const bottom = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.62857 * headRadius,
        0.907143 * headRadius,
        1.91423 * headRadius,
        20
      ),
      this.material.bottomMaterial
    );
    bottom.castShadow = true;
    this.body.add(bottom);
  }
  initMiddle() {
    const middle = new THREE.Mesh(
      new THREE.CylinderGeometry(
        headRadius / 1.4,
        (headRadius / 1.44) * 0.88,
        headRadius * 1.2,
        20
      ),
      this.material.middleMaterial
    );
    middle.castShadow = true;
    middle.position.y = 3;
    this.body.add(middle);
  }
  initBodyHeader() {
    const topGeometry = new THREE.SphereGeometry(headRadius / 1.4, 20, 20);
    topGeometry.scale(1, 0.54, 1);
    const top = new THREE.Mesh(topGeometry, this.material.specularMaterial);
    top.castShadow = true;
    top.position.y = 2.1 * headRadius;
    this.body.add(top);
  }
  loadTexture() {
    const loader = new THREE.TextureLoader();
    const specularTexture = loader.load("/img/head.png");
    const specularMaterial = new THREE.MeshBasicMaterial({
      map: specularTexture
    });

    const bottomTexture = loader.load("/img/bottom.png");
    const bottomMaterial = new THREE.MeshBasicMaterial({
      map: bottomTexture
    });

    const middleTexture = loader.load("/img/middle.png");
    const middleMaterial = new THREE.MeshBasicMaterial({
      map: middleTexture
    });

    this.material = { specularMaterial, bottomMaterial, middleMaterial };
  }
  shrink() {
    this.whitegeometrypoints.visible = true;
    this.whitegeometrypoints.visible = true;
    this.status = "shrink";
    this.gatherParticle();
    this.isGatherParticle = true;
  }
  jump() {
    this.whitegeometrypoints.visible = false;
    this.whitegeometrypoints.visible = false;
    this.isGatherParticle = false;
    this.resetParticle();
    this.status = "jump";
    this.translateH = 0;
    this.translateY = 0;
  }
  stop() {
    this.status = "stop";
    this.flyingTime = 0;
    this.scaleY = 1;
  }
  //按压变化
  _shrink() {
    const MIN_SCALE = 0.55;
    const HORIZON_DELTA_SCALE = 0.007;
    const DELTA_SCALE = 0.005;
    const HEAD_DELTA = 0.03;

    this.scaleY -= DELTA_SCALE;
    this.scaleY = Math.max(MIN_SCALE, this.scaleY);
    if (this.scaleY <= MIN_SCALE) {
      return;
    }
    //y轴高度    x,与z轴扩张
    this.body.scale.y = this.scaleY;
    this.body.scale.x += HORIZON_DELTA_SCALE;
    this.body.scale.z += HORIZON_DELTA_SCALE;
    //头部重心下偏
    this.head.position.y -= HEAD_DELTA;

    const bottleDeltaY = HEAD_DELTA / 2;
    const deltaY = blockConf.blockHeight * DELTA_SCALE;
    this.obj.position.y -= bottleDeltaY + deltaY;
  }

  _jump(tickTime) {
    const t = tickTime / 1000;
    //计算每个时间间隔内位移的距离
    const translateH = this.velocity.vx * t;
    const translateY =
      this.velocity.vy * t -
      0.5 * blockConf.gravity * t * t -
      blockConf.gravity * this.flyingTime * t;
    this.translateH += translateH;
    this.translateY += translateY;
    this.obj.translateY(translateY);
    this.obj.translateOnAxis(this.axis, translateH);
    this.flyingTime += t;
  }

  update() {
    if (this.status === "shrink") {
      this._shrink();
    } else if (this.status === "jump") {
      const tickTime = Date.now() - this.lastFrameTime;
      this._jump(tickTime);
    }
    this.head.rotation.y += 0.03;
    this.lastFrameTime = Date.now();
  }

  straight() {
    this.status = "straight";
    setTimeout(() => {
      customAnimation.to(0.4, this.obj.position, {
        y: -blockConf.blockHeight / 2 + 0.5
      });
    });
  }

  hypsokinesis() {
    this.status = "hypsokinesis";
    setTimeout(() => {
      if (this.direction == 0) {
        customAnimation.to(0.8, this.obj.rotation, {
          z: Math.PI / 2
        });
      } else {
        customAnimation.to(0.8, this.obj.rotation, {
          x: Math.PI / 2
        });
      }
      setTimeout(() => {
        customAnimation.to(0.4, this.obj.position, {
          y: -blockConf.blockHeight / 2 + 1.2
        });
        customAnimation.to(0.2, this.head.position, {
          x: 1.125
        });
        customAnimation.to(
          0.2,
          this.head.position,
          {
            x: 0
          },
          null,
          0.2
        );
      }, 350);
    }, 200);
  }

  forerake() {
    this.status = "forerake";
    setTimeout(() => {
      if (this.direction == 0) {
        // x
        customAnimation.to(1, this.obj.rotation, {
          z: -Math.PI / 2
        });
      } else {
        customAnimation.to(1, this.obj.rotation, {
          x: -Math.PI / 2
        });
      }
      setTimeout(() => {
        customAnimation.to(0.4, this.obj.position, {
          y: -blockConf.blockHeight / 2 + 0.5
        });
      }, 350);
    }, 200);
  }
  reset() {
    this.stop();
    this.obj.rotation.x = 0;
    this.obj.rotation.z = 0;
    this.obj.position.set(initPosition.x, initPosition.y + 30, initPosition.z);
  }
  //初始化降落弹性动画
  initDown() {
    let count = 0;
    const tween = new TWEEN.Tween(this.obj.position)
      .to(
        {
          x: initPosition.x,
          y: initPosition.y + blockHeight / 2,
          z: initPosition.z
        },
        1000
      )
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(obj => {
        this.obj.position.set(obj.x, obj.y, obj.z);
      })
      .start();
    audioManage.play("init", "play");
  }
  //跳跃旋转
  rotate() {
    const scale = 1.4;
    this.human.rotation.x = this.human.rotation.z = 0;
    if (this.direction == 0) {
      customAnimation.to(0.14, this.human.rotation, {
        z: this.human.rotation.z - Math.PI
      });
      customAnimation.to(
        0.18,
        this.human.rotation,
        { z: this.human.rotation.z - 2 * Math.PI },
        undefined,
        0.14
      );
      customAnimation.to(0.1, this.head.position, {
        y: this.head.position.y + 0.9 * scale,
        x: this.head.position.x + 0.45 * scale
      });
      customAnimation.to(
        0.1,
        this.head.position,
        {
          y: this.head.position.y - 0.9 * scale,
          x: this.head.position.x - 0.45 * scale
        },
        undefined,
        0.1
      );
      customAnimation.to(
        0.15,
        this.head.position,
        { y: 8.8, x: 0 },
        undefined,
        0.25
      );
      customAnimation.to(0.1, this.body.scale, {
        y: Math.max(scale, 1),
        x: Math.max(Math.min(1 / scale, 1), 0.7),
        z: Math.max(Math.min(1 / scale, 1), 0.7)
      });
      customAnimation.to(
        0.1,
        this.body.scale,
        {
          y: Math.min(0.9 / scale, 0.7),
          x: Math.max(scale, 1.2),
          z: Math.max(scale, 1.2)
        },
        undefined,
        0.1
      );
      customAnimation.to(
        0.3,
        this.body.scale,
        { y: 1, x: 1, z: 1 },
        undefined,
        0.2
      );
    } else if (this.direction == 1) {
      // y
      customAnimation.to(0.14, this.human.rotation, {
        x: this.human.rotation.x - Math.PI
      });
      customAnimation.to(
        0.18,
        this.human.rotation,
        { x: this.human.rotation.x - 2 * Math.PI },
        undefined,
        0.14
      );
      customAnimation.to(0.1, this.head.position, {
        y: this.head.position.y + 0.9 * scale,
        z: this.head.position.z - 0.45 * scale
      });
      customAnimation.to(
        0.1,
        this.head.position,
        {
          z: this.head.position.z + 0.45 * scale,
          y: this.head.position.y - 0.9 * scale
        },
        undefined,
        0.1
      );
      customAnimation.to(
        0.15,
        this.head.position,
        { y: 8.8, z: 0 },
        undefined,
        0.25
      );
      customAnimation.to(0.05, this.body.scale, {
        y: Math.max(scale, 1),
        x: Math.max(Math.min(1 / scale, 1), 0.7),
        z: Math.max(Math.min(1 / scale, 1), 0.7)
      });
      customAnimation.to(
        0.05,
        this.body.scale,
        {
          y: Math.min(0.9 / scale, 0.7),
          x: Math.max(scale, 1.2),
          z: Math.max(scale, 1.2)
        },
        undefined,
        0.1
      );
      customAnimation.to(
        0.2,
        this.body.scale,
        { y: 1, x: 1, z: 1 },
        undefined,
        0.2
      );
    }
  }
}

export default new Bottle();
