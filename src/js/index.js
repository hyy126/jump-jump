class WebVRApp {
  constructor(canvas) {
    // 初始化场景
    this.scene = new THREE.Scene();
    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.scene.add(this.camera);
    this.camera.position.z = 30;
    this.camera.position.y = 30;
    this.camera.position.x = 30;
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x519ecb);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //document.body.appendChild(this.renderer.domElement);
    var controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.clock = new THREE.Clock();
    // VR初始化
    //this._initVR();
    //this.createFont();
    // 往场景添加3d物体
    //this.start();
    this.createBufferBox();
    //this.loadVtkModel();

    //构造线
    this.scene.add(new THREE.GridHelper(100, 100));
    this.scene.add(new THREE.AxesHelper(20));
    this.creatLight();

    // 窗口大小调整监听
    window.addEventListener("resize", this._resize.bind(this), false);
    // 渲染动画
    this.renderer.animate(this.update.bind(this));
  }
  loadVtkModel() {
    const { scene } = this;
    var objLoader = new THREE.VTKLoader();
    console.log(objLoader);
    objLoader.load("../../model/bunny.vtk", function(geometry) {
      //object.rotation.x = -Math.PI * 0.5;
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
      });
      let bunny = new THREE.Mesh(geometry, material);
      bunny.position.set(0, 15, 0);
      bunny.scale.set(30, 30, 30);
      scene.add(bunny);
    });
  }
  creatLight() {
    const { scene } = this;
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.setScalar(100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  createFont() {
    const { scene } = this;
    var loader = new THREE.FontLoader();

    loader.load("three/examples/fonts/gentilis_bold.typeface", font => {
      var geometry = new THREE.TextGeometry("abcde", {
        font: font,
        size: 5,
        height: 1
      });
      geometry.center();
      const material = new THREE.MeshBasicMaterial({
        color: 0x000000
      });
      this.fontObj = new THREE.Mesh(geometry, material);
      //textObj.castShadow = true;
      scene.add(this.fontObj);
    });
  }
  // 创建3d物体
  start() {
    const { scene } = this;
    // 创建光线、地面等
    // 创建立方体
    const geometry = new THREE.CubeGeometry(3, 3, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.cube = new THREE.Mesh(geometry, material);
    scene.add(this.cube);
  }
  createBufferBox() {
    const { scene } = this;
    this.texture = new THREE.TextureLoader().load("../../img/hua1.gif");
    // var video = document.getElementById("video");
    // var texture = new THREE.VideoTexture(video);
    var geometry = new THREE.BoxBufferGeometry(5, 5, 5);
    var material = new THREE.MeshBasicMaterial({ map: this.texture });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(0, 10, 0);
    scene.add(this.cube);
  }
  // 动画更新
  update() {
    const { scene, camera, renderer, clock } = this;
    const delta = clock.getDelta() * 60;
    // 启动渲染
    this.cube.rotation.y += 0.01 * delta;
    if (this.fontObj) {
      //this.fontObj.rotation.y += 0.01 * delta;
    }
    //this.cube.rotation.x += 0.01 * delta;
    renderer.render(scene, camera);
  }
  // 窗口调整监听
  _resize() {
    const { camera, renderer } = this;
    // 窗口调整重新调整渲染器
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export default WebVRApp;
