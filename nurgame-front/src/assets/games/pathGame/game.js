import * as THREE from 'three';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';


const smoothCameraMove = (from, to, duration = 1000) => {
  new TWEEN.Tween(from)
    .to(to, duration)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
      camera.position.set(from.x, from.y, from.z);
    })
    .start();
};



// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Create the university building
const createBuilding = () => {
  const building = new THREE.Group();
  return building;
};

const university = createBuilding();
scene.add(university);

// Create player (a simple cube)
const playerGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 3, 5);
scene.add(player);



// Вместо стандартной настройки controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Для плавности
controls.dampingFactor = 0.25; // Уменьшите значение для увеличения плавности
controls.screenSpacePanning = false; // Запретить панорамирование камеры
controls.maxDistance = 20; // Максимальная дистанция камеры
controls.minDistance = 5; // Минимальная дистанция камеры

// Обновление камеры
controls.enableRotate = true; // Включить вращение камеры сразу
controls.enablePan = true; // Включить панорамирование сразу
controls.enableZoom = true; // Включить зум сразу

// Вызов при фокусе на NPC
let focusCameraOnNPC = (npc) => {
  const boundingBox = new THREE.Box3().setFromObject(npc);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  const offset = Math.max(size.x, size.y, size.z) * 2;
  smoothCameraMove(camera.position, { x: center.x + offset, y: center.y + offset, z: center.z + offset });
  camera.lookAt(center);
};

// Убираем необходимость нажимать ЛКМ
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,  // Вращение на ЛКМ
  MIDDLE: THREE.MOUSE.DOLLY, // Масштабирование на колесико
  RIGHT: THREE.MOUSE.PAN     // Панорамирование на ПКМ
};




// NPCs
const loadProfessorModel = (filePath, scale = 1, position = [0, 0, 0]) => {
  const loader = new TDSLoader();
  const professorGroup = new THREE.Group();
  professorGroup.position.set(...position); // Задайте позицию группе

  loader.load(
    filePath,
    (object) => {
      object.scale.set(scale, scale, scale);
      object.rotation.y = -Math.PI;
      object.rotation.x = Math.PI / 2;

      professorGroup.add(object);
      scene.add(professorGroup); // Добавляем группу в сцену
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );

  return professorGroup; // Возвращаем группу
};


// Add the classroom model
const classroomBoundingBox = new THREE.Box3(); // Для границ модели

const loadClassroomModel = (filePath, scale = [1, 1, 1], position = [0, 0, 0]) => {
  const loader = new FBXLoader(); // Создаем экземпляр FBXLoader
  loader.load(
    filePath,
    (object) => {
      object.scale.set(...scale); // Применяем масштаб
      object.position.set(...position); // Применяем позицию
      scene.add(object);

      // Рассчитать границы classroom модели
      classroomBoundingBox.setFromObject(object);
    },
    undefined,
    (error) => {
      console.error('Error loading classroom model:', error);
    }
  );
};


const checkPlayerBounds = () => {
  // Create a bounding box for the player
  const playerBoundingBox = new THREE.Box3().setFromObject(player);

  // Check for collisions with the walls
  for (let i = 0; i < universityWalls.length; i++) {
    const wall = universityWalls[i];

    // If the player's bounding box intersects with the wall, prevent movement
    if (playerBoundingBox.intersectsBox(wall)) {
      // Prevent movement based on the direction of input
      if (keys['w']) player.position.z += speed; // Forward
      if (keys['s']) player.position.z -= speed; // Backward
      if (keys['a']) player.position.x += speed; // Left
      if (keys['d']) player.position.x -= speed; // Right

      break; // Exit the loop after a collision is detected to prevent further checks
    }
  }
};


const createWall = (width, height, depth, position, rotation = new THREE.Euler(0, 0, 0)) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(...position);
  wall.rotation.set(...rotation);
  return wall;
};

