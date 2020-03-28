function cvImageToMessageData(cvImage) {
  return({
     cols: cvImage.cols,
     rows: cvImage.rows,
     type: cvImage.type(),
     data: cvImage.data,
  });
}

function messageDataToCvImage(messageData) {
  const {cols, rows, type, data} =  messageData;
  return(cv.matFromArray(cols, rows, type, data));
}
