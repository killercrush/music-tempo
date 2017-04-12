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


/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is JTransforms.
 *
 * The Initial Developer of the Original Code is
 * Piotr Wendykier, Emory University.
 * Portions created by the Initial Developer are Copyright (C) 2007-2009
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/* Generated from Java with JSweet 1.2.0 - http://www.jsweet.org */

var ConcurrencyUtils = (function () {
    function ConcurrencyUtils() {
    }
    /**
     * Returns the closest power-of-two number greater than or equal to x.
     *
     * @param x
     * @return the closest power-of-two number greater than or equal to x
     */
    ConcurrencyUtils.nextPow2 = function (x) {
        if (x < 1)
            throw new java.lang.IllegalArgumentException("x must be greater or equal 1");
        if ((x & (x - 1)) === 0) {
            return x;
        }
        x |= (x >>> 1);
        x |= (x >>> 2);
        x |= (x >>> 4);
        x |= (x >>> 8);
        x |= (x >>> 16);
        x |= (x >>> 32);
        return x + 1;
    };
    /**
     * Checks if x is a power-of-two number.
     *
     * @param x
     * @return true if x is a power-of-two number
     */
    ConcurrencyUtils.isPowerOf2 = function (x) {
        if (x <= 0)
            return false;
        else
            return (x & (x - 1)) === 0;
    };
    return ConcurrencyUtils;
}());
ConcurrencyUtils["__class"] = "ConcurrencyUtils";
var FloatFFT = (function () {
    /**
     * Creates new instance of FloatFFT.
     *
     * @param n
     * size of data
     */
    function FloatFFT(n) {
        this.n = 0;
        this.nBluestein = 0;
        this.nw = 0;
        this.nc = 0;
        if (!ConcurrencyUtils.isPowerOf2(n)) {
            throw new java.lang.IllegalArgumentException("n must be power of 2");
        }
        this.n = n;
        this.plan = FloatFFT.Plans.SPLIT_RADIX;
        this.ip = new Array(2 + (Math.ceil(2 + (1 << (((Math.log(n + 0.5) / Math.log(2)) | 0) / 2 | 0))) | 0));
        this.w = new Array(n);
        var twon = 2 * n;
        this.nw = this.ip[0];
        if (twon > (this.nw << 2)) {
            this.nw = twon >> 2;
            this.makewt(this.nw);
        }
        this.nc = this.ip[1];
        if (n > (this.nc << 2)) {
            this.nc = n >> 2;
            this.makect(this.nc, this.w, this.nw);
        }
    }
    FloatFFT.factors_$LI$ = function () { if (FloatFFT.factors == null)
        FloatFFT.factors = [4, 2, 3, 5]; return FloatFFT.factors; };
    ;
    /**
     * Computes 1D forward DFT of complex data leaving the result in
     * <code>a</code>. Complex number is stored as two float values in
     * sequence: the real and imaginary part, i.e. the size of the input array
     * must be greater or equal 2*n. The physical layout of the input data has
     * to be as follows:<br>
     *
     * <pre>
     * a[offa+2*k] = Re[k],
     * a[offa+2*k+1] = Im[k], 0&lt;=k&lt;n
     * </pre>
     *
     * @param a
     * data to transform
     * @param offa
     * index of the first element in array <code>a</code>
     */
    FloatFFT.prototype.complexForward = function (a, offa) {
        if (this.n === 1)
            return;
        switch ((this.plan)) {
            case FloatFFT.Plans.SPLIT_RADIX:
                this.cftbsub(2 * this.n, a, offa, this.ip, this.nw, this.w);
                break;
        }
    };
    FloatFFT.prototype.realForward = function (a, offa) {
        if (this.n === 1)
            return;
        switch ((this.plan)) {
            case FloatFFT.Plans.SPLIT_RADIX:
                var xi = void 0;
                if (this.n > 4) {
                    this.cftfsub(this.n, a, offa, this.ip, this.nw, this.w);
                    this.rftfsub(this.n, a, offa, this.nc, this.w, this.nw);
                }
                else if (this.n === 4) {
                }
                xi = a[offa] - a[offa + 1];
                a[offa] += a[offa + 1];
                a[offa + 1] = xi;
                break;
        }
    };
    FloatFFT.prototype.cftfsub = function (n, a, offa, ip, nw, w) {
        if (n > 8) {
            if (n > 32) {
                this.cftf1st(n, a, offa, w, nw - (n >> 2));
                if (false) {
                }
                else if (n > 512) {
                    this.cftrec4(n, a, offa, nw, w);
                }
                else if (n > 128) {
                }
                else {
                }
                this.bitrv2(n, ip, a, offa);
            }
            else if (n === 32) {
            }
            else {
            }
        }
        else if (n === 8) {
        }
        else if (n === 4) {
        }
    };
    FloatFFT.prototype.cftbsub = function (n, a, offa, ip, nw, w) {
        if (n > 8) {
            if (n > 32) {
                this.cftb1st(n, a, offa, w, nw - (n >> 2));
                if (false) {
                }
                else if (n > 512) {
                    this.cftrec4(n, a, offa, nw, w);
                }
                else if (n > 128) {
                }
                else {
                }
                this.bitrv2conj(n, ip, a, offa);
            }
            else if (n === 32) {
            }
            else {
            }
        }
        else if (n === 8) {
        }
        else if (n === 4) {
        }
    };
    FloatFFT.prototype.rftfsub = function (n, a, offa, nc, c, startc) {
        var k;
        var kk;
        var ks;
        var m;
        var wkr;
        var wki;
        var xr;
        var xi;
        var yr;
        var yi;
        var idx1;
        var idx2;
        m = n >> 1;
        ks = (2 * nc / m | 0);
        kk = 0;
        for (var j = 2; j < m; j += 2) {
            k = n - j;
            kk += ks;
            wkr = (0.5 - c[startc + nc - kk]);
            wki = c[startc + kk];
            idx1 = offa + j;
            idx2 = offa + k;
            xr = a[idx1] - a[idx2];
            xi = a[idx1 + 1] + a[idx2 + 1];
            yr = wkr * xr - wki * xi;
            yi = wkr * xi + wki * xr;
            a[idx1] -= yr;
            a[idx1 + 1] = yi - a[idx1 + 1];
            a[idx2] += yr;
            a[idx2 + 1] = yi - a[idx2 + 1];
        }
        a[offa + m + 1] = -a[offa + m + 1];
    };
    FloatFFT.prototype.cftrec4 = function (n, a, offa, nw, w) {
        var isplt;
        var j;
        var k;
        var m;
        m = n;
        var idx1 = offa + n;
        while ((m > 512)) {
            m >>= 2;
            this.cftmdl1(m, a, idx1 - m, w, nw - (m >> 1));
        }
        ;
        this.cftleaf(m, 1, a, idx1 - m, nw, w);
        k = 0;
        var idx2 = offa - m;
        for (j = n - m; j > 0; j -= m) {
            k++;
            isplt = this.cfttree(m, j, k, a, offa, nw, w);
            this.cftleaf(m, isplt, a, idx2 + j, nw, w);
        }
    };
    FloatFFT.prototype.cftf1st = function (n, a, offa, w, startw) {
        var j0;
        var j1;
        var j2;
        var j3;
        var k;
        var m;
        var mh;
        var wn4r;
        var csc1;
        var csc3;
        var wk1r;
        var wk1i;
        var wk3r;
        var wk3i;
        var wd1r;
        var wd1i;
        var wd3r;
        var wd3i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var idx0;
        var idx1;
        var idx2;
        var idx3;
        var idx4;
        var idx5;
        mh = n >> 3;
        m = 2 * mh;
        j1 = m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[offa] + a[idx2];
        x0i = a[offa + 1] + a[idx2 + 1];
        x1r = a[offa] - a[idx2];
        x1i = a[offa + 1] - a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[offa] = x0r + x2r;
        a[offa + 1] = x0i + x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i - x2i;
        a[idx2] = x1r - x3i;
        a[idx2 + 1] = x1i + x3r;
        a[idx3] = x1r + x3i;
        a[idx3 + 1] = x1i - x3r;
        wn4r = w[startw + 1];
        csc1 = w[startw + 2];
        csc3 = w[startw + 3];
        wd1r = 1;
        wd1i = 0;
        wd3r = 1;
        wd3i = 0;
        k = 0;
        for (var j = 2; j < mh - 2; j += 4) {
            k += 4;
            idx4 = startw + k;
            wk1r = csc1 * (wd1r + w[idx4]);
            wk1i = csc1 * (wd1i + w[idx4 + 1]);
            wk3r = csc3 * (wd3r + w[idx4 + 2]);
            wk3i = csc3 * (wd3i + w[idx4 + 3]);
            wd1r = w[idx4];
            wd1i = w[idx4 + 1];
            wd3r = w[idx4 + 2];
            wd3i = w[idx4 + 3];
            j1 = j + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            idx5 = offa + j;
            x0r = a[idx5] + a[idx2];
            x0i = a[idx5 + 1] + a[idx2 + 1];
            x1r = a[idx5] - a[idx2];
            x1i = a[idx5 + 1] - a[idx2 + 1];
            y0r = a[idx5 + 2] + a[idx2 + 2];
            y0i = a[idx5 + 3] + a[idx2 + 3];
            y1r = a[idx5 + 2] - a[idx2 + 2];
            y1i = a[idx5 + 3] - a[idx2 + 3];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            y2r = a[idx1 + 2] + a[idx3 + 2];
            y2i = a[idx1 + 3] + a[idx3 + 3];
            y3r = a[idx1 + 2] - a[idx3 + 2];
            y3i = a[idx1 + 3] - a[idx3 + 3];
            a[idx5] = x0r + x2r;
            a[idx5 + 1] = x0i + x2i;
            a[idx5 + 2] = y0r + y2r;
            a[idx5 + 3] = y0i + y2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i - x2i;
            a[idx1 + 2] = y0r - y2r;
            a[idx1 + 3] = y0i - y2i;
            x0r = x1r - x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1r * x0r - wk1i * x0i;
            a[idx2 + 1] = wk1r * x0i + wk1i * x0r;
            x0r = y1r - y3i;
            x0i = y1i + y3r;
            a[idx2 + 2] = wd1r * x0r - wd1i * x0i;
            a[idx2 + 3] = wd1r * x0i + wd1i * x0r;
            x0r = x1r + x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3r * x0r + wk3i * x0i;
            a[idx3 + 1] = wk3r * x0i - wk3i * x0r;
            x0r = y1r + y3i;
            x0i = y1i - y3r;
            a[idx3 + 2] = wd3r * x0r + wd3i * x0i;
            a[idx3 + 3] = wd3r * x0i - wd3i * x0r;
            j0 = m - j;
            j1 = j0 + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx0 = offa + j0;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            x0r = a[idx0] + a[idx2];
            x0i = a[idx0 + 1] + a[idx2 + 1];
            x1r = a[idx0] - a[idx2];
            x1i = a[idx0 + 1] - a[idx2 + 1];
            y0r = a[idx0 - 2] + a[idx2 - 2];
            y0i = a[idx0 - 1] + a[idx2 - 1];
            y1r = a[idx0 - 2] - a[idx2 - 2];
            y1i = a[idx0 - 1] - a[idx2 - 1];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            y2r = a[idx1 - 2] + a[idx3 - 2];
            y2i = a[idx1 - 1] + a[idx3 - 1];
            y3r = a[idx1 - 2] - a[idx3 - 2];
            y3i = a[idx1 - 1] - a[idx3 - 1];
            a[idx0] = x0r + x2r;
            a[idx0 + 1] = x0i + x2i;
            a[idx0 - 2] = y0r + y2r;
            a[idx0 - 1] = y0i + y2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i - x2i;
            a[idx1 - 2] = y0r - y2r;
            a[idx1 - 1] = y0i - y2i;
            x0r = x1r - x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1i * x0r - wk1r * x0i;
            a[idx2 + 1] = wk1i * x0i + wk1r * x0r;
            x0r = y1r - y3i;
            x0i = y1i + y3r;
            a[idx2 - 2] = wd1i * x0r - wd1r * x0i;
            a[idx2 - 1] = wd1i * x0i + wd1r * x0r;
            x0r = x1r + x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3i * x0r + wk3r * x0i;
            a[idx3 + 1] = wk3i * x0i - wk3r * x0r;
            x0r = y1r + y3i;
            x0i = y1i - y3r;
            a[offa + j3 - 2] = wd3i * x0r + wd3r * x0i;
            a[offa + j3 - 1] = wd3i * x0i - wd3r * x0r;
        }
        wk1r = csc1 * (wd1r + wn4r);
        wk1i = csc1 * (wd1i + wn4r);
        wk3r = csc3 * (wd3r - wn4r);
        wk3i = csc3 * (wd3i - wn4r);
        j0 = mh;
        j1 = j0 + m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx0 = offa + j0;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[idx0 - 2] + a[idx2 - 2];
        x0i = a[idx0 - 1] + a[idx2 - 1];
        x1r = a[idx0 - 2] - a[idx2 - 2];
        x1i = a[idx0 - 1] - a[idx2 - 1];
        x2r = a[idx1 - 2] + a[idx3 - 2];
        x2i = a[idx1 - 1] + a[idx3 - 1];
        x3r = a[idx1 - 2] - a[idx3 - 2];
        x3i = a[idx1 - 1] - a[idx3 - 1];
        a[idx0 - 2] = x0r + x2r;
        a[idx0 - 1] = x0i + x2i;
        a[idx1 - 2] = x0r - x2r;
        a[idx1 - 1] = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        a[idx2 - 2] = wk1r * x0r - wk1i * x0i;
        a[idx2 - 1] = wk1r * x0i + wk1i * x0r;
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        a[idx3 - 2] = wk3r * x0r + wk3i * x0i;
        a[idx3 - 1] = wk3r * x0i - wk3i * x0r;
        x0r = a[idx0] + a[idx2];
        x0i = a[idx0 + 1] + a[idx2 + 1];
        x1r = a[idx0] - a[idx2];
        x1i = a[idx0 + 1] - a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[idx0] = x0r + x2r;
        a[idx0 + 1] = x0i + x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        a[idx2] = wn4r * (x0r - x0i);
        a[idx2 + 1] = wn4r * (x0i + x0r);
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        a[idx3] = -wn4r * (x0r + x0i);
        a[idx3 + 1] = -wn4r * (x0i - x0r);
        x0r = a[idx0 + 2] + a[idx2 + 2];
        x0i = a[idx0 + 3] + a[idx2 + 3];
        x1r = a[idx0 + 2] - a[idx2 + 2];
        x1i = a[idx0 + 3] - a[idx2 + 3];
        x2r = a[idx1 + 2] + a[idx3 + 2];
        x2i = a[idx1 + 3] + a[idx3 + 3];
        x3r = a[idx1 + 2] - a[idx3 + 2];
        x3i = a[idx1 + 3] - a[idx3 + 3];
        a[idx0 + 2] = x0r + x2r;
        a[idx0 + 3] = x0i + x2i;
        a[idx1 + 2] = x0r - x2r;
        a[idx1 + 3] = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        a[idx2 + 2] = wk1i * x0r - wk1r * x0i;
        a[idx2 + 3] = wk1i * x0i + wk1r * x0r;
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        a[idx3 + 2] = wk3i * x0r + wk3r * x0i;
        a[idx3 + 3] = wk3i * x0i - wk3r * x0r;
    };
    FloatFFT.prototype.bitrv2 = function (n, ip, a, offa) {
        var j1;
        var k1;
        var l;
        var m;
        var nh;
        var nm;
        var xr;
        var xi;
        var yr;
        var yi;
        var idx0;
        var idx1;
        var idx2;
        m = 1;
        for (l = n >> 2; l > 8; l >>= 2) {
            m <<= 1;
        }
        nh = n >> 1;
        nm = 4 * m;
        if (l === 8) {
            for (var k = 0; k < m; k++) {
                idx0 = 4 * k;
                for (var j = 0; j < k; j++) {
                    j1 = 4 * j + 2 * ip[m + k];
                    k1 = idx0 + 2 * ip[m + j];
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nh;
                    k1 += 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += 2;
                    k1 += nh;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nh;
                    k1 -= 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                }
                k1 = idx0 + 2 * ip[m + k];
                j1 = k1 + 2;
                k1 += nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nm;
                k1 += 2 * nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nm;
                k1 -= nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 -= 2;
                k1 -= nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nh + 2;
                k1 += nh + 2;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 -= nh - nm;
                k1 += 2 * nm - 2;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
            }
        }
        else {
            for (var k = 0; k < m; k++) {
                idx0 = 4 * k;
                for (var j = 0; j < k; j++) {
                    j1 = 4 * j + ip[m + k];
                    k1 = idx0 + ip[m + j];
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nh;
                    k1 += 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += 2;
                    k1 += nh;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nh;
                    k1 -= 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = a[idx1 + 1];
                    yr = a[idx2];
                    yi = a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                }
                k1 = idx0 + ip[m + k];
                j1 = k1 + 2;
                k1 += nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nm;
                k1 += nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = a[idx1 + 1];
                yr = a[idx2];
                yi = a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
            }
        }
    };
    FloatFFT.prototype.bitrv2conj = function (n, ip, a, offa) {
        var j1;
        var k1;
        var l;
        var m;
        var nh;
        var nm;
        var xr;
        var xi;
        var yr;
        var yi;
        var idx0;
        var idx1;
        var idx2;
        m = 1;
        for (l = n >> 2; l > 8; l >>= 2) {
            m <<= 1;
        }
        nh = n >> 1;
        nm = 4 * m;
        if (l === 8) {
            for (var k = 0; k < m; k++) {
                idx0 = 4 * k;
                for (var j = 0; j < k; j++) {
                    j1 = 4 * j + 2 * ip[m + k];
                    k1 = idx0 + 2 * ip[m + j];
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nh;
                    k1 += 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += 2;
                    k1 += nh;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nh;
                    k1 -= 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= 2 * nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                }
                k1 = idx0 + 2 * ip[m + k];
                j1 = k1 + 2;
                k1 += nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                a[idx1 - 1] = -a[idx1 - 1];
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                a[idx2 + 3] = -a[idx2 + 3];
                j1 += nm;
                k1 += 2 * nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nm;
                k1 -= nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 -= 2;
                k1 -= nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 += nh + 2;
                k1 += nh + 2;
                idx1 = offa + j1;
                idx2 = offa + k1;
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                j1 -= nh - nm;
                k1 += 2 * nm - 2;
                idx1 = offa + j1;
                idx2 = offa + k1;
                a[idx1 - 1] = -a[idx1 - 1];
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                a[idx2 + 3] = -a[idx2 + 3];
            }
        }
        else {
            for (var k = 0; k < m; k++) {
                idx0 = 4 * k;
                for (var j = 0; j < k; j++) {
                    j1 = 4 * j + ip[m + k];
                    k1 = idx0 + ip[m + j];
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nh;
                    k1 += 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += 2;
                    k1 += nh;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 += nm;
                    k1 += nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nh;
                    k1 -= 2;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                    j1 -= nm;
                    k1 -= nm;
                    idx1 = offa + j1;
                    idx2 = offa + k1;
                    xr = a[idx1];
                    xi = -a[idx1 + 1];
                    yr = a[idx2];
                    yi = -a[idx2 + 1];
                    a[idx1] = yr;
                    a[idx1 + 1] = yi;
                    a[idx2] = xr;
                    a[idx2 + 1] = xi;
                }
                k1 = idx0 + ip[m + k];
                j1 = k1 + 2;
                k1 += nh;
                idx1 = offa + j1;
                idx2 = offa + k1;
                a[idx1 - 1] = -a[idx1 - 1];
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                a[idx2 + 3] = -a[idx2 + 3];
                j1 += nm;
                k1 += nm;
                idx1 = offa + j1;
                idx2 = offa + k1;
                a[idx1 - 1] = -a[idx1 - 1];
                xr = a[idx1];
                xi = -a[idx1 + 1];
                yr = a[idx2];
                yi = -a[idx2 + 1];
                a[idx1] = yr;
                a[idx1 + 1] = yi;
                a[idx2] = xr;
                a[idx2 + 1] = xi;
                a[idx2 + 3] = -a[idx2 + 3];
            }
        }
    };
    FloatFFT.prototype.cfttree = function (n, j, k, a, offa, nw, w) {
        var i;
        var isplt;
        var m;
        var idx1 = offa - n;
        if ((k & 3) !== 0) {
            isplt = k & 1;
            if (isplt !== 0) {
                this.cftmdl1(n, a, idx1 + j, w, nw - (n >> 1));
            }
            else {
                this.cftmdl2(n, a, idx1 + j, w, nw - n);
            }
        }
        else {
            m = n;
            for (i = k; (i & 3) === 0; i >>= 2) {
                m <<= 2;
            }
            isplt = i & 1;
            var idx2 = offa + j;
            if (isplt !== 0) {
                while ((m > 128)) {
                    this.cftmdl1(m, a, idx2 - m, w, nw - (m >> 1));
                    m >>= 2;
                }
                ;
            }
            else {
                while ((m > 128)) {
                    this.cftmdl2(m, a, idx2 - m, w, nw - m);
                    m >>= 2;
                }
                ;
            }
        }
        return isplt;
    };
    FloatFFT.prototype.cftleaf = function (n, isplt, a, offa, nw, w) {
        if (n === 512) {
            this.cftmdl1(128, a, offa, w, nw - 64);
            this.cftf161(a, offa, w, nw - 8);
            this.cftf162(a, offa + 32, w, nw - 32);
            this.cftf161(a, offa + 64, w, nw - 8);
            this.cftf161(a, offa + 96, w, nw - 8);
            this.cftmdl2(128, a, offa + 128, w, nw - 128);
            this.cftf161(a, offa + 128, w, nw - 8);
            this.cftf162(a, offa + 160, w, nw - 32);
            this.cftf161(a, offa + 192, w, nw - 8);
            this.cftf162(a, offa + 224, w, nw - 32);
            this.cftmdl1(128, a, offa + 256, w, nw - 64);
            this.cftf161(a, offa + 256, w, nw - 8);
            this.cftf162(a, offa + 288, w, nw - 32);
            this.cftf161(a, offa + 320, w, nw - 8);
            this.cftf161(a, offa + 352, w, nw - 8);
            if (isplt !== 0) {
                this.cftmdl1(128, a, offa + 384, w, nw - 64);
                this.cftf161(a, offa + 480, w, nw - 8);
            }
            else {
                this.cftmdl2(128, a, offa + 384, w, nw - 128);
                this.cftf162(a, offa + 480, w, nw - 32);
            }
            this.cftf161(a, offa + 384, w, nw - 8);
            this.cftf162(a, offa + 416, w, nw - 32);
            this.cftf161(a, offa + 448, w, nw - 8);
        }
        else {
            this.cftmdl1(64, a, offa, w, nw - 32);
            this.cftf081(a, offa, w, nw - 8);
            this.cftf082(a, offa + 16, w, nw - 8);
            this.cftf081(a, offa + 32, w, nw - 8);
            this.cftf081(a, offa + 48, w, nw - 8);
            this.cftmdl2(64, a, offa + 64, w, nw - 64);
            this.cftf081(a, offa + 64, w, nw - 8);
            this.cftf082(a, offa + 80, w, nw - 8);
            this.cftf081(a, offa + 96, w, nw - 8);
            this.cftf082(a, offa + 112, w, nw - 8);
            this.cftmdl1(64, a, offa + 128, w, nw - 32);
            this.cftf081(a, offa + 128, w, nw - 8);
            this.cftf082(a, offa + 144, w, nw - 8);
            this.cftf081(a, offa + 160, w, nw - 8);
            this.cftf081(a, offa + 176, w, nw - 8);
            if (isplt !== 0) {
                this.cftmdl1(64, a, offa + 192, w, nw - 32);
                this.cftf081(a, offa + 240, w, nw - 8);
            }
            else {
                this.cftmdl2(64, a, offa + 192, w, nw - 64);
                this.cftf082(a, offa + 240, w, nw - 8);
            }
            this.cftf081(a, offa + 192, w, nw - 8);
            this.cftf082(a, offa + 208, w, nw - 8);
            this.cftf081(a, offa + 224, w, nw - 8);
        }
    };
    FloatFFT.prototype.cftf161 = function (a, offa, w, startw) {
        var wn4r;
        var wk1r;
        var wk1i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var y4r;
        var y4i;
        var y5r;
        var y5i;
        var y6r;
        var y6i;
        var y7r;
        var y7i;
        var y8r;
        var y8i;
        var y9r;
        var y9i;
        var y10r;
        var y10i;
        var y11r;
        var y11i;
        var y12r;
        var y12i;
        var y13r;
        var y13i;
        var y14r;
        var y14i;
        var y15r;
        var y15i;
        wn4r = w[startw + 1];
        wk1r = w[startw + 2];
        wk1i = w[startw + 3];
        x0r = a[offa] + a[offa + 16];
        x0i = a[offa + 1] + a[offa + 17];
        x1r = a[offa] - a[offa + 16];
        x1i = a[offa + 1] - a[offa + 17];
        x2r = a[offa + 8] + a[offa + 24];
        x2i = a[offa + 9] + a[offa + 25];
        x3r = a[offa + 8] - a[offa + 24];
        x3i = a[offa + 9] - a[offa + 25];
        y0r = x0r + x2r;
        y0i = x0i + x2i;
        y4r = x0r - x2r;
        y4i = x0i - x2i;
        y8r = x1r - x3i;
        y8i = x1i + x3r;
        y12r = x1r + x3i;
        y12i = x1i - x3r;
        x0r = a[offa + 2] + a[offa + 18];
        x0i = a[offa + 3] + a[offa + 19];
        x1r = a[offa + 2] - a[offa + 18];
        x1i = a[offa + 3] - a[offa + 19];
        x2r = a[offa + 10] + a[offa + 26];
        x2i = a[offa + 11] + a[offa + 27];
        x3r = a[offa + 10] - a[offa + 26];
        x3i = a[offa + 11] - a[offa + 27];
        y1r = x0r + x2r;
        y1i = x0i + x2i;
        y5r = x0r - x2r;
        y5i = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        y9r = wk1r * x0r - wk1i * x0i;
        y9i = wk1r * x0i + wk1i * x0r;
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        y13r = wk1i * x0r - wk1r * x0i;
        y13i = wk1i * x0i + wk1r * x0r;
        x0r = a[offa + 4] + a[offa + 20];
        x0i = a[offa + 5] + a[offa + 21];
        x1r = a[offa + 4] - a[offa + 20];
        x1i = a[offa + 5] - a[offa + 21];
        x2r = a[offa + 12] + a[offa + 28];
        x2i = a[offa + 13] + a[offa + 29];
        x3r = a[offa + 12] - a[offa + 28];
        x3i = a[offa + 13] - a[offa + 29];
        y2r = x0r + x2r;
        y2i = x0i + x2i;
        y6r = x0r - x2r;
        y6i = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        y10r = wn4r * (x0r - x0i);
        y10i = wn4r * (x0i + x0r);
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        y14r = wn4r * (x0r + x0i);
        y14i = wn4r * (x0i - x0r);
        x0r = a[offa + 6] + a[offa + 22];
        x0i = a[offa + 7] + a[offa + 23];
        x1r = a[offa + 6] - a[offa + 22];
        x1i = a[offa + 7] - a[offa + 23];
        x2r = a[offa + 14] + a[offa + 30];
        x2i = a[offa + 15] + a[offa + 31];
        x3r = a[offa + 14] - a[offa + 30];
        x3i = a[offa + 15] - a[offa + 31];
        y3r = x0r + x2r;
        y3i = x0i + x2i;
        y7r = x0r - x2r;
        y7i = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        y11r = wk1i * x0r - wk1r * x0i;
        y11i = wk1i * x0i + wk1r * x0r;
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        y15r = wk1r * x0r - wk1i * x0i;
        y15i = wk1r * x0i + wk1i * x0r;
        x0r = y12r - y14r;
        x0i = y12i - y14i;
        x1r = y12r + y14r;
        x1i = y12i + y14i;
        x2r = y13r - y15r;
        x2i = y13i - y15i;
        x3r = y13r + y15r;
        x3i = y13i + y15i;
        a[offa + 24] = x0r + x2r;
        a[offa + 25] = x0i + x2i;
        a[offa + 26] = x0r - x2r;
        a[offa + 27] = x0i - x2i;
        a[offa + 28] = x1r - x3i;
        a[offa + 29] = x1i + x3r;
        a[offa + 30] = x1r + x3i;
        a[offa + 31] = x1i - x3r;
        x0r = y8r + y10r;
        x0i = y8i + y10i;
        x1r = y8r - y10r;
        x1i = y8i - y10i;
        x2r = y9r + y11r;
        x2i = y9i + y11i;
        x3r = y9r - y11r;
        x3i = y9i - y11i;
        a[offa + 16] = x0r + x2r;
        a[offa + 17] = x0i + x2i;
        a[offa + 18] = x0r - x2r;
        a[offa + 19] = x0i - x2i;
        a[offa + 20] = x1r - x3i;
        a[offa + 21] = x1i + x3r;
        a[offa + 22] = x1r + x3i;
        a[offa + 23] = x1i - x3r;
        x0r = y5r - y7i;
        x0i = y5i + y7r;
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        x0r = y5r + y7i;
        x0i = y5i - y7r;
        x3r = wn4r * (x0r - x0i);
        x3i = wn4r * (x0i + x0r);
        x0r = y4r - y6i;
        x0i = y4i + y6r;
        x1r = y4r + y6i;
        x1i = y4i - y6r;
        a[offa + 8] = x0r + x2r;
        a[offa + 9] = x0i + x2i;
        a[offa + 10] = x0r - x2r;
        a[offa + 11] = x0i - x2i;
        a[offa + 12] = x1r - x3i;
        a[offa + 13] = x1i + x3r;
        a[offa + 14] = x1r + x3i;
        a[offa + 15] = x1i - x3r;
        x0r = y0r + y2r;
        x0i = y0i + y2i;
        x1r = y0r - y2r;
        x1i = y0i - y2i;
        x2r = y1r + y3r;
        x2i = y1i + y3i;
        x3r = y1r - y3r;
        x3i = y1i - y3i;
        a[offa] = x0r + x2r;
        a[offa + 1] = x0i + x2i;
        a[offa + 2] = x0r - x2r;
        a[offa + 3] = x0i - x2i;
        a[offa + 4] = x1r - x3i;
        a[offa + 5] = x1i + x3r;
        a[offa + 6] = x1r + x3i;
        a[offa + 7] = x1i - x3r;
    };
    FloatFFT.prototype.cftf162 = function (a, offa, w, startw) {
        var wn4r;
        var wk1r;
        var wk1i;
        var wk2r;
        var wk2i;
        var wk3r;
        var wk3i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var y4r;
        var y4i;
        var y5r;
        var y5i;
        var y6r;
        var y6i;
        var y7r;
        var y7i;
        var y8r;
        var y8i;
        var y9r;
        var y9i;
        var y10r;
        var y10i;
        var y11r;
        var y11i;
        var y12r;
        var y12i;
        var y13r;
        var y13i;
        var y14r;
        var y14i;
        var y15r;
        var y15i;
        wn4r = w[startw + 1];
        wk1r = w[startw + 4];
        wk1i = w[startw + 5];
        wk3r = w[startw + 6];
        wk3i = -w[startw + 7];
        wk2r = w[startw + 8];
        wk2i = w[startw + 9];
        x1r = a[offa] - a[offa + 17];
        x1i = a[offa + 1] + a[offa + 16];
        x0r = a[offa + 8] - a[offa + 25];
        x0i = a[offa + 9] + a[offa + 24];
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        y0r = x1r + x2r;
        y0i = x1i + x2i;
        y4r = x1r - x2r;
        y4i = x1i - x2i;
        x1r = a[offa] + a[offa + 17];
        x1i = a[offa + 1] - a[offa + 16];
        x0r = a[offa + 8] + a[offa + 25];
        x0i = a[offa + 9] - a[offa + 24];
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        y8r = x1r - x2i;
        y8i = x1i + x2r;
        y12r = x1r + x2i;
        y12i = x1i - x2r;
        x0r = a[offa + 2] - a[offa + 19];
        x0i = a[offa + 3] + a[offa + 18];
        x1r = wk1r * x0r - wk1i * x0i;
        x1i = wk1r * x0i + wk1i * x0r;
        x0r = a[offa + 10] - a[offa + 27];
        x0i = a[offa + 11] + a[offa + 26];
        x2r = wk3i * x0r - wk3r * x0i;
        x2i = wk3i * x0i + wk3r * x0r;
        y1r = x1r + x2r;
        y1i = x1i + x2i;
        y5r = x1r - x2r;
        y5i = x1i - x2i;
        x0r = a[offa + 2] + a[offa + 19];
        x0i = a[offa + 3] - a[offa + 18];
        x1r = wk3r * x0r - wk3i * x0i;
        x1i = wk3r * x0i + wk3i * x0r;
        x0r = a[offa + 10] + a[offa + 27];
        x0i = a[offa + 11] - a[offa + 26];
        x2r = wk1r * x0r + wk1i * x0i;
        x2i = wk1r * x0i - wk1i * x0r;
        y9r = x1r - x2r;
        y9i = x1i - x2i;
        y13r = x1r + x2r;
        y13i = x1i + x2i;
        x0r = a[offa + 4] - a[offa + 21];
        x0i = a[offa + 5] + a[offa + 20];
        x1r = wk2r * x0r - wk2i * x0i;
        x1i = wk2r * x0i + wk2i * x0r;
        x0r = a[offa + 12] - a[offa + 29];
        x0i = a[offa + 13] + a[offa + 28];
        x2r = wk2i * x0r - wk2r * x0i;
        x2i = wk2i * x0i + wk2r * x0r;
        y2r = x1r + x2r;
        y2i = x1i + x2i;
        y6r = x1r - x2r;
        y6i = x1i - x2i;
        x0r = a[offa + 4] + a[offa + 21];
        x0i = a[offa + 5] - a[offa + 20];
        x1r = wk2i * x0r - wk2r * x0i;
        x1i = wk2i * x0i + wk2r * x0r;
        x0r = a[offa + 12] + a[offa + 29];
        x0i = a[offa + 13] - a[offa + 28];
        x2r = wk2r * x0r - wk2i * x0i;
        x2i = wk2r * x0i + wk2i * x0r;
        y10r = x1r - x2r;
        y10i = x1i - x2i;
        y14r = x1r + x2r;
        y14i = x1i + x2i;
        x0r = a[offa + 6] - a[offa + 23];
        x0i = a[offa + 7] + a[offa + 22];
        x1r = wk3r * x0r - wk3i * x0i;
        x1i = wk3r * x0i + wk3i * x0r;
        x0r = a[offa + 14] - a[offa + 31];
        x0i = a[offa + 15] + a[offa + 30];
        x2r = wk1i * x0r - wk1r * x0i;
        x2i = wk1i * x0i + wk1r * x0r;
        y3r = x1r + x2r;
        y3i = x1i + x2i;
        y7r = x1r - x2r;
        y7i = x1i - x2i;
        x0r = a[offa + 6] + a[offa + 23];
        x0i = a[offa + 7] - a[offa + 22];
        x1r = wk1i * x0r + wk1r * x0i;
        x1i = wk1i * x0i - wk1r * x0r;
        x0r = a[offa + 14] + a[offa + 31];
        x0i = a[offa + 15] - a[offa + 30];
        x2r = wk3i * x0r - wk3r * x0i;
        x2i = wk3i * x0i + wk3r * x0r;
        y11r = x1r + x2r;
        y11i = x1i + x2i;
        y15r = x1r - x2r;
        y15i = x1i - x2i;
        x1r = y0r + y2r;
        x1i = y0i + y2i;
        x2r = y1r + y3r;
        x2i = y1i + y3i;
        a[offa] = x1r + x2r;
        a[offa + 1] = x1i + x2i;
        a[offa + 2] = x1r - x2r;
        a[offa + 3] = x1i - x2i;
        x1r = y0r - y2r;
        x1i = y0i - y2i;
        x2r = y1r - y3r;
        x2i = y1i - y3i;
        a[offa + 4] = x1r - x2i;
        a[offa + 5] = x1i + x2r;
        a[offa + 6] = x1r + x2i;
        a[offa + 7] = x1i - x2r;
        x1r = y4r - y6i;
        x1i = y4i + y6r;
        x0r = y5r - y7i;
        x0i = y5i + y7r;
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        a[offa + 8] = x1r + x2r;
        a[offa + 9] = x1i + x2i;
        a[offa + 10] = x1r - x2r;
        a[offa + 11] = x1i - x2i;
        x1r = y4r + y6i;
        x1i = y4i - y6r;
        x0r = y5r + y7i;
        x0i = y5i - y7r;
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        a[offa + 12] = x1r - x2i;
        a[offa + 13] = x1i + x2r;
        a[offa + 14] = x1r + x2i;
        a[offa + 15] = x1i - x2r;
        x1r = y8r + y10r;
        x1i = y8i + y10i;
        x2r = y9r - y11r;
        x2i = y9i - y11i;
        a[offa + 16] = x1r + x2r;
        a[offa + 17] = x1i + x2i;
        a[offa + 18] = x1r - x2r;
        a[offa + 19] = x1i - x2i;
        x1r = y8r - y10r;
        x1i = y8i - y10i;
        x2r = y9r + y11r;
        x2i = y9i + y11i;
        a[offa + 20] = x1r - x2i;
        a[offa + 21] = x1i + x2r;
        a[offa + 22] = x1r + x2i;
        a[offa + 23] = x1i - x2r;
        x1r = y12r - y14i;
        x1i = y12i + y14r;
        x0r = y13r + y15i;
        x0i = y13i - y15r;
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        a[offa + 24] = x1r + x2r;
        a[offa + 25] = x1i + x2i;
        a[offa + 26] = x1r - x2r;
        a[offa + 27] = x1i - x2i;
        x1r = y12r + y14i;
        x1i = y12i - y14r;
        x0r = y13r - y15i;
        x0i = y13i + y15r;
        x2r = wn4r * (x0r - x0i);
        x2i = wn4r * (x0i + x0r);
        a[offa + 28] = x1r - x2i;
        a[offa + 29] = x1i + x2r;
        a[offa + 30] = x1r + x2i;
        a[offa + 31] = x1i - x2r;
    };
    FloatFFT.prototype.cftf081 = function (a, offa, w, startw) {
        var wn4r;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var y4r;
        var y4i;
        var y5r;
        var y5i;
        var y6r;
        var y6i;
        var y7r;
        var y7i;
        wn4r = w[startw + 1];
        x0r = a[offa] + a[offa + 8];
        x0i = a[offa + 1] + a[offa + 9];
        x1r = a[offa] - a[offa + 8];
        x1i = a[offa + 1] - a[offa + 9];
        x2r = a[offa + 4] + a[offa + 12];
        x2i = a[offa + 5] + a[offa + 13];
        x3r = a[offa + 4] - a[offa + 12];
        x3i = a[offa + 5] - a[offa + 13];
        y0r = x0r + x2r;
        y0i = x0i + x2i;
        y2r = x0r - x2r;
        y2i = x0i - x2i;
        y1r = x1r - x3i;
        y1i = x1i + x3r;
        y3r = x1r + x3i;
        y3i = x1i - x3r;
        x0r = a[offa + 2] + a[offa + 10];
        x0i = a[offa + 3] + a[offa + 11];
        x1r = a[offa + 2] - a[offa + 10];
        x1i = a[offa + 3] - a[offa + 11];
        x2r = a[offa + 6] + a[offa + 14];
        x2i = a[offa + 7] + a[offa + 15];
        x3r = a[offa + 6] - a[offa + 14];
        x3i = a[offa + 7] - a[offa + 15];
        y4r = x0r + x2r;
        y4i = x0i + x2i;
        y6r = x0r - x2r;
        y6i = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        x2r = x1r + x3i;
        x2i = x1i - x3r;
        y5r = wn4r * (x0r - x0i);
        y5i = wn4r * (x0r + x0i);
        y7r = wn4r * (x2r - x2i);
        y7i = wn4r * (x2r + x2i);
        a[offa + 8] = y1r + y5r;
        a[offa + 9] = y1i + y5i;
        a[offa + 10] = y1r - y5r;
        a[offa + 11] = y1i - y5i;
        a[offa + 12] = y3r - y7i;
        a[offa + 13] = y3i + y7r;
        a[offa + 14] = y3r + y7i;
        a[offa + 15] = y3i - y7r;
        a[offa] = y0r + y4r;
        a[offa + 1] = y0i + y4i;
        a[offa + 2] = y0r - y4r;
        a[offa + 3] = y0i - y4i;
        a[offa + 4] = y2r - y6i;
        a[offa + 5] = y2i + y6r;
        a[offa + 6] = y2r + y6i;
        a[offa + 7] = y2i - y6r;
    };
    FloatFFT.prototype.cftf082 = function (a, offa, w, startw) {
        var wn4r;
        var wk1r;
        var wk1i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var y4r;
        var y4i;
        var y5r;
        var y5i;
        var y6r;
        var y6i;
        var y7r;
        var y7i;
        wn4r = w[startw + 1];
        wk1r = w[startw + 2];
        wk1i = w[startw + 3];
        y0r = a[offa] - a[offa + 9];
        y0i = a[offa + 1] + a[offa + 8];
        y1r = a[offa] + a[offa + 9];
        y1i = a[offa + 1] - a[offa + 8];
        x0r = a[offa + 4] - a[offa + 13];
        x0i = a[offa + 5] + a[offa + 12];
        y2r = wn4r * (x0r - x0i);
        y2i = wn4r * (x0i + x0r);
        x0r = a[offa + 4] + a[offa + 13];
        x0i = a[offa + 5] - a[offa + 12];
        y3r = wn4r * (x0r - x0i);
        y3i = wn4r * (x0i + x0r);
        x0r = a[offa + 2] - a[offa + 11];
        x0i = a[offa + 3] + a[offa + 10];
        y4r = wk1r * x0r - wk1i * x0i;
        y4i = wk1r * x0i + wk1i * x0r;
        x0r = a[offa + 2] + a[offa + 11];
        x0i = a[offa + 3] - a[offa + 10];
        y5r = wk1i * x0r - wk1r * x0i;
        y5i = wk1i * x0i + wk1r * x0r;
        x0r = a[offa + 6] - a[offa + 15];
        x0i = a[offa + 7] + a[offa + 14];
        y6r = wk1i * x0r - wk1r * x0i;
        y6i = wk1i * x0i + wk1r * x0r;
        x0r = a[offa + 6] + a[offa + 15];
        x0i = a[offa + 7] - a[offa + 14];
        y7r = wk1r * x0r - wk1i * x0i;
        y7i = wk1r * x0i + wk1i * x0r;
        x0r = y0r + y2r;
        x0i = y0i + y2i;
        x1r = y4r + y6r;
        x1i = y4i + y6i;
        a[offa] = x0r + x1r;
        a[offa + 1] = x0i + x1i;
        a[offa + 2] = x0r - x1r;
        a[offa + 3] = x0i - x1i;
        x0r = y0r - y2r;
        x0i = y0i - y2i;
        x1r = y4r - y6r;
        x1i = y4i - y6i;
        a[offa + 4] = x0r - x1i;
        a[offa + 5] = x0i + x1r;
        a[offa + 6] = x0r + x1i;
        a[offa + 7] = x0i - x1r;
        x0r = y1r - y3i;
        x0i = y1i + y3r;
        x1r = y5r - y7r;
        x1i = y5i - y7i;
        a[offa + 8] = x0r + x1r;
        a[offa + 9] = x0i + x1i;
        a[offa + 10] = x0r - x1r;
        a[offa + 11] = x0i - x1i;
        x0r = y1r + y3i;
        x0i = y1i - y3r;
        x1r = y5r + y7r;
        x1i = y5i + y7i;
        a[offa + 12] = x0r - x1i;
        a[offa + 13] = x0i + x1r;
        a[offa + 14] = x0r + x1i;
        a[offa + 15] = x0i - x1r;
    };
    FloatFFT.prototype.cftmdl1 = function (n, a, offa, w, startw) {
        var j0;
        var j1;
        var j2;
        var j3;
        var k;
        var m;
        var mh;
        var wn4r;
        var wk1r;
        var wk1i;
        var wk3r;
        var wk3i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var idx0;
        var idx1;
        var idx2;
        var idx3;
        var idx4;
        var idx5;
        mh = n >> 3;
        m = 2 * mh;
        j1 = m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[offa] + a[idx2];
        x0i = a[offa + 1] + a[idx2 + 1];
        x1r = a[offa] - a[idx2];
        x1i = a[offa + 1] - a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[offa] = x0r + x2r;
        a[offa + 1] = x0i + x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i - x2i;
        a[idx2] = x1r - x3i;
        a[idx2 + 1] = x1i + x3r;
        a[idx3] = x1r + x3i;
        a[idx3 + 1] = x1i - x3r;
        wn4r = w[startw + 1];
        k = 0;
        for (var j = 2; j < mh; j += 2) {
            k += 4;
            idx4 = startw + k;
            wk1r = w[idx4];
            wk1i = w[idx4 + 1];
            wk3r = w[idx4 + 2];
            wk3i = w[idx4 + 3];
            j1 = j + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            idx5 = offa + j;
            x0r = a[idx5] + a[idx2];
            x0i = a[idx5 + 1] + a[idx2 + 1];
            x1r = a[idx5] - a[idx2];
            x1i = a[idx5 + 1] - a[idx2 + 1];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            a[idx5] = x0r + x2r;
            a[idx5 + 1] = x0i + x2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i - x2i;
            x0r = x1r - x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1r * x0r - wk1i * x0i;
            a[idx2 + 1] = wk1r * x0i + wk1i * x0r;
            x0r = x1r + x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3r * x0r + wk3i * x0i;
            a[idx3 + 1] = wk3r * x0i - wk3i * x0r;
            j0 = m - j;
            j1 = j0 + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx0 = offa + j0;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            x0r = a[idx0] + a[idx2];
            x0i = a[idx0 + 1] + a[idx2 + 1];
            x1r = a[idx0] - a[idx2];
            x1i = a[idx0 + 1] - a[idx2 + 1];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            a[idx0] = x0r + x2r;
            a[idx0 + 1] = x0i + x2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i - x2i;
            x0r = x1r - x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1i * x0r - wk1r * x0i;
            a[idx2 + 1] = wk1i * x0i + wk1r * x0r;
            x0r = x1r + x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3i * x0r + wk3r * x0i;
            a[idx3 + 1] = wk3i * x0i - wk3r * x0r;
        }
        j0 = mh;
        j1 = j0 + m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx0 = offa + j0;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[idx0] + a[idx2];
        x0i = a[idx0 + 1] + a[idx2 + 1];
        x1r = a[idx0] - a[idx2];
        x1i = a[idx0 + 1] - a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[idx0] = x0r + x2r;
        a[idx0 + 1] = x0i + x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i - x2i;
        x0r = x1r - x3i;
        x0i = x1i + x3r;
        a[idx2] = wn4r * (x0r - x0i);
        a[idx2 + 1] = wn4r * (x0i + x0r);
        x0r = x1r + x3i;
        x0i = x1i - x3r;
        a[idx3] = -wn4r * (x0r + x0i);
        a[idx3 + 1] = -wn4r * (x0i - x0r);
    };
    FloatFFT.prototype.cftmdl2 = function (n, a, offa, w, startw) {
        var j0;
        var j1;
        var j2;
        var j3;
        var k;
        var kr;
        var m;
        var mh;
        var wn4r;
        var wk1r;
        var wk1i;
        var wk3r;
        var wk3i;
        var wd1r;
        var wd1i;
        var wd3r;
        var wd3i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var y0r;
        var y0i;
        var y2r;
        var y2i;
        var idx0;
        var idx1;
        var idx2;
        var idx3;
        var idx4;
        var idx5;
        var idx6;
        mh = n >> 3;
        m = 2 * mh;
        wn4r = w[startw + 1];
        j1 = m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[offa] - a[idx2 + 1];
        x0i = a[offa + 1] + a[idx2];
        x1r = a[offa] + a[idx2 + 1];
        x1i = a[offa + 1] - a[idx2];
        x2r = a[idx1] - a[idx3 + 1];
        x2i = a[idx1 + 1] + a[idx3];
        x3r = a[idx1] + a[idx3 + 1];
        x3i = a[idx1 + 1] - a[idx3];
        y0r = wn4r * (x2r - x2i);
        y0i = wn4r * (x2i + x2r);
        a[offa] = x0r + y0r;
        a[offa + 1] = x0i + y0i;
        a[idx1] = x0r - y0r;
        a[idx1 + 1] = x0i - y0i;
        y0r = wn4r * (x3r - x3i);
        y0i = wn4r * (x3i + x3r);
        a[idx2] = x1r - y0i;
        a[idx2 + 1] = x1i + y0r;
        a[idx3] = x1r + y0i;
        a[idx3 + 1] = x1i - y0r;
        k = 0;
        kr = 2 * m;
        for (var j = 2; j < mh; j += 2) {
            k += 4;
            idx4 = startw + k;
            wk1r = w[idx4];
            wk1i = w[idx4 + 1];
            wk3r = w[idx4 + 2];
            wk3i = w[idx4 + 3];
            kr -= 4;
            idx5 = startw + kr;
            wd1i = w[idx5];
            wd1r = w[idx5 + 1];
            wd3i = w[idx5 + 2];
            wd3r = w[idx5 + 3];
            j1 = j + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            idx6 = offa + j;
            x0r = a[idx6] - a[idx2 + 1];
            x0i = a[idx6 + 1] + a[idx2];
            x1r = a[idx6] + a[idx2 + 1];
            x1i = a[idx6 + 1] - a[idx2];
            x2r = a[idx1] - a[idx3 + 1];
            x2i = a[idx1 + 1] + a[idx3];
            x3r = a[idx1] + a[idx3 + 1];
            x3i = a[idx1 + 1] - a[idx3];
            y0r = wk1r * x0r - wk1i * x0i;
            y0i = wk1r * x0i + wk1i * x0r;
            y2r = wd1r * x2r - wd1i * x2i;
            y2i = wd1r * x2i + wd1i * x2r;
            a[idx6] = y0r + y2r;
            a[idx6 + 1] = y0i + y2i;
            a[idx1] = y0r - y2r;
            a[idx1 + 1] = y0i - y2i;
            y0r = wk3r * x1r + wk3i * x1i;
            y0i = wk3r * x1i - wk3i * x1r;
            y2r = wd3r * x3r + wd3i * x3i;
            y2i = wd3r * x3i - wd3i * x3r;
            a[idx2] = y0r + y2r;
            a[idx2 + 1] = y0i + y2i;
            a[idx3] = y0r - y2r;
            a[idx3 + 1] = y0i - y2i;
            j0 = m - j;
            j1 = j0 + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx0 = offa + j0;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            x0r = a[idx0] - a[idx2 + 1];
            x0i = a[idx0 + 1] + a[idx2];
            x1r = a[idx0] + a[idx2 + 1];
            x1i = a[idx0 + 1] - a[idx2];
            x2r = a[idx1] - a[idx3 + 1];
            x2i = a[idx1 + 1] + a[idx3];
            x3r = a[idx1] + a[idx3 + 1];
            x3i = a[idx1 + 1] - a[idx3];
            y0r = wd1i * x0r - wd1r * x0i;
            y0i = wd1i * x0i + wd1r * x0r;
            y2r = wk1i * x2r - wk1r * x2i;
            y2i = wk1i * x2i + wk1r * x2r;
            a[idx0] = y0r + y2r;
            a[idx0 + 1] = y0i + y2i;
            a[idx1] = y0r - y2r;
            a[idx1 + 1] = y0i - y2i;
            y0r = wd3i * x1r + wd3r * x1i;
            y0i = wd3i * x1i - wd3r * x1r;
            y2r = wk3i * x3r + wk3r * x3i;
            y2i = wk3i * x3i - wk3r * x3r;
            a[idx2] = y0r + y2r;
            a[idx2 + 1] = y0i + y2i;
            a[idx3] = y0r - y2r;
            a[idx3 + 1] = y0i - y2i;
        }
        wk1r = w[startw + m];
        wk1i = w[startw + m + 1];
        j0 = mh;
        j1 = j0 + m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx0 = offa + j0;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[idx0] - a[idx2 + 1];
        x0i = a[idx0 + 1] + a[idx2];
        x1r = a[idx0] + a[idx2 + 1];
        x1i = a[idx0 + 1] - a[idx2];
        x2r = a[idx1] - a[idx3 + 1];
        x2i = a[idx1 + 1] + a[idx3];
        x3r = a[idx1] + a[idx3 + 1];
        x3i = a[idx1 + 1] - a[idx3];
        y0r = wk1r * x0r - wk1i * x0i;
        y0i = wk1r * x0i + wk1i * x0r;
        y2r = wk1i * x2r - wk1r * x2i;
        y2i = wk1i * x2i + wk1r * x2r;
        a[idx0] = y0r + y2r;
        a[idx0 + 1] = y0i + y2i;
        a[idx1] = y0r - y2r;
        a[idx1 + 1] = y0i - y2i;
        y0r = wk1i * x1r - wk1r * x1i;
        y0i = wk1i * x1i + wk1r * x1r;
        y2r = wk1r * x3r - wk1i * x3i;
        y2i = wk1r * x3i + wk1i * x3r;
        a[idx2] = y0r - y2r;
        a[idx2 + 1] = y0i - y2i;
        a[idx3] = y0r + y2r;
        a[idx3 + 1] = y0i + y2i;
    };
    FloatFFT.prototype.cftb1st = function (n, a, offa, w, startw) {
        var j0;
        var j1;
        var j2;
        var j3;
        var k;
        var m;
        var mh;
        var wn4r;
        var csc1;
        var csc3;
        var wk1r;
        var wk1i;
        var wk3r;
        var wk3i;
        var wd1r;
        var wd1i;
        var wd3r;
        var wd3i;
        var x0r;
        var x0i;
        var x1r;
        var x1i;
        var x2r;
        var x2i;
        var x3r;
        var x3i;
        var y0r;
        var y0i;
        var y1r;
        var y1i;
        var y2r;
        var y2i;
        var y3r;
        var y3i;
        var idx0;
        var idx1;
        var idx2;
        var idx3;
        var idx4;
        var idx5;
        mh = n >> 3;
        m = 2 * mh;
        j1 = m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[offa] + a[idx2];
        x0i = -a[offa + 1] - a[idx2 + 1];
        x1r = a[offa] - a[idx2];
        x1i = -a[offa + 1] + a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[offa] = x0r + x2r;
        a[offa + 1] = x0i - x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i + x2i;
        a[idx2] = x1r + x3i;
        a[idx2 + 1] = x1i + x3r;
        a[idx3] = x1r - x3i;
        a[idx3 + 1] = x1i - x3r;
        wn4r = w[startw + 1];
        csc1 = w[startw + 2];
        csc3 = w[startw + 3];
        wd1r = 1;
        wd1i = 0;
        wd3r = 1;
        wd3i = 0;
        k = 0;
        for (var j = 2; j < mh - 2; j += 4) {
            k += 4;
            idx4 = startw + k;
            wk1r = csc1 * (wd1r + w[idx4]);
            wk1i = csc1 * (wd1i + w[idx4 + 1]);
            wk3r = csc3 * (wd3r + w[idx4 + 2]);
            wk3i = csc3 * (wd3i + w[idx4 + 3]);
            wd1r = w[idx4];
            wd1i = w[idx4 + 1];
            wd3r = w[idx4 + 2];
            wd3i = w[idx4 + 3];
            j1 = j + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            idx5 = offa + j;
            x0r = a[idx5] + a[idx2];
            x0i = -a[idx5 + 1] - a[idx2 + 1];
            x1r = a[idx5] - a[offa + j2];
            x1i = -a[idx5 + 1] + a[idx2 + 1];
            y0r = a[idx5 + 2] + a[idx2 + 2];
            y0i = -a[idx5 + 3] - a[idx2 + 3];
            y1r = a[idx5 + 2] - a[idx2 + 2];
            y1i = -a[idx5 + 3] + a[idx2 + 3];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            y2r = a[idx1 + 2] + a[idx3 + 2];
            y2i = a[idx1 + 3] + a[idx3 + 3];
            y3r = a[idx1 + 2] - a[idx3 + 2];
            y3i = a[idx1 + 3] - a[idx3 + 3];
            a[idx5] = x0r + x2r;
            a[idx5 + 1] = x0i - x2i;
            a[idx5 + 2] = y0r + y2r;
            a[idx5 + 3] = y0i - y2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i + x2i;
            a[idx1 + 2] = y0r - y2r;
            a[idx1 + 3] = y0i + y2i;
            x0r = x1r + x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1r * x0r - wk1i * x0i;
            a[idx2 + 1] = wk1r * x0i + wk1i * x0r;
            x0r = y1r + y3i;
            x0i = y1i + y3r;
            a[idx2 + 2] = wd1r * x0r - wd1i * x0i;
            a[idx2 + 3] = wd1r * x0i + wd1i * x0r;
            x0r = x1r - x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3r * x0r + wk3i * x0i;
            a[idx3 + 1] = wk3r * x0i - wk3i * x0r;
            x0r = y1r - y3i;
            x0i = y1i - y3r;
            a[idx3 + 2] = wd3r * x0r + wd3i * x0i;
            a[idx3 + 3] = wd3r * x0i - wd3i * x0r;
            j0 = m - j;
            j1 = j0 + m;
            j2 = j1 + m;
            j3 = j2 + m;
            idx0 = offa + j0;
            idx1 = offa + j1;
            idx2 = offa + j2;
            idx3 = offa + j3;
            x0r = a[idx0] + a[idx2];
            x0i = -a[idx0 + 1] - a[idx2 + 1];
            x1r = a[idx0] - a[idx2];
            x1i = -a[idx0 + 1] + a[idx2 + 1];
            y0r = a[idx0 - 2] + a[idx2 - 2];
            y0i = -a[idx0 - 1] - a[idx2 - 1];
            y1r = a[idx0 - 2] - a[idx2 - 2];
            y1i = -a[idx0 - 1] + a[idx2 - 1];
            x2r = a[idx1] + a[idx3];
            x2i = a[idx1 + 1] + a[idx3 + 1];
            x3r = a[idx1] - a[idx3];
            x3i = a[idx1 + 1] - a[idx3 + 1];
            y2r = a[idx1 - 2] + a[idx3 - 2];
            y2i = a[idx1 - 1] + a[idx3 - 1];
            y3r = a[idx1 - 2] - a[idx3 - 2];
            y3i = a[idx1 - 1] - a[idx3 - 1];
            a[idx0] = x0r + x2r;
            a[idx0 + 1] = x0i - x2i;
            a[idx0 - 2] = y0r + y2r;
            a[idx0 - 1] = y0i - y2i;
            a[idx1] = x0r - x2r;
            a[idx1 + 1] = x0i + x2i;
            a[idx1 - 2] = y0r - y2r;
            a[idx1 - 1] = y0i + y2i;
            x0r = x1r + x3i;
            x0i = x1i + x3r;
            a[idx2] = wk1i * x0r - wk1r * x0i;
            a[idx2 + 1] = wk1i * x0i + wk1r * x0r;
            x0r = y1r + y3i;
            x0i = y1i + y3r;
            a[idx2 - 2] = wd1i * x0r - wd1r * x0i;
            a[idx2 - 1] = wd1i * x0i + wd1r * x0r;
            x0r = x1r - x3i;
            x0i = x1i - x3r;
            a[idx3] = wk3i * x0r + wk3r * x0i;
            a[idx3 + 1] = wk3i * x0i - wk3r * x0r;
            x0r = y1r - y3i;
            x0i = y1i - y3r;
            a[idx3 - 2] = wd3i * x0r + wd3r * x0i;
            a[idx3 - 1] = wd3i * x0i - wd3r * x0r;
        }
        wk1r = csc1 * (wd1r + wn4r);
        wk1i = csc1 * (wd1i + wn4r);
        wk3r = csc3 * (wd3r - wn4r);
        wk3i = csc3 * (wd3i - wn4r);
        j0 = mh;
        j1 = j0 + m;
        j2 = j1 + m;
        j3 = j2 + m;
        idx0 = offa + j0;
        idx1 = offa + j1;
        idx2 = offa + j2;
        idx3 = offa + j3;
        x0r = a[idx0 - 2] + a[idx2 - 2];
        x0i = -a[idx0 - 1] - a[idx2 - 1];
        x1r = a[idx0 - 2] - a[idx2 - 2];
        x1i = -a[idx0 - 1] + a[idx2 - 1];
        x2r = a[idx1 - 2] + a[idx3 - 2];
        x2i = a[idx1 - 1] + a[idx3 - 1];
        x3r = a[idx1 - 2] - a[idx3 - 2];
        x3i = a[idx1 - 1] - a[idx3 - 1];
        a[idx0 - 2] = x0r + x2r;
        a[idx0 - 1] = x0i - x2i;
        a[idx1 - 2] = x0r - x2r;
        a[idx1 - 1] = x0i + x2i;
        x0r = x1r + x3i;
        x0i = x1i + x3r;
        a[idx2 - 2] = wk1r * x0r - wk1i * x0i;
        a[idx2 - 1] = wk1r * x0i + wk1i * x0r;
        x0r = x1r - x3i;
        x0i = x1i - x3r;
        a[idx3 - 2] = wk3r * x0r + wk3i * x0i;
        a[idx3 - 1] = wk3r * x0i - wk3i * x0r;
        x0r = a[idx0] + a[idx2];
        x0i = -a[idx0 + 1] - a[idx2 + 1];
        x1r = a[idx0] - a[idx2];
        x1i = -a[idx0 + 1] + a[idx2 + 1];
        x2r = a[idx1] + a[idx3];
        x2i = a[idx1 + 1] + a[idx3 + 1];
        x3r = a[idx1] - a[idx3];
        x3i = a[idx1 + 1] - a[idx3 + 1];
        a[idx0] = x0r + x2r;
        a[idx0 + 1] = x0i - x2i;
        a[idx1] = x0r - x2r;
        a[idx1 + 1] = x0i + x2i;
        x0r = x1r + x3i;
        x0i = x1i + x3r;
        a[idx2] = wn4r * (x0r - x0i);
        a[idx2 + 1] = wn4r * (x0i + x0r);
        x0r = x1r - x3i;
        x0i = x1i - x3r;
        a[idx3] = -wn4r * (x0r + x0i);
        a[idx3 + 1] = -wn4r * (x0i - x0r);
        x0r = a[idx0 + 2] + a[idx2 + 2];
        x0i = -a[idx0 + 3] - a[idx2 + 3];
        x1r = a[idx0 + 2] - a[idx2 + 2];
        x1i = -a[idx0 + 3] + a[idx2 + 3];
        x2r = a[idx1 + 2] + a[idx3 + 2];
        x2i = a[idx1 + 3] + a[idx3 + 3];
        x3r = a[idx1 + 2] - a[idx3 + 2];
        x3i = a[idx1 + 3] - a[idx3 + 3];
        a[idx0 + 2] = x0r + x2r;
        a[idx0 + 3] = x0i - x2i;
        a[idx1 + 2] = x0r - x2r;
        a[idx1 + 3] = x0i + x2i;
        x0r = x1r + x3i;
        x0i = x1i + x3r;
        a[idx2 + 2] = wk1i * x0r - wk1r * x0i;
        a[idx2 + 3] = wk1i * x0i + wk1r * x0r;
        x0r = x1r - x3i;
        x0i = x1i - x3r;
        a[idx3 + 2] = wk3i * x0r + wk3r * x0i;
        a[idx3 + 3] = wk3i * x0i - wk3r * x0r;
    };
    FloatFFT.prototype.makewt = function (nw) {
        var j;
        var nwh;
        var nw0;
        var nw1;
        var delta;
        var wn4r;
        var wk1r;
        var wk1i;
        var wk3r;
        var wk3i;
        var delta2;
        var deltaj;
        var deltaj3;
        this.ip[0] = nw;
        this.ip[1] = 1;
        if (nw > 2) {
            nwh = nw >> 1;
            delta = (0.7853981633974483 / nwh);
            delta2 = delta * 2;
            wn4r = Math.cos(delta * nwh);
            this.w[0] = 1;
            this.w[1] = wn4r;
            if (nwh === 4) {
                this.w[2] = Math.cos(delta2);
                this.w[3] = Math.sin(delta2);
            }
            else if (nwh > 4) {
                this.makeipt(nw);
                this.w[2] = (0.5 / Math.cos(delta2));
                this.w[3] = (0.5 / Math.cos(delta * 6));
                for (j = 4; j < nwh; j += 4) {
                    deltaj = delta * j;
                    deltaj3 = 3 * deltaj;
                    this.w[j] = Math.cos(deltaj);
                    this.w[j + 1] = Math.sin(deltaj);
                    this.w[j + 2] = Math.cos(deltaj3);
                    this.w[j + 3] = -Math.sin(deltaj3);
                }
            }
            nw0 = 0;
            while ((nwh > 2)) {
                nw1 = nw0 + nwh;
                nwh >>= 1;
                this.w[nw1] = 1;
                this.w[nw1 + 1] = wn4r;
                if (nwh === 4) {
                    wk1r = this.w[nw0 + 4];
                    wk1i = this.w[nw0 + 5];
                    this.w[nw1 + 2] = wk1r;
                    this.w[nw1 + 3] = wk1i;
                }
                else if (nwh > 4) {
                    wk1r = this.w[nw0 + 4];
                    wk3r = this.w[nw0 + 6];
                    this.w[nw1 + 2] = (0.5 / wk1r);
                    this.w[nw1 + 3] = (0.5 / wk3r);
                    for (j = 4; j < nwh; j += 4) {
                        var idx1 = nw0 + 2 * j;
                        var idx2 = nw1 + j;
                        wk1r = this.w[idx1];
                        wk1i = this.w[idx1 + 1];
                        wk3r = this.w[idx1 + 2];
                        wk3i = this.w[idx1 + 3];
                        this.w[idx2] = wk1r;
                        this.w[idx2 + 1] = wk1i;
                        this.w[idx2 + 2] = wk3r;
                        this.w[idx2 + 3] = wk3i;
                    }
                }
                nw0 = nw1;
            }
            ;
        }
    };
    FloatFFT.prototype.makect = function (nc, c, startc) {
        var j;
        var nch;
        var delta;
        var deltaj;
        this.ip[1] = nc;
        if (nc > 1) {
            nch = nc >> 1;
            delta = (0.7853981633974483 / nch);
            c[startc] = Math.cos(delta * nch);
            c[startc + nch] = (0.5 * c[startc]);
            for (j = 1; j < nch; j++) {
                deltaj = delta * j;
                c[startc + j] = (0.5 * Math.cos(deltaj));
                c[startc + nc - j] = (0.5 * Math.sin(deltaj));
            }
        }
    };
    FloatFFT.prototype.makeipt = function (nw) {
        var j;
        var l;
        var m;
        var m2;
        var p;
        var q;
        this.ip[2] = 0;
        this.ip[3] = 16;
        m = 2;
        for (l = nw; l > 32; l >>= 2) {
            m2 = m << 1;
            q = m2 << 3;
            for (j = m; j < m2; j++) {
                p = this.ip[j] << 2;
                this.ip[m + j] = p;
                this.ip[m2 + j] = p + q;
            }
            m = m2;
        }
    };
    FloatFFT.PI = 3.1415927;
    FloatFFT.TWO_PI = 6.2831855;
    return FloatFFT;
}());
FloatFFT["__class"] = "FloatFFT";
var FloatFFT;
(function (FloatFFT) {
    (function (Plans) {
        Plans[Plans["SPLIT_RADIX"] = 0] = "SPLIT_RADIX";
        Plans[Plans["MIXED_RADIX"] = 1] = "MIXED_RADIX";
        Plans[Plans["BLUESTEIN"] = 2] = "BLUESTEIN";
    })(FloatFFT.Plans || (FloatFFT.Plans = {}));
    var Plans = FloatFFT.Plans;
})(FloatFFT || (FloatFFT = {}));
FloatFFT.factors_$LI$();
