importScripts(
  "thirdparty/opencv.js",
  "util.js"
);

function equalize(cvImage) {
  cv.cvtColor(cvImage, cvImage, cv.COLOR_RGB2GRAY,0 )
  let tileGridSize = new cv.Size(cvImage.rows / 8, cvImage.cols / 8);
  const clahe = new cv.CLAHE(40, tileGridSize);
  clahe.setClipLimit(0.01 * 255);
  clahe.apply(cvImage, cvImage);
  cv.medianBlur(cvImage, cvImage, 5);
  // TODO: percentile clip
}

self.addEventListener("message", (message) => {

  if (message.data.request == "equalize") {
    const cvImage = messageDataToCvImage(message.data);
    equalize(cvImage);
    messageData = cvImageToMessageData(cvImage);
    self.postMessage(messageData);
    cvImage.delete()
  }

});
