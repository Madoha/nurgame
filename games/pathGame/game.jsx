import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// Инициализация сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Загрузка окружения space.glb
const loader = new GLTFLoader();
loader.load(
  'models/space.glb',
  (gltf) => {
    const environment = gltf.scene;
    environment.scale.set(600, 100, 500);
    environment.position.set(-850, 100, 300);
    scene.add(environment);
  },
  undefined,
  (error) => {
    console.error('Ошибка загрузки окружения:', error);
  }
);

// Загрузка города под платформой
loader.load(
  'models/city.glb', 
  (gltf) => {
    const city = gltf.scene;
    city.scale.set(1, 1, 1);
    city.position.set(0, -100, 0);
    scene.add(city);
  },
  undefined,
  (error) => {
    console.error('Ошибка загрузки города:', error);
  }
);

// Материалы
const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ffffff,
  transparent: true,
  opacity: 0.5,
  reflectivity: 0.7,
  metalness: 0.1,
  roughness: 0.1,
});

const pathMaterial = new THREE.MeshStandardMaterial({
  color: 0x4287f5,
  transparent: true,
  opacity: 0.6,
});

// Основная платформа
const platformSize = 20;
const platformGeometry = new THREE.BoxGeometry(platformSize, 1, platformSize);
const platform = new THREE.Mesh(platformGeometry, glassMaterial);
platform.position.set(0, 0, 0);
scene.add(platform);

// Создание путей и платформ ответов
const createAnswerPath = (direction, distance) => {
  // Путь
  const pathGeometry = new THREE.BoxGeometry(4, 1, distance);
  const path = new THREE.Mesh(pathGeometry, pathMaterial);
  
  // Платформа ответа
  const answerPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(10, 1, 10),
    glassMaterial
  );
  
  // Позиционирование в зависимости от направления
  if (direction === 'north') {
    path.position.set(0, 0, -(platformSize/2 + distance/2));
    answerPlatform.position.set(0, 0, -(platformSize/2 + distance));
  } else if (direction === 'south') {
    path.position.set(0, 0, platformSize/2 + distance/2);
    answerPlatform.position.set(0, 0, platformSize/2 + distance);
  } else if (direction === 'east') {
    path.rotation.y = Math.PI / 2;
    path.position.set(platformSize/2 + distance/2, 0, 0);
    answerPlatform.position.set(platformSize/2 + distance, 0, 0);
  } else if (direction === 'west') {
    path.rotation.y = Math.PI / 2;
    path.position.set(-(platformSize/2 + distance/2), 0, 0);
    answerPlatform.position.set(-(platformSize/2 + distance), 0, 0);
  }
  
  scene.add(path);
  scene.add(answerPlatform);
  return answerPlatform;
};

// Создание четырех путей
const pathDistance = 30;
const northPlatform = createAnswerPath('north', pathDistance);
const southPlatform = createAnswerPath('south', pathDistance);
const eastPlatform = createAnswerPath('east', pathDistance);
const westPlatform = createAnswerPath('west', pathDistance);

// Игрок
camera.position.set(0, 2, 5);
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// Управление мышью
document.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => console.log('Pointer locked'));
controls.addEventListener('unlock', () => console.log('Pointer unlocked'));

// Переменные для управления движением
const keys = {};
const speed = 0.1;
let isFalling = false;

document.addEventListener('keydown', (event) => (keys[event.key.toLowerCase()] = true));
document.addEventListener('keyup', (event) => (keys[event.key.toLowerCase()] = false));

// Проверка нахождения на платформе
const isPlayerOnPlatform = () => {
  const pos = controls.getObject().position;

  // Главная платформа
  if (Math.abs(pos.x) <= platformSize / 2 && Math.abs(pos.z) <= platformSize / 2) {
      console.log("Игрок на главной платформе");
      return 'main';
  }

  // Платформы ответов
  if (Math.abs(pos.x) <= 5 && Math.abs(pos.z + pathDistance) <= 5) {
      console.log("Игрок на северной платформе");
      return 'north';
  }
  if (Math.abs(pos.x) <= 5 && Math.abs(pos.z - pathDistance) <= 5) {
      console.log("Игрок на южной платформе");
      return 'south';
  }
  if (Math.abs(pos.x - pathDistance) <= 5 && Math.abs(pos.z) <= 5) {
      console.log("Игрок на восточной платформе");
      return 'east';
  }
  if (Math.abs(pos.x + pathDistance) <= 5 && Math.abs(pos.z) <= 5) {
      console.log("Игрок на западной платформе");
      return 'west';
  }

  // Пути
  if (Math.abs(pos.x) <= 2 && pos.z <= 0 && pos.z >= -pathDistance) {
      return 'northPath';
  }
  if (Math.abs(pos.x) <= 2 && pos.z >= 0 && pos.z <= pathDistance) {
      return 'southPath';
  }
  if (Math.abs(pos.z) <= 2 && pos.x >= 0 && pos.x <= pathDistance) {
      return 'eastPath';
  }
  if (Math.abs(pos.z) <= 2 && pos.x <= 0 && pos.x >= -pathDistance) {
      return 'westPath';
  }

  return null; // Игрок не на платформе
};


