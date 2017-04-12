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