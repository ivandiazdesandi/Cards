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
camera.position.z = 7;
camera.near = 1;
camera.far = 2000;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.autoRotateSpeed = 4;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = false;
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
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

//REFLECTION
let hdrCubeRenderTarget;
let pmremGenerator = new THREE.PMREMGenerator(renderer);
// Function to load the HDR environment map and return a Promise
function loadEnvMap() {
  return new Promise((resolve, reject) => {
    new RGBELoader().load('images/test.hdr', (hdrEquiRect, textureData) => {
      hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquiRect);
      pmremGenerator.compileCubemapShader();
      newEnvMap = hdrCubeRenderTarget.texture;
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 0.5;
      resolve(); // Resolve the Promise when the map is loaded
    });
  });
}
// Asynchronous function to set up the scene
async function setupScene() {
  console.log("Setting up the scene...");

  // Wait for the environment map to be loaded
  await loadEnvMap();

  console.log("Environment map is loaded and ready.");

  // Now you can create materials or apply the environment map to objects
  const basicMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    metalness: 1,
    roughness: 0,
    envMap: newEnvMap,
    envMapIntensity: 1,
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
    // card.rotateX(100);
    // card.rotateY(100);
    // card.rotateZ(100);
    //card.scale.set(13, 13, 13);
    scene.add(card);
    object.traverse((node) => {
      if (node.isMesh) {
        node.material = basicMaterial;
        if (node.material.isMeshStandardMaterial) {
          // Modify the metalness and roughness properties
          // node.material.metalness = 1; // Change to your desired value (between 0 and 1)
          // node.material.roughness = 0.1; // Change to your desired value (between 0 and 1)
        }
        // Set the environment map for the material
        // node.material.envMap = newEnvMap; // Assuming newEnvMap holds the HDR environment map
        // node.material.envMapIntensity = 1; // You can adjust the intensity as needed
      }
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

//EVENT LISTENERS
window.addEventListener(
  "resize",
  function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth/2, window.innerHeight/2);
  },
  false
);

canvas.addEventListener(
  "mousemove",
  function (mouse) {
    card.rotation.y = (THREE.MathUtils.lerp(card.rotation.y, (( mouse.x - (window.innerWidth / 1.7) ) * Math.PI) / 3000, 0.1)) - 0.01;
    card.rotation.x = (THREE.MathUtils.lerp(card.rotation.x, (( mouse.y - (window.innerHeight / 2.3) ) * Math.PI) / 3000, 0.1)) - 0.01;
  },
  false
);

requestAnimationFrame(render);
}

// Call the setupScene function to begin setting up the scene
setupScene();