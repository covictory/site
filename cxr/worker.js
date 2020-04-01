importScripts(
  "thirdparty/opencv.js",
  "util.js"
);

function cv_percentile(cvImage, percentileLimits) {
  // from https://stackoverflow.com/questions/51063944/mapping-pixels-elements-to-percentiles-c-opencv
  // https://docs.opencv.org/master/d7/d32/tutorial_js_histogram_begins.html
  // to match https://docs.scipy.org/doc/numpy/reference/generated/numpy.percentile.html

  const sources = new cv.MatVector();
  sources.push_back(cvImage);
  const accumulate = false;
  const channels = [0];
  const histSize = [256];
  const ranges = [0, 1];
  const hist = new cv.Mat();
  const mask = new cv.Mat();

  cv.calcHist(sources, channels, mask, hist, histSize, ranges, accumulate);

  const bins = []
  const totalPixels = cvImage.cols * cvImage.rows;
  let fraction = 0;
  for (let i = 0; i < histSize[0]; i++) {
    fraction = hist.data32F[i] / totalPixels;
    bins.push({value : i / histSize[0], fraction : fraction});
  }
  bins.sort((a,b) => {
    return (a.fraction - b.fraction);
  });

  let [lowerPercentile, upperPercentile] = percentileLimits
  let lowerValue, upperValue;
  cumulativeFraction = 0;
  bins.forEach(bin => {
    if ( !lowerValue && cumulativeFraction > lowerPercentile ) {
      lowerValue = bin.value;
    }
    if ( !upperValue && cumulativeFraction > upperPercentile ) {
      upperValue = bin.value;
    }
    cumulativeFraction += bin.fraction;
  });
  upperValue = upperValue || 1.;
  console.log(cumulativeFraction);
  console.log(lowerValue, upperValue);
  return( {lower: lowerValue, upper: upperValue, } );
}

function equalize(cvImage) {
  // TODO: delete cv objects
  // cvImage in is 0-255, RGBA
  // cvImage out is 0-1, on channel
  let scale;
  let bias;

  // make one component grayscale
  cv.cvtColor(cvImage, cvImage, cv.COLOR_RGB2GRAY, 1)
  const rgbaPlanes = new cv.MatVector();
  cv.split(cvImage, rgbaPlanes);
  rgbaPlanes.get(0).copyTo(cvImage);

  console.log('channels', cvImage.channels());

  let minMax = cv.minMaxLoc(cvImage);

  [scale, bias] = [2**16 / minMax.maxVal, 0];
  console.log(scale, bias);
  cvImage.convertTo(cvImage, cv.CV_16UC1, scale, bias);

  console.log('mean is', cv.mean(cvImage));
  console.log('channels', cvImage.channels());

  /*
   * TODO
  // contrast limited adaptive histogram equalization
  const tileGridSize = new cv.Size(cvImage.rows / 4, cvImage.cols / 4);
  const clahe = new cv.CLAHE(0.01 * 2**16, tileGridSize);
  clahe.apply(cvImage, cvImage);
  */

  // normalize to 0-1
  [scale, bias] = [1./2**16, 0];
  cvImage.convertTo(cvImage, cv.CV_32F, scale, bias);
  console.log(cv.mean(cvImage));

  // denoise
  cv.medianBlur(cvImage, cvImage, 3);

  // find where the bulk of the image intensities lie
  const percentileLimits = [0.02, 0.98];
  result = cv_percentile(cvImage, percentileLimits);

  cv.cvtColor(cvImage, cvImage, cv.COLOR_GRAY2RGB, 3);

  return(result);
}


self.addEventListener("message", (message) => {
  if (message.data.request == "equalize") {
    const cvImage = messageDataToCvImage(message.data);
    result = equalize(cvImage);
    messageData = cvImageToMessageData(cvImage);
    messageData.result = result;
    self.postMessage(messageData);
    cvImage.delete()
  }
});
