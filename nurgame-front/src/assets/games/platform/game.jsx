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

// Добавляем элемент <video> в HTML-документ
const loadingOverlay = document.createElement('div');
loadingOverlay.style.position = 'absolute';
loadingOverlay.style.top = '0';
loadingOverlay.style.left = '0';
loadingOverlay.style.width = '100%';
loadingOverlay.style.height = '100%';
loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
loadingOverlay.style.zIndex = '1000';
loadingOverlay.style.display = 'flex';
loadingOverlay.style.alignItems = 'center';
loadingOverlay.style.justifyContent = 'center';

// Элемент <video> для WebM
const loadingVideo = document.createElement('video');
loadingVideo.src = 'models/loading.webm'; // Укажите путь к вашему WebM-файлу
loadingVideo.autoplay = true;
loadingVideo.loop = true;
loadingVideo.style.maxWidth = '200px';
loadingVideo.style.borderRadius = '10px';

// Добавляем видео в overlay
loadingOverlay.appendChild(loadingVideo);

// Добавляем overlay на страницу
document.body.appendChild(loadingOverlay);

// Показываем overlay во время загрузки ресурсов
const resourcesToLoad = 2; // Количество загружаемых ресурсов
let loadedResources = 0;

// Функция для скрытия overlay после загрузки
const hideLoadingOverlay = () => {
  if (loadedResources >= resourcesToLoad) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(loadingOverlay);
    }, 500); // Делаем плавное исчезновение
  }
};

