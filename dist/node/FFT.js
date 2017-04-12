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