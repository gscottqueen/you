import React, { useEffect, useRef } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import * as CORDINATES from './coordinates'

const {
  outsideCoordinates,
  band10,
  band109,
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
    const bands = [
      band10,
      band109,
      band93,
      band132
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

    const drawHorizontalContours = (context, results, band, canvas, outside) => {
      context.lineWidth = 1;
      context.strokeStyle = 'black';

      const drawLandMarkConnections = (r, index) => {
        for (let l = 0; l < r.faceLandmarks.length; l++) {
          if (l === index) {
            const x = r.faceLandmarks[l].x * canvas.width
            const y = r.faceLandmarks[l].y * canvas.height
            context.lineTo(x, y);
          }
        }
      }

      const drawBand = (b, r) => {
        for (let l = 0; l < b.length; l++) {
          drawLandMarkConnections(r, b[l])
        }
      }

      for (let j = 0; j < band.length; j++) {
        context.beginPath()
        context.moveTo(bodyCoordinates.left, outside)
        drawBand(band, results)
        context.lineTo(bodyCoordinates.right, outside)
        context.stroke();
        context.save()
      }
    };

    function onResults(results, canvasCtx = context) {
      if (results.ea) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.save();
        let outside = 0;

          for (let i = 0; i < bands.length; i++ ) {
            outside = outside + outsideCoordinate(bodyCoordinates.height, outsideCoordinates.length / 2)
            drawHorizontalContours(canvasCtx, results, bands[i], canvas, outside, i)
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
