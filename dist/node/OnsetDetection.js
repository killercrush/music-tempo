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