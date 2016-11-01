var API = {
	generateLyricsCall: function(parameters, callback){
		  $.ajax({
		      type: "POST",
		      url: "http://yavor-ivanov.net:5000/generate_lyrics",
		      data: "authors=" + parameters.authorsValue + "&" +
		      "sentence_count=" + parameters.sentenceCount + "&" +
		      "banned_words_count=" + parameters.bannedWordsCount + "&" +
		      "attempts=" + parameters.attempts + "&" +
		      "state_size=" + parameters.stateSize
		    }).then(function(data) {
		    	callback(data);
	    });
	}
};