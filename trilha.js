(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"trilha_atlas_1", frames: [[1923,81,112,46],[1923,177,100,46],[1923,129,106,46],[1923,225,95,46],[1363,685,307,158],[1583,0,335,208],[1672,685,305,156],[1923,273,89,46],[1920,416,74,45],[1923,369,79,45],[1979,463,69,45],[1979,557,58,45],[1923,321,84,46],[1979,510,63,45],[1923,463,53,45],[1996,416,47,45],[2004,369,42,45],[2009,321,37,45],[2014,273,31,45],[2025,177,19,28],[2020,225,25,36],[2039,557,9,23],[2034,604,14,23],[758,996,178,132],[2044,510,4,15],[1601,1013,302,7],[1583,420,151,42],[2034,629,10,10],[792,465,176,49],[970,465,176,49],[1148,465,176,49],[1557,939,18,21],[2031,129,15,18],[1736,420,151,42],[938,996,176,49],[1116,1011,176,49],[1169,939,386,70],[1557,962,18,21],[1580,845,452,82],[938,1047,176,49],[1294,1013,305,7],[1580,929,452,82],[1326,465,31,36],[1923,0,79,79],[758,808,409,92],[1583,210,335,208],[1169,845,409,92],[758,902,409,92],[1363,465,558,108],[1363,575,558,108],[1889,420,24,27],[0,0,790,517],[0,519,1361,287],[0,808,756,459],[792,0,789,463]]}
];


