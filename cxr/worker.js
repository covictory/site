importScripts(
  "thirdparty/opencv.js",
  "util.js"
);

function cv_percentile(cvImage) {
  // from https://stackoverflow.com/questions/51063944/mapping-pixels-elements-to-percentiles-c-opencv
  // https://docs.opencv.org/master/d7/d32/tutorial_js_histogram_begins.html
  // to match https://docs.scipy.org/doc/numpy/reference/generated/numpy.percentile.html

  const sources = new cv.MatVector();
  sources.push_back(cvImage);
  const accumulate = false;
  const channels = [0];
  const histSize = [256];
  const ranges = [0, 255];
  const hist = new cv.Mat();
  const mask = new cv.Mat();

  cv.calcHist(sources, channels, mask, hist, histSize, ranges, accumulate);

  result = cv.minMaxLoc(hist, mask);
  for (let i = 0; i < histSize[0]; i++) {
    console.log( i, hist.data32F[i] );
  }


  /*

  const range = [0, 255];
  const uniform = true;

    cv::Mat hist;
    int histSize = 256;
    float range[] = { 0, 256 } ;
    const float* histRange = { range };
    bool uniform = true; bool accumulate = false;
    cv::calcHist( &gray, 1, 0, cv::Mat(), hist, 1, &histSize, &histRange, uniform, accumulate );

    // total pixels in image
    float totalPixels = gray.cols * gray.rows;

    // calculate percentage of every histogram bin (i.e: pixel value [0 - 255])
    // the 'bins' variable holds pairs of (int pixelValue, float percentage)
    std::vector<std::pair<int, float>> bins;
    float percentage;
    for(int i = 0; i < 256; ++i)
    {
        percentage = (hist.at<float>(i,0)*100.0)/totalPixels;
        bins.push_back(std::make_pair(i, percentage));
    }

    // sort the bins according to percentage
    sort(bins.begin(), bins.end(),comparator());

    // compute percentile for a pixel value
    int pixel = 185;
    float sum = 0;

    for (auto b : bins)
    {
        if(b.first != pixel)
            sum += b.second;
        else
        {
            sum += b.second/2;
            break;
        }
    }
    */
}

function equalize(cvImage) {
  cv.cvtColor(cvImage, cvImage, cv.COLOR_RGB2GRAY,0 )
  cv_percentile(cvImage);
  let tileGridSize = new cv.Size(cvImage.rows / 8, cvImage.cols / 8);
  const clahe = new cv.CLAHE(40, tileGridSize);
  clahe.setClipLimit(0.01 * 255);
  clahe.apply(cvImage, cvImage);
  cv.medianBlur(cvImage, cvImage, 5);
  let range = cv_percentile(cvImage);
  // TODO clip
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
