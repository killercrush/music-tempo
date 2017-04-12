/*
*      _______                       _____   _____ _____  
*     |__   __|                     |  __ \ / ____|  __ \ 
*        | | __ _ _ __ ___  ___  ___| |  | | (___ | |__) |
*        | |/ _` | '__/ __|/ _ \/ __| |  | |\___ \|  ___/ 
*        | | (_| | |  \__ \ (_) \__ \ |__| |____) | |     
*        |_|\__,_|_|  |___/\___/|___/_____/|_____/|_|     
*                                                         
* -------------------------------------------------------------
*
* TarsosDSP is developed by Joren Six at IPEM, University Ghent
*  
* -------------------------------------------------------------
*
*  Info: http://0110.be/tag/TarsosDSP
*  Github: https://github.com/JorenSix/TarsosDSP
*  Releases: http://0110.be/releases/TarsosDSP/
*  
*  TarsosDSP includes modified source code by various authors,
*  for credits and info, see README.
* 
*/

/*
*      _______                       _____   _____ _____  
*     |__   __|                     |  __ \ / ____|  __ \ 
*        | | __ _ _ __ ___  ___  ___| |  | | (___ | |__) |
*        | |/ _` | '__/ __|/ _ \/ __| |  | |\___ \|  ___/ 
*        | | (_| | |  \__ \ (_) \__ \ |__| |____) | |     
*        |_|\__,_|_|  |___/\___/|___/_____/|_____/|_|     
*                                                         
* -----------------------------------------------------------
*
*  TarsosDSP is developed by Joren Six at 
*  The Royal Academy of Fine Arts & Royal Conservatory,
*  University College Ghent,
*  Hoogpoort 64, 9000 Ghent - Belgium
*  
*  http://tarsos.0110.be/tag/TarsosDSP
*  https://github.com/JorenSix/TarsosDSP
*  http://tarsos.0110.be/releases/TarsosDSP/
* 
*/
/* 
 * Copyright (c) 2006, Karl Helgason
 * 
 * 2007/1/8 modified by p.j.leonard
 * 
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 
 *    1. Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *    2. Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *    3. The name of the author may not be used to endorse or promote
 *       products derived from this software without specific prior
 *       written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */

/**
 * Implementation of the Constant Q Transform.<br> References:
 * <p>
 * Judith C. Brown, <a
 * href="http://www.wellesley.edu/Physics/brown/pubs/cq1stPaper.pdf">
 * Calculation of a constant Q spectral transform</a>, J. Acoust. Soc. Am.,
 * 89(1): 425-434, 1991.
 * </p>
 * <p>
 * Judith C. Brown and Miller S. Puckette, <a
 * href="http://www.wellesley.edu/Physics/brown/pubs/effalgV92P2698-P2701.pdf"
 * >An efficient algorithm for the calculation of a constant Q transform</a>, J.
 * Acoust. Soc. Am., Vol. 92, No. 5, November 1992
 * </p>
 * <p>
 * Benjamin Blankertz, <a href=
 * "http://wwwmath1.uni-muenster.de/logik/org/staff/blankertz/constQ/constQ.pdf"
 * >The Constant Q Transform</a>
 * </p>
 *
 *
 * @author Joren Six
 * @author Karl Helgason
 * @author P.J Leonard
 */
