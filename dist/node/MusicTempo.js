(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module", "exports", "./OnsetDetection", "./TempoInduction", "./BeatTracking", "./FFT"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports, require("./OnsetDetection"), require("./TempoInduction"), require("./BeatTracking"), require("./FFT"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports, global.OnsetDetection, global.TempoInduction, global.BeatTracking, global.FFT);
    global.MusicTempo = mod.exports;
  }
})(this, function (module, exports, _OnsetDetection, _TempoInduction, _BeatTracking, _FFT) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _OnsetDetection2 = _interopRequireDefault(_OnsetDetection);

  var _TempoInduction2 = _interopRequireDefault(_TempoInduction);

  var _BeatTracking2 = _interopRequireDefault(_BeatTracking);

  var _FFT2 = _interopRequireDefault(_FFT);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var MusicTempo =
  /**
   * Constructor
   * @param {Float32Array} audioData - non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1 (Web Audio API - Audio Buffer)
   * @param {Object} [params={}] - parameters
   * @param {Number} [params.bufferSize=2048] - FFT windows size
   * @param {Number} [params.hopSize=441] - spacing of audio frames in samples
   * @param {Number} [params.decayRate=0.84] - how quickly previous peaks are forgotten
   * @param {Number} [params.peakFindingWindow=6] - minimum distance between peaks
   * @param {Number} [params.meanWndMultiplier=3] - multiplier for peak finding window
   * @param {Number} [params.peakThreshold=0.35] - minimum value of peaks
   * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
   * @param {Number} [params.maxIOI=2.5] - the maximum IOI for inclusion in a cluster
   * @param {Number} [params.minIOI=0.07] - the minimum IOI for inclusion in a cluster
   * @param {Number} [params.maxTempos=10] - initial amount of tempo hypotheses
   * @param {Number} [params.minBeatInterval=0.3] - the minimum inter-beat interval (IBI) (0.30 seconds == 200 BPM)
   * @param {Number} [params.maxBeatInterval=1] - the maximum inter-beat interval (IBI) (1.00 seconds ==  60 BPM)
   * @param {Number} [params.initPeriod=5] - duration of the initial section
   * @param {Number} [params.thresholdBI=0.02] - for the purpose of removing duplicate agents, the default JND of IBI
   * @param {Number} [params.thresholdBT=0.04] - for the purpose of removing duplicate agents, the default JND of phase
   * @param {Number} [params.expiryTime=10] - the time after which an Agent that has not accepted any beat will be destroyed
   * @param {Number} [params.toleranceWndInner=0.04] - the maximum time that a beat can deviate from the predicted beat time without a fork occurring
   * @param {Number} [params.toleranceWndPre=0.15] - the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
   * @param {Number} [params.toleranceWndPost=0.3] - the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
   * @param {Number} [params.correctionFactor=50] - correction factor for updating beat period
   * @param {Number} [params.maxChange=0.2] - the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
   * @param {Number} [params.penaltyFactor=0.5] - factor for correcting score, if onset do not coincide precisely with predicted beat time
   */
  function MusicTempo(audioData) {
    var _this = this;

    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MusicTempo);

    if (audioData instanceof Float32Array) {
      // Production steps of ECMA-262, Edition 6, 22.1.2.1
      if (!Array.from) {
        Array.from = function () {
          var toStr = Object.prototype.toString;
          var isCallable = function isCallable(fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
          };
          var toInteger = function toInteger(value) {
            var number = Number(value);
            if (isNaN(number)) {
              return 0;
            }
            if (number === 0 || !isFinite(number)) {
              return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
          };
          var maxSafeInteger = Math.pow(2, 53) - 1;
          var toLength = function toLength(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
          };

          // The length property of the from method is 1.
          return function from(arrayLike /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
              throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
              // 5. else
              // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
              if (!isCallable(mapFn)) {
                throw new TypeError('Array.from: when provided, the second argument must be a function');
              }

              // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
              if (arguments.length > 2) {
                T = arguments[2];
              }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method 
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
              kValue = items[k];
              if (mapFn) {
                A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
              } else {
                A[k] = kValue;
              }
              k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
          };
        }();
      }
      audioData = Array.from(audioData);
    } else if (!Array.isArray(audioData)) {
      throw "audioData is not an array";
    }
    var timeStep = params.timeStep || 0.01;
    var res = _OnsetDetection2.default.calculateSF(audioData, _FFT2.default, params);
    /** 
     * Spectral flux
     * @type {Array} 
     */
    this.spectralFlux = res;
    _OnsetDetection2.default.normalize(this.spectralFlux);
    /** 
     * Spectral flux peaks indexes
     * @type {Array} 
     */
    this.peaks = _OnsetDetection2.default.findPeaks(this.spectralFlux, params);
    /** 
     * Onsets times array
     * @type {Array} 
     */
    this.events = this.peaks.map(function (a) {
      return a * timeStep;
    });

    var clusters = _TempoInduction2.default.processRhythmicEvents(this.events, params);
    clusters = _TempoInduction2.default.mergeClusters(clusters, params);
    var scores = _TempoInduction2.default.calculateScore(clusters, params);
    clusters = {
      clIntervals: clusters.clIntervals,
      clSizes: clusters.clSizes,
      clScores: scores.clScores,
      clScoresIdxs: scores.clScoresIdxs
    };
    /** 
     * Tempo hypotheses array
     * @type {Array} 
     */
    this.tempoList = _TempoInduction2.default.createTempoList(clusters, params);

    var minSFValue = this.spectralFlux.reduce(function (a, b) {
      return Math.min(a, b);
    });
    var eventsScores = this.peaks.map(function (a) {
      return _this.spectralFlux[a] - minSFValue;
    });
    /** 
     * Agents array
     * @type {Array} 
     */
    this.agents = _BeatTracking2.default.trackBeat(this.events, eventsScores, this.tempoList, params);

    var bestScore = -1;
    var idxBestAgent = -1;
    /** 
     * The tempo value in beats per minute
     * @type {Number} 
     */
    this.tempo = -1;
    /** 
     * Beat times array
     * @type {Array} 
     */
    this.beats = [];
    /** 
     * Inter-beat interval
     * @type {Number} 
     */
    this.beatInterval = -1;

    for (var i = 0; i < this.agents.length; i++) {
      if (this.agents[i].score > bestScore) {
        bestScore = this.agents[i].score;
        idxBestAgent = i;
      }
    }
    if (this.agents[idxBestAgent]) {
      /** 
       * The agent with the highest score
       * @type {Agent} 
       */
      this.bestAgent = this.agents[idxBestAgent];
      this.bestAgent.fillBeats();
      this.tempo = (60 / this.bestAgent.beatInterval).toFixed(3);
      this.beatInterval = this.bestAgent.beatInterval;
      this.beats = this.bestAgent.events;
    }
    if (this.tempo == -1) {
      throw "Tempo extraction failed";
    }
  };

  exports.default = MusicTempo;
  module.exports = exports["default"];
});