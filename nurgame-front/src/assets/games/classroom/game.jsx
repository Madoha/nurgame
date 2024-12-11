import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Smooth camera movement
const smoothCameraMove = (from, to, duration = 1000) => {
    new TWEEN.Tween(from)
        .to(to, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            camera.position.set(from.x, from.y, from.z);
        })
        .start();
};

// Initialize scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Create building (stub for future design)
const createBuilding = () => {
    const building = new THREE.Group();
    return building;
};
const university = createBuilding();
scene.add(university);

// Load professor model
const loadProfessorModel = (filePath, scale = 1, position = [0, 0, 0]) => {
    const loader = new TDSLoader();
    const professorGroup = new THREE.Group();
    professorGroup.position.set(...position); // Set position of the professor

    loader.load(
        filePath,
        (object) => {
            object.scale.set(scale, scale, scale);
            object.rotation.y = -Math.PI;
            object.rotation.x = Math.PI / 2;

            professorGroup.add(object);
            scene.add(professorGroup); // Add professor group to the scene
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
        }
    );

    return professorGroup; // Return the professor group
};

const professor = loadProfessorModel('models/Teacher.3ds', 1.7, [-14, 2.3, 25]);

// Load classroom
const loadClassroomModel = (filePath, scale = [1, 1, 1], position = [0, 0, 0]) => {
    const loader = new FBXLoader();
    loader.load(
        filePath,
        (object) => {
            object.scale.set(...scale);
            object.position.set(...position);
            scene.add(object);
        },
        undefined,
        (error) => console.error('Error loading classroom model:', error)
    );
};
loadClassroomModel('models/classroom.fbx', [0.05, 0.04, 0.1], [2, 0, 0]);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.object);

document.addEventListener('click', () => {
    controls.lock(); // Lock the pointer on click
});

controls.addEventListener('lock', () => {
    console.log('Pointer locked');
});
controls.addEventListener('unlock', () => {
    console.log('Pointer unlocked');
});

// Movement variables
const speed = 0.1;
const keys = {};
document.addEventListener('keydown', (event) => (keys[event.key] = true));
document.addEventListener('keyup', (event) => (keys[event.key] = false));

// Dialog system
const dialogBox = document.getElementById('dialog');
const npcTextElement = document.getElementById('npc-text');
const npcNameElement = document.getElementById('npc-name');
const choicesList = document.getElementById('choices');

let score = 0; // Изначально 0, если коррупция обнаружена

