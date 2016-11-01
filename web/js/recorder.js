function Recorder(file) {
    this.mediaSource = new MediaSource();
    var mediaRecorder;
    var recordedBlobs;
    var sourceBuffer;
}

Recorder.prototype.initialize = function () {
    var self = this;
    this.mediaSource.addEventListener('sourceopen', function (event) {
        self.handleSourceOpen(event);
    }, false);
};

// The nested try blocks will be simplified when Chrome 47 moves to Stable
Recorder.prototype.startRecording = function () {
    var self = this;
    document.getElementById('audio').currentTime = 0;
    var playPromise = document.getElementById('audio').play();
    // In browsers that don’t yet support this functionality,
    // playPromise won’t be defined.
    if (playPromise !== undefined) {
        playPromise.then(function () {
            // Automatic playback started!
        }).catch(function (error) {
            // Automatic playback failed.
            // Show a UI element to let the user manually start playback.
            console.log("eeee stiga ee " + error);
        });
    }
    this.recordedBlobs = [];
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
        this.mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    this.mediaRecorder.onstop =  function(event) {
        self.handleStop(event);
    };
    this.mediaRecorder.ondataavailable = function(event) {
        self.handleDataAvailable(event);
    };
    this.mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', this.mediaRecorder);
};

Recorder.prototype.stopRecording = function (event) {
    var self = this;
    this.mediaRecorder.stop(event);
    console.log('Recorded Blobs: ', this.recordedBlobs);
    self.onVideoReady(self.recordedBlobs);
};

Recorder.prototype.initAudio = function () {
    var dir, ext, mylist;
    dir = "audio_tracks/";
    ext = ".mp3";
    // Audio Object
    document.getElementById('audio').src = dir + "default" + ext;
    // Event Handling
    mylist = document.getElementById("mylist");
    mylist.addEventListener("change", changeTrack);
    // Functions
    function changeTrack(event) {
        console.log("track name", dir + event.target.value + ext);
        document.getElementById('audio').src = dir + event.target.value + ext;
        var playPromise = document.getElementById('audio').play();

        // In browsers that don’t yet support this functionality,
        // playPromise won’t be defined.
        if (playPromise !== undefined) {
            playPromise.then(function () {
                // Automatic playback started!
            }).catch(function (error) {
                // Automatic playback failed.
                // Show a UI element to let the user manually start playback.
                console.log("eeee stiga ee " + error);
            });
        }
    }
};

Recorder.prototype.handleSourceOpen = function(event) {
    console.log('MediaSource opened');
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', this.sourceBuffer);
};

Recorder.prototype.handleDataAvailable = function(event) {
    if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
    }
};

Recorder.prototype.handleStop = function(event) {
    console.log('Recorder stopped: ', event);
};

Recorder.prototype.toggleRecording = function () {
    console.log("toggleRecording");
    if (recordButton.textContent === 'Start Recording') {
        this.startRecording();
    } else {
        this.stopRecording();
        recordButton.textContent = 'Start Recording';
    }
};

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

var constraints = {
    audio: true,
    video: true
};
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