// Кнопка "Again"
const createAgainButton = () => {
  const button = document.createElement('button');
  button.innerText = 'Again';
  button.style.position = 'absolute';
  button.style.top = '50%';
  button.style.left = '50%';
  button.style.transform = 'translate(-50%, -50%)';
  button.style.padding = '10px 20px';
  button.style.fontSize = '20px';
  button.style.display = 'none';
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    controls.getObject().position.set(0, 2, 0);
    button.style.display = 'none';
    isFalling = false;
  });

  return button;
};

const againButton = createAgainButton();

// Анимация падения
const startFalling = () => {
  isFalling = true;
  const fallSpeed = 0.1;

  const fallInterval = setInterval(() => {
    if (!isFalling) {
      clearInterval(fallInterval);
      return;
    }

    const playerPos = controls.getObject().position;
    playerPos.y -= fallSpeed;

    if (playerPos.y < -20) {
      againButton.style.display = 'block';
      clearInterval(fallInterval);
    }
  }, 16);
};

// Функция движения игрока
const movePlayer = () => {
  if (isFalling) return;

  // Направления движения
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(direction, camera.up).normalize();

  // Движение игрока
  if (keys['w']) controls.getObject().position.addScaledVector(direction, speed);
  if (keys['s']) controls.getObject().position.addScaledVector(direction, -speed);
  if (keys['a']) controls.getObject().position.addScaledVector(right, -speed);
  if (keys['d']) controls.getObject().position.addScaledVector(right, speed);

  // Проверка платформы
  const platform = isPlayerOnPlatform();
  const correctPlatform = 'north'; // Правильная платформа, задается заранее

  const handleCorrectChoice = () => {2
    console.log('Поздравляем! Вы выбрали правильный ответ!');
    // Например, загрузить следующую сцену или показать сообщение
    const message = document.createElement('div');
    message.innerText = 'Вы выиграли! Переход к следующему уровню...';
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.padding = '20px';
    message.style.backgroundColor = '#fff';
    message.style.border = '2px solid #000';
    message.style.fontSize = '24px';
    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
        // Логика перехода к следующей сцене или уровня
        resetGame();
    }, 3000);
};


  if (!platform) {
      console.log('Вы упали с платформы!');
      startFalling();
  } else {
      switch (platform) {
          case 'north':
              console.log('Вы на северной платформе!');
              if (platform === correctPlatform) {
                  console.log('Северная платформа — правильный ответ!');
                  // Обработка правильного выбора
                  handleCorrectChoice();
              } else {
                  console.log('Северная платформа, но это неправильный ответ.');
              }
              break;
          case 'south':
              console.log('Вы на южной платформе!');
              if (platform === correctPlatform) {
                  console.log('Южная платформа — правильный ответ!');
                  handleCorrectChoice();
              } else {
                  console.log('Южная платформа, но это неправильный ответ.');
              }
              break;
          case 'east':
              console.log('Вы на восточной платформе!');
              if (platform === correctPlatform) {
                  console.log('Восточная платформа — правильный ответ!');
                  handleCorrectChoice();
              } else {
                  console.log('Восточная платформа, но это неправильный ответ.');
              }
              break;
          case 'west':
              console.log('Вы на западной платформе!');
              if (platform === correctPlatform) {
                  console.log('Западная платформа — правильный ответ!');
                  handleCorrectChoice();
              } else {
                  console.log('Западная платформа, но это неправильный ответ.');
              }
              break;
          case 'main':
              console.log('Вы на главной платформе.');
              break;
          default:
              console.log('Вы на неизвестной платформе или пути.');
      }
  }
};


// Анимация
const animate = () => {
  requestAnimationFrame(animate);
  movePlayer();
  renderer.render(scene, camera);
};

animate();