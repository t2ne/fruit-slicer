let video;
let handPose;
let hands = [];
let gameState = "loading"; // "loading", "menu", "playing", "instructions", "objective", "options"
let fruits = [];
let basket;
let timer = 120;
let trails = [];
let grabbedFruit = null; // A fruta que está sendo arrastada
let assetsLoaded = false;
let counter = 0; // Contador de frutas "pegas"

// Assets
let bgImage;
let logoImage;
let upheavalFont;
let backArrow;

//Sounds
let bgMusic;
let fruitDropSound;
let fruitGrabSound;
let fruitInBasketSound;
let buttonClickSound;
let pauseSound;
let gameMusic;

function preload() {
  handPose = ml5.handPose({ flipped: true });

  // Load assets
  bgImage = loadImage("assets/imgs/bg.png");
  logoImage = loadImage("assets/icon/logo.png");
  backArrow = loadImage("assets/imgs/back_arrow.png");
  upheavalFont = loadFont("assets/font/upheavtt.ttf");

  // Load sounds
  bgMusic = loadSound("assets/sounds/bg.mp3");
  fruitDropSound = loadSound("assets/sounds/fruitdrop.mp3");
  fruitGrabSound = loadSound("assets/sounds/fruitgrab.mp3");
  fruitInBasketSound = loadSound("assets/sounds/fruitinbasket.mp3");
  buttonClickSound = loadSound("assets/sounds/button.mp3");
  pauseSound = loadSound("assets/sounds/pause.mp3");
  gameMusic = loadSound("assets/sounds/game.mp3");
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  handPose.detectStart(video, gotHands);

  textFont(upheavalFont);

  // Simulate asset loading
  setTimeout(() => {
    assetsLoaded = true;
    gameState = "menu";
  }, 2000);

  basket = { x: width / 2, y: height - 50, w: 100, h: 50 };
}

function draw() {
  background(0);

  switch (gameState) {
    case "loading":
      drawLoadingScreen();
      break;
    case "menu":
      drawMainMenu();
      break;
    case "playing":
      playGame();
      break;
    case "instructions":
      drawInstructionsScreen();
      break;
    case "objective":
      drawObjectiveScreen();
      break;
    case "options":
      drawOptionsScreen();
      break;
  }
}

function drawLoadingScreen() {
  // Colored gradient background
  for (let y = 0; y < height; y++) {
    let c = lerpColor(color(0, 0, 50), color(0, 0, 20), y / height);
    stroke(c);
    line(0, y, width, y);
  }

  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  textFont(upheavalFont);
  text("A CARREGAR...", width / 2, height / 2);

  // Loading animation
  noStroke();
  fill(0, 98, 38);
  let loadingWidth = map(sin(frameCount * 0.05), -1, 1, 100, 300);
  rect(width / 2 - loadingWidth / 2, height / 2 + 50, loadingWidth, 10, 5);
}

function drawMainMenu() {
  // Draw background with tint
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  // Draw inverted logo
  push();
  image(logoImage, width / 12, height / 8);
  pop();

  // Draw buttons
  let buttonY = height * 0.45;
  let buttonSpacing = 70;

  drawButton("Jogar", width / 2, buttonY, () => {
    gameState = "playing";
    resetGame();
  });

  drawButton("Instruções", width / 2, buttonY + buttonSpacing, () => {
    gameState = "instructions";
  });

  drawButton("Objetivo", width / 2, buttonY + 2 * buttonSpacing, () => {
    gameState = "objective";
  });

  drawButton("Opções", width / 2, buttonY + 3 * buttonSpacing, () => {
    gameState = "options";
  });

  // Credit text
  fill(180);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text("t2ne/cyzuko - 2025", 10, height - 10);
}

function drawButton(label, x, y, onClick) {
  let buttonWidth = 200;
  let buttonHeight = 50;
  let isHovered =
    mouseX > x - buttonWidth / 2 &&
    mouseX < x + buttonWidth / 2 &&
    mouseY > y - buttonHeight / 2 &&
    mouseY < y + buttonHeight / 2;

  // Button background
  push();
  if (isHovered) {
    fill(51, 149, 90);
  } else {
    fill(0, 98, 38);
  }
  stroke(255);
  strokeWeight(2);
  rect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 5);

  // Button text
  textSize(24);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  pop();

  // Store onClick handler in button data
  if (!window.buttons) window.buttons = [];
  window.buttons.push({
    x1: x - buttonWidth / 2,
    y1: y - buttonHeight / 2,
    x2: x + buttonWidth / 2,
    y2: y + buttonHeight / 2,
    onClick: onClick,
  });
}

function drawInstructionsScreen() {
  drawSecondaryScreen("Instruções", [
    "1. Usa as mãos para apanhar as frutas que caem",
    "2. Fecha a mão para agarrar uma fruta",
    "3. Abre a mão sobre o cesto para soltar a fruta",
    "4. Tenta pegar no máximo de frutas possível",
    "5. Tens 2 minutos para jogar",
  ]);
}

