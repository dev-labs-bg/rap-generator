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

/**
 * default values for the input fields used when nothing is entered
 * returns the default value for the corresponding key
 */
var GLOBALS = {
    default_state_size: 2,
    default_attempts: 10,
    default_sentence_count: 5,
    default_banned_words_count: 100
};

// selection of the selectize`s select element filled with artists
var $select;

//instance of the Recorder class which manages the recording logic
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
    debugger;
    API.generateLyricsCall({
            artistsListValue: artistsListValue,
            sentenceCount: getCountFromInput(sentenceCountInput, GLOBALS.default_sentence_count),
            bannedWordsCount: getCountFromInput(bannedWordsCountInput, GLOBALS.default_banned_words_count),
            attempts: getCountFromInput(attemptsInput, GLOBALS.default_attempts),
            stateSize: getCountFromInput(stateSizeInput, GLOBALS.default_state_size)
        },
        function callback(data) {
            lyricsTextArea.value = data;
        });
}

/**
 * Returns value from <input>
 * @param inputField - <input> from which the value is taken
 * @param defaultValue - if not valid or not entered
 * @returns {int} int value from input or default value if not entered or invalid
 */
function getCountFromInput(inputField, defaultValue) {
    var count = inputField.value;
    if (count != "") {
        var value = parseInt(count);
        if (!isNaN(value)) {
            return value;
        }
    }
    return defaultValue;
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