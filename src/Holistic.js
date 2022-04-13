import React, { useEffect, useRef } from 'react'
import {
  Holistic,
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import {
  drawConnectors,
  drawLandmarks
} from "@mediapipe/drawing_utils";

import PatternBlock from './test-pattern/1062.jpg'

const Runner = () => {
const videoElement = useRef(null);
const canvasElement = useRef(null);
const patternElement = useRef(null);

useEffect(() => {
  const video = videoElement.current
  const canvas = canvasElement.current
  const pattern = patternElement.current

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

console.log(outsideContour.length / 2)



  const band = [
    132, 177, 147, 187, 205, 36, 142, 209, 198, 236, 3, 195, 248, 456, 420, 429, 371, 266, 425, 411, 376, 401, 361
  ]

  const outsideCoordinate = ( min, max, fraction) => {
    return min + max / fraction
  }

  // const randomNumber = (min, max) => Math.random() * (max - min) + min

  const bodyCoordinates = document.body.getBoundingClientRect()

  const drawContours = (context, results, width, height, outside) => {

    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.beginPath();
    console.log(bodyCoordinates)
    context.moveTo(bodyCoordinates.left, outside)

    for (let i = 0; i < band.length; i++) {

      for (let j = 0; j < results.faceLandmarks.length; j++) {
        if (j === band[i]) {
          const x = results.faceLandmarks[j].x * width
          const y = results.faceLandmarks[j].y * height
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
      canvasCtx.globalCompositeOperation = 'source-over';

  // get coordinates from left, top - bottom, in fractions of array.length / 2

      console.log(
      outsideCoordinate(
        bodyCoordinates.top,
        bodyCoordinates.bottom,
        outsideContour.length / 2))

      for (let i = 0; i < outsideContour.length / 2; i++ ) {
        let outside = outsideCoordinate(
        bodyCoordinates.top,
        bodyCoordinates.bottom,
        outsideContour.length / 2)

        drawContours(canvasCtx, results, canvas.width, canvas.height, outside)
      }
      canvasCtx.restore();
    } else {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  holistic.onResults(onResults)

  const camera = new Camera(video, {
    onFrame: async () => {
      await holistic.send({image: video});
    },
    width: 1080,
    height: 1080
  });

  camera.start();
})

  const PatternElement = ({src, patternRef, hidden}) => <img src={src} ref={patternRef} alt="" hidden={hidden}></img>

  return (
    <div className="container">
      <video className="input_video" hidden ref={videoElement}></video>
      <canvas
        className="output_canvas"
        width="1080px" height="1080px"
        style={{width: '100vw', height: '100vh'}}
        ref={canvasElement}></canvas>
      <PatternElement src={PatternBlock} patternRef={patternElement} hidden/>
    </div>
  )

}

export default Runner
