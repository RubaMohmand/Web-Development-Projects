(() => {

  const canvas = document.getElementById("cv");
  const ctx = canvas.getContext("2d");

  // --------------------------------
  // SETTINGS
  // --------------------------------

  const COLS = 9;
  const ROWS = 9;

  const SPACING = 56;
  const BASE_RADIUS = 12;

  const SPRING = 0.09;
  const DAMPING = 0.78;

  const GRAVITY_RADIUS = 210;
  const GRAVITY_MAX = 20;

  // Wave
  const ROW_DELAY = 0.055;
  const BOUNCE_AMPLITUDE = 12;
  const DECAY = 4.2;
  const FREQUENCY = 13;
  const COLUMN_SPREAD = 0.65;


  // --------------------------------
  // VARIABLES
  // --------------------------------

  let width;
  let height;

  let dots = [];

  let time = 0;

  let drops = [];

  let nextDrop = 0.6;


  // --------------------------------
  // MOUSE
  // --------------------------------

  const mouse = {
    x: -9999,
    y: -9999,
    active: false
  };


  // --------------------------------
  // RESIZE
  // --------------------------------

  function resize() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    createGrid();
  }


  // --------------------------------
  // CREATE DOT GRID
  // --------------------------------

  function createGrid() {

    const offsetX =
      (width - (COLS - 1) * SPACING) / 2;

    const offsetY =
      (height - (ROWS - 1) * SPACING) / 2;

    dots = [];

    for (let row = 0; row < ROWS; row++) {

      for (let col = 0; col < COLS; col++) {

        const baseX =
          offsetX + col * SPACING;

        const baseY =
          offsetY + row * SPACING;

        dots.push({

          baseX,
          baseY,

          x: baseX,
          y: baseY,

          velocityX: 0,
          velocityY: 0,

          radius: BASE_RADIUS,

          col,
          row
        });
      }
    }
  }


  // --------------------------------
  // CREATE WAVE
  // --------------------------------

  function createDrop() {

    drops.push({

      column:
        Math.floor(
          Math.random() * COLS
        ),

      startTime: time,

      amplitude:
        BOUNCE_AMPLITUDE *
        (0.7 + Math.random() * 0.55)
    });


    nextDrop =
      time +
      1.8 +
      Math.random() * 2.4;
  }


  // --------------------------------
  // PHYSICS
  // --------------------------------

  function update() {

    time += 0.016;


    // New wave
    if (time >= nextDrop) {
      createDrop();
    }


    // Remove old waves
    drops = drops.filter(
      drop =>
        time - drop.startTime < 2.5
    );


    // Update dots
    for (const dot of dots) {

      let targetX = dot.baseX;
      let targetY = dot.baseY;

      let targetRadius = BASE_RADIUS;


      // -----------------------------
      // WAVE
      // -----------------------------

      for (const drop of drops) {

        const localTime =
          (time - drop.startTime) -
          dot.row * ROW_DELAY;


        if (localTime <= 0)
          continue;


        const columnDistance =
          Math.abs(
            dot.col - drop.column
          );


        const spread =
          Math.exp(
            -(columnDistance ** 2) *
            COLUMN_SPREAD
          );


        if (spread < 0.01)
          continue;


        targetY +=
          drop.amplitude *
          Math.exp(
            -DECAY * localTime
          ) *
          Math.sin(
            FREQUENCY * localTime
          ) *
          spread;
      }


      // -----------------------------
      // MOUSE LIQUID GRAVITY
      // -----------------------------

      if (mouse.active) {

        const dx =
          mouse.x - dot.baseX;

        const dy =
          mouse.y - dot.baseY;

        const distance =
          Math.hypot(dx, dy);


        if (
          distance < GRAVITY_RADIUS &&
          distance > 1
        ) {

          const influence =
            Math.pow(
              1 -
              distance / GRAVITY_RADIUS,
              2
            );


          const offset =
            influence *
            GRAVITY_MAX;


          targetX +=
            (dx / distance) *
            offset;

          targetY +=
            (dy / distance) *
            offset;


          targetRadius =
            BASE_RADIUS *
            (
              1 +
              influence * 0.22
            );
        }
      }


      // -----------------------------
      // SPRING
      // -----------------------------

      dot.velocityX +=
        (targetX - dot.x) *
        SPRING;

      dot.velocityY +=
        (targetY - dot.y) *
        SPRING;


      // -----------------------------
      // DAMPING
      // -----------------------------

      dot.velocityX *= DAMPING;
      dot.velocityY *= DAMPING;


      // -----------------------------
      // POSITION
      // -----------------------------

      dot.x += dot.velocityX;
      dot.y += dot.velocityY;


      // -----------------------------
      // SIZE
      // -----------------------------

      dot.radius +=
        (
          targetRadius -
          dot.radius
        ) * 0.10;
    }
  }


  // --------------------------------
  // DRAW
  // --------------------------------

  function draw() {

    ctx.fillStyle = "#0B0B12";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    // Neon glow
    ctx.shadowBlur = 20;


    for (const dot of dots) {

      // Purple → Cyan gradient
      const progress =
        Math.max(
          0,
          Math.min(
            1,
            dot.x / width
          )
        );


      const red =
        Math.round(
          124 +
          (34 - 124) *
          progress
        );


      const green =
        Math.round(
          58 +
          (211 - 58) *
          progress
        );


      const blue =
        Math.round(
          237 +
          (238 - 237) *
          progress
        );


      const color =
        `rgb(${red}, ${green}, ${blue})`;


      ctx.fillStyle = color;
      ctx.shadowColor = color;


      ctx.beginPath();

      ctx.arc(
        dot.x,
        dot.y,
        dot.radius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }


    ctx.shadowBlur = 0;
  }


  // --------------------------------
  // MOUSE EVENTS
  // --------------------------------

  window.addEventListener(
    "mousemove",
    event => {

      mouse.x = event.clientX;
      mouse.y = event.clientY;

      mouse.active = true;
    }
  );


  window.addEventListener(
    "mouseleave",
    () => {

      mouse.active = false;
    }
  );


  // --------------------------------
  // TOUCH EVENTS
  // --------------------------------

  window.addEventListener(
    "touchmove",
    event => {

      event.preventDefault();

      const touch =
        event.touches[0];

      mouse.x = touch.clientX;
      mouse.y = touch.clientY;

      mouse.active = true;

    },
    {
      passive: false
    }
  );


  window.addEventListener(
    "touchend",
    () => {

      mouse.active = false;
    }
  );


  // --------------------------------
  // WINDOW RESIZE
  // --------------------------------

  window.addEventListener(
    "resize",
    resize
  );


  // --------------------------------
  // ANIMATION LOOP
  // --------------------------------

  function animate() {

    update();
    draw();

    requestAnimationFrame(
      animate
    );
  }


  // --------------------------------
  // START
  // --------------------------------

  resize();
  animate();

})();