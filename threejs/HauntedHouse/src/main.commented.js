/**
 * ============================================
 * Three.js 鬼屋项目 (Haunted House)
 * ============================================
 * 
 * 综合运用 Three.js 多项技术：
 * - 纹理系统（Color, ARM, Normal, Displacement, Alpha）
 * - PBR 材质（MeshStandardMaterial）
 * - 光照系统（Ambient, Directional, Point）
 * - 阴影系统（Shadow Mapping）
 * - 场景组织（Group）
 * - 程序化生成（墓碑随机分布）
 * - 大气效果（Sky, Fog）
 * - 动画系统（Clock + requestAnimationFrame）
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import GUI from 'lil-gui'

/* ============================================
 * 1. 基础设置 (Base Setup)
 * ============================================ */

// 调试面板 - 使用 lil-gui 库创建可视化调试界面
const gui = new GUI()

// 获取画布元素 - HTML 中需要有 <canvas class="webgl"></canvas>
const canvas = document.querySelector('canvas.webgl')

// 创建场景 - Three.js 的核心容器，所有3D对象都添加到场景中
const scene = new THREE.Scene()

/* ============================================
 * 2. 纹理加载 (Texture Loading)
 * ============================================
 * 
 * 纹理类型说明：
 * - Color/Diffuse: 基础颜色贴图，需要 sRGB 色彩空间
 * - ARM: 打包贴图 (R=AO, G=Roughness, B=Metalness)
 * - Normal: 法线贴图，用于模拟表面凹凸细节
 * - Displacement: 位移贴图，真实移动顶点
 * - Alpha: 透明度贴图
 */

const textureLoader = new THREE.TextureLoader()

// ========== 地面纹理 (Floor Textures) ==========
const floorAlphaTexture = textureLoader.load('./floor/alpha.webp')
const floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp')
const floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp')
const floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp')
const floorDisplacementTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp')

// 颜色纹理必须设置 sRGB 色彩空间，确保颜色正确显示
floorColorTexture.colorSpace = THREE.SRGBColorSpace

// 设置纹理重复次数 - 8x8 平铺
floorColorTexture.repeat.set(8, 8)
floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)

// 设置纹理包裹模式 - RepeatWrapping 启用无缝重复
// wrapS: 水平方向 (U轴)
floorColorTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping

// wrapT: 垂直方向 (V轴)
floorColorTexture.wrapT = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

// ========== 墙壁纹理 (Wall Textures) ==========
const wallColorTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.webp')
const wallARMTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.webp')
const wallNormalTexture = textureLoader.load('./wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.webp')

wallColorTexture.colorSpace = THREE.SRGBColorSpace

// ========== 屋顶纹理 (Roof Textures) ==========
const roofColorTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_diff_1k.webp')
const roofARMTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_arm_1k.webp')
const roofNormalTexture = textureLoader.load('./roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.webp')

roofColorTexture.colorSpace = THREE.SRGBColorSpace

// 屋顶纹理水平重复3次，垂直不重复
roofColorTexture.repeat.set(3, 1)
roofARMTexture.repeat.set(3, 1)
roofNormalTexture.repeat.set(3, 1)

roofColorTexture.wrapS = THREE.RepeatWrapping
roofARMTexture.wrapS = THREE.RepeatWrapping
roofNormalTexture.wrapS = THREE.RepeatWrapping

// ========== 灌木纹理 (Bush Textures) ==========
const bushColorTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.webp')
const bushARMTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.webp')
const bushNormalTexture = textureLoader.load('./bush/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.webp')

bushColorTexture.colorSpace = THREE.SRGBColorSpace

bushColorTexture.repeat.set(2, 1)
bushARMTexture.repeat.set(2, 1)
bushNormalTexture.repeat.set(2, 1)

bushColorTexture.wrapS = THREE.RepeatWrapping
bushARMTexture.wrapS = THREE.RepeatWrapping
bushNormalTexture.wrapS = THREE.RepeatWrapping

