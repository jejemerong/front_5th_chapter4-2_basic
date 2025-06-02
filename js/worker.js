self.onmessage = function (event) {
  if (event.data === "start") {
    for (let i = 0; i < 10000000; i++) {
      const temp = i;
    }
    self.postMessage("done");
  }
};
