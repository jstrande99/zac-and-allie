import React, { useState } from 'react';
import { Camera } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

export default function Cameras() {
  const [imageData, setImageData] = useState(null);

  const handleTakePhoto = (dataUri) => {
    // Set the captured image data
    setImageData(dataUri);
  };

  return (
    <div>
      <Camera onTakePhoto={handleTakePhoto}
      // imageType = {IMAGE_TYPES.JPG}
      imageCompression = {0.97}
      isMaxResolution = {true}
      isImageMirror = {false}
      isSilentMode = {false}
      isDisplayStartCameraError = {true}
      isFullscreen = {false} />

      {imageData && (
        <div>
          <h2>Captured Image:</h2>
          <img src={imageData} alt="Captured" style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
