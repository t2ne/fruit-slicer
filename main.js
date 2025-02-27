let video;
let handPose;
let hands = [];

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

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
      }
    }
  }

  // Display hand states
  fill(255);
  textSize(24);
  textAlign(LEFT, CENTER);
  text(leftHandState, 20, height - 60);
  text(rightHandState, 20, height - 30);

  console.log(leftHandState, rightHandState);
}

// Function to determine if a hand is closed
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
