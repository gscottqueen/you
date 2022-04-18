import React, { useEffect, useRef } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import * as CORDINATES from './coordinates'

const {
  outsideCoordinates,
  band10,
  // band109,
  // band67,
  // band103,
  // band54,
  // band93,
  // band132
} = CORDINATES

const Runner = () => {
  const videoElement = useRef(null);
  const canvasElement = useRef(null);

  useEffect(() => {
    const video = videoElement.current
    const canvas = canvasElement.current
    const context = canvas.getContext('2d')
    const bands = [
      band10,
      // band109,
      // band67,
      // band103,
      // band54,
      // band93,
      // band132
    ]
    const outsideCoordinate = (size, fraction) => size / fraction
    const bodyCoordinates = canvas.getBoundingClientRect()
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

    const drawLandMarkConnections = (results, index, canvas) => {
      for (let i = 0; i < results.length; i++) {
        if (i === index) {
          const x = results[i].x * canvas.width
          const y = results[i].y * canvas.height
          context.lineTo(x, y);
        }
      }
    }

    const drawHorizontalContours = (context, results, band, canvas, outside) => {

      const drawBand = (resultsArray, bandArray) => {
        for (let l = 0; l < bandArray.length; l++) {
          drawLandMarkConnections(resultsArray, bandArray[l], canvas)
        }
      }

      context.beginPath()
      context.moveTo(bodyCoordinates.left, outside)

      if (results?.faceLandmarks) {
        drawBand(results.faceLandmarks, band)
      }

      context.lineTo(bodyCoordinates.right, outside)
      context.stroke();
    };

    function onResults(results, canvasCtx = context) {
      context.lineWidth = 1;
      context.strokeStyle = 'black';
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      let outside = 0;

      for (let i = 0; i < bands.length; i++ ) {
        outside = outside + outsideCoordinate(bodyCoordinates.height, outsideCoordinates.length)
        drawHorizontalContours(canvasCtx, results, bands[i], canvas, outside, i)
      }
      canvasCtx.save();
      canvasCtx.restore();
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
