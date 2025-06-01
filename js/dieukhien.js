class dieu_khien extends THREE.EventDispatcher {
  constructor() {
    super();
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians
    this.moveForward = false;
    this.moveLeft = false;
    this.moveBackward = false;
    this.moveRight = false;
    this.canJump = false;
    this.pointerSpeed = 1.0;
    this.isLocked = false;
    this.prevTime = performance.now();
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      10
    );
    this._euler = new THREE.Euler(0, 0, 0, "YXZ");
    this._vector = new THREE.Vector3();
    this._touchstart_c = this.touchstart_cam.bind(this);
    this._touchstart = this.touchstart.bind(this);
    this._touchmove = this.touchmove.bind(this);
    this._touchend = this.touchend.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this._onMouseMove = this.onMouseMove.bind(this);
    this._dichuyen = this.dichuyen.bind(this);

    document.addEventListener("pointerlockerror", function () {
      console.error(
        "THREE.PointerLockControls: Unable to use Pointer Lock API"
      );
    });

    if (mobile) {
      this.base = document.getElementById("joystick-base");
      this.stick = document.getElementById("joystick-stick");
      (this.dragging = false),
        (this.startX = 0),
        (this.startY = 0),
        (this.dx = 0),
        (this.dy = 0);
    } else {
    }
  }

  lock() {
    if (mobile) {
      this.stick.addEventListener("touchstart", this._touchstart);
      document.addEventListener("touchstart", this._touchstart_c);
      document.addEventListener("touchmove", this._touchmove);
      document.addEventListener("touchend", this._touchend);
    } else {
      render.domElement.ownerDocument.addEventListener(
        "mousemove",
        this._onMouseMove
      );
      document.addEventListener("keydown", this._onKeyDown);
      document.addEventListener("keyup", this._onKeyUp);
    }
    this.isLocked = true;
    camera.position.set(100, 10, 100);
    camera.lookAt(0, 0, 0);
    renderCallbacks.push(this._dichuyen);
    console.log("lock đã được gọi");
  }

  unlock() {
    if (mobile) {
      this.stick.removeEventListener("touchstart", this._touchstart);
      document.removeEventListener("touchstart", this._touchstart_c);
      document.removeEventListener("touchmove", this._touchmove);
      document.removeEventListener("touchend", this._touchend);
    } else {
      render.domElement.ownerDocument.removeEventListener(
        "mousemove",
        this._onMouseMove
      );
      document.removeEventListener("keydown", this._onKeyDown);
      document.removeEventListener("keyup", this._onKeyUp);
    }
    this.isLocked = false;
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    const index = renderCallbacks.indexOf(this._dichuyen);
    if (index > -1) {
      renderCallbacks.splice(index, 1);
    }
    console.log("unlock đã được gọi");
  }

  touchstart = function (e) {
    this.dragging = true;
    const t = e.touches[0];
    this.startX = t.clientX - this.stick.offsetLeft;
    this.startY = t.clientY - this.stick.offsetTop;
    console.log("touchstart đã được gọi");
  };

  touchstart_cam = function (e) {
    if (this.dragging) return;
    this.dragging_c = true;
    const t = e.touches[0];
    this.startX = t.clientX ;//- this.stick.offsetLeft;
    this.startY = t.clientY;// - this.stick.offsetTop;
  };

  touchmove = function (e) {
    if (this.dragging_c) {
      const t = e.touches[0];
      this.dx = t.clientX - this.startX;
      this.dy = t.clientY - this.startY;
      this.startX = t.clientX;
      this.startY = t.clientY;
      // --- Điều khiển góc nhìn camera tương tự onMouseMove ---
      if (this.isLocked === false) return;

      // scale để cảm ứng không quá nhạy (có thể điều chỉnh hệ số 0.05)
      const scale = 1 * this.pointerSpeed;

      this._euler.setFromQuaternion(camera.quaternion);

      this._euler.y -= this.dx * 0.002 * scale;
      this._euler.x -= this.dy * 0.002 * scale;

      this._euler.x = Math.max(
        Math.PI / 2 - this.maxPolarAngle,
        Math.min(Math.PI / 2 - this.minPolarAngle, this._euler.x)
      );

      camera.quaternion.setFromEuler(this._euler);
    }

    if (this.dragging) {
      const t = e.touches[0];
      this.dx = t.clientX - this.startX;
      this.dy = t.clientY - this.startY;
      // Giới hạn bán kính joystick
      const max = 40;
      const dist = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      if (dist > max) {
        this.dx = (this.dx * max) / dist;
        this.dy = (this.dy * max) / dist;
      }
      this.stick.style.left = 30 + this.dx + "px";
      this.stick.style.top = 30 + this.dy + "px";
      console.log("touchmove đã được gọi");

      this.moveRight =
        this.moveLeft =
        this.moveBackward =
        this.moveForward =
          false;
      if (this.dx > 0) {
        this.moveRight = true;
      }
      if (this.dx < 0) {
        this.moveLeft = true;
      }
      if (this.dy > 0) {
        this.moveBackward = true;
      }
      if (this.dy < 0) {
        this.moveForward = true;
      }
    }
    // Gọi hàm di chuyển nhân vật/camera ở đây
    // Ví dụ: movePlayer(dx / max, dy / max);
    // dx/max, dy/max là giá trị từ -1 đến 1
  };

  touchend = function (e) {
    this.dragging = false;
    this.dragging_c = false;
    this.x = this.dy = 0;
    this.moveRight =
      this.moveLeft =
      this.moveBackward =
      this.moveForward =
        false;
    this.stick.style.left = "30px";
    this.stick.style.top = "30px";
    console.log("touchend đã được gọi");
    // Dừng di chuyển
    // movePlayer(0, 0);
  };

  onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = true;
        break;

      case "Space":
        if (this.canJump === true) this.velocity.y += 150;
        this.canJump = false;
        break;
    }
    console.log("onKeyDown đã được gọi");
  };

  onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this.moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        this.moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        this.moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        this.moveRight = false;
        break;
    }
    console.log("onKeyUp đã được gọi");
  };

  dichuyen() {
    const time = performance.now();
    if (this.isLocked === true) {
      this.raycaster.ray.origin.copy(camera.position);
      this.raycaster.ray.origin.y -= 10;

      const intersections = this.raycaster.intersectObjects(camera, false);

      const onObject = intersections.length > 0;

      const delta = (time - this.prevTime) / 1000;
      let velocity = this.velocity;
      let direction = this.direction;
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y -= 5.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(this.moveForward) - Number(this.moveBackward);
      direction.x = Number(this.moveRight) - Number(this.moveLeft);
      direction.normalize(); // this ensures consistent movements in all directions

      if (this.moveForward || this.moveBackward)
        velocity.z -= direction.z * 400.0 * delta;
      if (this.moveLeft || this.moveRight)
        velocity.x -= direction.x * 200.0 * delta;

      if (onObject === true) {
        velocity.y = Math.max(0, velocity.y);
        this.canJump = true;
      }

      this.F_moveRight(-velocity.x * delta);
      this.F_moveForward(-velocity.z * delta);

      camera.position.y += velocity.y * delta; // new behavior

      if (camera.position.y < 10) {
        velocity.y = 0;
        camera.position.y = 10;

        this.canJump = true;
      }
      const gioihan = this.width / 2 - 5;
      const absz = Math.abs(camera.position.z);
      const absx = Math.abs(camera.position.x);
      if (absz > gioihan) {
        velocity.z = 0;
        camera.position.z = (gioihan * camera.position.z) / absz;
      }
      if (absx > gioihan) {
        velocity.x = 0;
        camera.position.x = (gioihan * camera.position.x) / absx;
      }
    }
    this.prevTime = time;
  }

  F_moveForward(distance) {
    if (this.enabled === false) return;

    // move forward parallel to the xz-plane
    // assumes camera.up is y-up

    this._vector.setFromMatrixColumn(camera.matrix, 0);

    this._vector.crossVectors(camera.up, this._vector);

    camera.position.addScaledVector(this._vector, distance);
  }

  F_moveRight(distance) {
    if (this.enabled === false) return;

    this._vector.setFromMatrixColumn(camera.matrix, 0);

    camera.position.addScaledVector(this._vector, distance);
  }
  onMouseMove(event) {
    console.log("onMouseMove đã được gọi");
    if (this.isLocked === false) return;

    this._euler.setFromQuaternion(camera.quaternion);

    this._euler.y -= event.movementX * 0.002 * this.pointerSpeed;
    this._euler.x -= event.movementY * 0.002 * this.pointerSpeed;

    this._euler.x = Math.max(
      Math.PI / 2 - this.maxPolarAngle,
      Math.min(Math.PI / 2 - this.minPolarAngle, this._euler.x)
    );

    camera.quaternion.setFromEuler(this._euler);
    console.log("onMouseMove đã được thực thi");
  }
}
