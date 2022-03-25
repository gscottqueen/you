const body = document.getElementById('you');
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');
let streamStarted = false;

// check for device support
if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
  console.log("Let's get this party started")
}

// get user permission and access Media Devices object
navigator.mediaDevices.getUserMedia({
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
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
  console.log(stream, streamStarted)
}).catch( err => {
  console.log(err)
});

