import React, { useEffect, useRef } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";

const Runner = () => {
const videoElement = useRef(null);
const canvasElement = useRef(null);

useEffect(() => {
  const video = videoElement.current
  const canvas = canvasElement.current

  const context = canvas.getContext('2d')
  const holistic = new Holistic({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  }});

  holistic.setOptions({
    modelComplexity: 1,
    modelSelection: 1,
    smoothLandmarks: true,
    selfieMode: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  const outsideContour = [
    127, 162, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234
  ]

  const band = [
    132, 177, 147, 187, 205, 36, 142, 209, 198, 236, 3, 195, 248, 456, 420, 429, 371, 266, 425, 411, 376, 401, 361
  ]

  const outsideCoordinate = (height, fraction) => height / fraction

  const bodyCoordinates = canvas.getBoundingClientRect()

  const drawContours = (context, results, canvas, outside) => {

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.beginPath();
    context.moveTo(bodyCoordinates.left, outside)


    for (let i = 0; i < band.length; i++) {
      for (let j = 0; j < results.faceLandmarks.length; j++) {
        if (j === band[i]) {
          const x = results.faceLandmarks[j].x * canvas.width
          const y = results.faceLandmarks[j].y * canvas.height
          context.lineTo(x, y);
        }
      }
    }
    context.lineTo(bodyCoordinates.right, outside)
    context.stroke();
};

  function onResults(results, canvasCtx = context) {

    if (results.ea) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.save();

      // get coordinates from left, top - bottom, in fractions of array.length / 2
      let outside = 0;

        for (let i = 0; i < outsideContour.length / 2; i++ ) {
          outside = outside + outsideCoordinate(bodyCoordinates.height, outsideContour.length / 2)
          drawContours(canvasCtx, results, canvas, outside)
        }

      canvasCtx.restore();
    } else {
      console.log('no length')
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  holistic.onResults(onResults)

  const camera = new Camera(video, {
    onFrame: async () => {
      await holistic.send({image: video});
    },
    width: canvas.width,
    height: canvas.height
  });

    camera.start();
  })

  return (
    window && <div className="container">
      <video className="input_video" hidden ref={videoElement}></video>
      <canvas
        className="output_canvas"
        width={`${window.innerWidth}px`} height={`${window.innerHeight}px`}
        ref={canvasElement}></canvas>
    </div>
  )

}

export default Runner
