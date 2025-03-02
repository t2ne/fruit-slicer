let video;
let handPose;
let hands = [];
let gameState = "loading";
let fruits = [];
let basket;
let timer;
let trails = [];
let grabbedFruit = null;
let grabbedFruitHand = null;
let fruitSoundPlayed = false;
let assetsLoaded = false;
let counter = 0;
let fruitSpeed = 2;
let fruitFrequency = 60;
let quota = 30;
let soundsLoaded = false;
let gameJustEnded = false;

let bgImage;
let logoImage;
let upheavalFont;
let backArrow;

let bgMusic;
let fruitDropSound;
let fruitGrabSound;
let fruitInBasketSound;
let buttonClickSound;
let pauseSound;
let gameMusic;
let gameOverSound;
let gameWinSound;

let difficulty = "Médio";
let musicVolume = 0.5;
let sfxVolume = 0.5;

function preload() {
  handPose = ml5.handPose({ flipped: true });

  try {
    bgImage = loadImage("assets/imgs/bg.png");
    logoImage = loadImage("assets/icon/logo.png");
    backArrow = loadImage("assets/imgs/back_arrow.png");
    upheavalFont = loadFont("assets/font/upheavtt.ttf");

    if (typeof p5.prototype.loadSound === "function") {
      bgMusic = loadSound(
        "assets/sound/bg.mp3",
        () => console.log("bgMusic loaded"),
        (err) => console.error("Could not load bgMusic:", err)
      );
      fruitDropSound = loadSound("assets/sound/fruitdrop.mp3");
      fruitGrabSound = loadSound("assets/sound/fruitgrab.mp3");
      fruitInBasketSound = loadSound("assets/sound/fruitinbasket.mp3");
      buttonClickSound = loadSound("assets/sound/button.mp3");
      pauseSound = loadSound("assets/sound/pause.mp3");
      gameMusic = loadSound("assets/sound/game.mp3");
      gameOverSound = loadSound("assets/sound/gameover.mp3");
      gameWinSound = loadSound("assets/sound/win.mp3");
      soundsLoaded = true;
      console.log("Sound files loading attempted");
    } else {
      console.warn(
        "p5.sound library is not available, sounds will be disabled"
      );
      soundsLoaded = false;
    }
  } catch (e) {
    console.error("Error loading assets:", e);

    soundsLoaded = false;
  }

  loadSettings();
}

function loadSettings() {
  if (localStorage.getItem("difficulty")) {
    difficulty = localStorage.getItem("difficulty");
    updateDifficultySettings();
  }

  if (localStorage.getItem("musicVolume")) {
    musicVolume = parseFloat(localStorage.getItem("musicVolume"));
  }

  if (localStorage.getItem("sfxVolume")) {
    sfxVolume = parseFloat(localStorage.getItem("sfxVolume"));
  }
}

function saveSettings() {
  localStorage.setItem("difficulty", difficulty);
  localStorage.setItem("musicVolume", musicVolume);
  localStorage.setItem("sfxVolume", sfxVolume);
}

function updateDifficultySettings() {
  switch (difficulty) {
    case "Fácil":
      fruitSpeed = 1;
      fruitFrequency = 90;
      quota = 20;
      break;
    case "Médio":
      fruitSpeed = 2;
      fruitFrequency = 60;
      quota = 30;
      break;
    case "Difícil":
      fruitSpeed = 3;
      fruitFrequency = 40;
      quota = 40;
      break;
  }
}

function updateSoundVolumes() {
  if (!soundsLoaded) return;

  try {
    if (bgMusic && typeof bgMusic.setVolume === "function")
      bgMusic.setVolume(musicVolume);
    if (gameMusic && typeof gameMusic.setVolume === "function")
      gameMusic.setVolume(musicVolume);

    if (fruitDropSound && typeof fruitDropSound.setVolume === "function")
      fruitDropSound.setVolume(sfxVolume);
    if (fruitGrabSound && typeof fruitGrabSound.setVolume === "function")
      fruitGrabSound.setVolume(sfxVolume);
    if (
      fruitInBasketSound &&
      typeof fruitInBasketSound.setVolume === "function"
    )
      fruitInBasketSound.setVolume(sfxVolume);
    if (buttonClickSound && typeof buttonClickSound.setVolume === "function")
      buttonClickSound.setVolume(sfxVolume);
    if (pauseSound && typeof pauseSound.setVolume === "function")
      pauseSound.setVolume(sfxVolume);
    if (gameOverSound && typeof gameOverSound.setVolume === "function")
      gameOverSound.setVolume(sfxVolume);
    if (gameWinSound && typeof gameWinSound.setVolume === "function")
      gameWinSound.setVolume(sfxVolume);
  } catch (e) {
    console.error("Error updating sound volumes:", e);
  }
}

