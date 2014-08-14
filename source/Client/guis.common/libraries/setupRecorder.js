var audio_context;
var recorder;
var globalaudioinputstream;

function startUserMedia(stream) {
	globalaudioinputstream = stream;
	var input = audio_context.createMediaStreamSource(stream);

	var muteInput = audio_context.createGain();
	muteInput.gain.value = 0.0;

	// we have to connect somehow to the speakers (audio_context.destination) to be able to record, BUT mute it first!
	input.connect(muteInput);
	muteInput.connect(audio_context.destination);

	var louderInput = audio_context.createGain();
	louderInput.gain.value = 1.2;
	input.connect(louderInput);

	var config = {
		workerPath: '/guis.common/libraries/recorderWorker.js',
	};
	recorder = new Recorder(louderInput, config);
}

function startRecording() {
  if(recorder) {
    recorder.record();
    return true;
  }
  return false;
}

function stopRecording(callback) {
	recorder && recorder.stop();
	// create WAV download link using audio data blob and upload file
	recorder.exportWAV(function(blob) {
		uploadFile(blob, callback);
	});
	recorder.clear();
}

function uploadFile(file, callback){
	var mimeType = file.type;

	/* create new File object and set position */
	ObjectManager.createObject("HiddenFile",{
		//"hasContent":true //prevent calling justCreated() after object creation (would display file upload dialog)
	},false,function(newObject) {
		/* object created --> upload content */

		var fd=new FormData();
		fd.append("file", file); // Append the file

		var xhr = new XMLHttpRequest();

		xhr.open("POST", "/setContent/"+newObject.getCurrentRoom()+"/"+newObject.getAttribute('id')+"/"+ObjectManager.userHash);
		xhr.send(fd);

		//newObject.setAttribute('mimeType',mimeType);
		newObject.setAttribute('name',newObject.getAttribute('id') + '.wav');
		callback && callback(newObject);
	});
}

function initAudio() {
	try {
		// webkit shim
		window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL;

		audio_context = new AudioContext();
	} catch (e) {
		console.log('No web audio support in this browser!');
	}

	navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
		console.log('No live audio input: ' + e);
	});
};

//window.addEventListener('load', initAudio);

function testRecording() {
	window.setTimeout(startRecording, 1000);
	window.setTimeout(stopRecording, 10000);
}