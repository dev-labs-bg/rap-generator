function Recorder() {
    this.mediaSource = new MediaSource();
    var mediaRecorder;
    var recordedBlobs;
    var sourceBuffer;
}

Recorder.prototype.initialize = function () {
    var self = this;
    self.mediaSource.addEventListener('sourceopen', function (event) {
        console.log("sourceopen");
        self.handleSourceOpen(event);
    }, false);
};

// The nested try blocks will be simplified when Chrome 47 moves to Stable
Recorder.prototype.startRecording = function () {
    console.log("startRecording");
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
            console.log(error);
        });
    }
    self.recordedBlobs = [];
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
        self.mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
        return;
    }
    console.log('Created MediaRecorder', self.mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    self.mediaRecorder.onstop = function (event) {
        self.handleStop(event);
    };
    self.mediaRecorder.ondataavailable = function (event) {
        self.handleDataAvailable(event);
    };
    self.mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', self.mediaRecorder);
};

Recorder.prototype.stopRecording = function (event) {
    console.log("stopRecording");
    var self = this;
    document.getElementById('audio').pause();
    document.getElementById('audio').currentTime = 0;
    self.mediaRecorder.stop(event);
    self.onVideoReady(self.recordedBlobs);
};

Recorder.prototype.initAudio = function (initialUrl) {
    console.log("initAudio");
    console.log(initialUrl);
    var self = this;
    // Audio Object
    document.getElementById('audio').src = initialUrl;
    // Event Handling
    selectList.addEventListener("change", changeTrack);
    // Functions
    function changeTrack(event) {
        self.playAudio(event.target.value);
    }
};

Recorder.prototype.playAudio = function (srcUrl) {
    var self = this;
    document.getElementById('audio').src = srcUrl;
    var playPromise = document.getElementById('audio').play();
    // In browsers that don’t yet support this functionality,
    // playPromise won’t be defined.
    if (playPromise !== undefined) {
        playPromise.then(function () {
            // Automatic playback started!
        }).catch(function (error) {
            // Automatic playback failed.
            // Show a UI element to let the user manually start playback.
            console.log(error);
        });
    }
};

Recorder.prototype.handleSourceOpen = function (event) {
    var self = this;
    console.log('MediaSource opened');
    self.sourceBuffer = self.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', self.sourceBuffer);
};

Recorder.prototype.handleDataAvailable = function (event) {
    var self = this;
    if (event.data && event.data.size > 0) {
        self.recordedBlobs.push(event.data);
    }
};

Recorder.prototype.handleStop = function (event) {
    console.log('Recorder stopped: ', event);
};

Recorder.prototype.toggleRecording = function () {
    var self = this;
    console.log("toggleRecording");
    if (recordButton.textContent === 'Start Recording') {
        self.startRecording();
    } else {
        self.stopRecording();
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
