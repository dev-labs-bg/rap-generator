var API = {
    /**
     * Generate lyrics of a new song
     * @param parameters
     * @param parameters.artistsListValue - List of artist keys, separated by comma symbol
     * @param parameters.sentenceCount - Count of sentences you want to be returned (default: 5)
     * @param parameters.bannedWordsCount - How many of the last words used to generate the sentence should not be repeated (default: 100)
     * @param parameters.attempts - How many attempts to include certain word in a sentence,
     * before give up and send something random (default: 10)
     * @param parameters.stateSize - How many of the last words are remembered (default: 2).
     * If increased, the generation is slower.
     * @param callback - returns the generated text as string
     */
    generateLyricsCall: function (parameters, callback) {
        $.ajax({
            type: "POST",
            url: "https://rap-generator.devlabs-projects.com/generator/generate_lyrics",
            data: "authors=" + parameters.artistsListValue + "&" +
            "sentence_count=" + parameters.sentenceCount + "&" +
            "banned_words_count=" + parameters.bannedWordsCount + "&" +
            "attempts=" + parameters.attempts + "&" +
            "state_size=" + parameters.stateSize
        }).then(function (data) {
            callback(data);
        });
    },

    /**
     * Function with retrieves a list of authors represented by
     * {string} name and {string} slug
     * @param callback - contains list of authors
     */
    fetchAuthors: function (callback) {
        $.ajax({
            url: "https://rap-generator.devlabs-projects.com/generator/authors?cached=true"
        }).then(function (data) {
            callback(data);
        });
    },

    /**
     * Function with retrieves a list of beats represented by
     * {string} id - used later a parameter for the upload
     * {string} url
     * @param callback - contains list of beats
     */
    fetchBeats: function (callback) {
        $.ajax({
            url: "https://rap-generator.devlabs-projects.com/audio/api/beats",
            dataType: "json"
        }).then(function (data) {
            callback(data);
        });
    },

    /**
     * Uploads video recorded by the cam to the API
     * @param recordedBlobs - the blobs representing the video record
     * @param beatName - selected audio name from the select element
     * @param callback - returns an url to the new generated video
     */
    uploadToServer: function (recordedBlobs, beatName, callback) {
        var blob = new Blob(recordedBlobs, {type: 'video/webm'});
        //sending the file trough form data
        var myFormData = new FormData();
        myFormData.append('audio', blob);
        myFormData.append('beat', beatName);
        $.ajax({
            url: 'https://rap-generator.devlabs-projects.com/audio/api/upload',
            type: 'POST',
            processData: false, // important
            contentType: false, // important
            dataType: "json",
            data: myFormData
        }).then(function (data) {
            console.log('url', data);
            callback(data);
        });
    },


    /**
     *
     * Generates audio from the lyrics of the new song
     * @param parameters
     * @param parameters.text - lyrics
     * @param parameters.beat - selected beat
     * @param parameters.speed - (default 175)
     * @param parameters.pitch - 0 to 99 (defaults to 50)
     * @param parameters.amplitude - 0 to 200 (defaults to 100)
     * @param parameters.gap - The value is the length of the pause, in units of 10 mS (at the
     default speed of 170 wpm).
     * @param callback - returns a link to the generated audio
     */
    generateRapCall: function (parameters, callback) {
        $.ajax({
            type: "POST",
            url: 'https://rap-generator.devlabs-projects.com/audio/api/text-to-rap',
            dataType: "json",
            data: parameters
        }).then(function (data) {
            callback(data);
        });
    }
};