function playSoundSafe(sound) {
  if (soundsLoaded && sound && typeof sound.play === "function") {
    try {
      sound.play();
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }
}

function stopSoundSafe(sound) {
  if (soundsLoaded && sound && typeof sound.stop === "function") {
    try {
      sound.stop();
    } catch (e) {
      console.error("Error stopping sound:", e);
    }
  }
}

function isSoundPlaying(sound) {
  if (soundsLoaded && sound && typeof sound.isPlaying === "function") {
    try {
      return sound.isPlaying();
    } catch (e) {
      console.error("Error checking if sound is playing:", e);
    }
  }
  return false;
}

function loopSoundSafe(sound) {
  if (soundsLoaded && sound && typeof sound.loop === "function") {
    try {
      sound.loop();
    } catch (e) {
      console.error("Error looping sound:", e);
    }
  }
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

  if (soundsLoaded) {
    updateSoundVolumes();
  }

  setTimeout(() => {
    assetsLoaded = true;
    gameState = "menu";
    if (soundsLoaded && !isSoundPlaying(bgMusic)) {
      loopSoundSafe(bgMusic);
    }
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
      if (soundsLoaded) {
        if (!isSoundPlaying(bgMusic)) {
          stopAllSounds();
          loopSoundSafe(bgMusic);
        }
      }
      drawMainMenu();
      break;
    case "playing":
      if (soundsLoaded) {
        if (!isSoundPlaying(gameMusic)) {
          stopAllSounds();
          loopSoundSafe(gameMusic);
        }
      }
      playGame();
      break;
    case "instructions":
      if (soundsLoaded) {
        if (!isSoundPlaying(bgMusic)) {
          stopAllSounds();
          loopSoundSafe(bgMusic);
        }
      }
      drawInstructionsScreen();
      break;
    case "objective":
      if (soundsLoaded) {
        if (!isSoundPlaying(bgMusic)) {
          stopAllSounds();
          loopSoundSafe(bgMusic);
        }
      }
      drawObjectiveScreen();
      break;
    case "options":
      if (soundsLoaded) {
        if (!isSoundPlaying(bgMusic)) {
          stopAllSounds();
          loopSoundSafe(bgMusic);
        }
      }
      drawOptionsScreen();
      break;
    case "gameOver":
      if (soundsLoaded && gameJustEnded) {
        stopAllSounds();
        playSoundSafe(gameOverSound);
        gameJustEnded = false;
      }
      drawGameOverScreen();
      break;
    case "gameWin":
      if (soundsLoaded && gameJustEnded) {
        stopAllSounds();
        playSoundSafe(gameWinSound);
        gameJustEnded = false;
      }
      drawGameWinScreen();
      break;
    case "confirmClear":
      if (soundsLoaded) {
        if (!isSoundPlaying(bgMusic)) {
          stopAllSounds();
          loopSoundSafe(bgMusic);
        }
      }
      drawConfirmClearScreen();
      break;
  }
}

function stopAllSounds() {
  if (!soundsLoaded) return;

  stopSoundSafe(bgMusic);
  stopSoundSafe(gameMusic);
  stopSoundSafe(gameOverSound);
  stopSoundSafe(gameWinSound);
}

function drawLoadingScreen() {
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

  noStroke();
  fill(0, 98, 38);
  let loadingWidth = map(sin(frameCount * 0.05), -1, 1, 100, 300);
  rect(width / 2 - loadingWidth / 2, height / 2 + 50, loadingWidth, 10, 5);
}

function drawMainMenu() {
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  push();
  image(logoImage, width / 12, height / 8);
  pop();

  let buttonY = height * 0.45;
  let buttonSpacing = 70;

  drawButton("Jogar", width / 2, buttonY, () => {
    playSoundSafe(buttonClickSound);
    gameState = "playing";
    resetGame();
  });

  drawButton("Instruções", width / 2, buttonY + buttonSpacing, () => {
    playSoundSafe(buttonClickSound);
    gameState = "instructions";
  });

  drawButton("Objetivo", width / 2, buttonY + 2 * buttonSpacing, () => {
    playSoundSafe(buttonClickSound);
    gameState = "objective";
  });

  drawButton("Opções", width / 2, buttonY + 3 * buttonSpacing, () => {
    playSoundSafe(buttonClickSound);
    gameState = "options";
  });

  fill(180);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text("t2ne/cyzuko - 2025", 10, height - 10);

  textAlign(RIGHT, BOTTOM);
  fill(180);
  text("Eliminar pontuação", width - 10, height - 10);

  if (!window.buttons) window.buttons = [];
  window.buttons.push({
    x1: width - 150,
    y1: height - 25,
    x2: width,
    y2: height,
    onClick: () => {
      playSoundSafe(buttonClickSound);
      gameState = "confirmClear";
    },
  });
}

function drawButton(label, x, y, onClick) {
  let buttonWidth = 200;
  let buttonHeight = 50;
  let isHovered =
    mouseX > x - buttonWidth / 2 &&
    mouseX < x + buttonWidth / 2 &&
    mouseY > y - buttonHeight / 2 &&
    mouseY < y + buttonHeight / 2;

  push();
  if (isHovered) {
    fill(51, 149, 90);
  } else {
    fill(0, 98, 38);
  }
  stroke(255);
  strokeWeight(2);
  rect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, 5);

  textSize(24);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  pop();

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
    `Objetivo atual: ${quota} frutas (${difficulty})`,
    "",
    "tenta superar o teu próprio recorde",
  ]);
}

