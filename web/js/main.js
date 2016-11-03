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

/**
 * onVideoReady is a callback called when the stop recording button is clicked
 * when the blobs are ready for use this callback is called
 * @param recordedBlobs - returning the recorded blobs which are later uploaded to the server
 */
recorderInstance.onVideoReady = function (recordedBlobs) {
    var beatName = selectList.options[selectList.selectedIndex].text;
    API.uploadToServer(recordedBlobs, beatName, function (data) {
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

/**
 * function which generates text based on the values from input fields
 */
function generateText() {
    if (!isInputValid()) {
        return;
    }
    var selectizeControl = $select[0].selectize;
    var artistsListValue = selectizeControl.getValue();
    API.generateLyricsCall({
            artistsListValue: artistsListValue,
            sentenceCount: getSentenceCount(),
            bannedWordsCount: getBannedWordsCount(),
            attempts: getAttempts(),
            stateSize: getStateSize()
        },
        function callback(data) {
            lyricsTextArea.value = data;
        });
}

/**
 * @returns {string} entered state size or default value
 */
function getStateSize() {
    var stateSize = stateSizeInput.value;
    if (stateSize == "") {
        return 2;
    }
    return stateSize;
}
/**
 * @returns {string} entered attempts or default value
 */
function getAttempts() {
    var attempts = attemptsInput.value;
    if (attempts == "") {
        return 10;
    }
    return attempts;
}
/**
 * @returns {string} entered bannedWordsCount or default value
 */
function getBannedWordsCount() {
    var bannedWordsCount = bannedWordsCountInput.value;
    if (bannedWordsCount == "") {
        return 100;
    }
    return bannedWordsCount;
}
/**
 * @returns {string} entered sentenceCount or default value
 */
function getSentenceCount() {
    var sentenceCount = sentenceCountInput.value;
    if (sentenceCount == "") {
        return 5;
    }
    return sentenceCount;
}

/**
 * checks for valid input
 * @returns {boolean} true if the inputs are valid
 */
function isInputValid() {
    if ($select == null) {
        window.alert("Please select one or more artists");
        return false;
    }
    var selectizeControl = $select[0].selectize;
    var artistsListValue = selectizeControl.getValue();
    if (artistsListValue == "") {
        window.alert("Please select one or more artists");
        return false;
    }
    return true;
}