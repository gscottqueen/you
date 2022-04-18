import React, { useEffect, useRef } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import * as CORDINATES from './coordinates'

const {
  // band10,
  band109,
  band67,
  band103,
  band54,
  band93,
  band132
} = CORDINATES

const Runner = () => {
  const videoElement = useRef(null);
  const canvasElement = useRef(null);

  useEffect(() => {
    const video = videoElement.current
    const canvas = canvasElement.current
    const context = canvas.getContext('2d')
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.save();
    const bands = [
      band109,
      band67,
      band103,
      band54,
      band93,
      band132
    ]
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
      const x = results[index].x * canvas.width
      const y = results[index].y * canvas.height
      context.lineTo(x, y);
    }

    const drawBandContours = (context, results, band, canvas, outside) => {

      const drawBand = (resultsArray, bandArray) => {
        for (let j = 0; j < bandArray.length; j++) {
          drawLandMarkConnections(resultsArray, bandArray[j], canvas)
        }
      }

      const outsideY = results.faceLandmarks
        ? results.faceLandmarks[band[0]].y * canvas.height
        : outside

      context.beginPath()
      context.moveTo(bodyCoordinates.left, outsideY)
      if (results?.faceLandmarks) {
        drawBand(results.faceLandmarks, band)
      }
      context.lineTo(bodyCoordinates.right, outsideY)
      context.stroke();
    };

    function onResults(results, canvasCtx = context) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      let outside = 0;

      for (let i = 0; i < bands.length; i++ ) {
        outside = outside + ( bodyCoordinates.height / bands.length )
        drawBandContours(canvasCtx, results, bands[i], canvas, outside)
      }
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