function drawOptionsScreen() {
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  image(backArrow, 20, 20, 40, 40);

  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        playSoundSafe(buttonClickSound);
        gameState = "menu";
        saveSettings();
      },
    },
  ];

  fill(255);
  textSize(36);
  textAlign(CENTER, TOP);
  text("Opções", width / 2, 30);

  textSize(26);
  textAlign(CENTER, TOP);
  text("Dificuldade:", width / 2, 100);

  let buttonY = 150;
  let buttonWidth = 120;
  let buttonSpacing = 140;

  let easyX = width / 2 - buttonSpacing;
  let easySelected = difficulty === "Fácil";
  drawDifficultyButton(
    "Fácil",
    easyX,
    buttonY,
    buttonWidth,
    50,
    easySelected,
    () => {
      playSoundSafe(buttonClickSound);
      difficulty = "Fácil";
      updateDifficultySettings();
    }
  );

  let mediumSelected = difficulty === "Médio";
  drawDifficultyButton(
    "Médio",
    width / 2,
    buttonY,
    buttonWidth,
    50,
    mediumSelected,
    () => {
      playSoundSafe(buttonClickSound);
      difficulty = "Médio";
      updateDifficultySettings();
    }
  );

  let hardX = width / 2 + buttonSpacing;
  let hardSelected = difficulty === "Difícil";
  drawDifficultyButton(
    "Difícil",
    hardX,
    buttonY,
    buttonWidth,
    50,
    hardSelected,
    () => {
      playSoundSafe(buttonClickSound);
      difficulty = "Difícil";
      updateDifficultySettings();
    }
  );

  textSize(26);
  textAlign(CENTER, TOP);
  text("Volume:", width / 2, 220);

  textSize(20);
  textAlign(RIGHT, CENTER);
  text("Música:", width / 2 - 20, 270);

  let sliderX = width / 2;
  let sliderWidth = 200;
  drawSlider(sliderX, 270, sliderWidth, musicVolume, (value) => {
    musicVolume = value;
    updateSoundVolumes();
  });

  textAlign(RIGHT, CENTER);
  text("Efeitos:", width / 2 - 20, 320);

  drawSlider(sliderX, 320, sliderWidth, sfxVolume, (value) => {
    sfxVolume = value;
    updateSoundVolumes();
  });
}

function drawDifficultyButton(label, x, y, w, h, selected, onClick) {
  push();
  if (selected) {
    fill(51, 149, 90);
  } else {
    fill(0, 98, 38);
  }
  stroke(255);
  strokeWeight(2);
  rect(x - w / 2, y - h / 2, w, h, 5);

  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(label, x, y);
  pop();

  if (!window.buttons) window.buttons = [];
  window.buttons.push({
    x1: x - w / 2,
    y1: y - h / 2,
    x2: x + w / 2,
    y2: y + h / 2,
    onClick: onClick,
  });
}

