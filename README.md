# MECIT - ARMorix
A prototype developed during Tech for Good (T4G) 2022.<br />
Mobile device will be running a camera application that can be controlled with eye tracking features.<br />
The application is then able to wirelessly control a robotic arm by sending signals to position it via face tracking.

## Camera Components
* Bluetooth: Allows connection to the HC-05.
* Camera: Mobile application with face detection.
* Navigation: Stores options (features) that users can navigate.

## Robotic Arm
Arduino code can be found in the mecit-arm directory.<br />
Program is used to control robotic arm.<br />
Not all intended features have been completed.<br />

## Bluetooth Serial Communication
Data ia sent from our mobile application (CHAR) to the Arduino (UINT). 
| CHAR  | UINT    | INSTRUCTION         |
| :---: | :---:   | :---:               |
| NULL  | 0       | NIL                 |
| a     | 97      | LANDSCAPE MODE      |
| b     | 98      | PORTRAIT MODE       |
| c     | 99      | MOVE DOWN           |
| d     | 100     | MOVE UP             |
| e     | 101     | MOVE LEFT           |
| f     | 102     | MOVE RIGHT          |
