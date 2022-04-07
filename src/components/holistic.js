
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Holistic } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils";
import {
  drawConnectors,
  drawLandmarks,
  POSE_CONNECTIONS,
  FACEMESH_TESSELATION,
  HAND_CONNECTIONS
} from "@mediapipe/drawing_utils";

const Runner = () => {
const videoElement = useRef(null);
const canvasElement = useRef(null);
const [context, setContext] = useState(null)

function onResults(results, canvasCtx = context) {
  console.log('in component', results, canvasCtx)
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.segmentationMask, 0, 0,
    canvasElement.width,
    canvasElement.height
  );

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-both';
  canvasCtx.fillStyle = '#FFFFFF';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';

  // pose-connections
  drawConnectors(
    canvasCtx,
    results.poseLandmarks,
    POSE_CONNECTIONS,
    {color: '#000000', lineWidth: 1}
  );

  // pose-landmarks
  drawLandmarks(
    canvasCtx,
    results.poseLandmarks,
    {color: '#000000', lineWidth: 1}
  );

  // facemesh tesselation
  drawConnectors(
    canvasCtx,
    results.faceLandmarks,
    FACEMESH_TESSELATION,
    {color: '#00000', lineWidth: 1}
  );

  // left hand connections
  drawConnectors(
    canvasCtx,
    results.leftHandLandmarks,
    HAND_CONNECTIONS,
    {color: '#000000', lineWidth: 1}
  );

  // left hand landmarks
  drawLandmarks(
    canvasCtx,
    results.leftHandLandmarks,
    {color: '#000000', lineWidth: 1}
  );

  // right hand connections
  drawConnectors(
    canvasCtx,
    results.rightHandLandmarks,
    HAND_CONNECTIONS,
    {color: '#000000', lineWidth: 1}
  );

  // right hand landmarks
  drawLandmarks(
    canvasCtx,
    results.rightHandLandmarks,
    {color: '#000000', lineWidth: 1}
  );

  canvasCtx.restore();
}

const holistic = new Holistic({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});

console.log(holistic)

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

useEffect(() => {
  const video = videoElement.current
  const canvas = canvasElement.current
  setContext(canvas.getContext('2d'))

  console.log(context)

  holistic.onResults(onResults)
  const camera = new Camera(video, {
    onFrame: async () => {
      await holistic.send({image: video});
    },
    width: 1280,
    height: 3000
  });

  camera.start();
}, [context, holistic, onResults])

  return (
    <div className="container">
      <video className="input_video" hidden ref={videoElement}></video>
      <canvas className="output_canvas" width="1080px" height="1080px" style={{width: '100vw', height: '100vh'}} ref={canvasElement}></canvas>
    </div>
  )

}

export default Runner
