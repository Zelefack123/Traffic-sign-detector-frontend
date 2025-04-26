import PhotoPreviewSection from '@/components/PhotoPreviewSection';
import { AntDesign } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState<any>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      const takedPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(takedPhoto);
    }
  }; 

  const handleStartRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      const videoRecorded = await cameraRef.current.recordAsync();
      setVideo(videoRecorded);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetakePhoto = () => setPhoto(null);
  const handleRetakeVideo = () => {
    setVideo(null);
    setRecordingTime(0);
  };

  if (photo) return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />;
  if (video) return (
    <View style={styles.container}>
      <Text>Video Recorded ({formatTime(recordingTime)})</Text>
      <Button title="Retake" onPress={handleRetakeVideo} />
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {isRecording && (
          <View style={styles.timerContainer}>
            <View style={styles.timerBackground}>
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name='retweet' size={44} color='black' />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name='camera' size={44} color='black' />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, isRecording && styles.recordingButton]} 
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <AntDesign 
              name={isRecording ? 'pausecircle' : 'playcircleo'} 
              size={44} 
              color={isRecording ? 'red' : 'black'} 
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
  },
  timerBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});