// ========== 墓碑纹理 (Grave Textures) ==========
const graveColorTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.webp')
const graveARMTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.webp')
const graveNormalTexture = textureLoader.load('./grave/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.webp')

graveColorTexture.colorSpace = THREE.SRGBColorSpace

// 小于1的repeat值会放大纹理
graveColorTexture.repeat.set(0.3, 0.4)
graveARMTexture.repeat.set(0.3, 0.4)
graveNormalTexture.repeat.set(0.3, 0.4)

// ========== 门纹理 (Door Textures) ==========
// 门使用完整的 PBR 纹理集
const doorColorTexture = textureLoader.load('./door/color.webp')
const doorAlphaTexture = textureLoader.load('./door/alpha.webp')
const doorAmbientOcclusionTexture = textureLoader.load('./door/ambientOcclusion.webp')
const doorHeightTexture = textureLoader.load('./door/height.webp')
const doorNormalTexture = textureLoader.load('./door/normal.webp')
const doorMetalnessTexture = textureLoader.load('./door/metalness.webp')
const doorRoughnessTexture = textureLoader.load('./door/roughness.webp')

doorColorTexture.colorSpace = THREE.SRGBColorSpace

/* ============================================
 * 3. 场景对象创建 (Scene Objects)
 * ============================================ */

// ========== 地面 (Floor) ==========
/**
 * PlaneGeometry(width, height, widthSegments, heightSegments)
 * - 20x20 的大小
 * - 100x100 的细分用于 Displacement Map
 * 
 * MeshStandardMaterial - PBR 材质
 * - alphaMap: 透明度贴图
 * - transparent: 启用透明
 * - map: 颜色贴图
 * - aoMap: 环境光遮蔽（使用 ARM 的 R 通道）
 * - roughnessMap: 粗糙度（使用 ARM 的 G 通道）
 * - metalnessMap: 金属度（使用 ARM 的 B 通道）
 * - normalMap: 法线贴图
 * - displacementMap: 位移贴图
 * - displacementScale: 位移强度
 * - displacementBias: 位移偏移（负值让地面下沉）
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 100, 100),
    new THREE.MeshStandardMaterial({
        alphaMap: floorAlphaTexture,
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        normalMap: floorNormalTexture,
        displacementMap: floorDisplacementTexture,
        displacementScale: 0.3,
        displacementBias: -0.2
    })
)
// 旋转地面使其水平（PlaneGeometry 默认是垂直的）
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

// GUI 调试控制
gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('floorDisplacementScale')
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('floorDisplacementBias')

// ========== 房屋容器 (House Container) ==========
/**
 * THREE.Group() - 用于组织相关对象
 * 可以统一变换（移动、旋转、缩放）所有子对象
 */
const house = new THREE.Group()
scene.add(house)

// ========== 墙壁 (Walls) ==========
/**
 * BoxGeometry(width, height, depth)
 * 4x2.5x4 的立方体作为墙壁
 */
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: wallColorTexture,
        aoMap: wallARMTexture,
        roughnessMap: wallARMTexture,
        metalnessMap: wallARMTexture,
        normalMap: wallNormalTexture
    })
)
// 墙壁上移一半高度，使底部与地面对齐
walls.position.y += 1.25
house.add(walls)

// ========== 屋顶 (Roof) ==========
/**
 * ConeGeometry(radius, height, radialSegments)
 * - radialSegments: 4 创建四边形金字塔形状
 */
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1.5, 4),
    new THREE.MeshStandardMaterial({
        map: roofColorTexture,
        aoMap: roofARMTexture,
        roughnessMap: roofARMTexture,
        metalnessMap: roofARMTexture,
        normalMap: roofNormalTexture
    })
)
// 放置在墙壁顶部
roof.position.y = 2.5 + 0.75
// 旋转45度使边角对齐墙壁边角
roof.rotation.y = Math.PI * 0.25
house.add(roof)

// ========== 门 (Door) ==========
/**
 * 门使用完整的 PBR 贴图集
 * 高细分(100x100)用于 displacementMap
 */
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.15,
        displacementBias: -0.04,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.position.y = 1
