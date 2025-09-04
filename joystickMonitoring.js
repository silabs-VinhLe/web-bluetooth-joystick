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
    connect() {
      return navigator.bluetooth.requestDevice({filters:[
        {name:[ 'joystick_7seg' ]},
        {services: [JOYSTICK_SERVICE]}
      ]})
      .then(device => {
        console.log('> Found ' + device.name);
        console.log('Connecting to GATT Server...');
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return server.getPrimaryService(JOYSTICK_SERVICE);
      })
      .then(service => {
        console.log('> Found service: ' + service.uuid);
        return this._cacheCharacteristics(service,
                                          [JOYSTICK_VALUE_X_CHARACTERISTIC,
                                           JOYSTICK_VALUE_Y_CHARACTERISTIC]
        );
      })
    }

    /* Proximity Tracking Service */

    startNotificationsPosX() {
      return this._startNotifications(JOYSTICK_VALUE_X_CHARACTERISTIC);
    }
    startNotificationsPosY() {
      return this._startNotifications(JOYSTICK_VALUE_Y_CHARACTERISTIC);
    }
    stopNotificationsPosX() {
      return this._stopNotifications(JOYSTICK_VALUE_X_CHARACTERISTIC);
    }
    stopNotificationsPosY() {
      return this._stopNotifications(JOYSTICK_VALUE_Y_CHARACTERISTIC);
    }

    /* Utils */

    _cacheCharacteristics(service, characteristicUuids) {
      let chain = Promise.resolve();
      for (const index in characteristicUuids) {
        chain = chain.then(() => {
          return service.getCharacteristic(characteristicUuids[index])
          .then(characteristic => {
            console.log('> Found characteristic: ' + characteristic.uuid);
            this._characteristics.set(characteristic.uuid, characteristic);
          })
        });
      }
      return chain;
    }
    _readCharacteristicValue(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }
    _writeCharacteristicValue(characteristicUuid, value) {
      let characteristic = this._characteristics.get(characteristicUuid);
      return characteristic.writeValue(value);
    }
    _startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.startNotifications()
      .then(() => characteristic);
    }
    _stopNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to remove characteristicvaluechanged event
      // handlers in the resolved promise.
      return characteristic.stopNotifications()
      .then(() => characteristic);
    }
  }

  window.joystickMonitoring = new joystickMonitoring();

})();
