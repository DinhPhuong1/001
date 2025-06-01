const width = 400;

let canvas = document.getElementById("c1");

// Nếu muốn canvas tự động thay đổi kích thước khi thay đổi cửa sổ:
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  render.setSize(window.innerWidth, window.innerHeight);
});

let camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(width, width, width);
camera.lookAt(0, 0, 0);

let scene = new THREE.Scene("background:rgb(0, 0, 0)");

let render = new THREE.WebGLRenderer({
  canvas: document.getElementById("c1"),
  antialias: true,
});
render.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BoxGeometry(width / 2, 2, width / 2);
const material = new THREE.MeshBasicMaterial({
  color: 0xf0f0f0,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

let renderCallbacks = [];

animate();

function animate() {
  window.requestAnimationFrame(() => animate());
  renderCallbacks.forEach((callback) => callback());
  render.render(scene, camera);
}
let dk = new dieu_khien();

document.getElementById("batdau").addEventListener("click", function () {
  if (!mobile) {
    render.domElement.requestPointerLock();
  } else {
    document.getElementById("dieu_khien_3d_dienthoai").style.display = "flex";
  }
  document.getElementById("divbatdau").style.display = "none";
  dk.lock();
  console.log("Đã yêu cầu Pointer Lock");
});

document.getElementById("tat_dk").addEventListener("click", function () {
  
  if (mobile) {
    document.getElementById("dieu_khien_3d_dienthoai").style.display = "none";
  }
  document.getElementById("divbatdau").style.display = "flex";
  dk.unlock();
});

document.addEventListener("pointerlockchange", function () {
  if (document.pointerLockElement !== render.domElement) {
    console.log("Đã mở khóa chuột khỏi canvas c1");
    dk.unlock();
    if (mobile) {
      document.getElementById("dieu_khien_3d_dienthoai").style.display = "none";
    }
    document.getElementById("divbatdau").style.display = "flex";
  }
});
