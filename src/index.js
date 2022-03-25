const canvasSketch = require('canvas-sketch');
const {random, math} = require('canvas-sketch-util');

const video = document.querySelector('video');
let streamStarted = false;

// check for device support
if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
  console.log("Let's get this party started")
}

// get user permission and access Media Devices object
async function generateMesh() {
  console.log("tying again");

  const model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
  const predictions = await model.estimateFaces({
    input: document.querySelector("video")
  });

if (predictions.length > 0) {
    /*
    `predictions` is an array of objects describing each detected face, for example:

    [
      {
        faceInViewConfidence: 1, // The probability of a face being present.
        boundingBox: { // The bounding box surrounding the face.
          topLeft: [232.28, 145.26],
          bottomRight: [449.75, 308.36],
        },
        mesh: [ // The 3D coordinates of each facial landmark.
          [92.07, 119.49, -17.54],
          [91.97, 102.52, -30.54],
          ...
        ],
        scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
          [322.32, 297.58, -17.54],
          [322.18, 263.95, -30.54]
        ],
        annotations: { // Semantic groupings of the `scaledMesh` coordinates.
          silhouette: [
            [326.19, 124.72, -3.82],
            [351.06, 126.30, -3.00],
            ...
          ],
          ...
        }
      }
    ]
    */

    // const settings = {
    //   dimensions: [ 1080, 1080 ],
    // };

    // for (let i = 0; i < predictions.length; i++) {
    //   const keypoints = predictions[i].scaledMesh;

    //   for (let i = 0; i < keypoints.length; i++) {
    //   const [x, y, z] = keypoints[i];

    //   // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
    // }

    // start canvas sketch
      const settings = {
        dimensions: [ 1080, 1080 ],
      };

    const sketch = ({ context, width, height }) => {

      const agents = [];

      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].scaledMesh;

          for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];

          // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
          agents.push(new Agent(x, y, z))
        }
      }

      return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        for (let i = 0; i < agents.length; i++) {
          const agent = agents[i];

            context.beginPath();
            context.moveTo(agent.pos.x, agent.pos.y, agent.pos.z);
            context.stroke();
        }

        console.log(agents)

        agents.forEach(agent => {
          agent.update();
          agent.draw(context);
        });
      };
    };
      // Log facial keypoints.

      // plot points on a canvas
      canvasSketch(sketch, settings);
    }
}

class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Agent {
  constructor(x, y, z) {
    this.pos = new Vector(x, y, z);
    this.radius = 1;
  }

  update() {
    this.pos.x;
    this.pos.y;
    this.pos.z;
  }

  draw(context) {
    context.save();
    context.translate(this.pos.x, this.pos.y, this.pos.z);

    context.lineWidth = 1;

    context.beginPath();
    context.arc(
        0,
        0,
        this.radius,
        0,
        Math.PI * 2
      );
    context.fill();
    context.stroke();

    context.restore();
  }
}

navigator.mediaDevices.getUserMedia({
  video: {
    width: {
      min: 720,
      ideal: 1080,
      max: 1440
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440
    },
    facingMode: 'user'
  }
}).then( stream => {
  /* use the stream */
  video.srcObject = stream;
  streamStarted = true;
  console.log("stream", stream, "stream started", streamStarted)
  generateMesh()
}).catch( err => {
  console.log(err)
});
