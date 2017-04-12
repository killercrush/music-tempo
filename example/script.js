document.addEventListener("DOMContentLoaded", function () {
"use strict";
  var context = new AudioContext(),
      trackGainNode = context.createGain();
  trackGainNode.gain.value = 0.01;
  //beats
  var clickSound = document.getElementById("clickSound"),  
      beatTimes,
      beatInterval,
      nextBeatTime = 0;
  clickSound.volume = 0.25;
  //visualisation
  var spectrogram,
      waveform,
      beatLines,
      scaleLines,
      spectrogramContainer,
      waveformContainer,      
      audioSource,
      audioBuffer,
      minFQ = 77,
      maxFQ = 12000,
      BPO = 40,
      idAnimFrame,
      specHeight = getSpecHeight(minFQ, maxFQ, BPO);
  var secPerPx;
  //time
  var animStart,
      playbackTime,
      startedAt,
      pausedAt,
      duration,
      isPaused = true;
  //controls
  var playbackBar = document.getElementById("playbackBar"),
      btnTogglePlay,
      fileInput,
      iconTogglePlay,
      trackGainBar,
      clickGainBar,
      beatIndicator = document.getElementById("beatIndicator"),
      playbackTimeValue,
      isPlaybackBarMouseDown = false;
  var processAudioData = function (buffer) {
      audioBuffer = buffer;
      playbackBar.max = buffer.duration;
      var audioData = [];
      if (buffer.numberOfChannels > 1) {
        var channel1Data = buffer.getChannelData(0);
        var channel2Data = buffer.getChannelData(1);
        var length = channel1Data.length;
        for (var i = 0; i < length; i++) {
          audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
      } else {
        audioData = buffer.getChannelData(0);
      }

      asyncCalcChain(audioData);
  }

  function getSpecHeight(minimumFrequency, maximumFreqency, binsPerOctave) {
      return (Math.ceil(binsPerOctave * Math.log(maximumFreqency / minimumFrequency) / Math.log(2)) | 0);;
  }

  function asyncCalcChain(audioData) {
    document.getElementById("bpmSpinner").classList.add("is-active");
    document.getElementById("spectrogramSpinner").classList.add("is-active");
    document.getElementById("waveformSpinner").classList.add("is-active");
    asyncCalcTempo(audioData);     
  }
  function asyncCalcTempo(audioData) {    
    setTimeout(function() {      
      console.time("MusicTempo");
      var mt = new MusicTempo(audioData);
      console.timeEnd("MusicTempo");
      document.getElementById("bpmSpinner").classList.remove("is-active");
      document.getElementById("bpmValue").textContent = Math.round(mt.tempo) + " BPM";
      document.getElementById("bpmValue").style.display = "inline-block";
      beatIndicator.style.display = "inline-block";
      beatTimes = mt.beats;
      beatInterval = mt.beatInterval;
      beatIndicator.style.animationDuration = beatInterval + "s";
      asyncCalcAndDrawSpectrogram(audioData, beatTimes);
    }, 100);
  }
  function asyncCalcAndDrawSpectrogram(audioData, beatTimes) {    
    setTimeout(function() {      
      console.time("calcSpectrogram");
      var res = getSpectrogramCQ(audioData);
      console.timeEnd("calcSpectrogram");      
      console.time("drawSpectrogram");
      drawSpectrogram(res.spectrum, res.specMaxVal);
      drawBeatLines(res.spectrum.length, res.spectrum[0].length, beatTimes);
      drawScale(minFQ, maxFQ, res.spectrum[0].length);
      console.timeEnd("drawSpectrogram");
      document.getElementById("spectrogramSpinner").classList.remove("is-active");

      asyncCalcAndDrawWaveform(audioData, res.spectrum.length);
    }, 100);
  }  
  function asyncCalcAndDrawWaveform(audioData, length) {    
    setTimeout(function() {
      console.time("drawWaveform");
      drawWaveform(audioData, length);
      console.timeEnd("drawWaveform");
      resetTime();

      //disabled
      playbackBar.disabled = false;
      btnTogglePlay.disabled = false;
      document.getElementById("waveformSpinner").classList.remove("is-active");
    }, 100);
  } 
  function initControls() {
    playbackTimeValue = document.getElementById("playbackTimeValue");
    spectrogramContainer = document.getElementById("spectrogramContainer");
    spectrogramContainer.style.height = (52 + specHeight) + "px";
    waveformContainer = document.getElementById("waveformContainer");  
    document.getElementById("spectrogramTracker").style.height = (52 + specHeight) + "px";
    document.getElementById("beatLinesSwitch").onchange = function () {
      var isVisible = document.getElementById("beatLinesSwitch").checked;
      if (isVisible) {
        beatLines.style.display = "block";
      } else {
        beatLines.style.display = "none";
      }      
    };
    //document.getElementById("beatIndicator").style.top = specHeight + "px";  
      spectrogramContainer,
      waveformContainer, 
    btnTogglePlay = document.getElementById("btnTogglePlay");
    btnTogglePlay.onclick = togglePlay;
    iconTogglePlay = document.getElementById("iconTogglePlay");

    fileInput = document.getElementById("fileInput");
    fileInput.onchange = function () {
        var files = document.getElementById("fileInput").files;
        if (files.length == 0) return;

        var reader = new FileReader();

        reader.onload = function(fileEvent) {
          context.decodeAudioData(fileEvent.target.result, processAudioData);
        }

        reset();
        playbackBar.disabled = true;
        btnTogglePlay.disabled = true;
        reader.readAsArrayBuffer(files[0]);
    }

    // playbackBar.addEventListener("change", function () {
    //   seek();
    // });
    playbackBar.addEventListener("click", function () {
      seek();
    });    
    playbackBar.addEventListener("mousedown", function () {
     isPlaybackBarMouseDown = true;
    });
    document.addEventListener("mouseup", function () {
     isPlaybackBarMouseDown = false;
    });    
    window.addEventListener("blur", function () {
      if (!isPaused) {
        togglePlay();
      }
    });

    trackGainBar = document.getElementById("trackGainBar");
    trackGainBar.oninput = function() {
      var val = parseFloat(trackGainBar.value, 10);
      trackGainNode.gain.value = val * val;
    }
    clickGainBar = document.getElementById("clickGainBar");
    clickGainBar.oninput = function() {
      var val = parseFloat(clickGainBar.value, 10);
      clickSound.volume = val * val;
    }

    beatIndicator = document.getElementById("beatIndicator"); 
  }

  function initAudioSource(buffer) {
    audioSource = context.createBufferSource();
    audioSource.buffer = buffer;
    audioSource.connect(trackGainNode);
    trackGainNode.connect(context.destination);
  }
  function resetTime() {
      playbackTimeValue.textContent = "0c";
      playbackTime = 0;
      pausedAt = 0;
      startedAt = 0;
      isPaused = true;
      nextBeatTime = 0;
  }
  function reset() {
    if (!isPaused) togglePlay();
    startedAt = false;
    //if (idAnimFrame) cancelAnimationFrame(idAnimFrame);
    playbackBar.MaterialSlider.change(0);
    playbackTimeValue.textContent = "0c";
    var shift = Math.round(spectrogramContainer.clientWidth / 2) + "px";
    if (spectrogram) {
      spectrogram.style.left = shift;
      waveform.style.left = shift;
      beatLines.style.left = shift;      
    }
  }
  function seek() {
      if (!startedAt) {
        resetTime();
        idAnimFrame = requestAnimationFrame(animCycle);
      }    
      var newPlaybackTime = parseFloat(playbackBar.value, 10);
      startedAt += playbackTime - newPlaybackTime;
      playbackTime = newPlaybackTime;
      for (nextBeatTime = 0; nextBeatTime < beatTimes.length; nextBeatTime++) {
        if (playbackTime <= beatTimes[nextBeatTime]) break;
      }
      if (!isPaused) {
        audioSource.stop();
        initAudioSource(audioBuffer);        
        audioSource.start(0, playbackTime);
      }      
  }
  function togglePlay() {
    if (!startedAt) {
      resetTime();
      idAnimFrame = requestAnimationFrame(animCycle);
    }
    if (isPaused) {
      initAudioSource(audioBuffer);
      startedAt += context.currentTime - pausedAt;
      audioSource.start(0, playbackTime);
      iconTogglePlay.textContent = "pause";
    } else {
      audioSource.stop();
      pausedAt = context.currentTime;
      iconTogglePlay.textContent = "play_arrow";
    }
    isPaused = !isPaused;    
  }

  function animCycle(timestamp) {
    if (!isPaused) {
      playbackTime = context.currentTime - startedAt;      
      if (!isPlaybackBarMouseDown) {
        playbackBar.MaterialSlider.change(playbackTime);
        if (playbackTime >= playbackBar.max) {
          reset();
          return;
        }
      }
      if (beatTimes[nextBeatTime] <= playbackTime || beatTimes[nextBeatTime] - playbackTime < 0.0166) {
        nextBeatTime++;
        clickSound.play();

        beatIndicator.classList.remove("anim");
        void beatIndicator.offsetWidth;
        beatIndicator.classList.add("anim");
      }      
    }

    playbackTimeValue.textContent = playbackTime.toFixed(2) + "s";
    var shift = Math.round(spectrogramContainer.clientWidth / 2 + playbackTime / secPerPx * -1) + "px";
    spectrogram.style.left = shift;
    waveform.style.left = shift;
    beatLines.style.left = shift;
    requestAnimationFrame(animCycle);
  }
  function getSpectrogramCQ(inputBuffer) {
    //var constQ = new ConstantQ(44100, 112, 14700, 29);
    var constQ = new ConstantQ(44100, minFQ, maxFQ, BPO);
    var len = inputBuffer.length;
    var bufferSize = constQ.fftLength;
    var hopSize = 882;
    secPerPx = 1 / (44100 / hopSize);
    var hammWindow = FFT.getHammingWindow(bufferSize);

    var length = inputBuffer.length;
    // var zerosStart = new Array(bufferSize - hopSize);
    // zerosStart.fill(0);
    // inputBuffer = zerosStart.concat(inputBuffer);        
    inputBuffer = Array.from(inputBuffer);
    var zerosEnd = new Array(bufferSize - (inputBuffer.length % hopSize));
    zerosEnd.fill(0);
    inputBuffer = inputBuffer.concat(zerosEnd);
    
    var spectrum = [];
    var specMaxVal = 0;
    for (var wndStart = 0; wndStart < length; wndStart += hopSize) {   
        var wndEnd = wndStart + bufferSize;

        var re = [];
        var k = 0;
        for (var i = wndStart; i < wndEnd; i++) {
            re[k * 2] = /*hammWindow[k] */ inputBuffer[i];
            re[k * 2 + 1] = 0;
            //re[k] = inputBuffer[i];
            k++;
        }
        constQ.calculateMagintudes(re);
        for (var i = 0; i < constQ.magnitudes.length; i++) {
          if (specMaxVal < constQ.magnitudes[i]) specMaxVal = constQ.magnitudes[i];
        }
        spectrum.push(constQ.magnitudes.slice());
    }
    return {spectrum: spectrum, specMaxVal: specMaxVal};    
  }

  function drawWaveform(waveData, width) {
    if (!waveform) {
      var container = document.getElementById("waveformContainer");
      waveform = document.createElement("canvas");
      container.appendChild(waveform);      
    }

    var ctx = waveform.getContext("2d");

    var height = 100;
    var halfHeight = height / 2;

    length = waveData.length;
    var step = Math.round(length / width);
    waveform.width = width;
    waveform.height = height;
    waveform.style.width = width + "px";
    waveform.style.height = height + "px";
    waveform.style.left = Math.round(waveformContainer.clientWidth / 2) + "px";

    var x = 0,
        sumPositive = 0,
        sumNegative = 0,
        maxPositive = 0,
        maxNegative = 0,
        kNegative = 0,
        kPositive = 0,
        drawIdx = step;
    for (var i = 0; i < length; i++) {
      if (i == drawIdx) {
        var p1 = maxNegative * halfHeight + halfHeight;
        ctx.strokeStyle = '#558b2f';
        ctx.strokeRect(x, p1, 1, (maxPositive * halfHeight + halfHeight) - p1);

        var p2 = sumNegative / kNegative * halfHeight + halfHeight;
        ctx.strokeStyle = '#8bc34a';
        ctx.strokeRect(x, p2, 1, (sumPositive / kPositive * halfHeight + halfHeight) - p2);
        x++;
        drawIdx += step;
        sumPositive = 0;
        sumNegative = 0;
        maxPositive = 0;
        maxNegative = 0;
        kNegative = 0;
        kPositive = 0;        
      } else {
        if (waveData[i] < 0) {
          sumNegative += waveData[i];
          kNegative++;
          if (maxNegative > waveData[i]) maxNegative = waveData[i];
        } else {
          sumPositive += waveData[i];
          kPositive++;
          if (maxPositive < waveData[i]) maxPositive = waveData[i];
        }
        
      }
    }
  }
  function drawSpectrogram(spectrum, maxVal) {
    var scale = 1 / Math.log(maxVal + 1);
    //var gradient = chroma.scale(["black", "blue", "red", "yellow"]).domain([0, 0.03, 0.3, 0.7]);
    var gradient = chroma.scale(["white", "#448aff", "#f44336", "#ffee58"]).domain([0, 0.1, 0.3, 0.7]);
    //var gradient = chroma.scale(["#448aff", "white"]).domain([0, 0.3]);
    if (!spectrogram) {
      var container = document.getElementById("spectrogramContainer");
      spectrogram = document.createElement("canvas");
      container.appendChild(spectrogram);
    }

    var ctx = spectrogram.getContext("2d");

    var width = spectrum.length;
    var height = spectrum[0].length;

    var shift = 6;
    var shiftWidth = width - shift;
    var shiftStart = Math.floor(height / 2);
    var shiftFactor = shiftStart / shift;

    spectrogram.width = width;
    spectrogram.height = height;
    spectrogram.style.width = (1 * width) + "px";
    spectrogram.style.height = (1 * height) + "px";
    spectrogram.style.left = Math.round(spectrogramContainer.clientWidth / 2) + "px";

    spectrogram.style.transform = "scaleY(-1)";

    var canvasData = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < shiftWidth; i++) {
      for (var j = 0; j < shiftStart; j++) {
        var index = (i + (shift - Math.round(j / shiftFactor)) + j * width) * 4;
        var val = gradient(Math.log(spectrum[i][j] + 1) * scale).rgb();
        canvasData.data[index + 0] = val[0];
        canvasData.data[index + 1] = val[1];
        canvasData.data[index + 2] = val[2];
        canvasData.data[index + 3] = 255;
      }      
      for (; j < height; j++) {
        index = (i + j * width) * 4;
        //var val = 225 - (spectrum[i][j] * scale);
        //var val = gradient(Math.log(spectrum[i][j] + 1) * scale);
        val = gradient(Math.log(spectrum[i][j] + 1) * scale).rgb();
        canvasData.data[index + 0] = val[0];
        canvasData.data[index + 1] = val[1];
        canvasData.data[index + 2] = val[2];
        canvasData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(canvasData, 0, 0);
  }

  function drawBeatLines(width, height, beats) {
    beats = beats.map(function(time) {return Math.round(time / secPerPx);});

    if (!beatLines) {
      var container = document.getElementById("spectrogramContainer");
      beatLines = document.createElement("canvas");
      container.appendChild(beatLines);
    }

    var ctx = beatLines.getContext("2d");

    beatLines.width = width;
    beatLines.height = height;
    beatLines.style.width = (1 * width) + "px";
    beatLines.style.height = (1 * height) + "px";
    beatLines.style.left = Math.round(spectrogramContainer.clientWidth / 2) + "px";

    ctx.strokeStyle = "#616161";
    for (var i = 0; i < beats.length; i++) {        
        ctx.strokeRect(beats[i], 0, 0.5, height);    
    }  
  }

  function drawScale(startFQ, end, height) {
    if (!scaleLines) {
      var container = document.getElementById("spectrogramContainer");
      scaleLines = document.createElement("canvas");
      container.appendChild(scaleLines);
    }

    var ctx = scaleLines.getContext("2d");

    var width = 200;
    scaleLines.width = width;
    scaleLines.height = height;
    scaleLines.style.left = (Math.round(spectrogramContainer.clientWidth / 2) - width) + "px";

    var canvasData = ctx.getImageData(0, 0, width, height);
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        var index = (i + j * width) * 4;
        var alpha = 255 / width * i;
        canvasData.data[index + 0] = 255;
        canvasData.data[index + 1] = 255;
        canvasData.data[index + 2] = 255;
        canvasData.data[index + 3] = alpha;
      }
    }

    ctx.putImageData(canvasData, 0, 0);

    var step = height / 8;

    ctx.font="10px Courier New";
    ctx.fillStyle = "#9e9e9e";
    ctx.strokeStyle = "#9e9e9e";

    for (i = 0; i < height; i+=step) {
      // var idx = Math.round(i * factor);
      var hz = Math.round(Math.pow(Math.pow(2, 1 / BPO), i) * (minFQ * 2));
      ctx.fillText(hz + " Hz", 150, (height - i) - 4);    
      ctx.strokeRect(150, (height - i), 50, 0.5);
    }
  }

  initControls();

});