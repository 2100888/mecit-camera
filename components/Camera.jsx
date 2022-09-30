import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as MediaLibrary from 'expo-media-library';
import * as Bluetooth from './Bluetooth';
import * as Navigation from './Navigation';

const FIRST_ELEMENT = 'orientation';
const LAST_ELEMENT = 'photo';

export default function Main() {
    // Application settings
    const cameraRef = useRef();
    const [cameraPermission, setCameraPermission] = useState(false);
    const [mediaLibraryPermission, setMediaLibraryPermission] = useState(false);
    const [orientation, setOrientation] = useState('portrait');
    const { height, width } = useWindowDimensions();

    // Camera settings
    const animation = useRef(new Animated.Value(1)).current;
    const [currentElement, setCurrentElement] = useState('photo');

    // Bluetooth settings
    const bluetoothMessage = useRef('');
    const [bluetoothSocket, setBluetoothSocket] = useState(false);
    // const [bluetoothActiveSocket, setBluetoothActiveSocket] = useState(false);

    // Tracking settings
    const leftEyeCloseArray = useRef([]);
    const rightEyeCloseArray = useRef([]);
    const counter = useRef(0);
    const blinkTime = useRef(0);
    const [blink, setBlink] = useState(0);

    // Function that invokes action with respective to current element/option selected
    const invokeOption = () => {
        setBlink(0);
        if (currentElement === 'orientation') {
            updateOrientation();
        } else if (currentElement === 'photo') {
            captureImage();
        }
    };

    // Function that stores animation sequence after users attempt to capture an image
    const captureAnimation = () => {
        Animated.sequence([
            Animated.timing(animation, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(animation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            })
        ]).start();
    };

    // Function that allows users to capture an image and save it to their gallery
    const captureImage = async () => {
        try {
            captureAnimation();
            const newImage = await cameraRef.current.takePictureAsync({ quality: 1, skipProcessing: false });
            MediaLibrary.saveToLibraryAsync(newImage.uri);
        } catch (err) {
            console.log(err);
        }
    };

    // Function that allows user to toggle between portrait and landscape mode
    const updateOrientation = () => {
        if (orientation === 'portrait') {
            Bluetooth.sendData(bluetoothSocket, 'a') // Rotate the phone holder
        } else if (orientation === 'landscape') {
            Bluetooth.sendData(bluetoothSocket, 'b');
        }
        orientation === 'portrait' ? setOrientation('landscape') : setOrientation('portrait');
    };

    // Function that checks if face is centered in frame
    const centerFaceInFrame = (bounds) => {
        // 60x60 square in the center of the frame
        const centerSquare = {
            top: height / 2 - 60,
            bottom: height / 2 + 60,
            left: width / 2 - 60,
            right: width / 2 + 60
        };

        // Middle point of the user's face
        const faceMiddlePoint = {
            x: (bounds.origin.x * 2 + bounds.size.width) / 2,
            y: (bounds.origin.y * 2 + bounds.size.height) / 2,
        };

        /*
            Ensure middle point of user's face is inside 60x60 square
            Priority: Move Down -> Move Up -> Move Left -> Move Right
        */
        if (faceMiddlePoint.y > centerSquare.bottom) {
            bluetoothMessage.current = 'c';
        } else if (faceMiddlePoint.y < centerSquare.top) {
            bluetoothMessage.current = 'd';
        } else if (faceMiddlePoint.x > centerSquare.right) {
            bluetoothMessage.current = 'e';
        } else if (faceMiddlePoint.x < centerSquare.left) {
            bluetoothMessage.current = 'f';
        } else {
            bluetoothMessage.current = '\0';
        }

        Bluetooth.sendData(bluetoothSocket, bluetoothMessage.current);
    };

    // Function that handles blinks and winks
    const handleCloseEye = (leftEyeOpenProbability, rightEyeOpenProbability) => {
        const currentTime = new Date().getTime();
        const leftEyeClose = leftEyeOpenProbability < 0.33;
        const rightEyeClose = rightEyeOpenProbability < 0.33;

        if (leftEyeCloseArray.current.length === 10 || rightEyeCloseArray.current.length === 10) {
            leftEyeCloseArray.current.shift();
            rightEyeCloseArray.current.shift();
        }
        leftEyeCloseArray.current.push(leftEyeClose);
        rightEyeCloseArray.current.push(rightEyeClose);

        // Boolean variables that predict whether user has blinked/winked (eyes open -> close -> open)
        const predictLeftWink = leftEyeCloseArray.current[0] === false && leftEyeCloseArray.current[4] && leftEyeCloseArray.current[9] === false;
        const predictRightWink = rightEyeCloseArray.current[0] === false && rightEyeCloseArray.current[4] && rightEyeCloseArray.current[9] === false;
        const predictBlink = predictLeftWink && predictRightWink;

        if (blink > 0 && currentTime - blinkTime.current > 1000) { // Reset blink count if next blink not within 1s (not consecutive)
            setBlink(0);
        } else if (predictBlink && counter.current === 0) {
            blinkTime.current = currentTime;
            counter.current = 1;
            setBlink(blink + 1); // Increase blink count upon blink
        } else if ((predictLeftWink || predictRightWink) && counter.current === 0) { // Navigate element/option upon winks
            if (predictLeftWink && currentElement !== FIRST_ELEMENT) {
                setCurrentElement(Navigation.navigateOptions('left', currentElement));
            } else if (predictRightWink && currentElement !== LAST_ELEMENT) {
                setCurrentElement(Navigation.navigateOptions('right', currentElement));
            }
            leftEyeCloseArray.current = [];
            rightEyeCloseArray.current = [];
            counter.current = 1;
            setBlink(0);
        }

        // Prevent unnecessary loops
        if (counter.current >= 1 && counter.current < 6) {
            counter.current += 1;
        } else {
            counter.current = 0;
        }

        // Trigger event upon 3 consecutive blinks
        if (blink === 3) {
            invokeOption();
        }
    };

    /*
        Function that handles detected faces, refer to:
        https://docs.expo.dev/versions/latest/sdk/facedetector/#facefeature
        Currently programmed to support only 1 face in frame at all times
    */
    const handleFacesDetected = ({ faces }) => {
        if (faces.length === 0) {
            setBlink(0);
        } else {
            const face = faces[0];
            if (Bluetooth.ensureBluetoothConnection(bluetoothSocket)) { // Ensure HC-05 is connected
                centerFaceInFrame(face.bounds);
                if (bluetoothMessage.current === '\0') { // Ensure arm stops moving before checking for blinks and winks
                    handleCloseEye(face.rightEyeOpenProbability, face.leftEyeOpenProbability);
                } else {
                    setBlink(0);
                }
            }
        }
    };

    useEffect(() => {
        (async () => {
            const btSocket = await Bluetooth.retrieveBluetoothSocket();
            setBluetoothSocket(btSocket);
            const camPermission = await Camera.requestCameraPermissionsAsync();
            setCameraPermission(camPermission.status === 'granted');
            const galleryPermission = await MediaLibrary.requestPermissionsAsync();
            setMediaLibraryPermission(galleryPermission.status === 'granted');
        })();
    }, []);

    // Ensure necessary permissions were given by user before rendering application
    if (!bluetoothSocket) {
        return <Text>Please ensure device is paired with HC-05 via Bluetooth.</Text>
    };

    if (!cameraPermission || !mediaLibraryPermission) {
        return <Text>Please allow Camera and Gallery permissions in Settings.</Text>
    };

    // Application (camera) user interface
    return (
        <Animated.View style={{ opacity: animation }}>
            <Camera
                style={[styles.cam, { height: height, width: width }]} ref={cameraRef}
                autoFocus={Camera.Constants.AutoFocus.on} type={Camera.Constants.Type.front} onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    minDetectionInterval: 60,
                    mode: FaceDetector.FaceDetectorMode.accurate,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                    tracking: true
                }}
            >
                <View style={styles.camtainer}>
                    <Icon style={currentElement === 'orientation' ? [styles.icon, styles.selectedIcon] : styles.icon}
                        name={orientation === 'portrait' ? 'phone-landscape-outline' : 'phone-portrait-outline'} onPress={updateOrientation} />
                    <Text style={[styles.icon, { fontSize: 60 }]}>{blink}</Text>
                    <Icon style={currentElement === 'photo' ? [styles.icon, styles.selectedIcon] : styles.icon} name='camera-outline' onPress={captureImage} />
                </View>
            </Camera>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cam: {
        flex: 1,
        position: 'absolute'
    },
    camtainer: {
        alignItems: 'center',
        backgroundColor: '#000000',
        bottom: 0,
        flex: 1,
        flexDirection: 'row',
        opacity: 0.7,
        position: 'absolute',
        width: '100%',
        zIndex: 100
    },
    icon: {
        color: '#ffffff',
        flex: 1,
        fontSize: 30,
        textAlign: 'center'
    },
    selectedIcon: {
        color: '#ffe203',
        fontSize: 45
    }
});
