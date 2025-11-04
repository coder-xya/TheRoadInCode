// 导入Three.js库，这是创建3D图形的核心库
import * as THREE from "three";

// 获取DOM中的canvas元素，这是渲染3D场景的目标容器
// 注意：需要在HTML中有一个class为"threejs"的canvas元素
const canvas = document.querySelector("canvas.webGL");

// 创建场景(Scene) - 场景是所有3D对象的容器，相当于一个3D世界
const scene = new THREE.Scene();

// 创建几何体(Geometry) - 定义物体的形状和结构
// BoxGeometry创建一个立方体，参数分别是长、宽、高
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 创建材质(Material) - 定义物体的外观属性
// MeshBasicMaterial是基础材质，不受光照影响
// color属性设置为红色，可以使用CSS颜色值或十六进制值
const material = new THREE.MeshBasicMaterial({ color: "red" });

// 创建网格(Mesh) - 将几何体和材质结合成一个可渲染的对象
// 网格 = 几何体(形状) + 材质(外观)
const mesh = new THREE.Mesh(geometry, material);

// 将网格添加到场景中，这样它才会在渲染时显示出来
scene.add(mesh);

// 定义渲染窗口的尺寸对象
// 这些值将用于设置摄像机的宽高比和渲染器的尺寸
const sizes = {
  width: 800,
  height: 600,
};

// 创建透视摄像机(PerspectiveCamera)
// 参数1: 视野角度(FOV) - 摄像机看到的视场范围，单位是度
// 参数2: 宽高比 - 渲染窗口的宽/高
// 还有两个可选参数: near(近裁剪面)和far(远裁剪面)，决定可见范围
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

// 设置摄像机的位置
// 由于我们使用的是MeshBasicMaterial，摄像机位置不影响物体的亮度，只影响可见性
// 这里将摄像机沿Z轴向后移动2个单位，以便能看到整个立方体
camera.position.setZ(2);

// 将摄像机添加到场景中
scene.add(camera);

// 创建渲染器(Renderer)
// WebGLRenderer使用WebGL技术在canvas上绘制3D场景
// 参数是一个配置对象，这里我们指定使用的canvas元素
const renderer = new THREE.WebGLRenderer({
  canvas,
});

// 设置渲染器的尺寸，使其与我们定义的尺寸一致
renderer.setSize(sizes.width, sizes.height);

// 执行渲染
// 将场景和摄像机作为参数传递给render方法
// 渲染器会根据摄像机的视角，将场景中的内容绘制到canvas上
renderer.render(scene, camera);

// 动画系统 - 在Three.js中创建流畅动画的关键部分

// 创建时钟对象 - 用于精确跟踪动画时间
// Clock对象可以获取自创建以来经过的时间，对于创建基于时间的动画至关重要
const clock = new THREE.Clock();

// 定义动画循环函数(tick)
// 这个函数会被重复调用，每次调用都代表一帧动画
const tick = () => {
  // 获取自Clock创建以来经过的总时间(秒)
  // 使用elapsedTime确保动画速度与帧率无关，使动画在不同设备上表现一致
  const elapsedTime = clock.getElapsedTime();

  // 更新场景中的对象属性
  // 这里被注释的代码可以实现沿X轴的平移动画
  // mesh.position.x = elapsedTime;

  // 实现绕Y轴的旋转动画
  // 将旋转角度设置为经过的时间，这样立方体就会随时间持续旋转
  mesh.rotation.y = elapsedTime;

  // 重新渲染场景
  // 每一帧都需要重新渲染场景才能看到动画效果
  renderer.render(scene, camera);

  // 请求下一帧动画
  // window.requestAnimationFrame是浏览器提供的API，它会在浏览器准备好渲染下一帧时调用tick函数
  // 这比使用setInterval更高效，因为它会与浏览器的刷新率同步
  window.requestAnimationFrame(tick);
};

// 启动动画循环
// 调用一次tick函数，它会通过requestAnimationFrame持续执行
tick();
