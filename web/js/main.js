// globals
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
// selection of the selectize`s select element filled with artists
var $select;

var recorderInstance = new Recorder();
recorderInstance.onVideoReady = function (recordedBlobs) {
    uploadToServer(recordedBlobs, function (data) {
        resultVideo.controls = true;
        resultVideo.src = data.url;
    });
};

//on click methods setting
generateButton.onclick = generateText;
recordButton.onclick = function () {
    // this == dom button element
    recorderInstance.toggleRecording();
};

function generateText() {
    if (!isInputValid()) {
        return;
    }
    var selectizeControl = $select[0].selectize;
    var authorsValue = selectizeControl.getValue();
    API.generateLyricsCall({
            authorsValue: authorsValue,
            sentenceCount: getSentenceCount(),
            bannedWordsCount: getBannedWordsCount(),
            attempts: getAttempts(),
            stateSize: getStateSize()
        },
        function callback(data) {
            lyricsTextArea.value = data;
        });
}

function getStateSize() {
    var stateSize = stateSizeInput.value;
    if (stateSize == "") {
        return 2;
    }
    return stateSize;
}

function getAttempts() {
    var attempts = attemptsInput.value;
    if (attempts == "") {
        return 10;
    }
    return attempts;
}

function getBannedWordsCount() {
    var bannedWordsCount = bannedWordsCountInput.value;
    if (bannedWordsCount == "") {
        return 100;
    }
    return bannedWordsCount;
}

function getSentenceCount() {
    var sentenceCount = sentenceCountInput.value;
    if (sentenceCount == "") {
        return 5;
    }
    return sentenceCount;
}

function isInputValid() {
    if ($select == null) {
        window.alert("Please select one or more artists");
        return false;
    }
    var selectizeControl = $select[0].selectize;
    var authorsValue = selectizeControl.getValue();
    if (authorsValue == "") {
        window.alert("Please select one or more artists");
        return false;
    }
    return true;
}

function uploadToServer(recordedBlobs, callback) {
    var blob = new Blob(recordedBlobs, {type: 'video/webm'});
    var beatName = selectList.options[selectList.selectedIndex].text;
    //sending the file trough form data
    var myFormData = new FormData();
    myFormData.append('audio', blob);
    myFormData.append('beat', beatName);
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
