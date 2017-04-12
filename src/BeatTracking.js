import Agent from "./Agent";
/** 
 * Performs automatic beat tracking
 * @class
 */
export default class BeatTracking {
    /**
     * Perform beat tracking on a array of onsets
     * @param {Array} events - the array of onsets to beat track
     * @param {Array} eventsScores - the array of corresponding salience values
     * @param {Array} tempoList - the array of tempo hypothesis 
     * @param {Object} [params={}] - parameters
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
     * @return {Array} agents - agents array
     */
    static trackBeat(events, eventsScores, tempoList, params = {}) {
        const   initPeriod = params.initPeriod || 5,
                thresholdBI = params.thresholdBI || 0.02,
                thresholdBT = params.thresholdBT || 0.04;
        function removeSimilarAgents() {
            agents.sort( (a1, a2) => a1.beatInterval - a2.beatInterval );
            const length = agents.length;
            for (let i = 0; i < length; i++) {
                if (agents[i].score < 0) continue;
                for (let j = i + 1; j < length; j++) {
                    if(agents[j].beatInterval - agents[i].beatInterval > thresholdBI) {
                        break;
                    }
                    if(Math.abs(agents[j].beatTime - agents[i].beatTime) > thresholdBT) {
                        continue;
                    }
                    if(agents[i].score < agents[j].score) {
                        agents[i].score = -1;
                    }
                    else {
                        agents[j].score = -1;
                    }
                }
            }
            for (let i = length - 1; i >= 0; i--) {
                if (agents[i].score < 0) {
                    agents.splice(i, 1);
                }
            }
        }    
        var agents = [];

        for (let i = 0; i < tempoList.length; i++) {
            agents.push(new Agent(tempoList[i], events[0], eventsScores[0], agents, params));
        }
        var j = 1;
        removeSimilarAgents();

        while (events[j] < initPeriod) {
            let agentsLength = agents.length;
            let prevBeatInterval = -1;
            let isEventAccepted = true;
            for (let k = 0; k < agentsLength; k++) {
                if (agents[k].beatInterval != prevBeatInterval) {
                    if (!isEventAccepted) {
                        agents.push(new Agent(prevBeatInterval, events[j], eventsScores[j], agents, params));
                    }
                    prevBeatInterval = agents[k].beatInterval;
                    isEventAccepted = false;
                }
                isEventAccepted = agents[k].considerEvent(events[j], eventsScores[j]) || isEventAccepted;   
            }
            removeSimilarAgents();
            j++;
        }
        const eventsLength = events.length;
        for (let i = j; i < eventsLength; i++) {
            let agentsLength = agents.length;
            for (let j = 0; j < agentsLength; j++) {
                agents[j].considerEvent(events[i], eventsScores[i]);
            }
            removeSimilarAgents();
        }

        return agents;
    }
}