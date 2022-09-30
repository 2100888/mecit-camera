/* Include necessary libraries */
#include <SoftwareSerial.h>
#include <Servo.h>

/* Bluetooth */
#define BTRX 9
#define BTTX 8
SoftwareSerial BTserial(BTTX, BTRX);

/* Servo motors */
#define TOP 7
#define MIDDLE 5
#define BOTTOM 3
Servo TopServo;
Servo MiddleServo;
Servo BottomServo;

/* Initial position */
#define PORTRAIT_TOP 10
#define PORTRAIT_MIDDLE 50
#define PORTRAIT_BOTTOM 140
#define LANDSCAPE_TOP 170
#define LANDSCAPE_MIDDLE 120
#define LANDSCAPE_BOTTOM 110

/* Global variables */
#define BAUD_RATE 9600
#define STEPS 2
#define SERVO_MIN 40                    // Lowest angle set for all servo motors
#define MIDDLE_MAX 110                  // Highest angle set for middle servo motor
#define BOTTOM_MAX 170                  // Highest angle set for bottom servo motor
#define TIMEKEEPER 25                   // Acts as a timer
char orientation = 'p';                 // 'p' - Portrait, 'l' - Landscape
unsigned int topServoPos = PORTRAIT_TOP;
unsigned int middleServoPos = PORTRAIT_MIDDLE;
unsigned int bottomServoPos = PORTRAIT_BOTTOM;

/* Movement functions */
void rotatePhoneHolder() {
  unsigned int i;
  switch (orientation) {
    case 'l':   // Change to landscape
      if (topServoPos > LANDSCAPE_TOP) {
        for (i = topServoPos; i > LANDSCAPE_TOP; i -= STEPS) {
          TopServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = topServoPos; i < LANDSCAPE_TOP; i += STEPS) {
          TopServo.write(i);
          delay(TIMEKEEPER);
        }
      }
  
      if (middleServoPos > LANDSCAPE_MIDDLE) {
        for (i = middleServoPos; i > LANDSCAPE_MIDDLE; i -= STEPS) {
          MiddleServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = middleServoPos; i < LANDSCAPE_MIDDLE; i += STEPS) {
          MiddleServo.write(i);
          delay(TIMEKEEPER);
        }
      }
  
      if (bottomServoPos > LANDSCAPE_BOTTOM) {
        for (i = bottomServoPos; i > LANDSCAPE_BOTTOM; i -= STEPS) {
          BottomServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = bottomServoPos; i < LANDSCAPE_BOTTOM; i += STEPS) {
          BottomServo.write(i);
          delay(TIMEKEEPER);
        }
      }
      break;
    case 'p':   // Change to portrait
      if (bottomServoPos > PORTRAIT_BOTTOM) {
        for (i = bottomServoPos; i > PORTRAIT_BOTTOM; i -= STEPS) {
          BottomServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = bottomServoPos; i < PORTRAIT_BOTTOM; i += STEPS) {
          BottomServo.write(i);
          delay(TIMEKEEPER);
        }
      }
      
      if (middleServoPos > PORTRAIT_MIDDLE) {
        for (i = middleServoPos; i > PORTRAIT_MIDDLE; i -= STEPS) {
          MiddleServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = middleServoPos; i < PORTRAIT_MIDDLE; i += STEPS) {
          MiddleServo.write(i);
          delay(TIMEKEEPER);
        }
      }
      
      if (topServoPos > PORTRAIT_TOP) {
        for (i = topServoPos; i > PORTRAIT_TOP; i -= STEPS) {
          TopServo.write(i);
          delay(TIMEKEEPER);
        }
      } else {
        for (i = topServoPos; i < PORTRAIT_TOP; i += STEPS) {
          TopServo.write(i);
          delay(TIMEKEEPER);
        }
      }
      break;
    default:
      break;
  }
  topServoPos = TopServo.read();
  middleServoPos = MiddleServo.read();
  bottomServoPos = BottomServo.read();
  delay(1000);
  Serial.println("ROTATE");
}

void moveUp() {
  if (middleServoPos <= MIDDLE_MAX - STEPS && bottomServoPos <= BOTTOM_MAX - STEPS) {
    topServoPos += STEPS;
    if (TopServo.read() != topServoPos) {
      TopServo.write(topServoPos);
      delay(TIMEKEEPER);
    }
    middleServoPos += STEPS;
    if (MiddleServo.read() != middleServoPos) {
      MiddleServo.write(middleServoPos);
      delay(TIMEKEEPER);
    }
    bottomServoPos += STEPS;
    if (BottomServo.read() != bottomServoPos) {
      BottomServo.write(bottomServoPos);
      delay(TIMEKEEPER);
    }
  }
  Serial.println("UP");
}

void moveDown() {
  if (middleServoPos >= SERVO_MIN + STEPS && bottomServoPos >= SERVO_MIN + STEPS) {
    topServoPos -= STEPS;
    if (TopServo.read() != topServoPos) {
      TopServo.write(topServoPos);
      delay(TIMEKEEPER);
    }
    middleServoPos -= STEPS;
    if (MiddleServo.read() != middleServoPos) {
      MiddleServo.write(middleServoPos);
      delay(TIMEKEEPER);
    }
    bottomServoPos -= STEPS;
    if (BottomServo.read() != bottomServoPos) {
      BottomServo.write(bottomServoPos);
      delay(TIMEKEEPER);
    }
  }
  Serial.println("DOWN");
}

void moveLeft() {
  if (bottomServoPos <= BOTTOM_MAX - STEPS) {
    bottomServoPos += STEPS;
    if (BottomServo.read() != bottomServoPos) {
      BottomServo.write(bottomServoPos);
      delay(TIMEKEEPER);
    }
  }
  Serial.println("LEFT");
}

void moveRight() {
  if (bottomServoPos >= SERVO_MIN + STEPS) {
    bottomServoPos -= STEPS;
    if (BottomServo.read() != bottomServoPos) {
      BottomServo.write(bottomServoPos);
      delay(TIMEKEEPER);
    }
  }
  Serial.println("RIGHT");
}

/* Setup functions */
void setup() {
  // Attach servo motors
  TopServo.attach(TOP);
  MiddleServo.attach(MIDDLE);
  BottomServo.attach(BOTTOM);

  // Initialise servo motors to portrait mode
  BottomServo.write(PORTRAIT_BOTTOM);
  delay(TIMEKEEPER);
  TopServo.write(PORTRAIT_TOP);
  delay(TIMEKEEPER);
  MiddleServo.write(PORTRAIT_MIDDLE);
  delay(TIMEKEEPER);

  // Initialise UART with 9600 baud rate
  Serial.begin(BAUD_RATE);
  BTserial.begin(BAUD_RATE);
}

/* Main program */
void loop() {
  if (BTserial.available() > 0) {
    unsigned int message = BTserial.read();
    BTserial.end();                   // Stop BT
    switch (message) {
      case 0:
        Serial.println("CENTER");
        break;
      case 97:
        orientation = 'l';
        rotatePhoneHolder();
        break;
      case 98:
        orientation = 'p';
        rotatePhoneHolder();
        break;
      case 99:
        moveDown();
        break;
      case 100:
        moveUp();
        break;
      case 101:
        moveLeft();
        break;
      case 102:
        moveRight();
        break;
      default:
        break;
    }
    BTserial.begin(BAUD_RATE);      // Restart BT after instruction completes
  }
}
