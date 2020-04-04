function cvImageToMessageData(cvImage) {
  console.log("from Mat", cvImage.cols, cvImage.rows, cvImage.channels(), cvImage.type(), cvImage.data);
  if (cvImage.type() & cv.CV_32F) {
    data = cvImage.data32F;
  } else {
    data = cvImage.data;
  }
  return({
     cols: cvImage.cols,
     rows: cvImage.rows,
     type: cvImage.type(),
     data: data,
  });
}

function messageDataToCvImage(messageData) {
  let {cols, rows, type, data} =  messageData;
  console.log("to Mat", cols, rows, type, data);
  return(cv.matFromArray(cols, rows, type, data));
}
