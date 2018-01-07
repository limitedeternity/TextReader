const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const url = require('url');
const path = require('path');
const fs = require("fs");
const readChunk = require('read-chunk');

var window = null;
var openedFile = null;
var fileSize = null;
var startPos = 0;

app.on('ready', () => {
    window = new BrowserWindow({
        height: 390,
        width: 520,
        resizable: false,
        transparent: true

    });

    window.loadURL(url.format({
      pathname: path.join(__dirname, 'app', 'index.html'),
      protocol: 'file:',
      slashes: true

    }));

});

const updateText = (start) => {
  let input = readChunk.sync(openedFile, start, 1000);
  let readFile = (input instanceof Uint8Array) ? input : new Uint8Array(input);
  return readFile.toString();
}

ipcMain.on('close-main-window', (event) => {
    app.quit();
});

ipcMain.on('read-line', (event) => {
  event.sender.send('store-line', updateText(startPos));
});

ipcMain.on('file-dialog', (event) => {
  dialog.showOpenDialog({properties: ['openFile'], filters: [{name: 'Text', extensions: ['txt']}]},
    (file) => {
      if (file !== undefined) {
        startPos = 0;
        openedFile = file[0];
        fileSize = fs.statSync(openedFile).size;
        event.sender.send('open-success');
      }
    });
});

ipcMain.on('update-line', (event, action) => {
  switch (action) {
    case 'increment':

      if (startPos + 2000 < fileSize) {
        startPos += 1000;

      } else if (startPos + 2000 > fileSize) {
        startPos = fileSize - 2000;
      }

      break;

    case 'decrement':
      if (startPos - 1000 > 0) {
        startPos -= 1000;

      } else {
        startPos = 0;
      }

      break;

    default:
      break;
  }

  event.sender.send('line-updated');
});