(lib.AnMovieClip = function(){
	this.currentSoundStreamInMovieclip;
	this.actionFrames = [];
	this.soundStreamDuration = new Map();
	this.streamSoundSymbolsList = [];

	this.gotoAndPlayForStreamSoundSync = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.gotoAndPlay = function(positionOrLabel){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(positionOrLabel);
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(this.currentFrame);
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
		this.clearAllSoundStreams();
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
		this.clearAllSoundStreams();
	}
	this.startStreamSoundsForTargetedFrame = function(targetFrame){
		for(var index=0; index<this.streamSoundSymbolsList.length; index++){
			if(index <= targetFrame && this.streamSoundSymbolsList[index] != undefined){
				for(var i=0; i<this.streamSoundSymbolsList[index].length; i++){
					var sound = this.streamSoundSymbolsList[index][i];
					if(sound.endFrame > targetFrame){
						var targetPosition = Math.abs((((targetFrame - sound.startFrame)/lib.properties.fps) * 1000));
						var instance = playSound(sound.id);
						var remainingLoop = 0;
						if(sound.offset){
							targetPosition = targetPosition + sound.offset;
						}
						else if(sound.loop > 1){
							var loop = targetPosition /instance.duration;
							remainingLoop = Math.floor(sound.loop - loop);
							if(targetPosition == 0){ remainingLoop -= 1; }
							targetPosition = targetPosition % instance.duration;
						}
						instance.loop = remainingLoop;
						instance.position = Math.round(targetPosition);
						this.InsertIntoSoundStreamData(instance, sound.startFrame, sound.endFrame, sound.loop , sound.offset);
					}
				}
			}
		}
	}
	this.InsertIntoSoundStreamData = function(soundInstance, startIndex, endIndex, loopValue, offsetValue){ 
 		this.soundStreamDuration.set({instance:soundInstance}, {start: startIndex, end:endIndex, loop:loopValue, offset:offsetValue});
	}
	this.clearAllSoundStreams = function(){
		var keys = this.soundStreamDuration.keys();
		for(var i = 0;i<this.soundStreamDuration.size; i++){
			var key = keys.next().value;
			key.instance.stop();
		}
 		this.soundStreamDuration.clear();
		this.currentSoundStreamInMovieclip = undefined;
	}
	this.stopSoundStreams = function(currentFrame){
		if(this.soundStreamDuration.size > 0){
			var keys = this.soundStreamDuration.keys();
			for(var i = 0; i< this.soundStreamDuration.size ; i++){
				var key = keys.next().value; 
				var value = this.soundStreamDuration.get(key);
				if((value.end) == currentFrame){
					key.instance.stop();
					if(this.currentSoundStreamInMovieclip == key) { this.currentSoundStreamInMovieclip = undefined; }
					this.soundStreamDuration.delete(key);
				}
			}
		}
	}

	this.computeCurrentSoundStreamInstance = function(currentFrame){
		if(this.currentSoundStreamInMovieclip == undefined){
			if(this.soundStreamDuration.size > 0){
				var keys = this.soundStreamDuration.keys();
				var maxDuration = 0;
				for(var i=0;i<this.soundStreamDuration.size;i++){
					var key = keys.next().value;
					var value = this.soundStreamDuration.get(key);
					if(value.end > maxDuration){
						maxDuration = value.end;
						this.currentSoundStreamInMovieclip = key;
					}
				}
			}
		}
	}
	this.getDesiredFrame = function(currentFrame, calculatedDesiredFrame){
		for(var frameIndex in this.actionFrames){
			if((frameIndex > currentFrame) && (frameIndex < calculatedDesiredFrame)){
				return frameIndex;
			}
		}
		return calculatedDesiredFrame;
	}

	this.syncStreamSounds = function(){
		this.stopSoundStreams(this.currentFrame);
		this.computeCurrentSoundStreamInstance(this.currentFrame);
		if(this.currentSoundStreamInMovieclip != undefined){
			var soundInstance = this.currentSoundStreamInMovieclip.instance;
			if(soundInstance.position != 0){
				var soundValue = this.soundStreamDuration.get(this.currentSoundStreamInMovieclip);
				var soundPosition = (soundValue.offset?(soundInstance.position - soundValue.offset): soundInstance.position);
				var calculatedDesiredFrame = (soundValue.start)+((soundPosition/1000) * lib.properties.fps);
				if(soundValue.loop > 1){
					calculatedDesiredFrame +=(((((soundValue.loop - soundInstance.loop -1)*soundInstance.duration)) / 1000) * lib.properties.fps);
				}
				calculatedDesiredFrame = Math.floor(calculatedDesiredFrame);
				var deltaFrame = calculatedDesiredFrame - this.currentFrame;
				if(deltaFrame >= 2){
					this.gotoAndPlayForStreamSoundSync(this.getDesiredFrame(this.currentFrame,calculatedDesiredFrame));
				}
			}
		}
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.CachedBmp_331 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_328 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_329 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_327 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_332 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_333 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_334 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_326 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_323 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_324 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(9);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_322 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(10);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_320 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(11);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_325 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(12);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_321 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(13);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_319 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(14);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_318 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(15);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_317 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(16);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_316 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(17);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_315 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(18);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_313 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(19);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_314 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(20);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_311 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(21);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_312 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(22);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_309 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(23);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_310 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(24);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_306 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(25);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_297 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(26);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_305 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(27);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_300 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(28);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_294 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(29);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_291 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(30);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_295 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(31);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_298 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(32);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_285 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(33);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_288 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(34);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_282 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(35);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_349 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(36);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_301 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(37);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_293 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(38);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_279 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(39);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_308 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(40);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_350 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(41);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_303 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(42);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_302 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(43);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_265 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(44);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_274 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(45);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_263 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(46);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_261 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(47);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_344 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(48);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_260 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(49);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_255 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(50);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_259 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(51);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_256 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(52);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_258 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(53);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_257 = function() {
	this.initialize(ss["trilha_atlas_1"]);
	this.gotoAndStop(54);
}).prototype = p = new cjs.Sprite();
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.v_phone = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.CachedBmp_309();
	this.instance.setTransform(-1,-2.5,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.v_phone, new cjs.Rectangle(-1,-2.5,89,66), null);


(lib.Interpolação10 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.CachedBmp_306();
	this.instance.setTransform(-75.65,-1.75,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-75.6,-1.7,151,3.5);


(lib.Interpolação8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.CachedBmp_305();
	this.instance.setTransform(-2.4,-2.4,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-2.4,-2.4,5,5);


(lib.Interpolação7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.CachedBmp_305();
	this.instance.setTransform(-2.4,-2.4,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-2.4,-2.4,5,5);


(lib.Interpolação1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.CachedBmp_303();
	this.instance.setTransform(-6.25,-8.9,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_302();
	this.instance_1.setTransform(-19.85,-19.85,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-19.8,-19.8,39.5,39.5);


(lib.v_podcast_over = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_3
	this.instance = new lib.CachedBmp_310();
	this.instance.setTransform(15.05,45,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_311();
	this.instance_1.setTransform(15.05,42.95,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_312();
	this.instance_2.setTransform(15.05,42.95,0.5,0.5);

	this.instance_3 = new lib.CachedBmp_313();
	this.instance_3.setTransform(15.05,41.4,0.5,0.5);

	this.instance_4 = new lib.CachedBmp_314();
	this.instance_4.setTransform(15.05,39.6,0.5,0.5);

	this.instance_5 = new lib.CachedBmp_315();
	this.instance_5.setTransform(15.05,37.25,0.5,0.5);

	this.instance_6 = new lib.CachedBmp_316();
	this.instance_6.setTransform(15.05,37.25,0.5,0.5);

	this.instance_7 = new lib.CachedBmp_317();
	this.instance_7.setTransform(15.05,37.25,0.5,0.5);

	this.instance_8 = new lib.CachedBmp_318();
	this.instance_8.setTransform(15.05,37.25,0.5,0.5);

	this.instance_9 = new lib.CachedBmp_319();
	this.instance_9.setTransform(15.05,37.25,0.5,0.5);

	this.instance_10 = new lib.CachedBmp_320();
	this.instance_10.setTransform(15.05,37.25,0.5,0.5);

	this.instance_11 = new lib.CachedBmp_321();
	this.instance_11.setTransform(15.05,37.25,0.5,0.5);

	this.instance_12 = new lib.CachedBmp_322();
	this.instance_12.setTransform(15.05,37.25,0.5,0.5);

	this.instance_13 = new lib.CachedBmp_323();
	this.instance_13.setTransform(15.05,37.25,0.5,0.5);

	this.instance_14 = new lib.CachedBmp_324();
	this.instance_14.setTransform(15.05,37.25,0.5,0.5);

	this.instance_15 = new lib.CachedBmp_325();
	this.instance_15.setTransform(15.05,36.75,0.5,0.5);

	this.instance_16 = new lib.CachedBmp_326();
	this.instance_16.setTransform(15.05,36.75,0.5,0.5);

	this.instance_17 = new lib.CachedBmp_327();
	this.instance_17.setTransform(15.05,36.75,0.5,0.5);

	this.instance_18 = new lib.CachedBmp_328();
	this.instance_18.setTransform(15.05,36.75,0.5,0.5);

	this.instance_19 = new lib.CachedBmp_329();
	this.instance_19.setTransform(15.05,36.75,0.5,0.5);

	this.instance_20 = new lib.CachedBmp_331();
	this.instance_20.setTransform(15.05,36.75,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance}]},3).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_2}]},2).to({state:[{t:this.instance_3}]},2).to({state:[{t:this.instance_4}]},2).to({state:[{t:this.instance_5}]},2).to({state:[{t:this.instance_6}]},2).to({state:[{t:this.instance_7}]},2).to({state:[{t:this.instance_8}]},2).to({state:[{t:this.instance_9}]},2).to({state:[{t:this.instance_10}]},2).to({state:[{t:this.instance_11}]},2).to({state:[{t:this.instance_12}]},2).to({state:[{t:this.instance_13}]},2).to({state:[{t:this.instance_14}]},2).to({state:[{t:this.instance_15}]},2).to({state:[{t:this.instance_16}]},2).to({state:[{t:this.instance_17}]},2).to({state:[{t:this.instance_18}]},2).to({state:[{t:this.instance_19}]},2).to({state:[{t:this.instance_20}]},2).to({state:[{t:this.instance_20}]},2).wait(1));

	// Camada_1
	this.instance_21 = new lib.v_phone();
	this.instance_21.setTransform(43.4,30.4,1,1,0,0,0,43.4,30.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_21).wait(46));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-2.5,89,66);


