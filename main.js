let video;
let handPose;
let hands = [];
let objects = []; // Array para armazenar as bolas
let objectPicked = []; // Array para armazenar o estado de "pegado" das bolas

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Inicializando 3 bolas
  for (let i = 0; i < 3; i++) {
    let newObj = {
      position: createVector(random(width), random(height), 50),
      picked: false
    };
    objects.push(newObj);
    objectPicked.push(false);
  }

  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  image(video, 0, 0);

  for (let i = 0; i < objects.length; i++) {
    // Desenha as bolas que não foram "pegas"
    if (!objects[i].picked) {
      fill(255, 0, 0);
      ellipse(objects[i].position.x, objects[i].position.y, objects[i].position.z, objects[i].position.z);
    }
  }

  let leftHandState = "Left: Not Detected";
  let rightHandState = "Right: Not Detected";

  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          fill(hand.handedness === "Left" ? [255, 0, 255] : [255, 255, 0]);
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        let state = isHandClosed(hand) ? "Closed" : "Open";

        if (hand.handedness === "Left") {
          leftHandState = `Left: ${state}`;
        } else {
          rightHandState = `Right: ${state}`;
        }

        // Verificando se a mão está próxima das bolas e se está fechada
        for (let i = 0; i < objects.length; i++) {
          if (state === "Closed" && isHandNearObject(hand, objects[i].position) && !objects[i].picked) {
            // Marca a bola como "pegada"
            objects[i].picked = true;
          }
        }
      }
    }
  }

  // Display hand states
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);
  text(leftHandState, 20, height - 60);
  text(rightHandState, 20, height - 30);
}

// Função para verificar se a mão está fechada
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

// Função para verificar se a mão está próxima do objeto
function isHandNearObject(hand, obj) {
  let handCenter = createVector(0, 0);
  for (let i = 0; i < hand.keypoints.length; i++) {
    handCenter.add(createVector(hand.keypoints[i].x, hand.keypoints[i].y));
  }
  handCenter.div(hand.keypoints.length); // Média da posição das keypoints

  let distance = dist(handCenter.x, handCenter.y, obj.x, obj.y);
  
  // Considerando que o objeto tem um tamanho de 50px e a mão precisa estar a menos de 100px do objeto
  return distance < 100 + obj.z / 2;
}

// Função para reiniciar as bolas
function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Resetando todas as bolas para posição aleatória e "desmarcando" o estado de "pegado"
    for (let i = 0; i < objects.length; i++) {
      objects[i].picked = false;
      objects[i].position = createVector(random(width), random(height), 50); // Reposiciona as bolas aleatoriamente
    }
  }
}