// 门稍微向外偏移，避免与墙壁 z-fighting
door.position.z = 2 + 0.01
house.add(door)

// ========== 灌木 (Bushes) ==========
/**
 * 复用几何体和材质 - 性能优化
 * 多个 Mesh 可以共享同一个 Geometry 和 Material
 */
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({
    color: '#ccffcc', // 淡绿色叠加
    map: bushColorTexture,
    aoMap: bushARMTexture,
    roughnessMap: bushARMTexture,
    metalnessMap: bushARMTexture,
    normalMap: bushNormalTexture
})

// 创建多个灌木，调整位置和大小
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
bush1.rotation.x = -0.75 // 旋转使纹理更自然

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
bush2.rotation.x = -0.75

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(-0.8, 0.1, 2.2)
bush3.rotation.x = -0.75

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(-1, 0.05, 2.6)
bush4.rotation.x = -0.75

house.add(bush1, bush2, bush3, bush4)

// ========== 墓碑 (Graves) ==========
/**
 * 程序化生成 - 使用极坐标随机分布
 */
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({
    map: graveColorTexture,
    normalMap: graveNormalTexture,
    aoMap: graveARMTexture,
    roughnessMap: graveARMTexture,
    metalnessMap: graveARMTexture
})

const graves = new THREE.Group()
scene.add(graves)

/**
 * 程序化生成30个墓碑
 * 使用极坐标转笛卡尔坐标实现圆形分布
 */
for (let i = 0; i < 30; i++) {
    // 随机角度 (0 到 2π)
    const angle = Math.random() * Math.PI * 2
    // 随机半径 (3-7)，避免与房屋重叠
    const radius = 3 + Math.random() * 4
    
    // 极坐标转笛卡尔坐标
    // x = sin(θ) × r
    // z = cos(θ) × r
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius

    const grave = new THREE.Mesh(graveGeometry, graveMaterial)
    grave.position.x = x
    grave.position.y = Math.random() * 0.4 // 随机高度
    grave.position.z = z
    
    // 随机倾斜，增加自然感
    grave.rotation.x = (Math.random() - 0.5) * 0.4
    grave.rotation.y = (Math.random() - 0.5) * 0.4
    grave.rotation.z = (Math.random() - 0.5) * 0.4

    graves.add(grave)
}

/* ============================================
 * 4. 光照系统 (Lighting)
 * ============================================ */

// ========== 环境光 (Ambient Light) ==========
/**
 * AmbientLight(color, intensity)
 * 全局均匀照明，没有方向，不产生阴影
 * 用于模拟间接光照，避免场景过暗
 */
const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
scene.add(ambientLight)

// ========== 平行光 (Directional Light) ==========
/**
 * DirectionalLight(color, intensity)
 * 模拟太阳光，所有光线平行
 * 可以产生阴影
 */
const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)

// ========== 门灯 (Door Light) ==========
/**
 * PointLight(color, intensity)
 * 点光源，从一个点向所有方向发光
 * 暖色调营造门口氛围
 */
const doorLight = new THREE.PointLight('#ff7d46', 5)
doorLight.position.set(0, 2.2, 2.5)
house.add(doorLight) // 添加到 house 组，跟随房屋移动

/* ============================================
 * 5. 幽灵光源 (Ghost Lights)
 * ============================================
 * 使用 PointLight 模拟漂浮的幽灵
 * 不同颜色增加视觉层次
 */
const ghost1 = new THREE.PointLight('#8800ff', 6) // 紫色
const ghost2 = new THREE.PointLight('#ff0088', 6) // 粉色
const ghost3 = new THREE.PointLight('#ff0000', 6) // 红色
scene.add(ghost1, ghost2, ghost3)

/* ============================================
 * 6. 响应式尺寸 (Responsive Sizing)
 * ============================================ */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// 窗口大小变化时更新
