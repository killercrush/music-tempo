/** 
 * Performs tempo induction by finding clusters of similar inter-onset intervals (IOIs)
 * @class
 */
export default class TempoInduction {
    /**
     * Find clusters
     * @param {Array} events - the onsets from which the tempo is induced
     * @param {Object} [params={}] - parameters
     * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
     * @param {Number} [params.maxIOI=2.5] - the maximum IOI for inclusion in a cluster
     * @param {Number} [params.minIOI=0.07] - the minimum IOI for inclusion in a cluster
     * @return {{clIntervals: Array, clSizes: Array}} - object with clusters
     */      
    static processRhythmicEvents(events, params = {}) {
        const widthTreshold = params.widthTreshold || 0.025,
              maxIOI = params.maxIOI || 2.5,
              minIOI = params.minIOI || 0.07,
              length = events.length;

        let clIntervals = [],
            clSizes = [],
            clCount = 0;

        for (let i = 0; i < length - 1; i++) {
            for(let j = i + 1; j < length; j++) {
                let ioi = events[j] - events[i];
                if (ioi < minIOI) {
                    continue
                }                
                if (ioi > maxIOI) {
                    break;
                }
                let k = 0;
                for ( ; k < clCount; k++) {
                    if (Math.abs(clIntervals[k] - ioi) < widthTreshold) {
                        if ( Math.abs(clIntervals[k + 1] - ioi) < Math.abs(clIntervals[k] - ioi) 
                            && k < clCount - 1 ) {
                            k++;
                        }
                        clIntervals[k] = (clIntervals[k] * clSizes[k] + ioi) / (clSizes[k] + 1);
                        clSizes[k]++;
                        break;
                    }
                }
                if (k != clCount) continue;
                clCount++;
                for ( ; k > 0 && clIntervals[k - 1] > ioi; k--) {
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
        return {clIntervals, clSizes};
    }
    /**
     * Merge similar intervals
     * @param {Object} clusters - object with clusters
     * @param {Array} clusters.clIntervals - clusters IOIs array
     * @param {Array} clusters.clSizes - clusters sizes array
     * @param {Object} [params={}] - parameters
     * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
     * @return {{clIntervals: Array, clSizes: Array}} - object with clusters
     */
    static mergeClusters(clusters, params = {}) {
        const widthTreshold = params.widthTreshold || 0.025;

        let clIntervals = clusters.clIntervals,
            clSizes = clusters.clSizes;
        let clCount = clIntervals.length;

        for (let i = 0; i < clCount; i++)
            for (let j = i + 1; j < clCount; j++)
                if (Math.abs(clIntervals[i] - clIntervals[j]) < widthTreshold) {
                    clIntervals[i] = 
                        (clIntervals[i] * clSizes[i] + 
                        clIntervals[j] * clSizes[j]) / 
                        (clSizes[i] + clSizes[j]);
                    clSizes[i] = clSizes[i] + clSizes[j];
                    --clCount;
                    for (let k = j + 1; k <= clCount; k++) {
                        clIntervals[k-1] = clIntervals[k];
                        clSizes[k-1] = clSizes[k];
                    }
                }
        clIntervals.length = clCount;
        clSizes.length = clCount;
        return {clIntervals, clSizes};
    }
    /**
     * Score intervals
     * @param {Object} clusters - object with clusters
     * @param {Array} clusters.clIntervals - clusters IOIs array
     * @param {Array} clusters.clSizes - clusters sizes array
     * @param {Object} [params={}] - parameters
     * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
     * @param {Number} [params.maxTempos=10] - initial amount of tempo hypotheses
     * @return {{clScores: Array, clScoresIdxs: Array}} - object with intervals scores
     */
    static calculateScore(clusters, params = {}) {
        const widthTreshold = params.widthTreshold || 0.025;
        let maxTempos = params.maxTempos || 10;

        let clIntervals = clusters.clIntervals,
            clSizes = clusters.clSizes,
            clScores = [],
            clScoresIdxs = [];
        let clCount = clIntervals.length;

        for (let i = 0; i < clCount; i++) {
            clScores[i] = 10 * clSizes[i];
            clScoresIdxs[i] = { score: clScores[i], idx: i};
        }        

        clScoresIdxs.sort( (a, b) => b.score - a.score );
        if (clScoresIdxs.length > maxTempos) {
          for (let i = maxTempos - 1; i <  clScoresIdxs.length - 1; i++) {
              if (clScoresIdxs[i].score == clScoresIdxs[i + 1].score) {
                  maxTempos++;
              } else {
                  break;
              }
          }
          clScoresIdxs.length = maxTempos;
        }

        clScoresIdxs = clScoresIdxs.map( a => a.idx );

        for (let i = 0; i < clCount; i++) {
            for (let j = i + 1; j < clCount; j++) {
                let ratio = clIntervals[i] / clIntervals[j];
                let isFraction = ratio < 1;
                let d, err;
                d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                if (d < 2 || d > 8) continue;

                if (isFraction)
                    err = Math.abs(clIntervals[i] * d - clIntervals[j]);
                else
                    err = Math.abs(clIntervals[i] - clIntervals[j] * d);
                let errTreshold = isFraction ? widthTreshold : widthTreshold * d;
                if (err >= errTreshold) continue;

                d = d >= 5 ? 1 : 6 - d;
                clScores[i] += d * clSizes[j];
                clScores[j] += d * clSizes[i];
            }
        }
        return {clScores, clScoresIdxs};
    }
    /**
     * Get array of tempo hypotheses
     * @param {Object} clusters - object with clusters
     * @param {Array} clusters.clIntervals - clusters IOIs array
     * @param {Array} clusters.clSizes - clusters sizes array
     * @param {Array} clusters.clScores - clusters scores array
     * @param {Array} clusters.clScoresIdxs - clusters scores indexes array
     * @param {Object} [params={}] - parameters
     * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
     * @param {Number} [params.minBeatInterval=0.3] - the minimum inter-beat interval (IBI) (0.30 seconds == 200 BPM)
     * @param {Number} [params.maxBeatInterval=1] - the maximum inter-beat interval (IBI) (1.00 seconds ==  60 BPM)
     * @return {Array} tempoList - tempo hypotheses array
     */
    static createTempoList(clusters, params = {}) {
        const widthTreshold = params.widthTreshold || 0.025,
            minBeatInterval = params.minBeatInterval || 0.3,
            maxBeatInterval = params.maxBeatInterval || 1;
        let clIntervals = clusters.clIntervals,
            clSizes = clusters.clSizes,
            clScores = clusters.clScores,
            clScoresIdxs = clusters.clScoresIdxs,
            tempoList = [];
        let clCount = clIntervals.length;

        for (let i = 0; i < clScoresIdxs.length; i++) {
            let idx = clScoresIdxs[i];            
            let newSum = clIntervals[idx] * clScores[idx];
            let newWeight = clScores[idx];
            let err, errTreshold;
            for (let j = 0; j < clCount; j++) {
                if (j == idx) continue;
                let ratio = clIntervals[idx] / clIntervals[j];
                let isFraction = ratio < 1;
                let sumInc = 0;
                let d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
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
            let beat = newSum / newWeight;
            
            while (beat < minBeatInterval) beat *= 2;
            while (beat > maxBeatInterval) beat /= 2;

            tempoList.push(beat);
        }
        return tempoList;
    }    
}