function drawSlider(x, y, w, value, onChange) {
  push();
  fill(50);
  noStroke();
  rect(x - w / 2, y - 10, w, 20, 10);

  fill(0, 98, 38);
  rect(x - w / 2, y - 10, w * value, 20, 10);

  fill(255);
  ellipse(x - w / 2 + w * value, y, 20, 20);
  pop();

  if (
    mouseIsPressed &&
    mouseX >= x - w / 2 &&
    mouseX <= x + w / 2 &&
    mouseY >= y - 15 &&
    mouseY <= y + 15
  ) {
    let newValue = constrain((mouseX - (x - w / 2)) / w, 0, 1);
    onChange(newValue);
  }
}

function drawSecondaryScreen(title, textLines) {
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  image(backArrow, 20, 20, 40, 40);

  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        playSoundSafe(buttonClickSound);
        gameState = "menu";
      },
    },
  ];

  fill(255);
  textSize(36);
  textAlign(CENTER, TOP);
  text(title, width / 2, 30);

  textSize(22);
  textAlign(LEFT, TOP);
  for (let i = 0; i < textLines.length; i++) {
    text(textLines[i], width / 2 - 200, 120 + i * 40);
  }
}

function drawGameOverScreen() {
  tint(90, 60, 60);
  image(bgImage, 0, 0, width, height);
  noTint();

  image(backArrow, 20, 20, 40, 40);

  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        playSoundSafe(buttonClickSound);
        gameState = "menu";
      },
    },
  ];

  fill(255, 100, 100);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Perdeste!", width / 2, height / 4);

  fill(255);
  textSize(30);
  text(`Pontuação: ${counter}/${quota}`, width / 2, height / 4 + 60);

  displayLeaderboard();

  drawTryAgainButtons();
}

function drawGameWinScreen() {
  tint(60, 100, 60);
  image(bgImage, 0, 0, width, height);
  noTint();

  image(backArrow, 20, 20, 40, 40);

  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        playSoundSafe(buttonClickSound);
        gameState = "menu";
      },
    },
  ];

  fill(100, 255, 100);
  textSize(48);
  textAlign(CENTER, CENTER);
  text("Ganhaste!", width / 2, height / 4);

  fill(255);
  textSize(30);
  text(`Pontuação: ${counter}`, width / 2, height / 4 + 60);

  displayLeaderboard();

  drawTryAgainButtons();
}

function drawTryAgainButtons() {
  fill(255);
  textSize(26);
  textAlign(CENTER, CENTER);
  text("Tentar outra vez?", width / 2, height - 100);

  let buttonY = height - 50;
  let buttonSpacing = 100;

  drawButton("Sim", width / 2 - buttonSpacing, buttonY, () => {
    playSoundSafe(buttonClickSound);
    gameState = "playing";
    resetGame();
  });

  drawButton("Não", width / 2 + buttonSpacing, buttonY, () => {
    playSoundSafe(buttonClickSound);
    gameState = "menu";
  });
}

function drawConfirmClearScreen() {
  tint(90, 90, 130);
  image(bgImage, 0, 0, width, height);
  noTint();

  image(backArrow, 20, 20, 40, 40);

  if (!window.buttons) window.buttons = [];
  window.buttons = [
    {
      x1: 20,
      y1: 20,
      x2: 60,
      y2: 60,
      onClick: () => {
        playSoundSafe(buttonClickSound);
        gameState = "menu";
      },
    },
  ];

  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("Tem a certeza que quer eliminar a pontuação?", width / 2, height / 3);

  let buttonY = height / 2;
  let buttonSpacing = 100;

  drawButton("Sim", width / 2 - buttonSpacing, buttonY, () => {
    playSoundSafe(buttonClickSound);
    clearLeaderboard();
    gameState = "menu";
  });

  drawButton("Não", width / 2 + buttonSpacing, buttonY, () => {
    playSoundSafe(buttonClickSound);
    gameState = "menu";
  });
}

function clearLeaderboard() {
  localStorage.removeItem("leaderboard");
  console.log("Leaderboard cleared");
}

