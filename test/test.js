var assert = require('chai').assert;
var fs = require("fs");

var FFT = require("../dist/node/FFT.js");
var OnsetDetection = require("../dist/node/OnsetDetection.js");
var TempoInduction = require("../dist/node/TempoInduction.js");
var BeatTracking = require("../dist/node/BeatTracking.js");
var Agent = require("../dist/node/Agent.js");
var MusicTempo = require("../dist/node/MusicTempo.js");

describe("FFT", function() {
  describe("getHammingWindow", function() {
    it("should return hamming window array", function() {
      var actual = FFT.getHammingWindow(2048);

      var data = fs.readFileSync("./test/data/hammingWindow2048.data");
      var expected = JSON.parse(data);
      assert.equal(actual.length, expected.length);

      var length = actual.length;
      var delta = 1e-17;
      for (var i = 0; i < length; i++) {
        assert.approximately(actual[i], expected[i], delta);
      }
    });
  });
  describe("getSpectrum", function() {
    it("should return spectrum of FFT", function() {
      var file = fs.readFileSync("./test/data/inputFrame.data");
      var inputData = JSON.parse(file);

      var im = [];
      for (var j = 0; j < 2048; j++) im[j] = 0;
      FFT.getSpectrum(inputData, im);
      var actual = inputData;

      file = fs.readFileSync("./test/data/spectrum.data");
      var expected = JSON.parse(file);

      assert.deepEqual(actual, expected);
    });
  });  
});

describe("OnsetDetection", function() {
  describe("calculateSF", function() {
    this.timeout(15000);
    it("should return spectral flux", function() {
      var bytes = fs.readFileSync("./test/data/PCM.data.gz");
      var zlib = require('zlib');
      var bytes = zlib.unzipSync(bytes);      
      var audioData = Array.from(new Float64Array(bytes.buffer));

      var actual = OnsetDetection.calculateSF(audioData, FFT);

      var data = fs.readFileSync("./test/data/spectralFlux.data");
      var expected = JSON.parse(data);
      assert.equal(actual.length, expected.length);

      var length = actual.length;
      var delta = 1e-13;
      //assert.deepEqual(actual, expected);
       for (var i = 0; i < expected.length; i++) {
         assert.approximately(actual[i], expected[i], delta);
       }
    });
  });
  describe("normalize", function() {
    it("should normalize array to have a mean of 0 and standard deviation of 1", function() {
      var array = [];
      var N = 1000;
      for (var i = 0; i < N; i++) {
        array[i] = Math.random() * 2000 - 1000;
      }

      OnsetDetection.normalize(array);

      var mean = 0;
      var sqrSum = 0;
      for (i = 0; i < N; i++) {
        mean += array[i];
      }
      mean /= N;
      for (i = 0; i < N; i++) {
        sqrSum += Math.pow(array[i] - mean, 2);
      }
      var stdDevation = Math.sqrt(sqrSum / N);
      var delta = 1e-12;
      assert.approximately(mean, 0, delta);
      assert.approximately(stdDevation, 1, delta);
    });
  });
  describe("findPeaks", function() {
    it("should return peaks array", function() {
      var file = fs.readFileSync("./test/data/spectralFluxNorm.data");
      var inputData = JSON.parse(file);

      var actual = OnsetDetection.findPeaks(inputData);

      file = fs.readFileSync("./test/data/peaks.data");
      var expected = JSON.parse(file);

      assert.deepEqual(actual, expected);
    });
  });  
});

