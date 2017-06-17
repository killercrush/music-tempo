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
var context = new AudioContext();
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
