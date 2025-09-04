var statusText = document.querySelector('#statusText');
let joystick = document.querySelector('#joyStick')
window.xPosition = 127;
window.yPosition = 127;

function joystickMove(stick, xPosition, yPosition) {
  xPosition = Math.floor((xPosition - 127) * 50 / 128);
  yPosition = Math.floor((yPosition - 127) * 50 / 128);
  stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;
}

joystickMove(joystick, xPosition, yPosition);

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
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition;
      joystickMove(joystick, xPosition, yPosition);
    });
    let handleCharY = await joystickMonitoring.startNotificationsPosY();
    handleCharY.addEventListener('characteristicvaluechanged', async (event) => {
      let value = event.target.value;
      // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      value = value.buffer ? value : new DataView(value);
      yPosition = value.getUint8(0);
      console.log('Y: ' + yPosition);
      statusText.textContent = 'X: ' + xPosition + ', Y: ' + yPosition;
      joystickMove(joystick, xPosition, yPosition);
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