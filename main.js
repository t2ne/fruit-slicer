let video;
let handPose;
let hands = [];
let painting;
let px = 0;
let py = 0;
let sw = 8;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  // Log detected hand data to the console
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);

  // Create an off-screen graphics buffer for painting
  painting = createGraphics(640, 480);
  painting.clear();

  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    let rightHand, leftHand;

    // Separate detected hands into left and right
    for (let hand of hands) {
      if (hand.handedness == "Right") {
        let index = hand.index_finger_tip;
        let thumb = hand.thumb_tip;
        rightHand = { index, thumb };
      }
      if (hand.handedness == "Left") {
        let index = hand.index_finger_tip;
        let thumb = hand.thumb_tip;
        leftHand = { index, thumb };
      }
    }

    // Adjust stroke width based on left-hand pinch distance
    if (leftHand) {
      let { index, thumb } = leftHand;
      let x = (index.x + thumb.x) * 0.5;
      let y = (index.y + thumb.y) * 0.5;
      sw = dist(index.x, index.y, thumb.x, thumb.y);

      fill(255, 0, 255);
      noStroke();
      circle(x, y, sw);
    }

    // Draw with right-hand pinch
    if (rightHand) {
      let { index, thumb } = rightHand;
      let x = (index.x + thumb.x) * 0.5;
      let y = (index.y + thumb.y) * 0.5;

      let d = dist(index.x, index.y, thumb.x, thumb.y);
      if (d < 20) {
        painting.stroke(255, 255, 0);
        painting.strokeWeight(sw * 0.5);
        painting.line(px, py, x, y);
      }

      px = x;
      py = y;
    }
  }

  // Overlay painting on top of the video
  image(painting, 0, 0);
}
