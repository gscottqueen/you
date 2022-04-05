const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
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

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

holistic.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 3000
});

camera.start();
