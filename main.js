let video;
let handPose;
let hands = [];
let gameState = "loading"; // "loading", "menu", "playing"
let fruits = [];
let basket;
let timer = 120;
let trails = [];
let grabbedFruit = null;
let assetsLoaded = false;

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  handPose.detectStart(video, gotHands);

  // Simulate asset loading
  setTimeout(() => {
    assetsLoaded = true;
    gameState = "menu";
  }, 2000);

  basket = { x: width / 2, y: height - 50, w: 100, h: 50 };
}

function draw() {
  background(0);

  if (gameState === "loading") {
    drawLoadingScreen();
  } else if (gameState === "menu") {
    drawMainMenu();
  } else if (gameState === "playing") {
    playGame();
  }
}

function drawLoadingScreen() {
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Loading...", width / 2, height / 2);
}

function drawMainMenu() {
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Fruit Ninja Hand Game", width / 2, height / 3);

  fill(100, 255, 100);
  rect(width / 2 - 50, height / 2, 100, 50);
  fill(0);
  textSize(24);
  text("Play", width / 2, height / 2 + 30);
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
  text("Time: " + nf(timer, 2) + "s", 10, 10);
}

function mousePressed() {
  if (
    gameState === "menu" &&
    mouseX > width / 2 - 50 &&
    mouseX < width / 2 + 50 &&
    mouseY > height / 2 &&
    mouseY < height / 2 + 50
  ) {
    gameState = "playing";
    setInterval(() => {
      if (timer > 0) timer--;
    }, 1000);
  }
}

function handleHandDetection() {
  if (hands.length > 0) {
    for (let hand of hands) {
      let isClosed = isHandClosed(hand);
      let palm = hand.keypoints[0];

      trails.push({ x: palm.x, y: palm.y, time: millis() });

      if (isClosed) {
        for (let fruit of fruits) {
          if (dist(palm.x, palm.y, fruit.x, fruit.y) < 30) {
            grabbedFruit = fruit;
          }
        }
      } else {
        grabbedFruit = null;
      }

      if (grabbedFruit) {
        grabbedFruit.x = palm.x;
        grabbedFruit.y = palm.y;
      }
    }
  }
}

function updateFruits() {
  if (frameCount % 60 === 0) {
    fruits.push({ x: random(width), y: 0, w: 20, h: 20 });
  }

  for (let fruit of fruits) {
    fruit.y += 2;
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
