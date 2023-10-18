// IMPORTS
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/MTLLoader.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/RGBELoader.js";
import { FlakesTexture } from "https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/textures/FlakesTexture.js";
//SCENE
let newEnvMap;
const scene = new THREE.Scene();

//RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas"),
  antialias: true,
  alpha: true,
});
renderer.setClearColor(0x000000, 0); //Sceen color
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth/2
, window.innerHeight/2
);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

//CAMERA
const camera = new THREE.PerspectiveCamera(
  9,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.z = 150;
camera.near = 10;
camera.far = 20;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 4;
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
// controls.minPolarAngle = .1; // radians
// controls.maxPolarAngle = 1; // radians
// controls.minAzimuthAngle = .1; // radians
// controls.maxAzimuthAngle = 1; // radians

//LIGHTS
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 5, 25);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 70;
scene.add(spotLight);
const spotLight2 = new THREE.SpotLight(0xffffff);
spotLight2.position.set(0, -40, -25);
spotLight2.castShadow = true;
spotLight2.shadow.mapSize.width = 1024;
spotLight2.shadow.mapSize.height = 1024;
spotLight2.shadow.camera.near = 500;
spotLight2.shadow.camera.far = 4000;
spotLight2.shadow.camera.fov = 70;
scene.add(spotLight2);

//scene.background = null;

//REFLECTION
 let pmremGenerator = new THREE.PMREMGenerator(renderer);

// new RGBELoader().setPath('images/').load('cayley_interior_4k.hdr', function(hdrmap) {
//    //...
   
//    let envmap = envmaploader,fromCubemap(hdrmap);
//    const ballMaterial = {
//     //...
//     envMap: envmap.texture
//   };
// });

new RGBELoader()
.load('cayley_interior_4k.hdr', (hdrEquiRect, textureData) => {
        hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquiRect);
        pmremGenerator.compileCubemapShader();

        scene.background = hdrCubeRenderTarget.texture;
        newEnvMap = hdrCubeRenderTarget.texture;
        renderer.toneMapping = LinearToneMapping;
        renderer.toneMappingExposure = 0.5;
});

var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('./images/Steel.jpg');
texture.mapping = THREE.EquirectangularReflectionMapping;

// OBJECT
const loader = new OBJLoader();
const mtlLoader = new MTLLoader();
let card;
mtlLoader.load("./3d_model/gcc.mtl", (materials) => {
  materials.preload();
  loader.setMaterials(materials);
  loader.load("./3d_model/gcc.obj", (object) => {
    card = object;
    card.rotateX(0);
    card.rotateY(0);
    card.rotateZ(100);
    card.scale.set(13, 13, 13);
    scene.add(card);
    object.traverse((node) => {
      if (node.isMesh) node.material.envMap = tnewEnvMap;
    });
  });
});

//RENDER LOOP
requestAnimationFrame(render);
function render() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.addEventListener(
  "resize",
  function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);