describe("TempoInduction", function() {
  describe("processRhythmicEvents", function() {
    it("should return object with IOI intervals", function() {
      var data = fs.readFileSync("./test/data/peaks.data");
      var peaks = JSON.parse(data);
      var events = peaks.map(function (a) {return a * 0.01});
      var actual = TempoInduction.processRhythmicEvents(events);

      var expected = {};
      data = fs.readFileSync("./test/data/clustersIntervals.data");      
      expected.clIntervals = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersSizes.data");      
      expected.clSizes = JSON.parse(data);

      assert.deepEqual(actual, expected);
    });
  });
  describe("mergeClusters", function() {
    it("should return object with merged IOI intervals", function() {
      var input = {};
      var data = fs.readFileSync("./test/data/clustersIntervals.data");      
      input.clIntervals = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersSizes.data");      
      input.clSizes = JSON.parse(data);

      var actual = TempoInduction.mergeClusters(input);

      var expected = {};
      data = fs.readFileSync("./test/data/clustersIntervalsMerged.data");      
      expected.clIntervals = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersSizesMerged.data");      
      expected.clSizes = JSON.parse(data);

      assert.deepEqual(actual, expected);
    });
  });
  describe("calculateScore", function() {
    it("should return object with IOI intervals scores", function() {
      var input = {};
      var data = fs.readFileSync("./test/data/clustersIntervalsMerged.data");      
      input.clIntervals = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersSizesMerged.data");      
      input.clSizes = JSON.parse(data);

      var actual = TempoInduction.calculateScore(input);

      var expected = {};
      data = fs.readFileSync("./test/data/clustersScores.data");      
      expected.clScores = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersScoresIdxs.data");      
      expected.clScoresIdxs = JSON.parse(data);

      assert.deepEqual(actual, expected);
    });    
  });
  describe("createTempoList", function() {
    it("should return array with tempos", function() {
      var input = {};
      var data = fs.readFileSync("./test/data/clustersIntervalsMerged.data");
      input.clIntervals = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersSizesMerged.data");
      input.clSizes = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersScores.data");
      input.clScores = JSON.parse(data);

      data = fs.readFileSync("./test/data/clustersScoresIdxs.data");
      input.clScoresIdxs = JSON.parse(data);

      var actual = TempoInduction.createTempoList(input);

      var expected = {};
      data = fs.readFileSync("./test/data/tempoList.data");
      expected = JSON.parse(data);

      assert.deepEqual(actual, expected);
    });    
  });
});

