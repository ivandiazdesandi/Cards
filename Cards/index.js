// IMPORTS
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/MTLLoader.js";
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
// controls.minPolarAngle = .1; // radians
// controls.maxPolarAngle = 1; // radians
// controls.minAzimuthAngle = .1; // radians
// controls.maxAzimuthAngle = 1; // radians

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

async function setupScene() { // Asynchronous function to set up the scene
  console.log("Setting up the scene...");
  await loadEnvMap(); // Wait for the environment map to be loaded
  console.log("Environment map is loaded and ready.");
  const loader2 = new GLTFLoader();

  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
  // loader.setDRACOLoader( dracoLoader );

  let card; // Load a glTF resource
  loader2.load(
    'models/credit card.gltf',
    function ( gltf ) {

      scene.add( gltf.scene );

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

      scene.environment = newEnvMap;

      card = gltf.scene;

    },
    
    function ( xhr ) { // called while loading is progressing
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    
    function ( error ) { // called when loading has errors
      console.log( 'An error happened' );
    }
);

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

setupScene(); // Call the setupScene function to begin setting up the scene