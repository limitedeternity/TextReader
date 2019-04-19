$(document).ready(() => {
  $("#fileOpen").on("click", () => {
    ipcRenderer.send("file-dialog");
  });

  ipcRenderer.on("open-success", event => {
    ipcRenderer.send("read-line");
  });

  ipcRenderer.on("store-line", (event, line) => {
    $("#inputField").text(line);

    if (!$("#nextLine").is(":visible")) {
      $("#nextLine").show();
      $("#prevLine").show();
    }
  });

  $("#nextLine").on("click", () => {
    ipcRenderer.send("update-line", "increment");
  });

  $("#prevLine").on("click", () => {
    ipcRenderer.send("update-line", "decrement");
  });

  ipcRenderer.on("line-updated", event => {
    ipcRenderer.send("read-line");
  });
});