describe("Agent", function() {
  describe("clone", function() {
    it("should return object clone", function() {
      var agents = [];
      var agent = new Agent(0.33, 0.11, 1, agents);
      agent.considerEvent(0.44, 1);
      agent.considerEvent(1.29, 1);
      agent.considerEvent(2.84, 1);
      agent.considerEvent(3.23, 1);
      agent.considerEvent(4.53, 1);
      agent.considerEvent(5.2, 1);
      var clone = agent.clone();

      assert.notEqual(agent, clone);
      assert.deepEqual(agent, clone);
    });
  });  
  describe("considerEvent", function() {
    it("should accept event depending on state, event time and parameters", function() {
      var agents = [];
      var agent = new Agent(0.33, 0.11, 0, agents);
      assert.equal(agent.considerEvent(0.44, 1), true);
      assert.equal(agent.considerEvent(1.1, 1), true);
      assert.equal(agent.considerEvent(1.38, 1), false);
      var clone = agent.clone();
      assert.equal(agent.considerEvent(1.48, 1), true);
      assert.deepEqual(agents[0], clone);
      assert.equal(agent.considerEvent(11.5, 1), false);
      var expected = {
        beatInterval: 0.331,
        initialBeatInterval: 0.33,
        beatTime: 1.48,
        totalBeatCount: 5,
        events: [0.11, 0.44, 1.1, 1.48],
        expiryTime: 10 ,
        toleranceWndInner: 0.04,
        toleranceWndPre: 0.33 * 0.15,
        toleranceWndPost: 0.33 * 0.3,
        correctionFactor: 50,
        maxChange: 0.2,
        penaltyFactor: 0.5,
        score: -1,
        agentListRef: agents
      };
      assert.deepEqual(agent, expected);
    });
  });  
  describe("acceptEvent", function() {
    it("should change state depending on parameters", function() {
      var agents = [];
      var agent = new Agent(0.47, 1.25, 0, agents);  
      agent.acceptEvent(1.72, 12, 0, 1);
      assert.equal(agent.events[agent.events.length - 1], 1.72);
      assert.equal(agent.beatTime, 1.72);
      assert.equal(agent.beatInterval, 0.47);
      assert.equal(agent.totalBeatCount, 2);
      assert.equal(agent.score, 12);

      var err = 0.5;
      agent.acceptEvent(1.72, 4, err, 3);
      assert.equal(agent.events[agent.events.length - 1], 1.72);
      assert.equal(agent.beatTime, 1.72);
      assert.equal(agent.beatInterval, 0.47 + err / 50);
      assert.equal(agent.totalBeatCount, 5);
      var errFactor = err / (0.47 * 0.3);
      var score = 12 + ( 4 * (1 - 0.5 * errFactor) );
      assert.equal(agent.score, score);

      var err = -9;
      agent.acceptEvent(2.6, 10, err, 1);
      assert.equal(agent.events[agent.events.length - 1], 2.6);
      assert.equal(agent.beatTime, 2.6);
      assert.equal(agent.beatInterval, 0.48);
      assert.equal(agent.totalBeatCount, 6);
      var errFactor = err / (0.47 * -0.15);
      assert.equal(agent.score, score + (10 * (1 - 0.5 * errFactor) ) );            
    });
  });
  describe("fillBeats", function() {
    it("should interpolate missing beats", function() {
      var agents = [];
      var agent = new Agent(0.5, 0.01, agents);
      agent.events = [0.01, 1.01, 2.51];
      agent.fillBeats();

      var expected = [0.01, 0.51, 1.01, 1.51, 2.01, 2.51];
      assert.deepEqual(agent.events, expected);
    });
  });      
});

describe("BeatTracking", function() {
  describe("trackBeat", function() {
    it("should return array with agents", function() {
      var input = {};
      var data = fs.readFileSync("./test/data/events.data");      
      events = JSON.parse(data);

      data = fs.readFileSync("./test/data/saliences.data");      
      saliences = JSON.parse(data);

      data = fs.readFileSync("./test/data/tempoList.data");
      tempoList = JSON.parse(data);

      var actual = BeatTracking.trackBeat(events, saliences, tempoList);

      data = fs.readFileSync("./test/data/agents.data");      
      var expected = JSON.parse(data);
      
      assert.equal(actual.length, expected.length);
      //actual.sort(function (a1, a2) {return a1.beatInterval - a2.beatInterval});
      //expected.sort(function (a1, a2) {return a1.beatInterval - a2.beatInterval});

      for (var i = 0; i < actual.length; i++) {
          assert.equal(actual[i].beatTime, expected[i].beatTime , "[i=" + i + "]");
          assert.equal(actual[i].beatInterval, expected[i].beatInterval , "[i=" + i + "]");
          assert.equal(actual[i].score, expected[i].phaseScore , "[i=" + i + "]");
          assert.equal(actual[i].totalBeatCount, expected[i].totalBeatCount , "[i=" + i + "]");
          assert.deepEqual(actual[i].events, expected[i].events);
      }
      //assert.deepEqual(actual, expected);
    });
  });
});

describe("MusicTempo", function() {
  it("should calculate music tempo", function() {
      this.timeout(15000);
      var bytes = fs.readFileSync("./test/data/PCM.data.gz");
      var zlib = require('zlib');
      var bytes = zlib.unzipSync(bytes);
      var audioData = Array.from(new Float64Array(bytes.buffer));

      var data = fs.readFileSync("./test/data/bestAgent.data");
      var expected = JSON.parse(data);

      var actual = new MusicTempo(audioData);

      assert.equal(actual.beatInterval, expected.beatInterval);
      assert.deepEqual(actual.beats, expected.events);
  });
});