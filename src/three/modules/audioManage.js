import audioSource from "../config/audio-conf";
//是否加载音频模块   移动端卡顿
let canplay = false;
let audioManage = {};
let { audioSources } = audioSource;
if (canplay) {
  for (let i in audioSources) {
    let src = audioSources[i];
    let audio = new Audio(src);
    audioManage[i] = audio;
    if (i == "shrink") {
      audioManage["shrink"].onended = () => {
        audioManage["shrink_end"].play();
      };
    }
    if (i === "shrink_end") {
      audio.loop = true;
    }
  }
}

audioManage.play = (key, action) => {
  if (canplay) {
    audioManage[key][action]();
  }
};

export default audioManage;
