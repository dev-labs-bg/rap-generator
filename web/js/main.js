/* globals MediaRecorder */
var gumVideo = document.querySelector('video#gum');
var resultVideo = document.querySelector('video#result');
var authorsSelector = document.querySelector('input#authors_selector');
var generateButton = document.querySelector('button#generate');
var recordButton = document.querySelector('button#record');
var lyricsTextArea = document.querySelector('textarea#lyrics_text');
var sentenceCountInput = document.querySelector('input#sentence_count');
var bannedWordsCountInput = document.querySelector('input#banned_words_count');
var attemptsInput = document.querySelector('input#attempts');
var stateSizeInput = document.querySelector('input#state_size');
var selectList = document.querySelector('select#mylist');
var $select;

generateButton.onclick = generateText;
var recorderInstance = new Recorder();
recorderInstance.onVideoReady = function (recordedBlobs) {
    uploadToServer(recordedBlobs, function (data) {
        resultVideo.src = data.url;
    });
};

recordButton.onclick = function () {
    // this == dom button element
    recorderInstance.toggleRecording();
};

function generateText() {
    var authorsValue;
    if ($select == null) {
        window.alert("Please select one or more artists");
        return;
    }

    var selectizeControl = $select[0].selectize;
    authorsValue = selectizeControl.getValue();
    if (authorsValue == "") {
        window.alert("Please select one or more artists");
    }

    var sentenceCount = sentenceCountInput.value;
    if (sentenceCount == "") {
        sentenceCount = 5;
    }

    var bannedWordsCount = bannedWordsCountInput.value;
    if (bannedWordsCount == "") {
        bannedWordsCount = 100;
    }

    var attempts = attemptsInput.value;
    if (attempts == "") {
        attempts = 10;
    }

    var stateSize = stateSizeInput.value;
    if (stateSize == "") {
        stateSize = 2;
    }

    API.generateLyricsCall({
        authorsValue: authorsValue,
        selectizeControl: selectizeControl,
        sentenceCount: sentenceCount,
        bannedWordsCount: bannedWordsCount,
        attempts: attempts,
        stateSize: stateSize
    }, function callback(data) {
        lyricsTextArea.value = data;
    });
}

function uploadToServer(recordedBlobs, callback) {
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    //the code below saves the file to the computer
    // var url = window.URL.createObjectURL(blob);
    // var a = document.createElement('a');
    // a.style.display = 'none';
    // a.href = url;
    // a.download = 'test.mp4';
    // document.body.appendChild(a);
    // a.click();
    // setTimeout(function() {
    //   document.body.removeChild(a);
    //   window.URL.revokeObjectURL(url);
    // }, 100);

    //sending the file trough form data
    var myFormData = new FormData();
    myFormData.append('audio', blob);
    myFormData.append('beat', 'track1.mp3');
    $.ajax({
        url: 'http://192.168.10.118:8000/api/upload',
        type: 'POST',
        processData: false, // important
        contentType: false, // important
        dataType: "json",
        data: myFormData
    }).then(function (data) {
        console.log('url', data);
        callback(data);
    });
}