function displayLeaderboard() {
  let leaderboard = getLeaderboard();

  fill(255, 215, 0);
  textSize(36);
  textAlign(CENTER, CENTER);
  text("Top 3", width / 2, height / 2);

  fill(255);
  textSize(24);
  let startY = height / 2 + 40;

  if (leaderboard.length === 0) {
    textAlign(CENTER, CENTER);
    text("Sem pontuações", width / 2, startY + 30);
  } else {
    for (let i = 0; i < leaderboard.length; i++) {
      textAlign(CENTER, CENTER);
      text(`${i + 1}. ${leaderboard[i]}`, width / 2, startY + i * 30);
    }
  }
}

function getLeaderboard() {
  let leaderboard = [];
  if (localStorage.getItem("leaderboard")) {
    leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  }

  if (
    (gameState === "gameOver" || gameState === "gameWin") &&
    gameJustEnded === false
  ) {
    let newLeaderboard = [...leaderboard];
    newLeaderboard.push(counter);
    newLeaderboard.sort((a, b) => b - a);

    let uniqueLeaderboard = [...new Set(newLeaderboard)];
    uniqueLeaderboard = uniqueLeaderboard.slice(0, 3);

    localStorage.setItem("leaderboard", JSON.stringify(uniqueLeaderboard));

    return uniqueLeaderboard;
  }

  return leaderboard;
}

function resetGame() {
  fruits = [];
  timer = 120;
  counter = 0;

  grabbedFruit = null;
  grabbedFruitHand = null;
  fruitSoundPlayed = false;

  if (window.timerInterval) clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    if (timer > 0 && gameState === "playing") {
      timer--;
      if (timer === 0) {
        endGame();
      }
    }
  }, 1000);
}

function endGame() {
  gameJustEnded = true;

  if (counter >= quota) {
    gameState = "gameWin";
  } else {
    gameState = "gameOver";
  }
}

function mousePressed() {
  if (!window.buttons) return;

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
  text("Fruta Apanhada: " + counter + "/" + quota, 10, 40);
  noStroke();
}

function handleHandDetection() {
  if (hands.length > 0) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      let handIndex = i;
      let isClosed = isHandClosed(hand);
      let palm = hand.keypoints[0];

      trails.push({ x: palm.x, y: palm.y, time: millis() });

      if (isClosed && grabbedFruit === null) {
        for (let fruit of fruits) {
          if (dist(palm.x, palm.y, fruit.x, fruit.y) < 30 && !fruit.caught) {
            grabbedFruit = fruit;
            grabbedFruitHand = handIndex;
            fruitSoundPlayed = true;
            grabbedFruit.offsetX = palm.x - fruit.x;
            grabbedFruit.offsetY = palm.y - fruit.y;
            playSoundSafe(fruitGrabSound);
            break;
          }
        }
      } else if (
        isClosed &&
        grabbedFruit !== null &&
        handIndex === grabbedFruitHand
      ) {
        grabbedFruit.x = palm.x - grabbedFruit.offsetX;
        grabbedFruit.y = palm.y - grabbedFruit.offsetY;
      } else if (
        !isClosed &&
        grabbedFruit !== null &&
        handIndex === grabbedFruitHand
      ) {
        if (
          dist(grabbedFruit.x, grabbedFruit.y, basket.x, basket.y) <
          basket.w / 2
        ) {
          counter++;
          playSoundSafe(fruitInBasketSound);
        } else {
          playSoundSafe(fruitDropSound);
        }

        grabbedFruit = null;
        grabbedFruitHand = null;
        fruitSoundPlayed = false;
      }
    }
  }
}

function updateFruits() {
  if (frameCount % fruitFrequency === 0 && grabbedFruit === null) {
    fruits.push({ x: random(width), y: 0, w: 20, h: 20, caught: false });
  }

  for (let fruit of fruits) {
    if (!grabbedFruit || fruit !== grabbedFruit) {
      fruit.y += fruitSpeed;
    }
  }
}

function drawFruits() {
  fill(255, 0, 0);
  for (let fruit of fruits) {
    ellipse(fruit.x, fruit.y, fruit.w, fruit.h);
  }
}

function drawBasket() {
  fill(200, 150, 0);
  rect(basket.x - basket.w / 2, basket.y, basket.w, basket.h);
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
