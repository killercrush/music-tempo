/** 
 * Spectral flux calculating and peaks finding
 * @class
 */
export default class OnsetDetection {
    /**
     * Get spectral flux
     * @param {Float32Array} audioData - non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1 (Web Audio API - Audio Buffer)
     * @param {Object} fft - object with methods for performing FFT
     * @param {Object} [params={}] - parameters
     * @param {Number} [params.bufferSize=2048] - FFT windows size
     * @param {Number} [params.hopSize=441] - spacing of audio frames in samples
     * @return {Array} spectralFlux - the array of spectral flux values
     */      
    static calculateSF(audioData, fft, params = {}) {
        if (typeof fft == "undefined") {
            throw new ReferenceError("fft is undefined");
        } 
        if (typeof fft.getHammingWindow !== "function" || typeof fft.getSpectrum !== "function") {
            throw new ReferenceError("fft doesn't contain getHammingWindow or getSpectrum methods");
        }
        // Array.fill polyfill
        if (!Array.prototype.fill) {
          Array.prototype.fill = function(value) {
            if (this == null) {
              throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            var start = arguments[1];
            var relativeStart = start >> 0;
             var k = relativeStart < 0 ?
              Math.max(len + relativeStart, 0) :
              Math.min(relativeStart, len);
            var end = arguments[2];
            var relativeEnd = end === undefined ?
              len : end >> 0;
            var final = relativeEnd < 0 ?
              Math.max(len + relativeEnd, 0) :
              Math.min(relativeEnd, len);
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

        const {bufferSize, hopSize} = params;        

        let k = Math.floor(Math.log(bufferSize) / Math.LN2);
        if (Math.pow(2, k) !== bufferSize) { 
            throw "Invalid buffer size (" + bufferSize + "), must be power of 2"; 
        }

        const hammWindow = fft.getHammingWindow(bufferSize);
        let spectralFlux = [];
        let spectrumLength = bufferSize / 2 + 1;
        let previousSpectrum = new Array(spectrumLength);
        previousSpectrum.fill(0);
        let im = new Array(bufferSize);

        let length = audioData.length;
        let zerosStart = new Array(bufferSize - hopSize);
        zerosStart.fill(0);
        audioData = zerosStart.concat(audioData);        

        let zerosEnd = new Array(bufferSize - (audioData.length % hopSize));
        zerosEnd.fill(0);
        audioData = audioData.concat(zerosEnd);
        
        for (let wndStart = 0; wndStart < length; wndStart += hopSize) {   
            let wndEnd = wndStart + bufferSize;

            let re = [];
            let k = 0;
            for (let i = wndStart; i < wndEnd; i++) {
                re[k] = hammWindow[k] * audioData[i];
                k++;
            }
            im.fill(0);

            fft.getSpectrum(re, im);

            let flux = 0;
            for(let j = 0; j < spectrumLength; j++) {
                let value = re[j] - previousSpectrum[j];
                flux += value < 0 ? 0 : value;
            }
            spectralFlux.push(flux);

            previousSpectrum = re;   
        }

        return spectralFlux;
    }
    /**
     * Normalize data to have a mean of 0 and standard deviation of 1
     * @param {Array} data - data array
     */  
    static normalize(data) {
        if (!Array.isArray(data)) {
            throw "Array expected";
        }
        if (data.length == 0) {
            throw "Array is empty";
        }
        let sum = 0;
        let squareSum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            squareSum += data[i] * data[i];
        }
        let mean = sum / data.length;
        let standardDeviation = Math.sqrt( (squareSum - sum * mean) / data.length );
        if (standardDeviation == 0)
            standardDeviation = 1; 
        for (let i = 0; i < data.length; i++) {
            data[i] = (data[i] - mean) / standardDeviation;
        }
    }    
    /**
     * Finding local maxima in an array
     * @param {Array} spectralFlux - input data
     * @param {Object} [params={}] - parametrs
     * @param {Number} [params.decayRate=0.84] - how quickly previous peaks are forgotten
     * @param {Number} [params.peakFindingWindow=6] - minimum distance between peaks
     * @param {Number} [params.meanWndMultiplier=3] - multiplier for peak finding window
     * @param {Number} [params.peakThreshold=0.35] - minimum value of peaks
     * @return {Array} peaks - array of peak indexes
     */  
    static findPeaks(spectralFlux, params = {}) {
        const length = spectralFlux.length;
        const sf = spectralFlux;
        const decayRate = params.decayRate || 0.84;
        const peakFindingWindow = params.peakFindingWindow || 6;
        const meanWndMultiplier = params.meanWndMultiplier || 3;
        const peakThreshold = params.peakThreshold || 0.35;
       
        let max = 0;
        let av = sf[0];
        let peaks = [];

        for (let i = 0; i < length; i++) {
            av = decayRate * av + (1 - decayRate) * sf[i];
            if (sf[i] < av) continue;

            let wndStart = i - peakFindingWindow;
            let wndEnd = i + peakFindingWindow + 1;

            if (wndStart < 0) wndStart = 0;
            if (wndEnd > length) wndEnd = length;
            if (av < sf[i]) av = sf[i];

            let isMax = true;
            for (let j = wndStart; j < wndEnd; j++) {
                if (sf[j] > sf[i]) isMax = false; 
            }
            if (isMax) {
                let meanWndStart = i - peakFindingWindow * meanWndMultiplier;
                let meanWndEnd = i + peakFindingWindow;
                if (meanWndStart < 0) meanWndStart = 0;
                if (meanWndEnd > length) meanWndEnd = length;
                let sum = 0;
                let count = meanWndEnd - meanWndStart;
                for (let j = meanWndStart; j < meanWndEnd; j++) {
                    sum += sf[j];
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
}