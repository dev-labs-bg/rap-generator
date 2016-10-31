/* globals MediaRecorder */
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var gumVideo = document.querySelector('video#gum');
var authorsSelector = document.querySelector('input#authors_selector');
var generateButton = document.querySelector('button#generate');
var recordButton = document.querySelector('button#record');
var lyricsTextArea = document.querySelector('textarea#lyrics_text');
recordButton.onclick = toggleRecording;
generateButton.onclick = generateText;
var $select;

// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' ||
location.hostname === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

// Use old-style gUM to avoid requirement to enable the
// Enable experimental Web Platform features flag in Chrome 49

var constraints = {
  audio: true,
  video: true
};

$.ajax({
  url: "http://yavor-ivanov.net:5000/authors"
}).then(function(data) {
 console.log('data',data);
   $select = $('#authors_selector').selectize({
      maxItems: null,
      valueField: 'slug',
      labelField: 'name',
      searchField: 'name',
      options: data,
      create: false
    });
});

function generateText(){
  var selectizeControl = $select[0].selectize
  $.ajax({
      type: "POST",
      url: "http://192.168.10.106:5000/generate_lyrics",
      data: "authors="+ selectizeControl.getValue()
    }).then(function(data) {
     lyricsTextArea.value = data;
    });
}


function handleSuccess(stream) {
  window.stream = stream;
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    stopRecording();
    recordButton.textContent = 'Start Recording';
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  download();
}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  // var url = window.URL.createObjectURL(blob);
  // var a = document.createElement('a');
  // a.style.display = 'none';
  // a.href = url;
  // a.download = 'test.mp4';
  // document.body.appendChild(a);
  // // a.click();
  // setTimeout(function() {
  //   document.body.removeChild(a);
  //   window.URL.revokeObjectURL(url);
  // }, 100);

var myFormData = new FormData();
myFormData.append('video', blob);
$.ajax({
  url: 'http://192.168.10.10/upload',
  type: 'POST',
  processData: false, // important
  contentType: false, // important
  // dataType : 'json',
  data: myFormData
});
}
