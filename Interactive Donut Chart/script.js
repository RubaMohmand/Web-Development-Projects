import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/* =========================================================
   AI DATA
========================================================= */

const FLAVORS = [
  {
    id: "generative-ai",
    code: "A1",
    name: "GENERATIVE AI",
    color: 0x8b5cf6, // Purple
  },
  {
    id: "machine-learning",
    code: "B2",
    name: "MACHINE LEARNING",
    color: 0x22d3ee, // Cyan
  },
  {
    id: "computer-vision",
    code: "C3",
    name: "COMPUTER VISION",
    color: 0xf59e0b, // Amber
  },
  {
    id: "natural-language",
    code: "D4",
    name: "NATURAL LANGUAGE",
    color: 0xec4899, // Pink
  },
  {
    id: "robotics",
    code: "E5",
    name: "ROBOTICS",
    color: 0x10b981, // Green
  },
];

const DATASETS = {
  morning: {
    label: "CURRENT MODEL",
    values: [74, 59, 48, 36, 23],
    change: ["+18.4%", "+12.7%", "+9.6%", "+7.2%", "+5.1%"],
    sell: ["94%", "88%", "82%", "76%", "69%"],
    insights: [
      "Generative AI leads the dataset, reflecting strong adoption across modern AI applications.",
      "Machine learning remains a core foundation for predictive systems and intelligent automation.",
      "Computer vision continues to expand across image, video, and visual recognition tasks.",
      "Natural language models are driving advances in text understanding and language-based systems.",
      "Robotics represents a growing area where AI connects intelligence with physical automation.",
    ],
  },

  evening: {
    label: "PREVIOUS MODEL",
    values: [52, 67, 76, 41, 28],
    change: ["+42.3%", "−11.9%", "−36.8%", "−12.2%", "−17.9%"],
    sell: ["86%", "91%", "94%", "73%", "65%"],
    insights: [
      "Generative AI shows the strongest growth compared with the previous dataset.",
      "Machine learning remains significant but represents a smaller share of the current distribution.",
      "Computer vision was previously the largest category before the latest shift in AI adoption.",
      "Natural language maintains a consistent role across the two datasets.",
      "Robotics remains the smallest category while continuing to develop as an AI application.",
    ],
  },
};

/* =========================================================
   PERFORMANCE SETTINGS
========================================================= */

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const compact = matchMedia("(max-width: 860px)").matches;

const lowPower =
  compact ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => [...document.querySelectorAll(selector)];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0, edge1, value) => {
  const x = clamp((value - edge0) / (edge1 - edge0));

  return x * x * (3 - 2 * x);
};

/* =========================================================
   WEBGL CHECK
========================================================= */

function supportsWebGL() {
  try {
    const test = document.createElement("canvas");

    return Boolean(test.getContext("webgl2") || test.getContext("webgl"));
  } catch {
    return false;
  }
}

/* =========================================================
   EXPERIENCE
========================================================= */

