import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { ElectricFan } from "./electricFan";
import { Pane } from "tweakpane";

import vert from "./shader/vertex.vert";
import frag from "./shader/fragment.frag";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const wrapper = document.querySelector<HTMLElement>("#webgl")!;
    const app = new ThreeApp(wrapper);
    app.renderStart();

    window.addEventListener("resize", () => app.resize(), false);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") app.renderStop();
      if (document.visibilityState === "visible") app.renderStart();
    });
  },
  false
);

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 200.0,
    position: new THREE.Vector3(0.0, 10.0, 20.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x000000,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  pane = new Pane();
  renderer;
  scene;
  camera;
  light;
  material;
  fan;
  renderTarget;
  composer;
  renderPass;
  shaderPass;
  raycaster;
  pointer;
  controls;
  axesHelper;

  isLoop = false;
  prevTime = Date.now();

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper
   */
  constructor(wrapper: HTMLElement) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(ThreeApp.CAMERA_PARAM.fovy, ThreeApp.CAMERA_PARAM.aspect, ThreeApp.CAMERA_PARAM.near, ThreeApp.CAMERA_PARAM.far);
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.light = new THREE.HemisphereLight(0xffffff, 0x333333, 1.0);
    this.scene.add(this.light);

    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.renderTarget.texture },
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: vert,
      fragmentShader: frag,
    });
    this.shaderPass = new ShaderPass(this.material);
    this.shaderPass.renderToScreen = true;
    this.composer.addPass(this.shaderPass);

    this.fan = new ElectricFan();
    this.scene.add(this.fan.group);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.render = this.render.bind(this);

    this.pane
      .addButton({
        title: "stop",
      })
      .on("click", () => {
        this.fan.modeChange("stop");
      });

    this.pane
      .addButton({
        title: "start",
      })
      .on("click", () => {
        this.fan.modeChange("start");
      });

    this.pane
      .addButton({
        title: "effect_1",
      })
      .on("click", () => {
        this.fan.modeChange("effect_1");
      });
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  renderStart() {
    this.isLoop = true;
    this.prevTime = Date.now();
    this.render();
  }

  renderStop() {
    this.isLoop = false;
  }

  /**
   * 描画処理
   */
  render() {
    if (!this.isLoop) return;

    const now = Date.now();
    const delta = (now - this.prevTime) / 1000;
    this.prevTime = now;

    this.fan.fanControl(delta);

    this.renderer.render(this.scene, this.camera);

    if (this.fan.getMode() === "effect_1") {
      this.renderer.setRenderTarget(this.renderTarget);
      this.material.uniforms.uTime.value += delta * 10;
      this.composer.render();
    } else {
      this.renderer.setRenderTarget(null);
    }

    this.controls.update();

    requestAnimationFrame(this.render);
  }
}