(lib.timeline = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_2
	this.instance = new lib.Interpolação7("synched",0);
	this.instance.setTransform(0.5,2.4);

	this.instance_1 = new lib.Interpolação8("synched",0);
	this.instance_1.setTransform(151.9,2.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},179).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true,x:151.9},179).wait(1));

	// Camada_3
	this.instance_2 = new lib.Interpolação10("synched",0);
	this.instance_2.setTransform(0,2.3,0.0076,1,0,0,0,-72.5,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({regX:-75.7,scaleX:1,x:0.05},179).wait(1));

	// Camada_4
	this.instance_3 = new lib.CachedBmp_308();
	this.instance_3.setTransform(0,0.7,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(180));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,0,157.5,5);


(lib.play_video = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.Interpolação1("synched",0);
	this.instance.setTransform(19.85,19.85);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:90},6).to({rotation:180},6).to({rotation:270},6).to({rotation:360},6).to({startPosition:0},95).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-8.2,-8.2,56.099999999999994,56.099999999999994);


(lib.b_reproduzir_2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_2
	this.instance = new lib.v_phone();
	this.instance.setTransform(-70,19.1,1,1,0,0,0,43.4,30.4);

	this.instance_1 = new lib.v_podcast_over();
	this.instance_1.setTransform(-70,19.1,1,1,0,0,0,43.4,30.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance}]},1).to({state:[{t:this.instance}]},1).wait(1));

	// Camada_1
	this.instance_2 = new lib.CachedBmp_301();
	this.instance_2.setTransform(91.8,14.65,0.5,0.5);

	this.instance_3 = new lib.CachedBmp_291();
	this.instance_3.setTransform(102,7.55,0.5,0.5);

	this.instance_4 = new lib.CachedBmp_350();
	this.instance_4.setTransform(26.2,-0.5,0.5,0.5);

	this.instance_5 = new lib.CachedBmp_295();
	this.instance_5.setTransform(91.8,14.65,0.5,0.5);

	this.instance_6 = new lib.CachedBmp_294();
	this.instance_6.setTransform(102,7.55,0.5,0.5);

	this.instance_7 = new lib.CachedBmp_293();
	this.instance_7.setTransform(26.2,-0.5,0.5,0.5);

	this.instance_8 = new lib.CachedBmp_298();
	this.instance_8.setTransform(98.65,15.75,0.5,0.5);

	this.instance_9 = new lib.CachedBmp_297();
	this.instance_9.setTransform(107.4,9.15,0.5,0.5);

	this.instance_10 = new lib.CachedBmp_349();
	this.instance_10.setTransform(42.65,2.5,0.5,0.5);

	this.instance_11 = new lib.CachedBmp_300();
	this.instance_11.setTransform(102,7.55,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2}]}).to({state:[{t:this.instance_7},{t:this.instance_6},{t:this.instance_5}]},1).to({state:[{t:this.instance_10},{t:this.instance_9},{t:this.instance_8}]},1).to({state:[{t:this.instance_4},{t:this.instance_11},{t:this.instance_2}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-114.4,-13.8,366.6,66);


(lib.v_video_player = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_1
	this.instance = new lib.play_video();
	this.instance.setTransform(82.9,42.7,1,1,0,0,0,19.9,19.9);

	this.instance_1 = new lib.timeline();
	this.instance_1.setTransform(82.9,86.15,1,1,0,0,0,76.2,2.4);

	this.instance_2 = new lib.CachedBmp_334();
	this.instance_2.setTransform(6.65,3.8,0.5,0.5);

	this.instance_3 = new lib.CachedBmp_333();
	this.instance_3.setTransform(0,-5.4,0.5,0.5);

	this.instance_4 = new lib.CachedBmp_332();
	this.instance_4.setTransform(6.15,3.3,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = getMCSymbolPrototype(lib.v_video_player, new cjs.Rectangle(0,-5.4,167.5,104), null);


(lib.b_reproduzir_1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Camada_2
	this.instance = new lib.Interpolação7("synched",0);
	this.instance.setTransform(296.8,59.5);

	this.instance_1 = new lib.CachedBmp_308();
	this.instance_1.setTransform(296.3,57.8,0.5,0.5);

	this.instance_2 = new lib.CachedBmp_303();
	this.instance_2.setTransform(366.2,7.1,0.5,0.5);

	this.instance_3 = new lib.CachedBmp_302();
	this.instance_3.setTransform(352.6,-3.85,0.5,0.5);

	this.instance_4 = new lib.CachedBmp_274();
	this.instance_4.setTransform(289.6,-32.05,0.5,0.5);

	this.instance_5 = new lib.v_video_player();
	this.instance_5.setTransform(373.5,20.1,1,1,0,0,0,83.7,46.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).to({state:[{t:this.instance_5}]},1).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]},1).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]},1).wait(1));

	// Camada_1
	this.instance_6 = new lib.CachedBmp_301();
	this.instance_6.setTransform(91.8,14.65,0.5,0.5);

	this.instance_7 = new lib.CachedBmp_279();
	this.instance_7.setTransform(102,7.55,0.5,0.5);

	this.instance_8 = new lib.CachedBmp_350();
	this.instance_8.setTransform(26.2,-0.5,0.5,0.5);

	this.instance_9 = new lib.CachedBmp_295();
	this.instance_9.setTransform(91.8,14.65,0.5,0.5);

	this.instance_10 = new lib.CachedBmp_282();
	this.instance_10.setTransform(102,7.55,0.5,0.5);

	this.instance_11 = new lib.CachedBmp_293();
	this.instance_11.setTransform(26.2,-0.5,0.5,0.5);

	this.instance_12 = new lib.CachedBmp_298();
	this.instance_12.setTransform(98.65,15.75,0.5,0.5);

	this.instance_13 = new lib.CachedBmp_285();
	this.instance_13.setTransform(107.4,9.15,0.5,0.5);

	this.instance_14 = new lib.CachedBmp_349();
	this.instance_14.setTransform(42.65,2.5,0.5,0.5);

	this.instance_15 = new lib.CachedBmp_288();
	this.instance_15.setTransform(102,7.55,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_8},{t:this.instance_7},{t:this.instance_6}]}).to({state:[{t:this.instance_11},{t:this.instance_10},{t:this.instance_9}]},1).to({state:[{t:this.instance_14},{t:this.instance_13},{t:this.instance_12}]},1).to({state:[{t:this.instance_8},{t:this.instance_15},{t:this.instance_6}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(26.2,-32,431.1,104.2);


// stage content:
(lib.trilha = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	this.actionFrames = [0];
	this.isSingleFrame = false;
	// timeline functions:
	this.frame_0 = function() {
		if(this.isSingleFrame) {
			return;
		}
		if(this.totalFrames == 1) {
			this.isSingleFrame = true;
		}
		this.clearAllSoundStreams();
		 
		var _this = this;
		/*
		Clicar na instância especificada do símbolo executa uma função.
		*/
		_this.b_rep_3.on('click', function(){
		/*
		Carrega o URL em uma nova janela do navegador.
		*/
		window.open('http://www.ibcmed.org', '_blank');
		});
		var _this = this;
		/*
		Clicar na instância especificada do símbolo executa uma função.
		*/
		_this.b_rep_2.on('click', function(){
		/*
		Carrega o URL em uma nova janela do navegador.
		*/
		window.open('http://www.ibcmed.org', '_blank');
		});
		var _this = this;
		/*
		Clicar na instância especificada do símbolo executa uma função.
		*/
		_this.b_rep_1.on('click', function(){
		/*
		Carrega o URL em uma nova janela do navegador.
		*/
		window.open('http://www.ibcmed.org', '_blank');
		});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// bot3
	this.b_rep_3 = new lib.b_reproduzir_1();
	this.b_rep_3.name = "b_rep_3";
	this.b_rep_3.setTransform(238.5,626,1,1,0,0,0,139.1,19.9);
	new cjs.ButtonHelper(this.b_rep_3, 0, 1, 2, false, new lib.b_reproduzir_1(), 3);

	this.instance = new lib.CachedBmp_255();
	this.instance.setTransform(225.7,607.05,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.b_rep_3}]}).wait(1));

	// bot2
	this.b_rep_2 = new lib.b_reproduzir_2();
	this.b_rep_2.name = "b_rep_2";
	this.b_rep_2.setTransform(304.75,357.35);
	new cjs.ButtonHelper(this.b_rep_2, 0, 1, 2, false, new lib.b_reproduzir_2(), 3);

	this.timeline.addTween(cjs.Tween.get(this.b_rep_2).wait(1));

	// bot1
	this.b_rep_1 = new lib.b_reproduzir_1();
	this.b_rep_1.name = "b_rep_1";
	this.b_rep_1.setTransform(238.4,150.8,1,1,0,0,0,139.1,19.9);
	new cjs.ButtonHelper(this.b_rep_1, 0, 1, 2, false, new lib.b_reproduzir_1(), 3);

	this.instance_1 = new lib.CachedBmp_255();
	this.instance_1.setTransform(225.6,131.85,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.b_rep_1}]}).wait(1));

	// trilha
	this.instance_2 = new lib.Interpolação10("synched",0);
	this.instance_2.setTransform(824,197.05,0.0076,1,0,0,0,-72.5,-0.1);

	this.instance_3 = new lib.CachedBmp_265();
	this.instance_3.setTransform(104.05,477.25,0.5,0.5);

	this.instance_4 = new lib.CachedBmp_344();
	this.instance_4.setTransform(67,473.8,0.5,0.5);

	this.instance_5 = new lib.CachedBmp_263();
	this.instance_5.setTransform(392.15,246.35,0.5,0.5);

	this.instance_6 = new lib.CachedBmp_344();
	this.instance_6.setTransform(355.25,242.75,0.5,0.5);

	this.instance_7 = new lib.CachedBmp_261();
	this.instance_7.setTransform(104.25,17.9,0.5,0.5);

	this.instance_8 = new lib.CachedBmp_260();
	this.instance_8.setTransform(66.95,14.15,0.5,0.5);

	this.instance_9 = new lib.CachedBmp_259();
	this.instance_9.setTransform(293.45,496.9,0.5,0.5);

	this.instance_10 = new lib.CachedBmp_258();
	this.instance_10.setTransform(16.5,269.6,0.5,0.5);

	this.instance_11 = new lib.CachedBmp_257();
	this.instance_11.setTransform(293.45,40.3,0.5,0.5);

	this.instance_12 = new lib.CachedBmp_256();
	this.instance_12.setTransform(12.2,728.45,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_12},{t:this.instance_11},{t:this.instance_10},{t:this.instance_9},{t:this.instance_8},{t:this.instance_7},{t:this.instance_6},{t:this.instance_5},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(362.2,464.2,462.90000000000003,407.8);
// library properties:
lib.properties = {
	id: '0AC8F67FA264184E9CCDCCB2FDA33303',
	width: 700,
	height: 900,
	fps: 30,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/trilha_atlas_1.png", id:"trilha_atlas_1"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['0AC8F67FA264184E9CCDCCB2FDA33303'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}			
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;			
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});			
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;			
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused){
			stageChild.syncStreamSounds();
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;