import React, { useState, useRef } from "react";
import "./Camera.css";

export default function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageData, setImageData] = useState(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        console.log("Error accessing camera:", error);
      });
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set the canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const dataURL = canvas.toDataURL("image/jpeg");

    // Set the captured image data
    setImageData(dataURL);
  };

  return (
    <div>
      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureImage}>Capture Image</button>

      {imageData && (
        <div>
          <h2>Captured Image:</h2>
          <img src={imageData} alt="Captured" style={{ width: "100%" }} />
        </div>
      )}

      <video ref={videoRef} autoPlay />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