const createCube = () => {
  const walls = [];

  // Создаем 6 стен
  walls.push(createWall(65, 10, 1, [0, 5, 37], new THREE.Euler(0, Math.PI, 0))); // Правая стена
  walls.push(createWall(34, 10, 1, [6.5, 5, -37], new THREE.Euler(0, Math.PI, 0))); // Левая стена
  walls.push(createWall(1, 10, 74, [-17, 5, 0], new THREE.Euler(0, 0, 0))); // Нижняя стена
  walls.push(createWall(1, 10, 74, [30, 5, 0], new THREE.Euler(0, 0, 0))); // Верхняя стена


  walls.forEach(wall => scene.add(wall)); // Добавляем стены в сцену
};

// Вызываем функцию для создания куба
createCube();

const universityWalls = [
  new THREE.Box3(new THREE.Vector3(-17, 0, 37), new THREE.Vector3(30, 10, 35)),  // Right wall
  new THREE.Box3(new THREE.Vector3(30, 0, 35), new THREE.Vector3(30, 10, -37)),  // Left wall
  new THREE.Box3(new THREE.Vector3(30, 0, -37), new THREE.Vector3(-17, 10, -37)), // Bottom wall
  new THREE.Box3(new THREE.Vector3(-17, 0, -37), new THREE.Vector3(-17, 10, 37))  // Top wall
];


loadClassroomModel('models/classroom.fbx', [0.05, 0.04, 0.1], [2, 0, 0]);
 // Path to your classroom.fbx model

const professor = loadProfessorModel('models/Teacher.3ds', 1.7, [-14, 2.3, 25]);

// Movement variables
const speed = 0.1;
const keys = {};

// Event listeners for player movement
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
  if (event.key === 'Escape' && isDialogOpen) {
    closeDialog(); // Close dialog on Escape key
  }
});
document.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

// Dialog box and interaction
const dialogBox = document.getElementById('dialog');
let isDialogOpen = false;

