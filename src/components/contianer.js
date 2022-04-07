import React from 'react'

const Container = () =>  {

  return (
    <div className="container">
      <video className="input_video" hidden></video>
      <canvas className="output_canvas" width="1080px" height="1080px" style={{width: '100vw', height: '100vh'}}></canvas>
    </div>
  )
}

export default Container
