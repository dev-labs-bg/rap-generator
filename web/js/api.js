var API = {
    generateLyricsCall: function (parameters, callback) {
        $.ajax({
            type: "POST",
            url: "http://yavor-ivanov.net:5000/generate_lyrics",
            data: "authors=" + parameters.authorsValue + "&" +
            "sentence_count=" + parameters.sentenceCount + "&" +
            "banned_words_count=" + parameters.bannedWordsCount + "&" +
            "attempts=" + parameters.attempts + "&" +
            "state_size=" + parameters.stateSize
        }).then(function (data) {
            callback(data);
        });
    },

    fetchAuthors: function (callback) {
        $.ajax({
            url: "http://yavor-ivanov.net:5000/authors?cached=true"
        }).then(function (data) {
            callback(data);
        });
    },

    fetchBeats: function (callback) {
        $.ajax({
            url: "http://192.168.10.118:8000/api/beats",
            dataType : "json"
        }).then(function (data) {
            callback(data);
        });
    }
};