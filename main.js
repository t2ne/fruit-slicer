let video;
let handPose;
let hands = [];
let object;

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  
  // Inicializando o objeto para pegar
  object = createVector(random(width), random(height), 50); // Objeto posicionado aleatoriamente
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  image(video, 0, 0);
  
  // Desenhando o objeto
  fill(255, 0, 0);
  ellipse(object.x, object.y, object.z, object.z);
  
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

        // Verificando se a mão está próxima do objeto e se está fechada
        if (state === "Closed" && isHandNearObject(hand, object)) {
          // O objeto foi "pegado"
          fill(0, 255, 0); // Mudando a cor do objeto para verde quando é "pegado"
          ellipse(object.x, object.y, object.z, object.z); // Desenhando o objeto "pegado"
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

// Função para verificar se a mão está próxima ao objeto
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