// Загрузка окружения space.glb
const loader = new GLTFLoader();
loader.load(
  'models/space.glb',
  (gltf) => {
    const environment = gltf.scene;
    environment.scale.set(600, 100, 500);
    environment.position.set(-850, 100, 300);
    scene.add(environment); 
    loadedResources++;
    hideLoadingOverlay();
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
    city.position.set(0, -300, 0);
    scene.add(city);
    loadedResources++;
    hideLoadingOverlay();
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
const platformSize = 12;
const platformGeometry = new THREE.BoxGeometry(platformSize, 1, platformSize);
const platform = new THREE.Mesh(platformGeometry, glassMaterial);
platform.position.set(0, 0, 0);
scene.add(platform);

// Создание путей и платформ ответов
const createAnswerPath = (direction, distance) => {
  // Путь
  const pathGeometry = new THREE.BoxGeometry(2, 1, distance);
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
const pathDistance = 20;
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

// Функция для создания текстовой надписи


// Добавление текста вопроса
// Функция для создания текстовой надписи
const createTextLabel = (text, fontSize, color, canvasWidth = 512, canvasHeight = 128) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Увеличиваем ширину канваса, если текст длинный
  canvas.width = Math.max(canvasWidth, text.length * fontSize * 0.6);
  canvas.height = canvasHeight;

  context.font = `${fontSize}px Arial`;
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  // Масштабируем объект, чтобы текст не выглядел слишком большим
  sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);
  return sprite;
};

// Код добавления вопроса и вариантов ответов
// Добавление текста вопроса
const questionText = createTextLabel('Уровень 1: Пример коррупции?', 50, '#FFFFFF', 1024, 256);
questionText.position.set(0, 5, 0); // Над главной платформой
scene.add(questionText);

// Добавление текстов ответов над путями
const northAnswer = createTextLabel('Взятка', 50, '#00FFFF', 512, 128);
northAnswer.position.set(0, 8, -(platformSize / 10 + pathDistance / 3));
scene.add(northAnswer);

const southAnswer = createTextLabel('Хищение', 50, '#00FFFF', 512, 128);
southAnswer.position.set(0, 8, platformSize / 10 + pathDistance / 3);
scene.add(southAnswer);

const eastAnswer = createTextLabel('Протекция', 50, '#00FFFF', 512, 128);
eastAnswer.position.set(platformSize / 10 + pathDistance / 3, 8, 0);
scene.add(eastAnswer);

const westAnswer = createTextLabel('Откат', 50, '#00FFFF', 512, 128);
westAnswer.position.set(-(platformSize / 10 + pathDistance / 3), 8, 0);
scene.add(westAnswer);



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

  const fadeScreen = (isFadingOut, duration, callback) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#000';
    overlay.style.opacity = isFadingOut ? '0' : '1';
    overlay.style.transition = `opacity ${duration}s`;
    document.body.appendChild(overlay);
  
    // Запуск анимации
    setTimeout(() => {
      overlay.style.opacity = isFadingOut ? '1' : '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
        if (callback) callback();
      }, duration * 1000);
    }, 10);
  };
  
  const displayCorrectMessage = () => {
    const message = document.createElement('div');
    message.innerHTML = '✅ <span style="color: green; font-size: 24px;">Правильно!</span>';
    message.style.position = 'absolute';
    message.style.top = '20%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.padding = '10px 20px';
    message.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    message.style.border = '2px solid green';
    message.style.borderRadius = '10px';
    message.style.fontSize = '24px';
    message.style.textAlign = 'center';
    message.style.zIndex = '10';
    document.body.appendChild(message);
  
    setTimeout(() => {
      document.body.removeChild(message);
    }, 2000);
  };
  
  const updateLessonProgress = (current, total) => {
    let progressElement = document.getElementById('lesson-progress');
    if (!progressElement) {
      progressElement = document.createElement('div');
      progressElement.id = 'lesson-progress';
      progressElement.style.position = 'absolute';
      progressElement.style.top = '10px';
      progressElement.style.right = '10px';
      progressElement.style.padding = '10px 20px';
      progressElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      progressElement.style.color = '#fff';
      progressElement.style.fontSize = '20px';
      progressElement.style.borderRadius = '5px';
      progressElement.style.zIndex = '10';
      document.body.appendChild(progressElement);
    }
  
    progressElement.textContent = `Задание: ${current}/${total}`;
  };
  
  const resetGame = () => {
    // Сбрасываем положение игрока
    controls.getObject().position.set(0, 2, 0);
  
    // Меняем текст вопроса и ответов (можно сделать более сложную логику)
    questionText.material.map.image.getContext('2d').clearRect(0, 0, 1024, 256);
    questionText.material.map.image.getContext('2d').fillText('Уровень 2: Что является коррупцией?', 512, 128);
    questionText.material.map.needsUpdate = true;
  
    // Логика обновления текстов ответов
    northAnswer.material.map.image.getContext('2d').clearRect(0, 0, 512, 128);
    northAnswer.material.map.image.getContext('2d').fillText('Личное обогащение', 256, 64);
    northAnswer.material.map.needsUpdate = true;
  
    southAnswer.material.map.image.getContext('2d').clearRect(0, 0, 512, 128);
    southAnswer.material.map.image.getContext('2d').fillText('Прозрачность', 256, 64);
    southAnswer.material.map.needsUpdate = true;
  
    eastAnswer.material.map.image.getContext('2d').clearRect(0, 0, 512, 128);
    eastAnswer.material.map.image.getContext('2d').fillText('Образование', 256, 64);
    eastAnswer.material.map.needsUpdate = true;
  
    westAnswer.material.map.image.getContext('2d').clearRect(0, 0, 512, 128);
    westAnswer.material.map.image.getContext('2d').fillText('Независимость', 256, 64);
    westAnswer.material.map.needsUpdate = true;
  };
  
  const handleCorrectChoice = () => {
    console.log('Поздравляем! Вы выбрали правильный ответ!');
  
    // Показать сообщение "Правильно!"
    displayCorrectMessage();
  
    // Обновить прогресс урока
    updateLessonProgress(1, 5); // Пример: текущий 1 из 5 уроков
  
    // Анимация затухания, восстановления и перехода к следующему уровню
    fadeScreen(true, 0.8, () => {
      resetGame();
      fadeScreen(false, 0.5);
    });
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