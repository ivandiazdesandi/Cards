// IMPORTS
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/RGBELoader.js";

//SCENE
let newEnvMap; //Environment map
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
renderer.toneMappingExposure = 1;

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

//LIGHTS
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

//REFLECTION
let hdrCubeRenderTarget;
let pmremGenerator = new THREE.PMREMGenerator(renderer);

function loadEnvMap() { // Function to load the HDR environment map and return a Promise
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

async function setupScene() {
  console.log("Setting up the scene...");
  await loadEnvMap();
  console.log("Environment map is loaded and ready.");

  const loader = new GLTFLoader();

  // Define an array of models with their respective paths
  const modelsToLoad = [
    { path: 'models/MatteBlackSilver.gltf', position: new THREE.Vector3(0, 0, 0), visibility: true, name: "Black Matte - Silver Background"},
    { path: 'models/credit card.gltf', position: new THREE.Vector3(0, 0, 0), visibility: false, name: "Shiny Gold 24k"}, // Add more models with their paths and positions
    // Add more models as needed
  ];

  const loadedModels = []; // Array to store loaded models

  // Load all models
  modelsToLoad.forEach((modelInfo) => {
    loader.load(
      modelInfo.path,
      function (gltf) {
        gltf.scene.visible = modelInfo.visibility;
        scene.add(gltf.scene);
        gltf.scene.position.copy(modelInfo.position);
        loadedModels.push(gltf.scene);
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      function (error) {
        console.error('An error happened', error);
      }
    );
  });

  // Update the scene environment with the loaded environment map
  scene.environment = newEnvMap;

  // Render loop
  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // Event listeners
  window.addEventListener(
    'resize',
    function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    },
    false
  );

  // Modify object rotation based on mouse movement
  canvas.addEventListener(
    'mousemove',
    function (mouse) {
      loadedModels.forEach((model) => {
        model.rotation.y = THREE.MathUtils.lerp(
          model.rotation.y,
          ((mouse.x - window.innerWidth / 1.7) * Math.PI) / 3000,
          0.1
        ) - 0.01;
        model.rotation.x = THREE.MathUtils.lerp(
          model.rotation.x,
          ((mouse.y - window.innerHeight / 2.3) * Math.PI) / 3000,
          0.1
        ) - 0.01;
      });
    },
    false
  );

  // Function to toggle models' visibility
  document.getElementById('toggleButton').addEventListener(
    'click', 
    function toggleModelsVisibility() {
      loadedModels.forEach((model) => {
      model.visible = !model.visible;
      });
    }
  );

}

setupScene();


// Hover changes

document.querySelector