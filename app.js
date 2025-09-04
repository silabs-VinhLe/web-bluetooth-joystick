var statusText = document.querySelector('#statusText');
let joystick = document.querySelector('#joyStick')
window.xPosition = 0;
window.yPosition = 0;

function joystickMove(stick, xPosition, yPosition) {
  stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;
}

joystickMove(joystick, xPosition, yPosition);

statusText.addEventListener('click', function() {
  statusText.textContent = 'Connecting...';
  console.log('connecting...');
  joystickMonitoring.connect()
  .then(() => {
    statusText.textContent = 'Connected';
    return joystickMonitoring.startNotificationsPosX();
  })
  .then((handleCharX) => {
    return handleCharX.addEventListener('characteristicvaluechanged', event => {
      let value = event.target.value;
      value = value.buffer ? value : new DataView(value);
      console.log('X: ' + value.getUint8(0));
      xPosition = Math.floor((value.getUint8(0) - 127) * 50 / 128);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition;
      joystickMove(joystick, xPosition, yPosition);
    })
  })
  .then(() => joystickMonitoring.startNotificationsPosY())
  .then((handleCharY) => {
    return handleCharY.addEventListener('characteristicvaluechanged', event => {
      let value = event.target.value;
      value = value.buffer ? value : new DataView(value);
      console.log('Y: ' + value.getUint8(0));
      yPosition = Math.floor((value.getUint8(0) - 127) * 50 / 128);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition;
      joystickMove(joystick, xPosition, yPosition);
    })
  })
  .catch(error => {
    statusText.textContent = error;
  });
});

// function loop()
// {
//   requestAnimationFrame(loop);
// }
// loop();