function drawObjectiveScreen() {
  drawSecondaryScreen("Objetivo", [
    "apanha o maior número de frutas",
    "possível antes que o tempo acabe!",
    "",
    "Cada fruta vale 1 ponto.",
    "",
    "tenta superar o teu próprio recorde",
  ]);
}

function drawOptionsScreen() {
  drawSecondaryScreen("Opções", [
    "Sem opções disponíveis no momento.",
    "",
    "Atualizações futuras incluirão:",
    "- Ajuste de dificuldade",
    "- Volume do som",
    "- Modo de jogo",
  ]);
}

function drawSecondaryScreen(title, textLines) {
  // Draw background with tint
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  // Draw back button
  image(backArrow, 20, 20, 40, 40);

  // Store back button data
  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        gameState = "menu";
      },
    },
  ];

  // Title
  fill(255);
  textSize(36);
  textAlign(CENTER, TOP);
  text(title, width / 2, 30);

  // Content
  textSize(22);
  textAlign(LEFT, TOP);
  for (let i = 0; i < textLines.length; i++) {
    text(textLines[i], width / 2 - 200, 120 + i * 40);
  }
}

function resetGame() {
  fruits = [];
  timer = 120;
  counter = 0;

  // Start timer
  if (window.timerInterval) clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    if (timer > 0 && gameState === "playing") {
      timer--;
      if (timer === 0) {
        gameState = "menu";
      }
    }
  }, 1000);
}

function mousePressed() {
  // Clear previous buttons data
  if (!window.buttons) return;

  // Check if any button was clicked
  for (let btn of window.buttons) {
    if (
      mouseX > btn.x1 &&
      mouseX < btn.x2 &&
      mouseY > btn.y1 &&
      mouseY < btn.y2
    ) {
      btn.onClick();
      break;
    }
  }

  // Clear buttons for next frame
  window.buttons = [];
}

function playGame() {
  image(video, 0, 0);

  updateFruits();
  drawFruits();
  drawBasket();
  updateTrails();
  drawTrails();

  handleHandDetection();

  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text("Tempo: " + nf(timer, 2) + "s", 10, 10);
  text("Fruita Apanhada: " + counter, 10, 40);
}

function handleHandDetection() {
  if (hands.length > 0) {
    for (let hand of hands) {
      let isClosed = isHandClosed(hand);
      let palm = hand.keypoints[0];

      trails.push({ x: palm.x, y: palm.y, time: millis() });

      // Verifica se o jogador está tentando pegar uma fruta com a mão fechada
      if (isClosed && grabbedFruit === null) {
        for (let fruit of fruits) {
          if (dist(palm.x, palm.y, fruit.x, fruit.y) < 30 && !fruit.caught) {
            grabbedFruit = fruit;
            grabbedFruit.offsetX = palm.x - fruit.x; // Guardar o deslocamento em X
            grabbedFruit.offsetY = palm.y - fruit.y; // Guardar o deslocamento em Y
          }
        }
      } else if (!isClosed && grabbedFruit !== null) {
        // Se a mão está aberta, "solta" a fruta
        if (
          dist(grabbedFruit.x, grabbedFruit.y, basket.x, basket.y) <
          basket.w / 2
        ) {
          // Se a fruta for solta dentro do cesto, incrementa o contador
          counter++;
        }
        grabbedFruit = null; // Soltar a fruta
      }

      if (grabbedFruit !== null) {
        // Se a fruta estiver sendo arrastada, atualiza a posição dela para a posição da mão
        grabbedFruit.x = palm.x - grabbedFruit.offsetX;
        grabbedFruit.y = palm.y - grabbedFruit.offsetY;
      }
    }
  }
}

function updateFruits() {
  // Se o jogador não pegou nenhuma fruta, adicione uma nova fruta a cada 60 frames
  if (frameCount % 60 === 0 && grabbedFruit === null) {
    fruits.push({ x: random(width), y: 0, w: 20, h: 20, caught: false });
  }

  // Atualiza a posição das frutas que estão a cair (teste)
  for (let fruit of fruits) {
    if (!grabbedFruit || fruit !== grabbedFruit) {
      fruit.y += 2;
    }
  }
}

function drawFruits() {
  fill(255, 0, 0);
  for (let fruit of fruits) {
    ellipse(fruit.x, fruit.y, fruit.w, fruit.h); // Desenha as frutas
  }
}

function drawBasket() {
  fill(200, 150, 0);
  rect(basket.x - basket.w / 2, basket.y, basket.w, basket.h); // Desenha o cesto
}

function updateTrails() {
  trails = trails.filter((t) => millis() - t.time < 500);
}

function drawTrails() {
  noFill();
  stroke(0, 255, 255, 100);
  strokeWeight(5);
  for (let t of trails) {
    point(t.x, t.y);
  }
}

function isHandClosed(hand) {
  let fingersClosed = 0;
  let fingertips = [4, 8, 12, 16, 20];
  let knuckles = [2, 5, 9, 13, 17];

  for (let i = 0; i < fingertips.length; i++) {
    let fingertip = hand.keypoints[fingertips[i]];
    let knuckle = hand.keypoints[knuckles[i]];

    if (fingertip.y > knuckle.y) {
      fingersClosed++;
    }
  }

  return fingersClosed >= 3;
}
