(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.FFT = mod.exports;
    }
})(this, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var FFT = function () {
        function FFT() {
            _classCallCheck(this, FFT);
        }

        _createClass(FFT, null, [{
            key: "getHammingWindow",
            value: function getHammingWindow(bufferSize) {
                var a = 25 / 46;
                var b = 21 / 46;
                var scale = 1 / bufferSize / 0.54;
                var sqrtBufferSize = Math.sqrt(bufferSize);
                var factor = Math.PI * 2 / bufferSize;
                var wnd = [];
                for (var i = 0; i < bufferSize; i++) {
                    wnd[i] = sqrtBufferSize * (scale * (a - b * Math.cos(factor * i)));
                }
                return wnd;
            }
        }, {
            key: "getSpectrum",
            value: function getSpectrum(re, im) {
                var direction = -1;
                var n = re.length;
                var bits = Math.round(Math.log(n) / Math.log(2));
                var twoPI = Math.PI * 2;
                if (n != 1 << bits) throw new Error("FFT data must be power of 2");
                var localN = void 0;
                var j = 0;
                for (var i = 0; i < n - 1; i++) {
                    if (i < j) {
                        var temp = re[j];
                        re[j] = re[i];
                        re[i] = temp;
                        temp = im[j];
                        im[j] = im[i];
                        im[i] = temp;
                    }
                    var k = n / 2;
                    while (k >= 1 && k - 1 < j) {
                        j = j - k;
                        k = k / 2;
                    }
                    j = j + k;
                }
                for (var m = 1; m <= bits; m++) {
                    localN = 1 << m;
                    var Wjk_r = 1;
                    var Wjk_i = 0;
                    var theta = twoPI / localN;
                    var Wj_r = Math.cos(theta);
                    var Wj_i = direction * Math.sin(theta);
                    var nby2 = localN / 2;
                    for (j = 0; j < nby2; j++) {
                        for (var _k = j; _k < n; _k += localN) {
                            var id = _k + nby2;
                            var tempr = Wjk_r * re[id] - Wjk_i * im[id];
                            var tempi = Wjk_r * im[id] + Wjk_i * re[id];
                            re[id] = re[_k] - tempr;
                            im[id] = im[_k] - tempi;
                            re[_k] += tempr;
                            im[_k] += tempi;
                        }
                        var wtemp = Wjk_r;
                        Wjk_r = Wj_r * Wjk_r - Wj_i * Wjk_i;
                        Wjk_i = Wj_r * Wjk_i + Wj_i * wtemp;
                    }
                }

                for (var _i = 0; _i < re.length; _i++) {
                    var pow = re[_i] * re[_i] + im[_i] * im[_i];
                    //im[i] = Math.atan2(im[i], re[i]);
                    re[_i] = pow;
                }

                for (var _i2 = 0; _i2 < re.length; _i2++) {
                    re[_i2] = Math.sqrt(re[_i2]);
                }
            }
        }]);

        return FFT;
    }();

    exports.default = FFT;
    module.exports = exports["default"];
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.OnsetDetection = mod.exports;
    }
})(this, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var OnsetDetection = function () {
        function OnsetDetection() {
            _classCallCheck(this, OnsetDetection);
        }

        _createClass(OnsetDetection, null, [{
            key: "calculateSF",
            value: function calculateSF(audioData, fft) {
                var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (typeof fft == "undefined") {
                    throw new ReferenceError("fft is undefined");
                }
                if (typeof fft.getHammingWindow !== "function" || typeof fft.getSpectrum !== "function") {
                    throw new ReferenceError("fft doesn't contain getHammingWindow or getSpectrum methods");
                }
                // Array.fill polyfill
                if (!Array.prototype.fill) {
                    Array.prototype.fill = function (value) {
                        if (this == null) {
                            throw new TypeError('this is null or not defined');
                        }
                        var O = Object(this);
                        var len = O.length >>> 0;
                        var start = arguments[1];
                        var relativeStart = start >> 0;
                        var k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
                        var end = arguments[2];
                        var relativeEnd = end === undefined ? len : end >> 0;
                        var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
                        while (k < final) {
                            O[k] = value;
                            k++;
                        }
                        return O;
                    };
                }
                params.bufferSize = params.bufferSize || 2048;
                //params.samplingRate = params.samplingRate || 44100;
                params.hopSize = params.hopSize || 441;

                var bufferSize = params.bufferSize,
                    hopSize = params.hopSize;


                var k = Math.floor(Math.log(bufferSize) / Math.LN2);
                if (Math.pow(2, k) !== bufferSize) {
                    throw "Invalid buffer size (" + bufferSize + "), must be power of 2";
                }

                var hammWindow = fft.getHammingWindow(bufferSize);
                var spectralFlux = [];
                var spectrumLength = bufferSize / 2 + 1;
                var previousSpectrum = new Array(spectrumLength);
                previousSpectrum.fill(0);
                var im = new Array(bufferSize);

                var length = audioData.length;
                var zerosStart = new Array(bufferSize - hopSize);
                zerosStart.fill(0);
                audioData = zerosStart.concat(audioData);

                var zerosEnd = new Array(bufferSize - audioData.length % hopSize);
                zerosEnd.fill(0);
                audioData = audioData.concat(zerosEnd);

                for (var wndStart = 0; wndStart < length; wndStart += hopSize) {
                    var wndEnd = wndStart + bufferSize;

                    var re = [];
                    var _k = 0;
                    for (var i = wndStart; i < wndEnd; i++) {
                        re[_k] = hammWindow[_k] * audioData[i];
                        _k++;
                    }
                    im.fill(0);

                    fft.getSpectrum(re, im);

                    var flux = 0;
                    for (var j = 0; j < spectrumLength; j++) {
                        var value = re[j] - previousSpectrum[j];
                        flux += value < 0 ? 0 : value;
                    }
                    spectralFlux.push(flux);

                    previousSpectrum = re;
                }

                return spectralFlux;
            }
        }, {
            key: "normalize",
            value: function normalize(data) {
                if (!Array.isArray(data)) {
                    throw "Array expected";
                }
                if (data.length == 0) {
                    throw "Array is empty";
                }
                var sum = 0;
                var squareSum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += data[i];
                    squareSum += data[i] * data[i];
                }
                var mean = sum / data.length;
                var standardDeviation = Math.sqrt((squareSum - sum * mean) / data.length);
                if (standardDeviation == 0) standardDeviation = 1;
                for (var _i = 0; _i < data.length; _i++) {
                    data[_i] = (data[_i] - mean) / standardDeviation;
                }
            }
        }, {
            key: "findPeaks",
            value: function findPeaks(spectralFlux) {
                var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var length = spectralFlux.length;
                var sf = spectralFlux;
                var decayRate = params.decayRate || 0.84;
                var peakFindingWindow = params.peakFindingWindow || 6;
                var meanWndMultiplier = params.meanWndMultiplier || 3;
                var peakThreshold = params.peakThreshold || 0.35;

                var max = 0;
                var av = sf[0];
                var peaks = [];

                for (var i = 0; i < length; i++) {
                    av = decayRate * av + (1 - decayRate) * sf[i];
                    if (sf[i] < av) continue;

                    var wndStart = i - peakFindingWindow;
                    var wndEnd = i + peakFindingWindow + 1;

                    if (wndStart < 0) wndStart = 0;
                    if (wndEnd > length) wndEnd = length;
                    if (av < sf[i]) av = sf[i];

                    var isMax = true;
                    for (var j = wndStart; j < wndEnd; j++) {
                        if (sf[j] > sf[i]) isMax = false;
                    }
                    if (isMax) {
                        var meanWndStart = i - peakFindingWindow * meanWndMultiplier;
                        var meanWndEnd = i + peakFindingWindow;
                        if (meanWndStart < 0) meanWndStart = 0;
                        if (meanWndEnd > length) meanWndEnd = length;
                        var sum = 0;
                        var count = meanWndEnd - meanWndStart;
                        for (var _j = meanWndStart; _j < meanWndEnd; _j++) {
                            sum += sf[_j];
                        }
                        if (sf[i] > sum / count + peakThreshold) {
                            peaks.push(i);
                        }
                    }
                }

                if (peaks.length < 2) {
                    throw "Fail to find peaks";
                }
                return peaks;
            }
        }]);

        return OnsetDetection;
    }();

    exports.default = OnsetDetection;
    module.exports = exports["default"];
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.TempoInduction = mod.exports;
    }
})(this, function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var TempoInduction = function () {
        function TempoInduction() {
            _classCallCheck(this, TempoInduction);
        }

        _createClass(TempoInduction, null, [{
            key: "processRhythmicEvents",
            value: function processRhythmicEvents(events) {
                var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var widthTreshold = params.widthTreshold || 0.025,
                    maxIOI = params.maxIOI || 2.5,
                    minIOI = params.minIOI || 0.07,
                    length = events.length;

                var clIntervals = [],
                    clSizes = [],
                    clCount = 0;

                for (var i = 0; i < length - 1; i++) {
                    for (var j = i + 1; j < length; j++) {
                        var ioi = events[j] - events[i];
                        if (ioi < minIOI) {
                            continue;
                        }
                        if (ioi > maxIOI) {
                            break;
                        }
                        var k = 0;
                        for (; k < clCount; k++) {
                            if (Math.abs(clIntervals[k] - ioi) < widthTreshold) {
                                if (Math.abs(clIntervals[k + 1] - ioi) < Math.abs(clIntervals[k] - ioi) && k < clCount - 1) {
                                    k++;
                                }
                                clIntervals[k] = (clIntervals[k] * clSizes[k] + ioi) / (clSizes[k] + 1);
                                clSizes[k]++;
                                break;
                            }
                        }
                        if (k != clCount) continue;
                        clCount++;
                        for (; k > 0 && clIntervals[k - 1] > ioi; k--) {
                            clIntervals[k] = clIntervals[k - 1];
                            clSizes[k] = clSizes[k - 1];
                        }
                        clIntervals[k] = ioi;
                        clSizes[k] = 1;
                    }
                }
                if (clCount == 0) {
                    throw "Fail to find IOIs";
                }
                clIntervals.length = clCount;
                clSizes.length = clCount;
                return { clIntervals: clIntervals, clSizes: clSizes };
            }
        }, {
            key: "mergeClusters",
            value: function mergeClusters(clusters) {
                var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var widthTreshold = params.widthTreshold || 0.025;

                var clIntervals = clusters.clIntervals,
                    clSizes = clusters.clSizes;
                var clCount = clIntervals.length;

                for (var i = 0; i < clCount; i++) {
                    for (var j = i + 1; j < clCount; j++) {
                        if (Math.abs(clIntervals[i] - clIntervals[j]) < widthTreshold) {
                            clIntervals[i] = (clIntervals[i] * clSizes[i] + clIntervals[j] * clSizes[j]) / (clSizes[i] + clSizes[j]);
                            clSizes[i] = clSizes[i] + clSizes[j];
                            --clCount;
                            for (var k = j + 1; k <= clCount; k++) {
                                clIntervals[k - 1] = clIntervals[k];
                                clSizes[k - 1] = clSizes[k];
                            }
                        }
                    }
                }clIntervals.length = clCount;
                clSizes.length = clCount;
                return { clIntervals: clIntervals, clSizes: clSizes };
            }
        }, {
            key: "calculateScore",
            value: function calculateScore(clusters) {
                var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var widthTreshold = params.widthTreshold || 0.025;
                var maxTempos = params.maxTempos || 10;

                var clIntervals = clusters.clIntervals,
                    clSizes = clusters.clSizes,
                    clScores = [],
                    clScoresIdxs = [];
                var clCount = clIntervals.length;

                for (var i = 0; i < clCount; i++) {
                    clScores[i] = 10 * clSizes[i];
                    clScoresIdxs[i] = { score: clScores[i], idx: i };
                }

                clScoresIdxs.sort(function (a, b) {
                    return b.score - a.score;
                });
                if (clScoresIdxs.length > maxTempos) {
                    for (var _i = maxTempos - 1; _i < clScoresIdxs.length - 1; _i++) {
                        if (clScoresIdxs[_i].score == clScoresIdxs[_i + 1].score) {
                            maxTempos++;
                        } else {
                            break;
                        }
                    }
                    clScoresIdxs.length = maxTempos;
                }

                clScoresIdxs = clScoresIdxs.map(function (a) {
                    return a.idx;
                });

                for (var _i2 = 0; _i2 < clCount; _i2++) {
                    for (var j = _i2 + 1; j < clCount; j++) {
                        var ratio = clIntervals[_i2] / clIntervals[j];
                        var isFraction = ratio < 1;
                        var d = void 0,
                            err = void 0;
                        d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                        if (d < 2 || d > 8) continue;

                        if (isFraction) err = Math.abs(clIntervals[_i2] * d - clIntervals[j]);else err = Math.abs(clIntervals[_i2] - clIntervals[j] * d);
                        var errTreshold = isFraction ? widthTreshold : widthTreshold * d;
                        if (err >= errTreshold) continue;

                        d = d >= 5 ? 1 : 6 - d;
                        clScores[_i2] += d * clSizes[j];
                        clScores[j] += d * clSizes[_i2];
                    }
                }
                return { clScores: clScores, clScoresIdxs: clScoresIdxs };
            }
        }, {
            key: "createTempoList",
            value: function createTempoList(clusters) {
                var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var widthTreshold = params.widthTreshold || 0.025,
                    minBeatInterval = params.minBeatInterval || 0.3,
                    maxBeatInterval = params.maxBeatInterval || 1;
                var clIntervals = clusters.clIntervals,
                    clSizes = clusters.clSizes,
                    clScores = clusters.clScores,
                    clScoresIdxs = clusters.clScoresIdxs,
                    tempoList = [];
                var clCount = clIntervals.length;

                for (var i = 0; i < clScoresIdxs.length; i++) {
                    var idx = clScoresIdxs[i];
                    var newSum = clIntervals[idx] * clScores[idx];
                    var newWeight = clScores[idx];
                    var err = void 0,
                        errTreshold = void 0;
                    for (var j = 0; j < clCount; j++) {
                        if (j == idx) continue;
                        var ratio = clIntervals[idx] / clIntervals[j];
                        var isFraction = ratio < 1;
                        var sumInc = 0;
                        var d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                        if (d < 2 || d > 8) continue;

                        if (isFraction) {
                            err = Math.abs(clIntervals[idx] * d - clIntervals[j]);
                            errTreshold = widthTreshold;
                        } else {
                            err = Math.abs(clIntervals[idx] - d * clIntervals[j]);
                            errTreshold = widthTreshold * d;
                        }
                        if (err >= errTreshold) continue;

                        if (isFraction) {
                            newSum += clIntervals[j] / d * clScores[j];
                        } else {
                            newSum += clIntervals[j] * d * clScores[j];
                        }
                        newWeight += clScores[j];
                    }
                    var beat = newSum / newWeight;

                    while (beat < minBeatInterval) {
                        beat *= 2;
                    }while (beat > maxBeatInterval) {
                        beat /= 2;
                    }tempoList.push(beat);
                }
                return tempoList;
            }
        }]);

        return TempoInduction;
    }();

    exports.default = TempoInduction;
    module.exports = exports["default"];
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["module", "exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.Agent = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Agent = function () {
    /**
     * Constructor
     * @param {Number} tempo - tempo hypothesis of the Agent
     * @param {Number} firstBeatTime - the time of the first beat accepted by this Agent
     * @param {Number} firsteventScore - salience value of the first beat accepted by this Agent
     * @param {Array} agentList - reference to the agent list 
     * @param {Object} [params={}] - parameters     
     * @param {Number} [params.expiryTime=10] - the time after which an Agent that has not accepted any beat will be destroyed
     * @param {Number} [params.toleranceWndInner=0.04] - the maximum time that a beat can deviate from the predicted beat time without a fork occurring
     * @param {Number} [params.toleranceWndPre=0.15] - the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
     * @param {Number} [params.toleranceWndPost=0.3] - the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
     * @param {Number} [params.correctionFactor=50] - correction factor for updating beat period
     * @param {Number} [params.maxChange=0.2] - the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
     * @param {Number} [params.penaltyFactor=0.5] - factor for correcting score, if onset do not coincide precisely with predicted beat time
     */
    function Agent(tempo, firstBeatTime, firsteventScore, agentList) {
      var params = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      _classCallCheck(this, Agent);

      /** 
       * the time after which an Agent that has not accepted any beat will be destroyed
       * @type {Number} 
       */
      this.expiryTime = params.expiryTime || 10;
      /** 
       * the maximum time that a beat can deviate from the predicted beat time without a fork occurring
       * @type {Number} 
       */
      this.toleranceWndInner = params.toleranceWndInner || 0.04;
      /** 
       * the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
       * @type {Number} 
       */
      this.toleranceWndPre = params.toleranceWndPre || 0.15;
      /** 
       * the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
       * @type {Number} 
       */
      this.toleranceWndPost = params.toleranceWndPost || 0.3;

      this.toleranceWndPre *= tempo;
      this.toleranceWndPost *= tempo;

      /** 
       * correction factor for updating beat period
       * @type {Number} 
       */
      this.correctionFactor = params.correctionFactor || 50;
      /** 
       * the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
       * @type {Number} 
       */
      this.maxChange = params.maxChange || 0.2;
      /** 
       * factor for correcting score, if onset do not coincide precisely with predicted beat time
       * @type {Number} 
       */
      this.penaltyFactor = params.penaltyFactor || 0.5;

      /** 
       * the current tempo hypothesis of the Agent, expressed as the beat period
       * @type {Number} 
       */
      this.beatInterval = tempo;
      /** 
       * the initial tempo hypothesis of the Agent, expressed as the beat period
       * @type {Number}
       */
      this.initialBeatInterval = tempo;
      /** 
       * the time of the most recent beat accepted by this Agent
       * @type {Number} 
       */
      this.beatTime = firstBeatTime;
      /** 
       * the number of beats found by this Agent, including interpolated beats
       * @type {Number} 
       */
      this.totalBeatCount = 1;
      /** 
       * the array of onsets accepted by this Agent as beats, plus interpolated beats
       * @type {Array} 
       */
      this.events = [firstBeatTime];
      /** 
       * sum of salience values of the onsets which have been interpreted as beats by this Agent
       * @type {Number} 
       */
      this.score = firsteventScore;
      /** 
       * reference to the agent list 
       * @type {Array} 
       */
      this.agentListRef = agentList;
    }
    /**
     * The event time is tested if it is a beat time
     * @param {Number} eventTime - the event time to be tested
     * @param {Number} eventScore - salience values of the event time
     * @return {Boolean} indicate whether the given event time was accepted as a beat time
     */


    _createClass(Agent, [{
      key: "considerEvent",
      value: function considerEvent(eventTime, eventScore) {
        if (eventTime - this.events[this.events.length - 1] > this.expiryTime) {
          this.score = -1;
          return false;
        }

        var beatCount = Math.round((eventTime - this.beatTime) / this.beatInterval);
        var err = eventTime - this.beatTime - beatCount * this.beatInterval;

        if (beatCount > 0 && err >= -this.toleranceWndPre && err <= this.toleranceWndPost) {
          if (Math.abs(err) > this.toleranceWndInner) {
            this.agentListRef.push(this.clone());
          }
          this.acceptEvent(eventTime, eventScore, err, beatCount);
          return true;
        }
        return false;
      }
    }, {
      key: "acceptEvent",
      value: function acceptEvent(eventTime, eventScore, err, beatCount) {
        this.beatTime = eventTime;
        this.events.push(eventTime);

        var corrErr = err / this.correctionFactor;
        if (Math.abs(this.initialBeatInterval - this.beatInterval - corrErr) < this.maxChange * this.initialBeatInterval) {
          this.beatInterval += corrErr;
        }
        this.totalBeatCount += beatCount;
        var errFactor = err > 0 ? err / this.toleranceWndPost : err / -this.toleranceWndPre;
        var scoreFactor = 1 - this.penaltyFactor * errFactor;
        this.score += eventScore * scoreFactor;
      }
    }, {
      key: "fillBeats",
      value: function fillBeats() {
        var prevBeat = void 0,
            nextBeat = void 0,
            currentInterval = void 0,
            beats = void 0;
        prevBeat = 0;
        if (this.events.length > 2) {
          prevBeat = this.events[0];
        }

        for (var i = 0; i < this.events.length; i++) {
          nextBeat = this.events[i];
          beats = Math.round((nextBeat - prevBeat) / this.beatInterval - 0.01);
          currentInterval = (nextBeat - prevBeat) / beats;
          var k = 0;
          for (; beats > 1; beats--) {
            prevBeat += currentInterval;
            this.events.splice(i + k, 0, prevBeat);
            k++;
          }
          prevBeat = nextBeat;
        }
      }
    }, {
      key: "clone",
      value: function clone() {
        var newAgent = new Agent();
        newAgent.beatInterval = this.beatInterval;
        newAgent.initialBeatInterval = this.initialBeatInterval;
        newAgent.beatTime = this.beatTime;
        newAgent.totalBeatCount = this.totalBeatCount;
        newAgent.events = this.events.slice();
        newAgent.expiryTime = this.expiryTime;
        newAgent.toleranceWndInner = this.toleranceWndInner;
        newAgent.toleranceWndPre = this.toleranceWndPre;
        newAgent.toleranceWndPost = this.toleranceWndPost;
        newAgent.correctionFactor = this.correctionFactor;
        newAgent.maxChange = this.maxChange;
        newAgent.penaltyFactor = this.penaltyFactor;
        newAgent.score = this.score;
        newAgent.agentListRef = this.agentListRef;

        return newAgent;
      }
    }]);

    return Agent;
  }();

  exports.default = Agent;
  module.exports = exports["default"];
});
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["module", "exports", "./Agent"], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports, require("./Agent"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports, global.Agent);
        global.BeatTracking = mod.exports;
    }
})(this, function (module, exports, _Agent) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _Agent2 = _interopRequireDefault(_Agent);

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

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var BeatTracking = function () {
        function BeatTracking() {
            _classCallCheck(this, BeatTracking);
        }

        _createClass(BeatTracking, null, [{
            key: "trackBeat",
            value: function trackBeat(events, eventsScores, tempoList) {
                var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

                var initPeriod = params.initPeriod || 5,
                    thresholdBI = params.thresholdBI || 0.02,
                    thresholdBT = params.thresholdBT || 0.04;
                function removeSimilarAgents() {
                    agents.sort(function (a1, a2) {
                        return a1.beatInterval - a2.beatInterval;
                    });
                    var length = agents.length;
                    for (var i = 0; i < length; i++) {
                        if (agents[i].score < 0) continue;
                        for (var _j = i + 1; _j < length; _j++) {
                            if (agents[_j].beatInterval - agents[i].beatInterval > thresholdBI) {
                                break;
                            }
                            if (Math.abs(agents[_j].beatTime - agents[i].beatTime) > thresholdBT) {
                                continue;
                            }
                            if (agents[i].score < agents[_j].score) {
                                agents[i].score = -1;
                            } else {
                                agents[_j].score = -1;
                            }
                        }
                    }
                    for (var _i = length - 1; _i >= 0; _i--) {
                        if (agents[_i].score < 0) {
                            agents.splice(_i, 1);
                        }
                    }
                }
                var agents = [];

                for (var i = 0; i < tempoList.length; i++) {
                    agents.push(new _Agent2.default(tempoList[i], events[0], eventsScores[0], agents, params));
                }
                var j = 1;
                removeSimilarAgents();

                while (events[j] < initPeriod) {
                    var agentsLength = agents.length;
                    var prevBeatInterval = -1;
                    var isEventAccepted = true;
                    for (var k = 0; k < agentsLength; k++) {
                        if (agents[k].beatInterval != prevBeatInterval) {
                            if (!isEventAccepted) {
                                agents.push(new _Agent2.default(prevBeatInterval, events[j], eventsScores[j], agents, params));
                            }
                            prevBeatInterval = agents[k].beatInterval;
                            isEventAccepted = false;
                        }
                        isEventAccepted = agents[k].considerEvent(events[j], eventsScores[j]) || isEventAccepted;
                    }
                    removeSimilarAgents();
                    j++;
                }
                var eventsLength = events.length;
                for (var _i2 = j; _i2 < eventsLength; _i2++) {
                    var _agentsLength = agents.length;
                    for (var _j2 = 0; _j2 < _agentsLength; _j2++) {
                        agents[_j2].considerEvent(events[_i2], eventsScores[_i2]);
                    }
                    removeSimilarAgents();
                }

                return agents;
            }
        }]);

        return BeatTracking;
    }();

    exports.default = BeatTracking;
    module.exports = exports["default"];
});
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