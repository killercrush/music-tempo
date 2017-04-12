import OnsetDetection from "./OnsetDetection";
import TempoInduction from "./TempoInduction";
import BeatTracking from "./BeatTracking";
import FFT from "./FFT";

/** 
 * Class combines the work of all the steps of tempo extraction
 * @class
 */
export default class MusicTempo {
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
    constructor(audioData, params = {}) {
        if ( !(audioData instanceof Float32Array) && !Array.isArray(audioData)) {
            throw "audioData is not an array";
        }
        const timeStep = params.timeStep || 0.01;
        let res = OnsetDetection.calculateSF(audioData, FFT, params);
        /** 
         * Spectral flux
         * @type {Array} 
         */          
        this.spectralFlux = res;
        OnsetDetection.normalize(this.spectralFlux);
        /** 
         * Spectral flux peaks indexes
         * @type {Array} 
         */         
        this.peaks = OnsetDetection.findPeaks(this.spectralFlux, params);
        /** 
         * Onsets times array
         * @type {Array} 
         */ 
        this.events = this.peaks.map(a => a * timeStep);

        let clusters = TempoInduction.processRhythmicEvents(this.events, params);
        clusters = TempoInduction.mergeClusters(clusters, params); 
        let scores = TempoInduction.calculateScore(clusters, params);
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
        this.tempoList = TempoInduction.createTempoList(clusters, params);

        let minSFValue = this.spectralFlux.reduce( (a, b) => Math.min(a, b) );
        let eventsScores = this.peaks.map(a => this.spectralFlux[a] - minSFValue);
        /** 
         * Agents array
         * @type {Array} 
         */         
        this.agents = BeatTracking.trackBeat(this.events, eventsScores, this.tempoList, params);

        let bestScore = -1;
        let idxBestAgent = -1;
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

        for (let i = 0; i < this.agents.length; i++) {
            if(this.agents[i].score > bestScore) {
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
    }
}