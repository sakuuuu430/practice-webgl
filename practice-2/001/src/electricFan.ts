import * as THREE from "three";

export class ElectricFan {
  group = new THREE.Group();
  fanGroup = new THREE.Group();
  headGroup = new THREE.Group();

  button_stop: THREE.Mesh;
  button_start: THREE.Mesh;
  button_effect: THREE.Mesh;

  power = 0;

  private mode = "stop";
  private fanSpeed = 600;
  private head = {
    sum: 0,
    speed: 1,
  };
  // private body = {
  //   sum: 0,
  //   speed: 1000,
  // };

  constructor() {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf9f9f9,
      side: THREE.DoubleSide,
    });
    const material_red = new THREE.MeshPhysicalMaterial({
      color: 0xea5550,
      side: THREE.DoubleSide,
    });
    const material_blue = new THREE.MeshPhysicalMaterial({
      color: 0x0075c2,
      side: THREE.DoubleSide,
    });
    const material_green = new THREE.MeshPhysicalMaterial({
      color: 0x79c06e,
      side: THREE.DoubleSide,
    });

    const fan_w = 3;
    const fan_geo = new THREE.PlaneGeometry(1.5, fan_w, 1, 1);
    for (let i = 0; i < 7; i++) {
      const group = new THREE.Group();
      const fan = new THREE.Mesh(fan_geo, material);
      const rad = Math.PI * 2 * (i / 7);
      fan.position.z = fan_w / 2;
      fan.rotation.x = Math.PI / 2;
      fan.rotation.y = Math.PI / 8;
      group.rotation.y = rad;
      group.add(fan);
      this.fanGroup.add(group);
    }
    this.fanGroup.position.y = 6;
    this.fanGroup.position.z = 1;
    this.fanGroup.rotation.x = Math.PI / 2;

    this.headGroup.add(this.fanGroup);

    const cylinder_geo = new THREE.CylinderGeometry(1, 1, 2, 30);
    const cylinder = new THREE.Mesh(cylinder_geo, material);
    cylinder.position.y = 6;
    cylinder.position.z = 0.5;
    cylinder.rotation.x = Math.PI / 2;
    this.headGroup.add(cylinder);
    const pole_geo = new THREE.CylinderGeometry(0.2, 0.2, 6, 30);
    const pole = new THREE.Mesh(pole_geo, material);
    pole.position.set(0, 3, 0);
    this.headGroup.add(pole);

    this.group.add(this.headGroup);

    const body_geo = new THREE.CylinderGeometry(2, 2.5, 0.5, 30);
    const body = new THREE.Mesh(body_geo, material);
    body.position.z = 0.5;
    this.group.add(body);

    const button_geo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 20);
    this.button_stop = new THREE.Mesh(button_geo, material_red);
    this.button_start = new THREE.Mesh(button_geo, material_blue);
    this.button_effect = new THREE.Mesh(button_geo, material_green);

    this.button_stop.name = "stop";
    this.button_start.name = "start";
    this.button_effect.name = "effect";

    this.button_stop.position.set(-0.8, 0.3, 1.5);
    this.button_start.position.set(0, 0.3, 1.5);
    this.button_effect.position.set(0.8, 0.3, 1.5);
    this.group.add(this.button_stop, this.button_start, this.button_effect);
  }

  getMode() {
    return this.mode;
  }

  modeChange(mode: "stop" | "start" | "effect_1") {
    this.button_stop.position.y = 0.3;
    this.button_start.position.y = 0.3;
    this.button_effect.position.y = 0.3;

    switch (mode) {
      case "stop":
        this.button_stop.position.y = 0.2;
        break;
      case "start":
        this.button_start.position.y = 0.2;
        break;
      case "effect_1":
        this.button_effect.position.y = 0.2;
        break;
    }

    this.mode = mode;
  }

  addPower(delta: number) {
    this.power += 0.5 * delta;
    if (this.power >= 1) this.power = 1;
  }

  removePower() {
    this.power = 0;
  }

  rotateFan(delta: number) {
    this.fanGroup.rotation.y += this.fanSpeed * this.power * delta;
  }

  rotateHead(delta: number) {
    this.head.sum += delta * 0.5 * this.power;
    const rad = Math.cos(this.head.sum) * 0.6;
    const speed = this.head.speed * delta * this.power;
    this.headGroup.rotation.y += speed * rad;
  }

  fanControl(delta: number) {
    switch (this.mode) {
      case "stop":
        this.removePower();
        break;
      case "start":
        this.addPower(delta);
        break;
      case "effect_1":
        this.addPower(delta);
        break;
    }
    this.rotateFan(delta);
    this.rotateHead(delta);
  }
}
