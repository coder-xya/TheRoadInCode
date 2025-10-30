import * as THREE from "three";

// 获取DOM
const canvas = document.querySelector("canvas.threejs");

// 创建场景
const scene = new THREE.Scene();

// 创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 创建材质
const material = new THREE.MeshBasicMaterial({ color: "red" });

const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

// 尺寸对象
const sizes = {
  width: 800,
  height: 600,
};

// 摄像机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.setZ(2);
scene.add(camera);

//渲染
const renderer = new THREE.WebGLRenderer({
  canvas,
});

renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
