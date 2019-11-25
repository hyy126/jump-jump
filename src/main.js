import Vue from "vue";
import App from "./App.vue";

import "@/assets/style/reset.css";

import TWEEN from "@tweenjs/tween.js";

import * as Stats from "stats.js";

window.TWEEN = TWEEN;
window.Stats = Stats;
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
