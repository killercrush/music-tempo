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