// Corruption dialog logic
const corruptionDialog = [
  { 
    npc: 'Professor', 
    text: 'Здравствуйте, студент. Как идут дела с вашим проектом? Вы ведь знаете, что сроки поджимают...', 
    choices: [
      { text: '1. Всё в порядке, я справляюсь.', next: 1, alert: "ты еблан"},
      { text: '2. Мне нужно больше времени, чтобы всё завершить.', next: 2 },
      { text: '3. Я боюсь, что не успею... Нужно что-то предпринять.', next: 3 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Ну что же, вам нужно работать быстрее. Сроки не ждут. Вы ведь знаете, что иногда нужно пойти на компромиссы, чтобы получить результат?', 
    choices: [
      { text: '1. Я предпочитаю не торопиться, результат важнее.', next: 4 },
      { text: '2. Что вы предлагаете? Как быстрее закончить?', next: 5 },
      { text: '3. Я не уверен, что готов на такие компромиссы.', next: 6 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Понимаю ваше сомнение, но помните, что без «маленькой помощи» не получится достичь больших успехов. Вы хотите продолжить с этим проектом?', 
    choices: [
      { text: '1. Я думаю, да. Сколько это будет стоить?', next: 7 },
      { text: '2. Думаю, я справлюсь без помощи.', next: 8 },
      { text: '3. Мне нужно подумать, но времени мало...', next: 9 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Хорошо, я понимаю, что вам трудно решить. Но не забывайте: иногда нужно идти на жертвы, чтобы получить то, что важно. Например 5000 спасибочек', 
    choices: [
      { text: '1. Согласен, но это не кажется правильным.', next: 12, alert: "ТИГР БЛЯ" },
      { text: '2. Хорошо, давайте попробуем это.', next: 13,   alert: "ты еблан"   },
      { text: '3. Я по-прежнему сомневаюсь.', next: 14, alert: "ТИГР БЛЯ"},
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы должны понять, что многие успешные люди прошли через это. Я уверен, что если вы примете моё предложение, вы получите желаемое быстрее.', 
    choices: [
      { text: '1. Я верю вам, но мне нужно больше времени для размышлений.', next: 15 },
      { text: '2. Возможно, вы правы. Я попробую.', next: 16 },
      { text: '3. Я не готов соглашаться.', next: 17 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Помните, студент, что вся ваша будущая карьера зависит от того, как вы справляетесь с такими моментами. Это не всегда легко, но оно того стоит.', 
    choices: [
      { text: '1. Я согласен, нужно быть готовым к таким моментам.', next: 18 },
      { text: '2. Я не знаю, если могу на это пойти.', next: 19 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Понимаю, что для вас это непросто, но вы ведь не хотите, чтобы этот проект стал причиной вашего провала, верно?', 
    choices: [
      { text: '1. Я не хочу провала. Я сделаю всё, что нужно.', next: 20 },
      { text: '2. Возможно, я не готов рисковать своей репутацией.', next: 21 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы ведь уже сделали первый шаг. Теперь важно не останавливаться. Если вы не хотите оказаться в положении, где время вышло, вам стоит принять помощь.', 
    choices: [
      { text: '1. Хорошо, давайте продолжим, я готов к этому.', next: 22 },
      { text: '2. Я всё ещё не уверен, что это правильный выбор.', next: 23 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Не беспокойтесь, студент. Я вам не помешаю. Я здесь, чтобы помочь вам закончить проект вовремя. Давайте сделаем это вместе.', 
    choices: [
      { text: '1. Спасибо, профессор. Я благодарен за помощь.', next: 24, alert: "ты еблан" }, // Вывод alert, если согласился
      { text: '2. Я не знаю, профессор, всё слишком сложно.', next: 25, alert: "ТИГР БЛЯ" }, // Вывод alert, если не согласился
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы будете благодарны мне позже. Я уверен, что вам это будет полезно, как и всем тем, кто когда-либо сделал такой выбор.', 
    choices: [
      { text: '1. Хорошо, давайте продолжим.', next: 26, alert: "ты еблан" }, // Вывод alert, если согласился
      { text: '2. Я сомневаюсь в этом, но сделаю, что нужно.', next: 27, alert: "ТИГР БЛЯ" }, // Вывод alert, если не согласился
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Я хочу, чтобы вы понимали: этот проект — это ваша визитная карточка. Если вы не примете мою помощь, вы рискуете не успеть вовремя.', 
    choices: [
      { text: '1. Я знаю. Спасибо, что помогаете.', next: 28, alert: "ты еблан" }, // Вывод alert, если согласился
      { text: '2. Мне нужно подумать ещё немного.', next: 29, alert: "ТИГР БЛЯ" }, // Вывод alert, если не согласился
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Время не ждёт, студент. Каждый момент важен. Ваш проект требует вашего внимания, и я могу помочь вам с этим.', 
    choices: [
      { text: '1. Спасибо за предложение. Я продолжу работать.', next: 30, alert: "ты еблан" }, // Вывод alert, если согласился
      { text: '2. Нет, я должен сделать это сам.', next: 31, alert: "ТИГР БЛЯ" }, // Вывод alert, если не согласился
    ] 
  }
];


// Display dialog and choices
const displayDialog = (index = 0) => {
  const dialogEntry = corruptionDialog[index];
  
  if (!dialogEntry) {
    console.error(`No dialog entry found for index ${index}`);
    closeDialog(); // Close dialog if no entry found
    return;
  }
  
  const npcTextElement = document.getElementById('npc-text');
  const npcNameElement = document.getElementById('npc-name');
  const choicesList = document.getElementById('choices');
  
  npcTextElement.innerText = dialogEntry.text;
  npcNameElement.innerText = dialogEntry.npc;
  choicesList.innerHTML = ''; // Clear old choices

  if (dialogEntry.choices && dialogEntry.choices.length > 0) {
    dialogEntry.choices.forEach((choice) => {
      const choiceItem = document.createElement('li');
      choiceItem.className = 'choice';
      choiceItem.innerText = choice.text;

      // Handle choice click
      choiceItem.onclick = () => {
        if (choice.alert) {
          alert(choice.alert); // Show alert if present
        }
        
        if (choice.next !== undefined) {
          displayDialog(choice.next); // Go to the next dialogue stage
        } else {
          closeDialog(); // Close the dialog if there are no more stages
        }
      };

      choicesList.appendChild(choiceItem);
    });
  } else {
    // If no choices, add a close option
    const closeItem = document.createElement('li');
    closeItem.className = 'choice';
    closeItem.innerText = 'Закрыть';
    closeItem.onclick = closeDialog;

    choicesList.appendChild(closeItem);
  }
};



// Function to open dialog
const openDialog = (npcText, npcName, npc) => {
  const dialogBox = document.getElementById('dialog');
  const npcTextElement = document.getElementById('npc-text');
  const npcNameElement = document.getElementById('npc-name');

  console.log(dialogBox, npcTextElement, npcNameElement); // Debugging log

  npcTextElement.innerText = npcText;
  npcNameElement.innerText = npcName;

  // Show the dialog box
  dialogBox.style.display = 'block';
  isDialogOpen = true;

  // Focus camera on NPC
  focusCameraOnNPC(npc);
};








// Function to return camera to player
// Обновление настроек OrbitControls
controls.maxDistance = 8;  // Уменьшаем максимальное расстояние камеры
controls.minDistance = 5;   // Минимальное расстояние камеры

// Плавное возвращение камеры к игроку
const returnCameraToPlayer = () => {
  const offset = new THREE.Vector3(0, 3, 10);  // Small offset from player
  camera.position.set(player.position.x + offset.x, player.position.y + offset.y + 4, player.position.z + offset.z);
  camera.lookAt(player.position);
};


// Check for player-NPC interaction
const checkInteraction = () => {
  if (!professor) return; // Ensure professor is loaded

  const distance = player.position.distanceTo(professor.position);

if (distance < 3 && !isDialogOpen) {
  openDialog('Здравствуйте, студент. Как идут дела с вашим проектом?', 'Professor', professor);
  setTimeout(() => {
    displayDialog(0); // Start the dialog sequence
    isDialogOpen = true;
  }, 500);
}

};

const updatePlayerMovement = () => {
  const forward = new THREE.Vector3(); // Forward vector from camera
  const right = new THREE.Vector3();   // Right vector from camera

  // Get the camera direction and update movement vectors
  camera.getWorldDirection(forward);
  forward.y = 0; 
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0)); // Right vector perpendicular to forward
  

  // Normalize vectors to ensure consistent movement speed
  forward.normalize();
  right.normalize();

  const playerSpeed = 0.1;
  const moveDirection = new THREE.Vector3(); // To accumulate movement direction

  if (keys['w']) moveDirection.add(forward); // Move forward
  if (keys['s']) moveDirection.add(forward.negate()); // Move backward
  if (keys['a']) moveDirection.add(right.negate()); // Move left
  if (keys['d']) moveDirection.add(right); // Move right

  moveDirection.normalize().multiplyScalar(playerSpeed);

  // Update player position based on movement direction
  const targetPosition = player.position.clone().add(moveDirection);

  // Check for collision before moving
  const playerBoundingBox = new THREE.Box3().setFromObject(player);
  let collided = false;

  for (let i = 0; i < universityWalls.length; i++) {
    const wall = universityWalls[i];

    if (playerBoundingBox.intersectsBox(wall)) {
      collided = true;
      break; // Stop further checks if a collision is detected
    }
    player.position.y = 3;
  }

  // If a collision was detected, move player next to the professor
  if (collided) {
    player.position.set(-14, 2.3, 25); // Adjust as needed
  } else {
    // If no collision, move the player
    player.position.add(moveDirection);
  }
};





// Game loop
const animate = () => {
  requestAnimationFrame(animate);
  checkInteraction();
  if (!isDialogOpen) {
    updatePlayerMovement(); // Логика движения игрока
  }
  controls.target.set(player.position.x, player.position.y, player.position.z); // Центр вращения — игрок
  controls.update();
  TWEEN.update();
  renderer.render(scene, camera);
};


animate();