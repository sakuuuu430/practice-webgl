import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

window.addEventListener(
  "DOMContentLoaded",
  () => {
    const wrapper = document.querySelector<HTMLElement>("#webgl")!;
    const app = new ThreeApp(wrapper);
    app.renderStart();

    window.addEventListener("resize", () => app.resize(), false);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        app.renderStop();
      }
      if (document.visibilityState === "visible") {
        app.renderStart();
      }
    });
  },
  false
);

class BoxObject {
  box: THREE.Mesh;
  directionMovement: THREE.Vector3;
  rotationalVolume: THREE.Vector3;

  constructor(geometry: THREE.BoxGeometry) {
    const material = new THREE.MeshLambertMaterial({
      color: Math.floor(0xffffff * Math.random()),
    });
    this.box = new THREE.Mesh(geometry, material);
    this.directionMovement = new THREE.Vector3(
      this.setRandomDirection(),
      this.setRandomDirection(),
      this.setRandomDirection()
    );
    this.rotationalVolume = new THREE.Vector3(
      this.setRandomRotation(),
      this.setRandomRotation(),
      this.setRandomRotation()
    );
  }

  getMovement() {
    return this.directionMovement;
  }

  setRandomDirection() {
    const d = Math.random() > 0.5 ? 1 : -1;
    return 5 * Math.random() * d + 5 * d;
  }

  setRandomRotation() {
    const d = Math.random() > 0.5 ? 1 : -1;
    return Math.random() * d;
  }
}

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 200.0,
    position: new THREE.Vector3(40.0, 40.0, 40.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  static RENDERER_PARAM = {
    clearColor: 0x666666,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(40.0, 40.0, 40.0),
  };
  static MOVE_LIMIT_RANGE = {
    X: 20,
    Y: 20,
    Z: 20,
  };

  renderer;
  scene;
  camera;
  light;
  geometry;
  rangeBox;
  boxes;
  controls;

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
    this.renderer.setSize(
      ThreeApp.RENDERER_PARAM.width,
      ThreeApp.RENDERER_PARAM.height
    );
    wrapper.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.light = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.light.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position);
    this.scene.add(this.light);

    this.rangeBox = (() => {
      const geometry = new THREE.BoxGeometry(
        ThreeApp.MOVE_LIMIT_RANGE.X * 2,
        ThreeApp.MOVE_LIMIT_RANGE.Y * 2,
        ThreeApp.MOVE_LIMIT_RANGE.Z * 2
      );
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.1,
        depthTest: true,
        depthWrite: true,
        color: 0x2a9e00,
      });
      return new THREE.Mesh(geometry, material);
    })();
    this.scene.add(this.rangeBox);

    this.geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    this.boxes = [...Array(300)].map(() => {
      const obj = new BoxObject(this.geometry);
      const x =
        ThreeApp.MOVE_LIMIT_RANGE.X *
        Math.random() *
        this.randomPositiveAndNegative();
      const y =
        ThreeApp.MOVE_LIMIT_RANGE.Y *
        Math.random() *
        this.randomPositiveAndNegative();
      const z =
        ThreeApp.MOVE_LIMIT_RANGE.Z *
        Math.random() *
        this.randomPositiveAndNegative();
      obj.box.position.set(x, y, z);
      return obj;
    });
    this.scene.add(...this.boxes.map((v) => v.box));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.render = this.render.bind(this);
  }

  randomPositiveAndNegative() {
    return Math.random() > 0.5 ? 1 : -1;
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

    this.boxes.forEach((v) => {
      v.box.position.x += v.directionMovement.x * delta;
      v.box.position.y += v.directionMovement.y * delta;
      v.box.position.z += v.directionMovement.z * delta;

      v.box.rotation.x += v.rotationalVolume.x * delta;
      v.box.rotation.y += v.rotationalVolume.y * delta;
      v.box.rotation.z += v.rotationalVolume.z * delta;

      const range = ThreeApp.MOVE_LIMIT_RANGE;
      if (v.box.position.x + 0.5 > range.X) {
        v.box.position.x = range.X - 0.5;
        v.directionMovement.x *= -1;
      } else if (v.box.position.x - 0.5 < -range.X) {
        v.box.position.x = -range.X + 0.5;
        v.directionMovement.x *= -1;
      }

      if (v.box.position.y + 0.5 > range.Y) {
        v.box.position.y = range.Y - 0.5;
        v.directionMovement.y *= -1;
      } else if (v.box.position.y - 0.5 < -range.Y) {
        v.box.position.y = -range.Y + 0.5;
        v.directionMovement.y *= -1;
      }

      if (v.box.position.z + 0.5 > range.Z) {
        v.box.position.z = range.Z - 0.5;
        v.directionMovement.z *= -1;
      } else if (v.box.position.z - 0.5 < -range.Z) {
        v.box.position.z = -range.Z + 0.5;
        v.directionMovement.z *= -1;
      }
    });

    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    requestAnimationFrame(this.render);
  }
}
