import React, { useState } from 'react';
import { Camera, FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './Camera.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "./Navbar";


export default function Cameras() {
  const [imageData, setImageData] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(FACING_MODES.ENVIRONMENT)

  const handleTakePhoto = (dataUri) => {
    // Set the captured image data
    setImageData(dataUri);
  };

  const handleCameraToggle = () => {
    if(isFrontCamera === FACING_MODES.ENVIRONMENT){
      setIsFrontCamera(FACING_MODES.USER);
    }else{
      setIsFrontCamera(FACING_MODES.ENVIRONMENT);
    }
  };

  return (
    <div>
      <Camera onTakePhoto={handleTakePhoto}
      // imageType = {IMAGE_TYPES.JPG}
      idealFacingMode = {isFrontCamera}
      imageCompression = {0.97}
      isMaxResolution = {true}
      isImageMirror = {false}
      isSilentMode = {false}
      isDisplayStartCameraError = {true}
      isFullscreen = {false} 
      className='preview'
      />
      <button onClick={handleCameraToggle} className='reverse'>
        <FontAwesomeIcon icon={['fa-solid', 'fa-camera-rotate']} size='2xl'/>
      </button>

      {imageData && (
        <div>
          <h2>Captured Image:</h2>
          <img src={imageData} alt="Captured" style={{ width: '100%' }} />
        </div>
      )}
      <Navbar/>
    </div>
  );
}
