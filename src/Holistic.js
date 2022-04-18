import React, { useEffect, useRef } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import * as CORDINATES from './coordinates'

const { bands } = CORDINATES

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

      context.moveTo(bodyCoordinates.left, outside)
      if (results?.faceLandmarks) {
        drawBand(results.faceLandmarks, band)
      }
      context.lineTo(bodyCoordinates.right, outside)
    };

    const drawFill = (length, band, side) => {

      let spacing = 0;
      const outsideCoordinate = side === 'bottom'
        ? bodyCoordinates.bottom
        : bodyCoordinates.top

      for (let j = 0; j < length; j++) {
        spacing = spacing + ( bodyCoordinates.width / length )
        context.moveTo(
          spacing,
          outsideCoordinate
          )
        context.lineTo(
          band.x * canvas.width,
          band.y * canvas.height
        );
      }
    }

    function onResults(results, canvasCtx = context) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.beginPath()

      drawFill(
        bands.length * 2,
        results.faceLandmarks[bands[0]],
        'top'
      )

      let outside = 0;

      for (let i = 0; i < bands.length; i++ ) {
        outside = outside + ( bodyCoordinates.height / bands.length )

        drawBandContours(
          canvasCtx,
          results,
          bands[i],
          canvas,
          outside
        )
      }

      drawFill(
        bands.length * 2,
        results.faceLandmarks[bands[bands.length - 1]],
        'bottom'
      )

      canvasCtx.stroke();
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
