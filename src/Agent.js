/** 
 * Agent is the central class for beat tracking
 * @class
 */
export default class Agent {
    /**
     * Constructor
     * @param {Number} tempo - tempo hypothesis of the Agent
     * @param {Number} firstBeatTime - the time of the first beat accepted by this Agent
     * @param {Number} firsteventScore - salience value of the first beat accepted by this Agent
     * @param {Array} agentList - reference to the agent list 
     * @param {Object} [params={}] - parameters     
     * @param {Number} [params.expiryTime=10] - the time after which an Agent that has not accepted any beat will be destroyed
     * @param {Number} [params.toleranceWndInner=0.04] - the maximum time that a beat can deviate from the predicted beat time without a fork occurring
     * @param {Number} [params.toleranceWndPre=0.15] - the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
     * @param {Number} [params.toleranceWndPost=0.3] - the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
     * @param {Number} [params.correctionFactor=50] - correction factor for updating beat period
     * @param {Number} [params.maxChange=0.2] - the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
     * @param {Number} [params.penaltyFactor=0.5] - factor for correcting score, if onset do not coincide precisely with predicted beat time
     */      
    constructor(tempo, firstBeatTime, firsteventScore, agentList, params = {}) {
        /** 
         * the time after which an Agent that has not accepted any beat will be destroyed
         * @type {Number} 
         */
        this.expiryTime = params.expiryTime || 10;
        /** 
         * the maximum time that a beat can deviate from the predicted beat time without a fork occurring
         * @type {Number} 
         */
        this.toleranceWndInner = params.toleranceWndInner || 0.04;
        /** 
         * the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
         * @type {Number} 
         */
        this.toleranceWndPre = params.toleranceWndPre || 0.15;
        /** 
         * the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
         * @type {Number} 
         */
        this.toleranceWndPost = params.toleranceWndPost || 0.3;

        this.toleranceWndPre *= tempo;
        this.toleranceWndPost *= tempo;

        /** 
         * correction factor for updating beat period
         * @type {Number} 
         */
        this.correctionFactor = params.correctionFactor || 50;
        /** 
         * the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
         * @type {Number} 
         */        
        this.maxChange = params.maxChange || 0.2;
        /** 
         * factor for correcting score, if onset do not coincide precisely with predicted beat time
         * @type {Number} 
         */        
        this.penaltyFactor = params.penaltyFactor || 0.5;

        /** 
         * the current tempo hypothesis of the Agent, expressed as the beat period
         * @type {Number} 
         */ 
        this.beatInterval = tempo;
        /** 
         * the initial tempo hypothesis of the Agent, expressed as the beat period
         * @type {Number}
         */         
        this.initialBeatInterval = tempo;
        /** 
         * the time of the most recent beat accepted by this Agent
         * @type {Number} 
         */         
        this.beatTime = firstBeatTime;
        /** 
         * the number of beats found by this Agent, including interpolated beats
         * @type {Number} 
         */         
        this.totalBeatCount = 1;
        /** 
         * the array of onsets accepted by this Agent as beats, plus interpolated beats
         * @type {Array} 
         */         
        this.events = [firstBeatTime];
        /** 
         * sum of salience values of the onsets which have been interpreted as beats by this Agent
         * @type {Number} 
         */         
        this.score = firsteventScore;
        /** 
         * reference to the agent list 
         * @type {Array} 
         */         
        this.agentListRef = agentList;
    }
    /**
     * The event time is tested if it is a beat time
     * @param {Number} eventTime - the event time to be tested
     * @param {Number} eventScore - salience values of the event time
     * @return {Boolean} indicate whether the given event time was accepted as a beat time
     */
    considerEvent(eventTime, eventScore) {
        if (eventTime - this.events[this.events.length - 1] > this.expiryTime) {
            this.score = -1;
            return false;
        }

        let beatCount = Math.round( (eventTime - this.beatTime) / this.beatInterval );
        let err = eventTime - this.beatTime - beatCount * this.beatInterval;

        if (beatCount > 0 && err >= -this.toleranceWndPre && err <= this.toleranceWndPost) {
            if (Math.abs(err) > this.toleranceWndInner) {
                this.agentListRef.push(this.clone());
            }
            this.acceptEvent(eventTime, eventScore, err, beatCount);
            return true;
        }
        return false;
    }
    /**
     * Accept the event time as a beat time, and update the state of the Agent accordingly
     * @param {Number} eventTime - the event time to be accepted
     * @param {Number} eventScore - salience values of the event time
     * @param {Number} err - the difference between the predicted and actual beat times
     * @param {Number} beatCount - the number of beats since the last beat
     */    
    acceptEvent(eventTime, eventScore, err, beatCount) {
        this.beatTime = eventTime;
        this.events.push(eventTime);

        let corrErr = err / this.correctionFactor;
        if (Math.abs(this.initialBeatInterval - this.beatInterval - corrErr) < this.maxChange * this.initialBeatInterval) {
            this.beatInterval += corrErr;
        }
        this.totalBeatCount += beatCount;
        let errFactor =  err > 0 ? err / this.toleranceWndPost : err / -this.toleranceWndPre;
        let scoreFactor = 1 - this.penaltyFactor * errFactor;
        this.score += eventScore * scoreFactor;
    }
    /**
     * Interpolates missing beats in the Agent's beat track
     */     
    fillBeats() {
        let prevBeat, nextBeat, currentInterval, beats;
        prevBeat = 0;
        if (this.events.length > 2) {
            prevBeat = this.events[0];
        }

        for (let i = 0; i < this.events.length; i++) {
            nextBeat = this.events[i];
            beats = Math.round((nextBeat - prevBeat) / this.beatInterval - 0.01);
            currentInterval = (nextBeat - prevBeat) / beats;
            let k = 0;
            for ( ; beats > 1; beats--) {
                prevBeat += currentInterval;
                this.events.splice(i + k, 0, prevBeat);
                k++;
            }
            prevBeat = nextBeat;            
        }
    }
    /**
     * Makes a clone of the Agent
     * @return {Agent} agent's clone
     */     
    clone() {
        let newAgent = new Agent();
        newAgent.beatInterval = this.beatInterval;
        newAgent.initialBeatInterval = this.initialBeatInterval;
        newAgent.beatTime = this.beatTime;
        newAgent.totalBeatCount = this.totalBeatCount;
        newAgent.events = this.events.slice();
        newAgent.expiryTime = this.expiryTime;
        newAgent.toleranceWndInner = this.toleranceWndInner;
        newAgent.toleranceWndPre = this.toleranceWndPre;
        newAgent.toleranceWndPost = this.toleranceWndPost;
        newAgent.correctionFactor = this.correctionFactor;
        newAgent.maxChange = this.maxChange;
        newAgent.penaltyFactor = this.penaltyFactor;
        newAgent.score = this.score;
        newAgent.agentListRef = this.agentListRef;

        return newAgent;
    }
}