const corruptionDialog = [
  { 
    npc: 'Professor', 
    text: 'Здравствуйте, студент. Как идут дела с вашим проектом? Вы ведь знаете, что сроки поджимают...', 
    choices: [
      { text: '1. Всё в порядке, я справляюсь.', next: 1, scoreChange: 1  }, 
      { text: '2. Мне нужно больше времени, чтобы всё завершить.', next: 2, scoreChange: 0 },
      { text: '3. Я боюсь, что не успею... Нужно что-то предпринять.', next: 3, scoreChange: 0 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Хорошо, я рад это слышать. Но помните, что сроки не ждут. Вам нужно работать быстрее.', 
    choices: [
      { text: '1. Я предпочитаю не торопиться, результат важнее.', next: 4, scoreChange: 1 },
      { text: '2. Что вы предлагаете? Как быстрее закончить?', next: 5, scoreChange: 0 },
      { text: '3. Я не уверен, что готов на такие компромиссы.', next: 6, scoreChange: 1 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Понимаю ваше сомнение, но иногда нужно пойти на компромиссы, чтобы получить результат. Вы хотите продолжить с этим проектом?', 
    choices: [
      { text: '1. Я думаю, да. Сколько это будет стоить?', next: 7, scoreChange: 0 },
      { text: '2. Думаю, я справлюсь без помощи.', next: 8, scoreChange: 1 },
      { text: '3. Мне нужно подумать, но времени мало...', next: 9, scoreChange: 0 },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Хорошо, я понимаю, что вам трудно решить. Но не забывайте: иногда нужно идти на жертвы, чтобы получить то, что важно.', 
    choices: [
      { text: '1. Согласен, но это не кажется правильным.', next: 10, scoreChange: 0 },
      { text: '2. Хорошо, давайте попробуем это.', next: 11, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' }, // Коррупция
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы должны понять, что многие успешные люди прошли через это. Я уверен, что если вы примете моё предложение, вы получите желаемое быстрее.', 
    choices: [
      { text: '1. Я верю вам, но мне нужно больше времени для размышлений.', next: 13, scoreChange: 1, alert: 'Вы выбрали верный исход!' },
      { text: '2. Возможно, вы правы. Я попробую.', next: 14, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' }, // Коррупция
      { text: '3. Я не готов соглашаться.', next: 15, scoreChange: 1, alert: 'Вы выбрали верный исход!' },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Понимаю, что для вас это непросто, но вы ведь не хотите, чтобы этот проект стал причиной вашего провала, верно?', 
    choices: [
      { text: '1. Я не хочу провала. Я сделаю всё, что нужно.', next: 18, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Возможно, я не готов рисковать своей репутацией.', next: 19, scoreChange: 1, alert: 'Вы выбрали верный исход!'  },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы ведь уже сделали первый шаг. Теперь важно не останавливаться. Если вы не хотите оказаться в положении, где время вышло, вам стоит принять помощь.', 
    choices: [
      { text: '1. Хорошо, давайте продолжим, я готов к этому.', next: 20, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Я всё ещё не уверен, что это правильный выбор.', next: 21, scoreChange: 1, scoreChange: 1, alert: 'Вы выбрали верный исход!'  },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Не беспокойтесь, студент. Я вам не помешаю. Я здесь, чтобы помочь вам закончить проект вовремя. Давайте сделаем это вместе.', 
    choices: [
      { text: '1. Спасибо, профессор. Я благодарен за помощь.', next: 22, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Я не знаю, профессор, всё слишком сложно.', next: 23, scoreChange: 1, alert: 'Вы выбрали верный исход!'  },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Вы будете благодарны мне позже. Я уверен, что вам это будет полезно, как и всем тем, кто когда-либо сделал такой выбор.', 
    choices: [
      { text: '1. Хорошо, давайте продолжим.', next: 24, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Я сомневаюсь в этом, но сделаю, что нужно.', next: 25, scoreChange: 1, alert: 'Вы выбрали верный исход!' },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Я хочу, чтобы вы понимали: этот проект — это ваша визитная карточка. Если вы не примете мою помощь, вы рискуете не успеть вовремя.', 
    choices: [
      { text: '1. Я знаю. Спасибо, что помогаете, я в деле.', next: 26, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Мне нужно подумать ещё немного.', next: 27, scoreChange: 1, alert: 'Вы выбрали верный исход!'  },
    ] 
  },
  { 
    npc: 'Professor', 
    text: 'Время не ждёт, студент. Каждый момент важен. Ваш проект требует вашего внимания, и я могу помочь вам с этим.', 
    choices: [
      { text: '1. Спасибо за предложение. Я продолжу работать так как вы скажете.', next: 28, scoreChange: 0, alert: 'К сожалению вы выбрали путь коррупционера' },
      { text: '2. Нет, я должен сделать это сам.', next: 29, scoreChange: 1, alert: 'Вы выбрали верный исход!'  },
    ] 
  }
];

// Функция для обработки выбора
const handleChoice = (choice) => {
  if (choice.alert) {
    alert(choice.alert); // Показываем сообщение alert, если оно есть
  }
  
  if (choice.scoreChange !== undefined) {
      score = choice.scoreChange; // Изменяем score, если есть соответствующее значение
  }

  displayDialog(choice.next); // Переход к следующему этапу диалога
};


let isDialogOpen = false;
let canMove = true; // Flag to control player movement

const displayDialog = (index = 0) => {
  const dialogEntry = corruptionDialog[index];
  if (!dialogEntry) {
      closeDialog();
      return;
  }

  // Установка текста и вариантов выбора
  npcNameElement.innerText = dialogEntry.npc;
  npcTextElement.innerText = dialogEntry.text;
  choicesList.innerHTML = '';

  // Показ курсора и разблокировка указателя
  document.exitPointerLock();
  document.body.style.cursor = 'auto'; // Сделать курсор видимым
  
  dialogEntry.choices.forEach((choice) => {
      const choiceItem = document.createElement('li');
      choiceItem.innerText = choice.text;
      choiceItem.style.cursor = 'pointer'; // Добавляем видимый курсор
      choiceItem.addEventListener('click', () => {
        handleChoice(choice);
      });
      choicesList.appendChild(choiceItem);
  });

  dialogBox.style.display = 'block';
  isDialogOpen = true;
  canMove = false; // Блокируем движение игрока во время диалога
  console.log(score)
};

const displayScore = () => {
  console.log('Итоговый счет:', score);
};

const closeDialog = () => {
  dialogBox.style.display = 'none';
  isDialogOpen = false;
  canMove = true; // Разблокируем движение игрока
  // Не скрываем курсор здесь, чтобы он оставался видимым
};

// Player movement logic
camera.position.set(0, 7, 5); // Initial position for first-person view
camera.lookAt(0, 7, 0); // Ensure camera looks forward

const movePlayer = () => {
  if (!canMove) return; // Блокируем движение при открытом диалоге

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0; // Убираем вертикальное движение
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, camera.up).normalize();

  if (keys['w']) {
      controls.object.position.addScaledVector(direction, speed);
  }
  if (keys['s']) {
      controls.object.position.addScaledVector(direction, -speed);
  }
  if (keys['a']) {
      controls.object.position.addScaledVector(right, -speed);
  }
  if (keys['d']) {
      controls.object.position.addScaledVector(right, speed);
  }
};


// Function to check the distance between the player and the professor
const professorPosition = new THREE.Vector3(-14, 2.3, 25); // Position of the professor
const dialogActivationDistance = 5; // Distance to activate dialog

const checkPlayerDistance = () => {
  const playerPosition = controls.object.position;
  const distance = playerPosition.distanceTo(professorPosition);

  if (distance < dialogActivationDistance && !isDialogOpen) {
      displayDialog(0); // Если близко, открыть диалог
  }
};


// Animate scene
const animate = () => {
    requestAnimationFrame(animate);
    movePlayer();
    checkPlayerDistance(); // Check distance to professor
    TWEEN.update();
    renderer.render(scene, camera);
};

// Trigger the dialog with 'e' key when not in a dialog
// Добавить обработку клавиши "E" для открытия диалога
document.addEventListener('keydown', (event) => {
  if (event.key === 'e' && !isDialogOpen) {
      displayDialog(0); // Открываем диалог
  } else if (event.key === 'Escape' && isDialogOpen) {
      closeDialog(); // Закрываем диалог
  }
});
// Добавить обработчик на разблокировку и блокировку указателя
controls.addEventListener('lock', () => {
  console.log('Pointer locked');
  document.body.style.cursor = 'none';
});
controls.addEventListener('unlock', () => {
  console.log('Pointer unlocked');
  document.body.style.cursor = 'auto';
});

// Start animation
animate();