function startExperience() {
  if (!supportsWebGL()) {
    throw new Error("WebGL is unavailable");
  }

  const canvas = $("#world");

  /* =======================================================
     RENDERER
  ======================================================= */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    alpha: false,
    powerPreference: lowPower ? "default" : "high-performance",
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));

  renderer.setSize(innerWidth, innerHeight);

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure = 1.08;

  renderer.shadowMap.enabled = !lowPower;

  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /* =======================================================
     SCENE
  ======================================================= */

  const scene = new THREE.Scene();

  scene.background = new THREE.Color(0x050505);

  scene.fog = new THREE.FogExp2(0x050505, compact ? 0.048 : 0.035);

  /* =======================================================
     CAMERA
  ======================================================= */

  const camera = new THREE.PerspectiveCamera(
    compact ? 38 : 34,
    innerWidth / innerHeight,
    0.1,
    90,
  );

  const cameraTarget = new THREE.Vector3();

  const cameraTargetGoal = new THREE.Vector3();

  /* =======================================================
     POST PROCESSING
  ======================================================= */

  const composer = new EffectComposer(renderer);

  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    lowPower ? 0.2 : 0.34,
    0.72,
    0.86,
  );

  composer.addPass(bloom);

  /* =======================================================
     WORLD
  ======================================================= */

  const world = new THREE.Group();

  scene.add(world);

  const chamber = new THREE.Group();

  world.add(chamber);

  /* =======================================================
     MATERIALS
  ======================================================= */

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0b0b,
    roughness: 0.82,
    metalness: 0.28,
  });

  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.32,
    metalness: 0.86,
    emissive: 0x151515,
    emissiveIntensity: 0.08,
  });

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xc7c7c7,
    transparent: true,
    opacity: 0.18,
  });

  /* =======================================================
     BACK WALL
  ======================================================= */

  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 15),
    wallMaterial,
  );

  backWall.position.z = -8;

  chamber.add(backWall);

  /* =======================================================
     CHAMBER RINGS
  ======================================================= */

  for (let i = 0; i < 8; i += 1) {
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(6.1 + i * 0.11, 0.022, 6, 112),
      steelMaterial,
    );

    rib.position.z = -1.8 - i * 0.74;

    rib.scale.y = 0.68;

    chamber.add(rib);
  }

  /* =======================================================
     AI CORE ASSEMBLY
  ======================================================= */

  const coilAssembly = new THREE.Group();

  coilAssembly.position.set(compact ? 0.65 : 3.15, compact ? -0.3 : -0.15, 0);

  chamber.add(coilAssembly);

  for (let i = 0; i < 3; i += 1) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(3.95 - i * 0.5, 0.035, 8, 100),
      glowMaterial,
    );

    coil.position.z = -7.7 + i * 0.03;

    coil.scale.y = 0.68;

    coilAssembly.add(coil);
  }

  /* =======================================================
     FLOOR
  ======================================================= */

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 28), wallMaterial);

  floor.rotation.x = -Math.PI / 2;

  floor.position.set(0, -4.55, -1);

  floor.receiveShadow = true;

  scene.add(floor);

  /* =======================================================
     LIGHTING
  ======================================================= */

  const hemisphere = new THREE.HemisphereLight(0xf2f2f2, 0x050505, 1.1);

  scene.add(hemisphere);

  const keyLight = new THREE.SpotLight(0xffffff, 65, 34, 0.56, 0.82, 1.45);

  keyLight.position.set(-5.5, 8, 7);

  keyLight.target.position.set(0, 0, -1);

  keyLight.castShadow = !lowPower;

  if (!lowPower) {
    keyLight.shadow.mapSize.set(1024, 1024);
  }

  scene.add(keyLight, keyLight.target);

  const rimLight = new THREE.PointLight(0xc7c7c7, 16, 16, 2);

  rimLight.position.set(5, 1.5, 1);

  scene.add(rimLight);

  const coreLight = new THREE.PointLight(0x8a8a8a, 3, 19, 2);

  coreLight.position.set(0, -2.5, -3);

  scene.add(coreLight);

  /* =======================================================
     DONUT CHART
  ======================================================= */

  const chart = new THREE.Group();

  chart.rotation.x = -0.78;

  chart.position.set(3.9, -0.5, -2.7);

  world.add(chart);

  /* =======================================================
     CHART PLATFORM
  ======================================================= */

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(4.35, 4.58, 0.2, lowPower ? 64 : 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x3a3a3a,
      roughness: 0.23,
      metalness: 0.9,
      clearcoat: 0.85,
      emissive: 0x151515,
      emissiveIntensity: 0.12,
    }),
  );

  plate.rotation.x = Math.PI / 2;

  plate.position.z = -0.25;

  plate.receiveShadow = true;

  chart.add(plate);

  const plateRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.86, 0.055, 10, lowPower ? 64 : 100),
    new THREE.MeshBasicMaterial({
      color: 0xc7c7c7,
    }),
  );

  plateRing.position.z = -0.35;

  chart.add(plateRing);

  /* =======================================================
     SLICES
  ======================================================= */

  const sliceGroups = [];

  const hitTargets = [];

  const sprinkleDummy = new THREE.Object3D();

  const sprinkleGeometry = new THREE.BoxGeometry(0.045, 0.17, 0.045);

  function ringShape(start, end, outer = 3.18, inner = 1.62) {
    const shape = new THREE.Shape();

    const segments = lowPower ? 30 : 48;

    for (let i = 0; i <= segments; i += 1) {
      const angle = THREE.MathUtils.lerp(start, end, i / segments);

      const x = Math.cos(angle) * outer;

      const y = Math.sin(angle) * outer;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    for (let i = segments; i >= 0; i -= 1) {
      const angle = THREE.MathUtils.lerp(start, end, i / segments);

      shape.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    }

    shape.closePath();

    return shape;
  }

  function makeGeometry(start, end, highlight = false) {
    return new THREE.ExtrudeGeometry(
      ringShape(start, end, highlight ? 3.06 : 3.18, highlight ? 1.73 : 1.62),
      {
        depth: highlight ? 0.13 : 0.47,

        steps: 1,

        bevelEnabled: true,

        bevelSegments: lowPower ? 2 : 4,

        bevelSize: highlight ? 0.055 : 0.09,

        bevelThickness: highlight ? 0.045 : 0.08,

        curveSegments: lowPower ? 18 : 28,
      },
    );
  }

  function updateSprinkles(group, start, end) {
    const mesh = group.userData.sprinkles;

    const seeds = group.userData.sprinkleSeeds;

    seeds.forEach((seed, index) => {
      const angle = THREE.MathUtils.lerp(start + 0.045, end - 0.045, seed.a);

      const radius = THREE.MathUtils.lerp(1.88, 2.89, seed.r);

      sprinkleDummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.67 + seed.z * 0.025,
      );

      sprinkleDummy.rotation.set(0, 0, angle + seed.spin);

      sprinkleDummy.scale.setScalar(seed.scale);

      sprinkleDummy.updateMatrix();

      mesh.setMatrixAt(index, sprinkleDummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }

  /* =======================================================
     DATASET ANGLES
  ======================================================= */

  function datasetAngles(datasetKey) {
    const values = DATASETS[datasetKey].values;

    const total = values.reduce((sum, value) => sum + value, 0);

    let cursor = -Math.PI / 2;

    return values.map((value) => {
      const span = (Math.PI * 2 * value) / total;

      const result = {
        start: cursor + 0.026,

        end: cursor + span - 0.026,
      };

      cursor += span;

      return result;
    });
  }

  const initialAngles = datasetAngles("morning");

  const eveningAngles = datasetAngles("evening");

  const morphStepCount = lowPower ? 8 : 14;

  /* =======================================================
     CREATE SLICES
  ======================================================= */

  FLAVORS.forEach((flavor, index) => {
    const angles = initialAngles[index];

    const geometryCache = Array.from(
      {
        length: morphStepCount + 1,
      },
      (_, step) => {
        const amount = step / morphStepCount;

        const start = THREE.MathUtils.lerp(
          initialAngles[index].start,
          eveningAngles[index].start,
          amount,
        );

        const end = THREE.MathUtils.lerp(
          initialAngles[index].end,
          eveningAngles[index].end,
          amount,
        );

        return {
          start,
          end,
          crust: makeGeometry(start, end),
          frosting: makeGeometry(start, end, true),
        };
      },
    );

    const color = new THREE.Color(flavor.color);

    const group = new THREE.Group();

    const crust = new THREE.Mesh(
      geometryCache[0].crust,
      new THREE.MeshStandardMaterial({
        color: color.clone().multiplyScalar(0.36),

        roughness: 0.55,
        metalness: 0.03,
      }),
    );

    const frosting = new THREE.Mesh(
      geometryCache[0].frosting,
      new THREE.MeshPhysicalMaterial({
        color,

        roughness: 0.28,

        metalness: 0.02,

        clearcoat: 1,

        clearcoatRoughness: 0.19,

        emissive: color,

        emissiveIntensity: 0.035,
      }),
    );

    frosting.position.z = 0.48;

    crust.castShadow = crust.receiveShadow = !lowPower;

    frosting.castShadow = !lowPower;

    const sprinkleCount = lowPower ? 12 : 22;

    const sprinkleMaterial = new THREE.MeshStandardMaterial({
      color: index % 2 ? 0xf2f2f2 : 0x202020,

      roughness: 0.46,
    });

    const sprinkles = new THREE.InstancedMesh(
      sprinkleGeometry,
      sprinkleMaterial,
      sprinkleCount,
    );

    const sprinkleSeeds = Array.from(
      {
        length: sprinkleCount,
      },
      (_, seedIndex) => ({
        a: (seedIndex * 0.61803398875 + index * 0.137) % 1,

        r: (seedIndex * 0.41421356237 + index * 0.23) % 1,

        z: (seedIndex * 0.271 + index * 0.1) % 1,

        spin: (((seedIndex * 1.7) % 1) - 0.5) * 2.2,

        scale: 0.75 + (seedIndex % 4) * 0.09,
      }),
    );

    group.add(crust, frosting, sprinkles);

    group.userData = {
      index,
      flavor,

      crust,
      frosting,
      sprinkles,

      sprinkleSeeds,

      mid: (angles.start + angles.end) / 2,

      morph: 0,

      targetMorph: 0,

      currentStep: 0,

      geometryCache,

      hover: 0,

      selected: 0,

      rawOffset: new THREE.Vector3(
        Math.cos((index / 5) * Math.PI * 2) * (5.5 + index * 0.55),

        Math.sin((index / 5) * Math.PI * 2) * (4.2 + index * 0.3),

        -2.5 - index * 0.5,
      ),
    };

    updateSprinkles(group, angles.start, angles.end);

    chart.add(group);

    sliceGroups.push(group);

    hitTargets.push(crust, frosting);
  });

  /* =======================================================
     PARTICLES
  ======================================================= */

  const particleCount = lowPower ? 480 : 1150;

  const particleGeometry = new THREE.BufferGeometry();

  const particlePositions = new Float32Array(particleCount * 3);

  const particleOrigins = new Float32Array(particleCount * 3);

  const particleTargets = new Float32Array(particleCount * 3);

  const particleSeeds = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i += 1) {
    const j = i * 3;

    const seed = (i * 0.61803398875) % 1;

    const orbit = i * 2.399963 + seed * 4;

    const spread = 3.5 + ((i * 0.37) % 1) * 7.5;

    particleOrigins[j] = Math.cos(orbit) * spread + (seed - 0.5) * 7;

    particleOrigins[j + 1] =
      Math.sin(orbit * 0.73) * spread * 0.62 + (seed - 0.5) * 2;

    particleOrigins[j + 2] = -5 + ((i * 0.127) % 1) * 11;

    const chartAngle = -Math.PI / 2 + (i / particleCount) * Math.PI * 2;

    const radius = 1.78 + ((i * 0.75487766) % 1) * 1.2;

    particleTargets[j] = Math.cos(chartAngle) * radius;

    particleTargets[j + 1] = Math.sin(chartAngle) * radius;

    particleTargets[j + 2] = 0.58 + ((i * 0.23) % 1) * 0.18;

    particleSeeds[i] = seed;
  }

  particlePositions.set(particleOrigins);

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xc7c7c7,

      size: compact ? 0.045 : 0.035,

      transparent: true,

      opacity: 0.58,

      blending: THREE.AdditiveBlending,

      depthWrite: false,
    }),
  );

  chart.add(particles);

  /* =======================================================
     INTERACTION
  ======================================================= */

  const raycaster = new THREE.Raycaster();

  const pointerNdc = new THREE.Vector2(5, 5);

  const pointer = {
    x: innerWidth * 0.7,
    y: innerHeight * 0.5,

    targetX: 0,
    targetY: 0,

    smoothX: 0,
    smoothY: 0,
  };

  const clock = new THREE.Clock();

  /* =======================================================
     CAMERA POSITIONS
  ======================================================= */

  const cameraPositions = {
    raw: new THREE.Vector3(0.5, 1.3, compact ? 16.5 : 15.5),

    bake: new THREE.Vector3(-5.4, 0.65, 10.5),

    taste: new THREE.Vector3(
      compact ? 0.2 : 1.1,

      compact ? 5.5 : 5.9,

      compact ? 13.7 : 12.4,
    ),
  };

  const chartPositions = {
    raw: new THREE.Vector3(
      compact ? 3.5 : 4.5,

      -0.5,

      -3.1,
    ),

    bake: new THREE.Vector3(
      compact ? 2.2 : 3.0,

      -0.1,

      -1.3,
    ),

    taste: new THREE.Vector3(
      compact ? 0 : 1.15,

      compact ? -1.3 : -0.3,

      0,
    ),
  };

  /* =======================================================
     STATE
  ======================================================= */

  let activeDataset = "morning";

  let selectedIndex = -1;

  let hoveredIndex = -1;

  let scrollProgress = 0;

  let formation = 0;

  let dragging = false;

  let dragStartX = 0;

  let dragStartRotation = 0;

  let lastDragX = 0;

  let lastDragTime = 0;

  let rotationVelocity = 0;

  let audio = null;

  let rafPending = false;

  let running = true;

  const legend = $("#legend");

  const table = $("#data-table");

  const analysis = $("#analysis");

  const tooltip = $("#tooltip");

  const dragCursor = $("#drag-cursor");

  /* =======================================================
     DATA HELPERS
  ======================================================= */

  function getDatasetTotal(key = activeDataset) {
    return DATASETS[key].values.reduce((sum, value) => sum + value, 0);
  }

  function percentage(index, key = activeDataset) {
    return Math.round(
      (DATASETS[key].values[index] / getDatasetTotal(key)) * 100,
    );
  }

  /* =======================================================
     ACCESSIBLE TABLE
  ======================================================= */

  function buildAccessibleData() {
    table.innerHTML = FLAVORS.map(
      (flavor, index) => `
          <tr>
            <th scope="row">
              ${flavor.name}
            </th>

            <td>
              ${DATASETS.morning.values[index]}
            </td>

            <td>
              ${percentage(index, "morning")}%
            </td>

            <td>
              ${DATASETS.evening.values[index]}
            </td>

            <td>
              ${percentage(index, "evening")}%
            </td>
          </tr>
        `,
    ).join("");
  }

  /* =======================================================
     LEGEND
  ======================================================= */

  function updateLegend() {
    legend.innerHTML = FLAVORS.map((flavor, index) => {
      const color = `#${new THREE.Color(flavor.color).getHexString()}`;

      return `
            <button
              type="button"
              data-slice="${index}"
              style="--slice:${color}"
              aria-pressed="${selectedIndex === index}"
            >
              <i aria-hidden="true"></i>

              <b>
                ${flavor.code}
                ${flavor.name}
              </b>

              <span>
                ${DATASETS[activeDataset].values[index]}
                U /
                ${percentage(index)}%
              </span>
            </button>
          `;
    }).join("");

    legend.querySelectorAll("button").forEach((button) => {
      const index = Number(button.dataset.slice);

      button.addEventListener("click", () =>
        selectSlice(selectedIndex === index ? -1 : index),
      );
    });
  }

  /* =======================================================
     ANALYSIS
  ======================================================= */

  function updateAnalysis() {
    if (selectedIndex < 0) {
      return;
    }

    const flavor = FLAVORS[selectedIndex];

    const dataset = DATASETS[activeDataset];

    const color = `#${new THREE.Color(flavor.color).getHexString()}`;

    $("#analysis-code").textContent = `${flavor.code} / ${dataset.label}`;

    $("#analysis-name").textContent = flavor.name;

    $("#analysis-swatch").style.background = color;

    $("#analysis-swatch").style.color = color;

    $("#analysis-percent").textContent = `${percentage(selectedIndex)}%`;

    $("#analysis-units").textContent = dataset.values[selectedIndex];

    $("#analysis-change").textContent = dataset.change[selectedIndex];

    $("#analysis-sell").textContent = dataset.sell[selectedIndex];

    $("#analysis-insight").textContent = dataset.insights[selectedIndex];
  }

  /* =======================================================
     SELECT SLICE
  ======================================================= */

  function selectSlice(index) {
    selectedIndex = index;

    sliceGroups.forEach((group, groupIndex) => {
      group.userData.selected = groupIndex === index ? 1 : 0;
    });

    analysis.classList.toggle("is-open", index >= 0);

    analysis.setAttribute("aria-hidden", String(index < 0));

    updateLegend();

    updateAnalysis();

    if (index >= 0 && compact) {
      analysis.scrollIntoView({
        block: "nearest",
      });
    }

    playSelectionTone(index);

    scheduleFrame();
  }

  /* =======================================================
     SWITCH DATASET
  ======================================================= */

  function switchDataset(key) {
    if (!DATASETS[key] || key === activeDataset) {
      return;
    }

    activeDataset = key;

    sliceGroups.forEach((group) => {
      group.userData.targetMorph = key === "evening" ? 1 : 0;
    });

    $$(".dataset-switch button").forEach((button) => {
      const active = button.dataset.dataset === key;

      button.classList.toggle("is-active", active);

      button.setAttribute("aria-pressed", String(active));
    });

    updateLegend();

    updateAnalysis();

    scheduleFrame();
  }

  /* =======================================================
     TOOLTIP
  ======================================================= */

  function showTooltip(index) {
    if (hoveredIndex === index) {
      return;
    }

    hoveredIndex = index;

    sliceGroups.forEach((group, groupIndex) => {
      group.userData.hover = groupIndex === index ? 1 : 0;
    });

    const visible = index >= 0 && !compact;

    tooltip.classList.toggle("is-visible", visible);

    tooltip.setAttribute("aria-hidden", String(!visible));

    if (visible) {
      const flavor = FLAVORS[index];

      $("#tooltip-code").textContent = flavor.code;

      $("#tooltip-name").textContent = flavor.name;

      $("#tooltip-value").textContent = `${
        DATASETS[activeDataset].values[index]
      } · ${percentage(index)}%`;
    }
  }

  /* =======================================================
     SCROLL
  ======================================================= */

  function updateScroll() {
    const max = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );

    scrollProgress = clamp(scrollY / max);

    formation = smoothstep(0.27, 0.67, scrollProgress);

    $("#scroll-progress").style.transform = `scaleX(${scrollProgress})`;

    const heat = Math.round(84 + smoothstep(0.2, 0.67, scrollProgress) * 136);

    $("#heat-label").textContent = `${String(heat).padStart(3, "0")}%`;

    $("#heat-fill").style.transform = `scaleX(${smoothstep(
      0.2,
      0.67,
      scrollProgress,
    )})`;

    const chapter = scrollProgress < 0.28 ? 0 : scrollProgress < 0.67 ? 1 : 2;

    const labels = [
      "01 — AI OVERVIEW",
      "02 — MODEL DISTRIBUTION",
      "03 — AI INSIGHTS",
    ];

    document.body.dataset.chapter = String(chapter);

    if (chapter !== 2 && selectedIndex >= 0) {
      selectSlice(-1);
    }

    $("#stage-label").textContent = labels[chapter];

    $$(".chapter-rail button").forEach((button, index) =>
      button.classList.toggle("is-active", index === chapter),
    );

    scheduleFrame();
  }

  /* =======================================================
     CAMERA
  ======================================================= */

  function updateCamera() {
    const coilCompact = innerWidth <= 860;

    const coilRawX = coilCompact ? 0.65 : 3.15;

    const coilTasteX = coilCompact ? 0 : 1.15;

    coilAssembly.position.x = THREE.MathUtils.lerp(
      coilRawX,
      coilTasteX,
      formation,
    );

    coilAssembly.position.y = coilCompact ? -0.3 : -0.15;

    glowMaterial.opacity = THREE.MathUtils.lerp(0.18, 0.3, formation);

    if (scrollProgress < 0.5) {
      const amount = smoothstep(0, 0.5, scrollProgress);

      camera.position.lerpVectors(
        cameraPositions.raw,
        cameraPositions.bake,
        amount,
      );

      chart.position.lerpVectors(
        chartPositions.raw,
        chartPositions.bake,
        amount,
      );

      chart.scale.setScalar(0.76 + amount * 0.2);

      chart.rotation.x = -0.58 - amount * 0.45;

      cameraTargetGoal.set(
        -0.2 + amount * 0.5,

        0,

        -1.3 + amount * 0.6,
      );
    } else {
      const amount = smoothstep(0.5, 1, scrollProgress);

      camera.position.lerpVectors(
        cameraPositions.bake,
        cameraPositions.taste,
        amount,
      );

      chart.position.lerpVectors(
        chartPositions.bake,
        chartPositions.taste,
        amount,
      );

      chart.scale.setScalar(
        compact ? 0.94 - amount * 0.05 : 0.96 + amount * 0.08,
      );

      chart.rotation.x = -1.03 + amount * 0.24;

      cameraTargetGoal.set(
        amount * (compact ? 0 : 0.8),

        -0.05,

        -0.7 + amount * 0.7,
      );
    }

    if (selectedIndex >= 0 && scrollProgress > 0.65) {
      const mid = sliceGroups[selectedIndex].userData.mid + chart.rotation.z;

      cameraTargetGoal.x += Math.cos(mid) * 0.45;

      cameraTargetGoal.y += Math.sin(mid) * 0.2;
    }

    cameraTarget.lerp(cameraTargetGoal, reducedMotion ? 1 : 0.08);

    camera.lookAt(cameraTarget);
  }

  /* =======================================================
     PARTICLES
  ======================================================= */

  function updateParticles(time) {
    const positions = particleGeometry.attributes.position.array;

    const settle = smoothstep(0.18, 0.78, formation);

    const driftStrength = (1 - formation) * (reducedMotion ? 0 : 0.24);

    for (let i = 0; i < particleCount; i += 1) {
      const j = i * 3;

      const seed = particleSeeds[i];

      const wobbleX = Math.sin(time * (0.35 + seed) + i) * driftStrength;

      const wobbleY = Math.cos(time * (0.28 + seed) + i * 0.7) * driftStrength;

      const pointerForce = (1 - settle) * (seed - 0.5);

      positions[j] = THREE.MathUtils.lerp(
        particleOrigins[j] + wobbleX + pointer.smoothX * pointerForce,

        particleTargets[j],

        settle,
      );

      positions[j + 1] = THREE.MathUtils.lerp(
        particleOrigins[j + 1] + wobbleY - pointer.smoothY * pointerForce,

        particleTargets[j + 1],

        settle,
      );

      positions[j + 2] = THREE.MathUtils.lerp(
        particleOrigins[j + 2],

        particleTargets[j + 2],

        settle,
      );
    }

    particleGeometry.attributes.position.needsUpdate = true;

    particles.material.opacity = 0.58 - formation * 0.46;
  }

  /* =======================================================
     SLICES UPDATE
  ======================================================= */

  function updateSlices(time) {
    sliceGroups.forEach((group, index) => {
      const data = group.userData;

      const geometryEase = reducedMotion ? 1 : 0.09;

      data.morph = THREE.MathUtils.lerp(
        data.morph,
        data.targetMorph,
        geometryEase,
      );

      const nextStep = Math.round(data.morph * morphStepCount);

      if (nextStep !== data.currentStep) {
        const cached = data.geometryCache[nextStep];

        data.crust.geometry = cached.crust;

        data.frosting.geometry = cached.frosting;

        data.currentStep = nextStep;

        data.mid = (cached.start + cached.end) / 2;

        updateSprinkles(group, cached.start, cached.end);
      }

      const mid = data.mid;

      const focus = data.selected * 0.68 + data.hover * 0.16;

      const assembledX = Math.cos(mid) * focus;

      const assembledY = Math.sin(mid) * focus;

      const rawFactor = 1 - formation;

      const goalX = data.rawOffset.x * rawFactor + assembledX * formation;

      const goalY = data.rawOffset.y * rawFactor + assembledY * formation;

      const goalZ =
        data.rawOffset.z * rawFactor + data.selected * 0.5 * formation;

      const ease = reducedMotion ? 1 : 0.095;

      group.position.x += (goalX - group.position.x) * ease;

      group.position.y += (goalY - group.position.y) * ease;

      group.position.z += (goalZ - group.position.z) * ease;

      const scale = 0.17 + formation * 0.83;

      group.scale.setScalar(scale);

      group.rotation.z =
        rawFactor * (index - 2) * 0.34 +
        (reducedMotion
          ? 0
          : Math.sin(time * 1.2 + index) * 0.002 * data.selected);

      const desiredGlow =
        0.035 +
        data.hover * 0.16 +
        data.selected * 0.24 +
        (1 - formation) * 0.04;

      data.frosting.material.emissiveIntensity +=
        (desiredGlow - data.frosting.material.emissiveIntensity) * ease;
    });

    plate.scale.setScalar(Math.max(0.001, formation));

    plateRing.scale.setScalar(Math.max(0.001, formation));
  }

  /* =======================================================
     RAYCAST
  ======================================================= */

  function updateRaycast() {
    if (formation < 0.72 || dragging || (compact && scrollProgress < 0.66)) {
      showTooltip(-1);

      return;
    }

    raycaster.setFromCamera(pointerNdc, camera);

    const hit = raycaster.intersectObjects(hitTargets, false)[0];

    showTooltip(hit ? hit.object.parent.userData.index : -1);
  }

  function pickSliceAt(clientX, clientY) {
    pointerNdc.set(
      (clientX / innerWidth) * 2 - 1,

      -(clientY / innerHeight) * 2 + 1,
    );

    raycaster.setFromCamera(pointerNdc, camera);

    const hit = raycaster.intersectObjects(hitTargets, false)[0];

    return hit ? hit.object.parent.userData.index : -1;
  }

  /* =======================================================
     ANIMATION
  ======================================================= */

  function scheduleFrame() {
    if (!reducedMotion || rafPending) {
      return;
    }

    rafPending = true;

    requestAnimationFrame(renderFrame);
  }

  function renderFrame() {
    rafPending = false;

    if (!running) {
      if (!reducedMotion) {
        requestAnimationFrame(renderFrame);
      }

      return;
    }

    const time = reducedMotion ? 0 : clock.getElapsedTime();

    pointer.smoothX +=
      (pointer.targetX - pointer.smoothX) * (reducedMotion ? 1 : 0.05);

    pointer.smoothY +=
      (pointer.targetY - pointer.smoothY) * (reducedMotion ? 1 : 0.05);

    world.rotation.y = pointer.smoothX * 0.045;

    world.rotation.x = -pointer.smoothY * 0.025;

    updateCamera();

    updateParticles(time);

    updateSlices(time);

    updateRaycast();

    if (!dragging && !reducedMotion) {
      chart.rotation.z += rotationVelocity;

      rotationVelocity *= 0.94;

      if (Math.abs(rotationVelocity) < 0.00008 && selectedIndex < 0) {
        chart.rotation.z += 0.00055 * formation;
      }
    }

    coreLight.intensity =
      3 +
      smoothstep(0.24, 0.68, scrollProgress) * 20 +
      (reducedMotion ? 0 : Math.sin(time * 4.5) * 1.4);

    rimLight.intensity = 8 + formation * 12;

    bloom.strength =
      (lowPower ? 0.2 : 0.34) +
      smoothstep(0.25, 0.7, scrollProgress) * (lowPower ? 0.12 : 0.28);

    $("#temperature").textContent = `${String(
      Math.round(84 + formation * 136),
    ).padStart(3, "0")}%`;

    composer.render();

    if (!reducedMotion) {
      requestAnimationFrame(renderFrame);
    }
  }

  /* =======================================================
     DEBUG
  ======================================================= */

  window.__aiChartDebug = Object.freeze({
    snapshot: () => ({
      activeDataset,

      selectedIndex,

      formation,

      chartRotation: chart.rotation.z,

      rotationVelocity,

      morphs: sliceGroups.map(({ userData }) => ({
        value: userData.morph,

        step: userData.currentStep,

        target: userData.targetMorph,
      })),
    }),
  });

  /* =======================================================
     AUDIO
  ======================================================= */

  function playSelectionTone(index) {
    if (!audio || index < 0) {
      return;
    }

    const oscillator = audio.context.createOscillator();

    const gain = audio.context.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value = 185 + index * 38;

    gain.gain.setValueAtTime(0.035, audio.context.currentTime);

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.context.currentTime + 0.28,
    );

    oscillator.connect(gain).connect(audio.master);

    oscillator.start();

    oscillator.stop(audio.context.currentTime + 0.3);
  }

  async function toggleSound() {
    const button = $("#sound-toggle");

    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context = new AudioContext();

      const master = context.createGain();

      master.gain.value = 0.38;

      master.connect(context.destination);

      const hum = context.createOscillator();

      const humGain = context.createGain();

      const lfo = context.createOscillator();

      const lfoGain = context.createGain();

      hum.type = "sine";

      hum.frequency.value = 47;

      humGain.gain.value = 0.045;

      lfo.frequency.value = 0.18;

      lfoGain.gain.value = 4;

      lfo.connect(lfoGain).connect(hum.frequency);

      hum.connect(humGain).connect(master);

      hum.start();

      lfo.start();

      audio = {
        context,
        master,
        humGain,
        enabled: true,
      };
    } else {
      await audio.context.resume();

      audio.enabled = !audio.enabled;

      audio.master.gain.setTargetAtTime(
        audio.enabled ? 0.38 : 0,

        audio.context.currentTime,

        0.08,
      );
    }

    button.setAttribute("aria-pressed", String(audio.enabled));

    button.setAttribute(
      "aria-label",

      audio.enabled
        ? "Turn ambient system sound off"
        : "Turn ambient system sound on",
    );

    button.querySelector("span").textContent = audio.enabled
      ? "SOUND ON"
      : "SOUND OFF";
  }

  /* =======================================================
     RESIZE
  ======================================================= */

  function resize() {
    camera.aspect = innerWidth / innerHeight;

    camera.updateProjectionMatrix();

    renderer.setPixelRatio(Math.min(devicePixelRatio, lowPower ? 1.25 : 1.75));

    renderer.setSize(innerWidth, innerHeight);

    composer.setSize(innerWidth, innerHeight);

    scheduleFrame();
  }

  /* =======================================================
     INITIALIZE
  ======================================================= */

  buildAccessibleData();

  updateLegend();

  updateScroll();

  /* =======================================================
     SCROLL
  ======================================================= */

  addEventListener("scroll", updateScroll, {
    passive: true,
  });

  addEventListener("resize", resize);

  /* =======================================================
     POINTER
  ======================================================= */

  addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;

      pointer.y = event.clientY;

      pointer.targetX = event.clientX / innerWidth - 0.5;

      pointer.targetY = event.clientY / innerHeight - 0.5;

      pointerNdc.set(
        (event.clientX / innerWidth) * 2 - 1,

        -((event.clientY / innerHeight) * 2 - 1),
      );

      dragCursor.style.transform = `translate(
          ${event.clientX - dragCursor.offsetWidth / 2}px,
          ${event.clientY - dragCursor.offsetHeight / 2}px
        )`;

      if (dragging) {
        const now = performance.now();

        const deltaX = event.clientX - lastDragX;

        chart.rotation.z =
          dragStartRotation + (event.clientX - dragStartX) * 0.006;

        rotationVelocity = (deltaX / Math.max(12, now - lastDragTime)) * 0.08;

        lastDragX = event.clientX;

        lastDragTime = now;
      }

      tooltip.style.left = `${event.clientX}px`;

      tooltip.style.top = `${event.clientY}px`;

      scheduleFrame();
    },
    {
      passive: true,
    },
  );

  /* =======================================================
     CANVAS POINTER
  ======================================================= */

  canvas.addEventListener("pointerenter", () =>
    document.body.classList.add("can-drag"),
  );

  canvas.addEventListener("pointerleave", () => {
    document.body.classList.remove("can-drag", "is-dragging");

    dragging = false;

    showTooltip(-1);
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (formation < 0.55) {
      return;
    }

    dragging = true;

    dragStartX = lastDragX = event.clientX;

    dragStartRotation = chart.rotation.z;

    lastDragTime = performance.now();

    rotationVelocity = 0;

    canvas.setPointerCapture(event.pointerId);

    document.body.classList.add("is-dragging");
  });

  canvas.addEventListener("pointerup", (event) => {
    const moved = Math.abs(event.clientX - dragStartX);

    dragging = false;

    document.body.classList.remove("is-dragging");

    if (moved < 7 && formation >= 0.72) {
      const hitIndex = pickSliceAt(event.clientX, event.clientY);

      if (hitIndex >= 0) {
        selectSlice(selectedIndex === hitIndex ? -1 : hitIndex);
      }
    }

    scheduleFrame();
  });

  /* =======================================================
     KEYBOARD
  ======================================================= */

  canvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === "Escape") {
      return selectSlice(-1);
    }

    if (event.key === "Enter") {
      return selectSlice(selectedIndex < 0 ? 0 : selectedIndex);
    }

    const step = event.key === "ArrowRight" ? 1 : -1;

    selectSlice(
      (selectedIndex < 0 ? 0 : selectedIndex + step + FLAVORS.length) %
        FLAVORS.length,
    );
  });

  /* =======================================================
     BUTTONS
  ======================================================= */

  const enterButton = $("#enter-button");

  if (enterButton) {
    enterButton.addEventListener("click", () => {
      const target = $("#distribution") || $("#bake");

      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    });
  }

  const analysisClose = $("#analysis-close");

  if (analysisClose) {
    analysisClose.addEventListener("click", () => selectSlice(-1));
  }

  const soundToggle = $("#sound-toggle");

  if (soundToggle) {
    soundToggle.addEventListener("click", toggleSound);
  }

  $$(".dataset-switch button").forEach((button) => {
    button.addEventListener("click", () =>
      switchDataset(button.dataset.dataset),
    );
  });

  /* =======================================================
     CHAPTER NAVIGATION
  ======================================================= */

  $$(".chapter-rail button").forEach((button) => {
    button.addEventListener("click", () => {
      const targets = [
        $("#overview") || $("#raw"),

        $("#distribution") || $("#bake"),

        $("#insights") || $("#taste"),
      ];

      const target = targets[Number(button.dataset.chapter)];

      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    });
  });

  /* =======================================================
     VISIBILITY
  ======================================================= */

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;

    if (running) {
      scheduleFrame();
    }
  });

  /* =======================================================
     WEBGL CONTEXT LOSS
  ======================================================= */

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();

    running = false;

    document.body.classList.add("scene-fallback");

    const fallbackText = $("#fallback span");

    if (fallbackText) {
      fallbackText.textContent =
        "The graphics context was lost. Reload the page to restart the AI visualization.";
    }
  });

  /* =======================================================
     READY
  ======================================================= */

  document.body.classList.remove("scene-fallback");

  document.body.classList.add("app-ready");

  if (typeof window.finishPreheating === "function") {
    window.finishPreheating(false);
  }

  renderFrame();
}

/* =========================================================
   START
========================================================= */

try {
  startExperience();
} catch (error) {
  console.error("The AI Data Visualization could not start:", error);

  document.body.classList.add("scene-fallback");

  if (typeof window.finishPreheating === "function") {
    window.finishPreheating(true);
  }
}
