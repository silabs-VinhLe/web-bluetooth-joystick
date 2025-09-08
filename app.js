var statusText = document.querySelector('#statusText');
let joystick = document.querySelector('#joyStick')
window.xPosition = 127;
window.yPosition = 127;
window.buttonStatus = 1;

function joystickMove() {
  x = Math.floor((xPosition - 127) * 50 / 128);
  y = Math.floor((yPosition - 127) * 50 / 128);
  joystick.style.transform = `translate3d(${x}px, ${y}px, 0px)` + ' ' + (buttonStatus == 0 ? 'scale(0.7)' : 'scale(1)');
}

joystickMove(joystick);

statusText.addEventListener('click', async ()  => {
  try {
    statusText.textContent = 'Connecting...';
    console.log('connecting...');
    await joystickMonitoring.connect()
    statusText.textContent = 'Connected';
    let handleCharX = await joystickMonitoring.startNotificationsPosX();
    handleCharX.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      xPosition =  value.getUint8(0);
      console.log('X: ' + xPosition);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition + ', Button: ' + buttonStatus;
      joystickMove();
    });
    let handleCharY = await joystickMonitoring.startNotificationsPosY();
    handleCharY.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      yPosition = value.getUint8(0);
      console.log('Y: ' + yPosition);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition + ', Button: ' + buttonStatus;
      joystickMove();
    });

    let handleCharButtonStatus = await joystickMonitoring.startNotificationsButtonStatus();
    handleCharButtonStatus.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      buttonStatus = value.getUint8(0);
      console.log('Button status: ' + buttonStatus);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition + ', Button: ' + buttonStatus;
      joystickMove();
    });
  } catch(error) {
    statusText.textContent = error;
  }
});

// function loop()
// {
//   requestAnimationFrame(loop);
// }
// loop();