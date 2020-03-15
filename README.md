## Description

Javascript-library for finding out tempo (BPM) of a song and beat tracking. It uses an algorithm ["Beatroot"](http://www.eecs.qmul.ac.uk/~simond/pub/2001/jnmr.pdf) authored by [Simon Dixon](http://www.eecs.qmul.ac.uk/~simond/)

**[Example App](https://killercrush.github.io/music-tempo/example/example-advanced.html)**

**[Docs](https://killercrush.github.io/music-tempo/docs/index.html)**

## Instalation

In a browser
```html
<script src="music-tempo.min.js"></script>
```

Using npm:
```shell
$ npm i --save music-tempo
```

## Usage

Pass to the constructor MusicTempo the buffer that contains data in the following format: non-interleaved IEEE754 32-bit linear PCM with a nominal range between -1 and +1, that is, 32bits floating point buffer, with each samples between -1.0 and 1.0. This format is used in the [AudioBuffer](https://developer.mozilla.org/en/docs/Web/API/AudioBuffer) interface of [Web Audio API](https://developer.mozilla.org/en/docs/Web/API/Web_Audio_API). The object returned by the constructor contain properties `tempo` - tempo value in beats per minute and `beats` - array with beat times in seconds.


### Browser

```javascript
var context = new AudioContext({ sampleRate: 44100 });
var fileInput = document.getElementById("fileInput");

fileInput.onchange = function () {
  var files = fileInput.files;

  if (files.length == 0) return;
  var reader = new FileReader();

  reader.onload = function(fileEvent) {
    context.decodeAudioData(fileEvent.target.result, calcTempo);
  }

  reader.readAsArrayBuffer(files[0]);
}
var calcTempo = function (buffer) {
  var audioData = [];
  // Take the average of the two channels
  if (buffer.numberOfChannels == 2) {
    var channel1Data = buffer.getChannelData(0);
    var channel2Data = buffer.getChannelData(1);
    var length = channel1Data.length;
    for (var i = 0; i < length; i++) {
      audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
    }
  } else {
    audioData = buffer.getChannelData(0);
  }
  var mt = new MusicTempo(audioData);

  console.log(mt.tempo);
  console.log(mt.beats);
}
```

### Node.js

In Node.js environment can be used [node-web-audio-api library](https://github.com/sebpiq/node-web-audio-api)

```javascript
var AudioContext = require("web-audio-api").AudioContext;
var MusicTempo = require("music-tempo");
var fs = require("fs");

var calcTempo = function (buffer) {
  var audioData = [];
  // Take the average of the two channels
  if (buffer.numberOfChannels == 2) {
    var channel1Data = buffer.getChannelData(0);
    var channel2Data = buffer.getChannelData(1);
    var length = channel1Data.length;
    for (var i = 0; i < length; i++) {
      audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
    }
  } else {
    audioData = buffer.getChannelData(0);
  }
  var mt = new MusicTempo(audioData);

  console.log(mt.tempo);
  console.log(mt.beats);
}

var data = fs.readFileSync("songname.mp3");

var context = new AudioContext();
context.decodeAudioData(data, calcTempo);
```

## Optional parameters

You can pass object with parameters as second argument to the constructor: 

```javascript
var p = { expiryTime: 30, maxBeatInterval: 1.5 };
var mt = new MusicTempo(audioData, p);
```
Most useful are `maxBeatInterval`/`minBeatInterval` and `expiryTime`. First two used for setting up maximum and minimum BPM. Default value for `maxBeatInterval` is 1 which means that minimum BPM is 60 (60 / 1 = 60). Default value for `minBeatInterval` is 0.3 which means that maximum BPM is 200 (60 / 0.3 = 200). Be careful, the more value of maximum BPM, the more probability of 2x-BPM errors (e.g.  if max BPM = 210 and real tempo of a song 102 BPM, in the end you can get 204 BPM). 
`expiryTime` can be used if audio file have periods of silence or almost silence and because of that beat tracking is failing. 
Other parameters are listed in [documentation](https://killercrush.github.io/music-tempo/docs/class/src/MusicTempo.js~MusicTempo.html).

## Other

### Tests

Requires [mocha](https://www.npmjs.com/package/mocha) and [chai](https://www.npmjs.com/package/chai)

```shell
$ npm test
```

### Documentation

Requires [esdoc](https://www.npmjs.com/package/esdoc)

```shell
$ esdoc
```

### Build

Requires [gulp](https://www.npmjs.com/package/gulp) and [babel](https://www.npmjs.com/package/gulp-babel). Other dependencies can be found in `package.json`

```shell
$ gulp build
```

## License

[MIT License](LICENCE)
