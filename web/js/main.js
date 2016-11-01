/* globals MediaRecorder */
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
window.addEventListener("load", initAudio);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;
var gumVideo = document.querySelector('video#gum');
var authorsSelector = document.querySelector('input#authors_selector');
var generateButton = document.querySelector('button#generate');
var recordButton = document.querySelector('button#record');
var lyricsTextArea = document.querySelector('textarea#lyrics_text');
var sentenceCountInput = document.querySelector('input#sentence_count');
var bannedWordsCountInput = document.querySelector('input#banned_words_count');
var attemptsInput = document.querySelector('input#attempts');
var stateSizeInput = document.querySelector('input#state_size');
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
  url: "http://yavor-ivanov.net:5000/authors?cached=true"
}).then(function(data) {
  authorsSelector.disabled = false;
   $select = $('#authors_selector').selectize({
      maxItems: null,
      valueField: 'slug',
      labelField: 'name',
      searchField: 'name',
      options: data,
      create: false
    });
    console.log("authors fetched");
 });

function generateText(){
  var authorsValue;
  if($select==null){
     window.alert("Please select one or more artists");
     return;
   } 

  var selectizeControl = $select[0].selectize;
  authorsValue = selectizeControl.getValue();
  if(authorsValue==""){
    window.alert("Please select one or more artists");
  }

  var sentenceCount = sentenceCountInput.value;
  if(sentenceCount==""){
    sentenceCount = 5;
  }

  var bannedWordsCount = bannedWordsCountInput.value;
  if(bannedWordsCount==""){
    bannedWordsCount = 100;
  }

  var attempts = attemptsInput.value;
  if(attempts==""){
    attempts = 10;
  }

  var stateSize = stateSizeInput.value;
  if(stateSize==""){
    stateSize = 2;
  }

  $.ajax({
      type: "POST",
      url: "http://192.168.10.106:5000/generate_lyrics",
      data: "authors="+ authorsValue + "&"+
      "sentence_count="+sentenceCount+ "&"+
      "banned_words_count="+bannedWordsCount+ "&"+
      "attempts="+attempts+ "&"+
      "state_size="+stateSize
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
  var playPromise = document.getElementById('audio').play();
      // In browsers that don’t yet support this functionality,
      // playPromise won’t be defined.
      if (playPromise !== undefined) {
        playPromise.then(function() {
          // Automatic playback started!
        }).catch(function(error) {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
          console.log("eeee stiga ee " + error);
        });
      }
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

function initAudio(){
  var dir, ext, mylist;
  dir = "audio_tracks/";
  ext = ".mp3";
  // Audio Object
  document.getElementById('audio').src = dir+"default"+ext;
  // Event Handling
  mylist = document.getElementById("mylist");
  mylist.addEventListener("change", changeTrack);
  // Functions
  function changeTrack(event){
    console.log("track name",dir+event.target.value+ext);
      document.getElementById('audio').src = dir+event.target.value+ext;
      var playPromise = document.getElementById('audio').play();

      // In browsers that don’t yet support this functionality,
      // playPromise won’t be defined.
      if (playPromise !== undefined) {
        playPromise.then(function() {
          // Automatic playback started!
        }).catch(function(error) {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
          console.log("eeee stiga ee " + error);
        });
      }
  }
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