window.addEventListener('resize', () => {
    // 更新尺寸
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // 更新相机宽高比
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // 更新渲染器尺寸和像素比
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/* ============================================
 * 7. 相机 (Camera)
 * ============================================ */

/**
 * PerspectiveCamera(fov, aspect, near, far)
 * - fov: 视场角 (75度)
 * - aspect: 宽高比
 * - near: 近裁剪面 (0.1)
 * - far: 远裁剪面 (100)
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// ========== 轨道控制器 (Orbit Controls) ==========
/**
 * OrbitControls(camera, domElement)
 * 允许用鼠标旋转、缩放、平移相机
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true // 启用阻尼，更平滑的控制

/* ============================================
 * 8. 渲染器 (Renderer)
 * ============================================ */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // 限制像素比，性能优化

/* ============================================
 * 9. 阴影配置 (Shadow Configuration)
 * ============================================ */

// 启用阴影
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // 软阴影

// ========== 投射阴影设置 (Cast Shadow) ==========
directionalLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

// ========== 接收阴影设置 (Receive Shadow) ==========
walls.castShadow = true
walls.receiveShadow = true
roof.castShadow = true
floor.receiveShadow = true

// 批量设置墓碑阴影
for (const grave of graves.children) {
    grave.castShadow = true
    grave.receiveShadow = true
}

// ========== 阴影贴图优化 (Shadow Map Optimization) ==========
/**
 * 平行光阴影相机配置
 * 减小阴影贴图尺寸和相机范围提升性能
 */
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20

// 点光源阴影配置
ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 10

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 10

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 10

/* ============================================
 * 10. 天空系统 (Sky)
 * ============================================ */

/**
 * Sky - Three.js 附加对象
 * 基于物理的天空模拟
 */
const sky = new Sky()
sky.scale.set(100, 100, 100) // 缩放到覆盖整个场景
scene.add(sky)

// 天空参数 - 调整大气效果
sky.material.uniforms['turbidity'].value = 10         // 浑浊度
sky.material.uniforms['rayleigh'].value = 3           // 瑞利散射（天空蓝色）
sky.material.uniforms['mieCoefficient'].value = 0.1   // 米氏散射系数
sky.material.uniforms['mieDirectionalG'].value = 0.95 // 米氏散射方向
// 太阳位置 - y为负值模拟夜晚
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

/* ============================================
 * 11. 雾效 (Fog)
 * ============================================ */

/**
 * FogExp2(color, density)
 * 指数雾 - 距离越远雾越浓，更自然的效果
 * 
 * 也可以使用线性雾：
 * scene.fog = new THREE.Fog('#04343f', 1, 13)
 */
scene.fog = new THREE.FogExp2('#04343f', 0.1)

/* ============================================
 * 12. 动画循环 (Animation Loop)
 * ============================================ */

/**
 * THREE.Clock - 时间管理
 * getElapsedTime() 返回自创建以来经过的秒数
 */
const clock = new THREE.Clock()

const tick = () => {
    // 获取经过的时间
    const elapsedTime = clock.getElapsedTime()

    // ========== 幽灵动画 (Ghost Animation) ==========
    /**
     * 使用三角函数创建复杂运动轨迹
     * - cos/sin 配合创建圆周运动
     * - 多个 sin 相乘创建不规则上下浮动
     * - 不同速度和半径避免同步
     */
    
    // 幽灵1 - 速度0.5，半径4
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    // 复杂的Y轴运动：三个不同频率的sin相乘
    ghost1.position.y = Math.sin(ghost1Angle) * Math.sin(ghost1Angle * 2.34) * Math.sin(ghost1Angle * 3.45)

    // 幽灵2 - 反方向，速度0.38，半径5
    const ghost2Angle = -elapsedTime * 0.38
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45)

    // 幽灵3 - 速度0.23，半径6
    const ghost3Angle = elapsedTime * 0.23
    ghost3.position.x = Math.cos(ghost3Angle) * 6
    ghost3.position.z = Math.sin(ghost3Angle) * 6
    ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45)

    // 更新控制器（启用阻尼时必须调用）
    controls.update()

    // 渲染场景
    renderer.render(scene, camera)

    // 递归调用，创建动画循环
    window.requestAnimationFrame(tick)
}

// 启动动画循环
tick()
