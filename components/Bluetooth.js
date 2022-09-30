import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';

// Function to retrieve socket from the HC-05
export async function retrieveBluetoothSocket() {
    try {
        const bondedDevices = await RNBluetoothClassic.getBondedDevices();
        let bluetoothSocket;
        bondedDevices.forEach(bt => {
            if (bt.name === 'HC-05') {
                bluetoothSocket = bt;
                RNBluetoothClassic.cancelDiscovery();
            }
        });
        return bluetoothSocket;
    } catch (err) {
        console.log(err);
    }
};

// Function to ensure HC-05 is connected
export async function ensureBluetoothConnection(bluetoothSocket) {
    const connected = await bluetoothSocket.isConnected();
    if (connected) {
        return true;
    } else {
        bluetoothSocket.connect(); // Establish connection with socket
        return false;
    }
};

// Function to trasmit data to the Arduino via Bluetooth
export async function sendData(bluetoothSocket, bluetoothMessage) {
    if (RNBluetoothClassic.getConnectedDevice(bluetoothSocket.address)) { // Ensure active socket
        try {
            await RNBluetoothClassic.writeToDevice(bluetoothSocket.address, bluetoothMessage);
            await bluetoothSocket.write(Buffer.alloc(1, bluetoothMessage));
        } catch (err) {
            console.log(err);
        }
    }
};
