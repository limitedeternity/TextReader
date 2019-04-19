const app = require("electron").app;
const BrowserWindow = require("electron").BrowserWindow;
const ipcMain = require("electron").ipcMain;
const dialog = require("electron").dialog;
const url = require("url");
const path = require("path");
const fs = require("fs");
const readChunk = require("read-chunk");

let mainWindow = null;
let openedFile = null;
let fileSize = null;
let startPos = 0;

function updateText(start) {
  let input = readChunk.sync(openedFile, start, 1000);
  let readFile = input instanceof Uint8Array ? input : new Uint8Array(input);
  return readFile.toString();
}

function createMainWindow() {
  let win = new BrowserWindow({
    height: 390,
    width: 520,
    resizable: true
  });

  win.loadURL(
    url.format({
      pathname: path.join(app.getAppPath(), "app", "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  win.on("closed", () => {
    mainWindow = null;
  });

  return win;
}

app.on("window-all-closed", event => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on("ready", () => {
  mainWindow = createMainWindow();
});

ipcMain.on("read-line", event => {
  event.sender.send("store-line", updateText(startPos));
});

ipcMain.on("file-dialog", event => {
  dialog.showOpenDialog(
    {
      properties: ["openFile"],
      filters: [{ name: "Text", extensions: ["txt"] }]
    },
    file => {
      if (file !== undefined) {
        startPos = 0;
        openedFile = file[0];
        fileSize = fs.statSync(openedFile).size;
        event.sender.send("open-success");
      }
    }
  );
});

ipcMain.on("update-line", (event, action) => {
  switch (action) {
    case "increment":
      if (startPos + 2000 < fileSize) {
        startPos += 1000;
      } else if (startPos + 2000 > fileSize) {
        startPos = fileSize - 2000;
      }

      break;

    case "decrement":
      if (startPos - 1000 > 0) {
        startPos -= 1000;
      } else {
        startPos = 0;
      }

      break;

    default:
      break;
  }

  event.sender.send("line-updated");
});
