(function() {
  'use strict';

  const JOYSTICK_SERVICE = "35a66b3c-ffa4-4689-a8a4-b547e25c677f";
  const JOYSTICK_VALUE_X_CHARACTERISTIC = "1954f9d7-5e68-40bd-88c2-c3c96c410fe0";
  const JOYSTICK_VALUE_Y_CHARACTERISTIC = "5e8f0838-b2b5-4748-9cfb-4a414a525337";

  class joystickMonitoring {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }
    async connect() {
      let device = await navigator.bluetooth.requestDevice({filters:[
        {name:[ 'joystick_7seg' ]},
        {services: [JOYSTICK_SERVICE]}
      ]})
      console.log('> Found ' + device.name);
      console.log('Connecting to GATT Server...');
      this.device = device;
      let server = await device.gatt.connect();
      this.server = server;
      let service = await server.getPrimaryService(JOYSTICK_SERVICE);
      console.log('> Found service: ' + service.uuid);
      return await this._cacheCharacteristics(service,
                                              [JOYSTICK_VALUE_X_CHARACTERISTIC,
                                               JOYSTICK_VALUE_Y_CHARACTERISTIC]
      );
    }

    /* Joystick Service */
    async startNotificationsPosX() {
      return await this._startNotifications(JOYSTICK_VALUE_X_CHARACTERISTIC);
    }
    async startNotificationsPosY() {
      return await this._startNotifications(JOYSTICK_VALUE_Y_CHARACTERISTIC);
    }
    async stopNotificationsPosX() {
      return await this._stopNotifications(JOYSTICK_VALUE_X_CHARACTERISTIC);
    }
    async stopNotificationsPosY() {
      return await this._stopNotifications(JOYSTICK_VALUE_Y_CHARACTERISTIC);
    }

    /* Utils */
    async _cacheCharacteristics(service, characteristicUuids) {
      for (const index in characteristicUuids) {
        let characteristic = await service.getCharacteristic(characteristicUuids[index]);
        console.log('> Found characteristic: ' + characteristic.uuid);
        this._characteristics.set(characteristic.uuid, characteristic);
      }
    }
    async _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      let value = await characteristic.readValue()
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      return value;
    }
    async _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return await characteristic.writeValue(value);
    }
    async _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return await characteristic.startNotifications();
    }
    async _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return await characteristic.stopNotifications()
    }
  }

  window.joystickMonitoring = new joystickMonitoring();

})();
