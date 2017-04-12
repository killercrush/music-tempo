/** 
 * Class containing methods for Fast Fourier Transform
 * @class
 */
export default class FFT {
    /**
     * Get Hamming window
     * @param {Number} bufferSize - windows size
     * @return {Array} wnd - Hamming window
     */       
    static getHammingWindow(bufferSize) {
        const a = 25 / 46;
        const b = 21 / 46;
        const scale = 1 / bufferSize / 0.54; 
        const sqrtBufferSize =  Math.sqrt(bufferSize);
        const factor = (Math.PI * 2) / bufferSize;
        let wnd = [];
        for (let i = 0; i < bufferSize; i++) {
            wnd[i] = sqrtBufferSize * (scale * (a - b * Math.cos(factor * i))) ;
        }
        return wnd;
    }
    /**
     * Computes FFT and converts the results to magnitude representation
     * @param {Array} re - the real part of the input data and the magnitude of the output data
     * @param {Array} im - the imaginary part of the input data
     */
    static getSpectrum(re, im) {
        const direction = -1;
        const n = re.length;
        const bits = Math.round(Math.log(n) / Math.log(2));
        const twoPI = Math.PI * 2;
        if (n != (1 << bits))
            throw new Error("FFT data must be power of 2");
        let localN;
        let j = 0;        
        for (let i = 0; i < n-1; i++) {
            if (i < j) {
                let temp = re[j];
                re[j] = re[i];
                re[i] = temp;
                temp = im[j];
                im[j] = im[i];
                im[i] = temp;
            }
            let k = n / 2;
            while ((k >= 1) &&  (k - 1 < j)) {
                j = j - k;
                k = k / 2;
            }
            j = j + k;
        }
        for(let m = 1; m <= bits; m++) {
            localN = 1 << m;
            let Wjk_r = 1;
            let Wjk_i = 0;
            let theta = twoPI / localN;
            let Wj_r = Math.cos(theta);
            let Wj_i = direction * Math.sin(theta);
            let nby2 = localN / 2;
            for (j = 0; j < nby2; j++) {
                for (let k = j; k < n; k += localN) {
                    let id = k + nby2;
                    let tempr = Wjk_r * re[id] - Wjk_i * im[id];
                    let tempi = Wjk_r * im[id] + Wjk_i * re[id];
                    re[id] = re[k] - tempr;
                    im[id] = im[k] - tempi;
                    re[k] += tempr;
                    im[k] += tempi;
                }
                let wtemp = Wjk_r;
                Wjk_r = Wj_r * Wjk_r  - Wj_i * Wjk_i;
                Wjk_i = Wj_r * Wjk_i  + Wj_i * wtemp;
            }
        }

        for (let i = 0; i < re.length; i++) {
            let pow = re[i] * re[i] + im[i] * im[i];
            //im[i] = Math.atan2(im[i], re[i]);
            re[i] = pow;
        }

        for (let i = 0; i < re.length; i++)
            re[i] = Math.sqrt(re[i]);

    }
}