var ConstantQ = (function () {
    function ConstantQ(sampleRate, minFreq, maxFreq, binsPerOctave, threshold, spread) {
        if (threshold === void 0) { threshold = 0.001; }
        if (spread === void 0) { spread = 1.0; }

        this.minimumFrequency = 0;
        this.maximumFreqency = 0;
        this.fftLength = 0;
        this.binsPerOctave = 0;
        this.minimumFrequency = minFreq;
        this.maximumFreqency = maxFreq;
        this.binsPerOctave = (binsPerOctave | 0);
        var q = 1.0 / (Math.pow(2, 1.0 / binsPerOctave) - 1.0) / spread;
        var numberOfBins = (Math.ceil(binsPerOctave * Math.log(this.maximumFreqency / this.minimumFrequency) / Math.log(2)) | 0);
        this.coefficients = new Array(numberOfBins * 2);
        this.magnitudes = new Array(numberOfBins);
        var calc_fftlen = Math.ceil(q * sampleRate / this.minimumFrequency);
        this.fftLength = (calc_fftlen | 0);
        this.fftLength = (Math.pow(2, Math.ceil(Math.log(calc_fftlen) / Math.log(2))) | 0);
        this.fft = new FloatFFT(this.fftLength);
        this.qKernel = new Array(numberOfBins);
        this.qKernel_indexes = new Array(numberOfBins);
        this.frequencies = new Array(numberOfBins);
        var temp = new Array(this.fftLength * 2);
        var ctemp = new Array(this.fftLength * 2);
        var cindexes = new Array(this.fftLength);
        for (var i = 0; i < numberOfBins; i++) {
            var sKernel = temp;
            this.frequencies[i] = (this.minimumFrequency * Math.pow(2, i / binsPerOctave));
            var len = (Math.min(Math.ceil(q * sampleRate / this.frequencies[i]), this.fftLength) | 0);
            for (var j = 0; j < len; j++) {
                var window_1 = -0.5 * Math.cos(2.0 * Math.PI * j / len) + 0.5;
                window_1 /= len;
                var x = 2 * Math.PI * q * j / len;
                sKernel[j * 2] = (window_1 * Math.cos(x));
                sKernel[j * 2 + 1] = (window_1 * Math.sin(x));
            }
            for (var j = len * 2; j < this.fftLength * 2; j++) {
                sKernel[j] = 0;
            }
            this.fft.complexForward(sKernel, 0);
            var cKernel = ctemp;
            var k = 0;
            for (var j = 0, j2 = sKernel.length - 2; j < (sKernel.length / 2 | 0); j += 2, j2 -= 2) {
                var absval = Math.sqrt(sKernel[j] * sKernel[j] + sKernel[j + 1] * sKernel[j + 1]);
                absval += Math.sqrt(sKernel[j2] * sKernel[j2] + sKernel[j2 + 1] * sKernel[j2 + 1]);
                if (absval > threshold) {
                    cindexes[k] = j;
                    cKernel[2 * k] = sKernel[j] + sKernel[j2];
                    cKernel[2 * k + 1] = sKernel[j + 1] + sKernel[j2 + 1];
                    k++;
                }
            }
            sKernel = new Array(k * 2);
            var indexes = new Array(k);
            for (var j = 0; j < k * 2; j++)
                sKernel[j] = cKernel[j];
            for (var j = 0; j < k; j++)
                indexes[j] = cindexes[j];
            for (var j = 0; j < sKernel.length; j++)
                sKernel[j] /= this.fftLength;
            for (var j = 1; j < sKernel.length; j += 2)
                sKernel[j] = -sKernel[j];
            for (var j = 0; j < sKernel.length; j++)
                sKernel[j] = -sKernel[j];
            this.qKernel_indexes[i] = indexes;
            this.qKernel[i] = sKernel;
        }
    }
    /**
     * Take an input buffer with audio and calculate the constant Q
     * coefficients.
     *
     * @param inputBuffer
     * The input buffer with audio.
     *
     *
     */
    ConstantQ.prototype.calculate = function (inputBuffer) {
        this.fft.realForward(inputBuffer, 0);
        for (var i = 0; i < this.qKernel.length; i++) {
            var kernel = this.qKernel[i];
            var indexes = this.qKernel_indexes[i];
            var t_r = 0;
            var t_i = 0;
            for (var j = 0, l = 0; j < kernel.length; j += 2, l++) {
                var jj = indexes[l];
                var b_r = inputBuffer[jj];
                var b_i = inputBuffer[jj + 1];
                var k_r = kernel[j];
                var k_i = kernel[j + 1];
                t_r += b_r * k_r - b_i * k_i;
                t_i += b_r * k_i + b_i * k_r;
            }
            this.coefficients[i * 2] = t_r;
            this.coefficients[i * 2 + 1] = t_i;
        }
    };
    /**
     * Take an input buffer with audio and calculate the constant Q magnitudes.
     * @param inputBuffer The input buffer with audio.
     */
    ConstantQ.prototype.calculateMagintudes = function (inputBuffer) {
        this.calculate(inputBuffer);
        for (var i = 0; i < this.magnitudes.length; i++) {
            this.magnitudes[i] = Math.sqrt(this.coefficients[i * 2] * this.coefficients[i * 2] + this.coefficients[i * 2 + 1] * this.coefficients[i * 2 + 1]);
        }
    };
    /**
     * @return The list of starting frequencies for each band. In Hertz.
     */
    ConstantQ.prototype.getFreqencies = function () {
        return this.frequencies;
    };
    /**
     * Returns the Constant Q magnitudes calculated for the previous audio
     * buffer. Beware: the array is reused for performance reasons. If your need
     * to cache your results, please copy the array.
     * @return The output buffer with constant q magnitudes. If you for example are
     * interested in coefficients between 256 and 1024 Hz (2^8 and 2^10 Hz) and
     * you requested 12 bins per octave, you will need 12 bins/octave * 2
     * octaves = 24 places in the output buffer.
     */
    ConstantQ.prototype.getMagnitudes = function () {
        return this.magnitudes;
    };
    /**
     * Return the Constant Q coefficients calculated for the previous audio
     * buffer. Beware: the array is reused for performance reasons. If your need
     * to cache your results, please copy the array.
     *
     * @return The array with constant q coefficients. If you for example are
     * interested in coefficients between 256 and 1024 Hz (2^8 and 2^10
     * Hz) and you requested 12 bins per octave, you will need 12
     * bins/octave * 2 octaves * 2 entries/bin = 48 places in the output
     * buffer. The coefficient needs two entries in the output buffer
     * since they are complex numbers.
     */
    ConstantQ.prototype.getCoefficients = function () {
        return this.coefficients;
    };
    /**
     * @return The number of coefficients, output bands.
     */
    ConstantQ.prototype.getNumberOfOutputBands = function () {
        return this.frequencies.length;
    };
    /**
     * @return The required length the FFT.
     */
    ConstantQ.prototype.getFFTlength = function () {
        return this.fftLength;
    };
    /**
     * @return the number of bins every octave.
     */
    ConstantQ.prototype.getBinsPerOctave = function () {
        return this.binsPerOctave;
    };
    return ConstantQ;
}());
ConstantQ["__class"] = "ConstantQ";
