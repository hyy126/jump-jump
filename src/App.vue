<template>
  <section class="jump-wrapper">
    <section class="score-wrapper">{{score}}</section>
    <canvas
      id="app"
      ref="canvas"
    ></canvas>
    <!-- <audio src="../audios/combo1.mp3" autoplay controls></audio> -->
  </section>
</template>

<script>
import utils from "./three/utils";
import bottleConf from "./three/config/bottle-conf";
import blockConf from "./three/config/block-conf";
import Scene from "./three/scene/Scene";
import event from "./three/utils/event";
import audioManage from "./three/modules/audioManage";

let canvas,
  scene,
  stats = null;
export default {
  data() {
    return {
      score: 0,
      keyTouch: 32,
      isKeyDown: false
    };
  },
  methods: {
    init() {},
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
      stats.update();
    },
    initstats() {
      stats = new Stats();
      // 将stats的界面对应左上角
      stats.domElement.style.position = "absolute";
      stats.domElement.style.left = "0px";
      stats.domElement.style.top = "0px";
      document.body.appendChild(stats.domElement);
      scene.stats = stats;
    },
    bindTouchEvent() {
      let _that = this;
      canvas.addEventListener("touchstart", this.touchstart);
      canvas.addEventListener("touchend", this.touchend);
      document.onkeydown = e => {
        if (e.keyCode === _that.keyTouch && !_that.isKeyDown) {
          _that.isKeyDown = true;
          _that.touchstart();
        }
      };
      document.onkeyup = e => {
        if (e.keyCode === _that.keyTouch) {
          _that.isKeyDown = false;
          _that.touchend();
        }
      };
    },
    checkRight() {
      let status = scene.bottle.status;
      if (status === "jump") {
        return true;
      }
    },
    touchstart() {
      if (this.checkRight()) {
        return;
      }
      audioManage.play("success", "load");
      audioManage.play("shrink", "play");
      this.touchStartTime = Date.now();
      scene.bottle.shrink();
      scene.currentBlock.shrink();
    },
    touchend() {
      if (this.checkRight()) {
        return;
      }
      audioManage.play("shrink", "load");
      audioManage.play("shrink_end", "load");
      this.touchEndTime = Date.now();
      const duration = this.touchEndTime - this.touchStartTime;
      let bottle = scene.bottle;
      bottle.velocity.vx = Math.min(duration / 6, 400);
      bottle.velocity.vx = +bottle.velocity.vx.toFixed(2);
      bottle.velocity.vy = Math.min(150 + duration / 20, 400);
      bottle.velocity.vy = +bottle.velocity.vy.toFixed(2);
      bottle.stop();
      const initY =
        (1 - scene.currentBlock.instance.scale.y) * blockConf.blockHeight;
      scene.bottle.hit = this.getHitStatus(
        bottle,
        scene.currentBlock,
        scene.targetBlock,
        initY
      );
      scene.checkingHit = true;
      scene.currentBlock.rebound();
      bottle.rotate();
      bottle.jump();
    },
    //碰撞检测
    getHitStatus(bottle, currentBlock, nextBlock, initY) {
      let flyingTime =
        (parseFloat(bottle.velocity.vy) / parseFloat(blockConf.gravity)) * 2.0;
      initY = initY || bottle.obj.position.y.toFixed(2);
      var time = +(
        (bottle.velocity.vy -
          Math.sqrt(
            Math.pow(bottle.velocity.vy, 2) - 2 * initY * blockConf.gravity
          )) /
        blockConf.gravity
      ).toFixed(2);
      flyingTime -= time;
      flyingTime = +flyingTime.toFixed(2);
      const destination = [];
      const bottlePosition = new THREE.Vector2(
        bottle.obj.position.x,
        bottle.obj.position.z
      );
      const translate = new THREE.Vector2(
        scene.axis.x,
        scene.axis.z
      ).setLength(bottle.velocity.vx * flyingTime);
      bottlePosition.add(translate);
      bottle.destination = [
        +bottlePosition.x.toFixed(2),
        +bottlePosition.y.toFixed(2)
      ];
      destination.push(
        +bottlePosition.x.toFixed(2),
        +bottlePosition.y.toFixed(2)
      );

      let result1, result2;
      //下一个block上触发
      if (nextBlock) {
        const nextDiff =
          Math.pow(destination[0] - nextBlock.instance.position.x, 2) +
          Math.pow(destination[1] - nextBlock.instance.position.z, 2);
        const nextPolygon = nextBlock.getVertices();
        if (utils.pointInPolygon(destination, nextPolygon)) {
          if (Math.abs(nextDiff) < 5) {
            result1 = bottleConf.jumpResult.HIT_NEXT_BLOCK_CENTER;
          } else {
            result1 = bottleConf.jumpResult.HIT_NEXT_BLOCK_NORMAL;
          }
        } else if (
          utils.pointInPolygon(
            [destination[0] - bottleConf.bodyWidth / 2, destination[1]],
            nextPolygon
          ) ||
          utils.pointInPolygon(
            [destination[0], destination[1] + bottleConf.bodyWidth / 2],
            nextPolygon
          )
        ) {
          result1 = bottleConf.jumpResult.GAME_OVER_NEXT_BLOCK_BACK;
        } else if (
          utils.pointInPolygon(
            [destination[0] + bottleConf.bodyWidth / 2, destination[1]],
            nextPolygon
          ) ||
          utils.pointInPolygon(
            [destination[0], destination[1] - bottleConf.bodyWidth / 2],
            nextPolygon
          )
        ) {
          result1 = bottleConf.jumpResult.GAME_OVER_NEXT_BLOCK_FRONT;
        }
      }
      //未跳出当前block
      if (currentBlock) {
        const currentPolygon = currentBlock.getVertices();
        if (utils.pointInPolygon(destination, currentPolygon)) {
          result2 = bottleConf.jumpResult.HIT_CURRENT_BLOCK;
        } else if (
          utils.pointInPolygon(
            [destination[0] - bottleConf.bodyWidth / 2, destination[1]],
            currentPolygon
          ) ||
          utils.pointInPolygon(
            [destination[0], destination[1] + bottleConf.bodyWidth / 2],
            currentPolygon
          )
        ) {
          if (result1) {
            result2 = bottleConf.jumpResult.GAME_OVER_BOTH;
          }
          result2 = bottleConf.jumpResult.GAME_OVER_CURRENT_BLOCK_BACK;
        }
      }
      return result1 || result2 || 0;
    },

    removeTouchEvent() {
      canvas.removeEventListener("touchstart", this.touchstart);
      canvas.removeEventListener("touchend", this.touchend);
    },
    initScoreEvent() {
      event.on("scorechange", score => {
        this.score = score === 0 ? 0 : this.score + score;
      });
    }
  },
  mounted() {
    canvas = this.$refs["canvas"];
    scene = new Scene(canvas);
    this.bindTouchEvent();
    this.initstats();
    this.initScoreEvent();
  },
  destroyed() {
    this.removeTouchEvent();
  }
};
</script>

<style >
@font-face {
  font-family: myFirstFont;
  src: url("./assets/font/Sacramento-Regular.ttf");
}
.jump-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
#app {
  height: 100%;
  width: 100%;
}
.score-wrapper {
  position: absolute;
  top: 15px;
  right: 25px;
  font-size: 30px;
  font-family: myFirstFont;
}
</style>
