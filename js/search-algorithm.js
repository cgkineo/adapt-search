/*
* adapt-keepScrollPosition
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>, Tom Greenfield
*/

define([ 
	"coreJS/adapt",
	"coreModels/adaptModel"
], function(Adapt, AdaptModel) {

	if (!AdaptModel.prototype.getParents) {

		AdaptModel.prototype.getParents = function(shouldIncludeChild) {
		    var parents = [];
		    var context = this;

		    if (shouldIncludeChild) parents.push(context);

		    while (context.has("_parentId")) {
		        context = context.getParent();
		        parents.push(context);
		    }

		    return parents.length ? new Backbone.Collection(parents) : null;
		}

	}

	var searchDefaults = { //override in course.json "_search": {}

		_searchAttributes: [
			{
				"_attributeName": "_search",
				"_level": 1,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "_keywords",
				"_level": 1,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "keywords",
				"_level": 1,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "displayTitle",
				"_level": 2,
				"_allowTextPreview": true
			},
			{
				"_attributeName": "title",
				"_level": 2,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "body",
				"_level": 3,
				"_allowTextPreview": true
			},
			{
				"_attributeName": "alt",
				"_level": 4,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "_alt",
				"_level": 4,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "_items",
				"_level": 5,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "items",
				"_level": 5,
				"_allowTextPreview": false
			},
			{
				"_attributeName": "text",
				"_level": 5,
				"_allowTextPreview": true
			}
		],

		_hideComponents: [
			"blank"
		],

		_hideTypes: [

		],

		_ignoreWords: [
			"a","an","and","are","as","at","be","by","for",
			"from","has","he","in","is","it","its","of","on",
			"that","the","to","was","were","will","wish","",
		],

		_wordBoundaryCharacters: [ " ", ".", ":" ],

		_scoreQualificationThreshold: 20,
		_minimumWordLength: 2,
		_frequencyImportance: 5

	};


	var search = _.extend({

		model: null,

		_searchableModels: null,
		_wordIndex: null,

		_regularExpressions: {
			matchNotWordBoundaries: /[^\ \.\:]+/g,
			trimReplaceNonWordCharacters: /^\W+|\W+$/g,
			trimReplaceWhitespace: /^\s+|\s+$/g,
			escapeRegExp: function (str) {
			  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			}
		},

		initialize: function() {
			this.setupListeners();
		},

		setupListeners: function() {
			this.listenToOnce(Adapt, "app:dataReady", this.onDataReady);
		},

		onDataReady: function() {
			this.setupConfig();
			this._searchableModels = this.collectModelTexts();
			this.makeModelTextProfiles();
			this.indexTextProfiles();
			Adapt.trigger("search-algorithm:ready");
		},

		setupConfig: function() {
			var model = Adapt.course.get("_search") || {};
			//make sure defaults are injected, but original model reference is maintained
			var modelWithDefaults = _.extend(searchDefaults, model);

			Adapt.course.set("_search", modelWithDefaults);

			this.model = new Backbone.Model(modelWithDefaults);

			var wordBoundaryCharacters = this.model.get("_wordBoundaryCharacters");
			this._regularExpressions.matchNotWordBoundaries = new RegExp( '[^\\' + wordBoundaryCharacters.join('\\') + ']+', 'g' );

		},

		collectModelTexts: function() {

			var searchAttributes = this.model.get("_searchAttributes");
			var hideComponents = this.model.get("_hideComponents");
			var hideTypes = this.model.get("_hideTypes");
			var regularExpressions = this._regularExpressions;


			function combineAdaptModels() {
				var rtn = []
					.concat(Adapt.contentObjects.models)
					.concat(Adapt.articles.models)
					.concat(Adapt.blocks.models)
					.concat(Adapt.components.models);

				var filtered = _.filter(rtn, function(model) {
					var type = model.get("_type");
					if (_.contains(hideTypes, component)) return false;

					if (type == "component") {
						var component = model.get("_component");
						if (_.contains(hideComponents, component)) return false;
					}

					var displayTitle = model.get("displayTitle").replace(regularExpressions.trimReplaceWhitespace, "");
					var title = model.get("title").replace(regularExpressions.trimReplaceWhitespace, "");

					if (!displayTitle && !title) return false;

					return true;
				});

				return filtered;
			}

			function getSearchableModels() {
				var adaptModels = combineAdaptModels();

				var searchable = [];
				for (var i = 0, l = adaptModels.length; i < l; i++) {
					var model = adaptModels[i];
					if (!isModelSearchable(model)) continue;
					var json = model.toJSON();
					var searchProfile = {
						"_raw": recursivelyCollectModelTexts(json)
					};
					model.set("_searchProfile", searchProfile)
					searchable.push(model);
				}

				return new Backbone.Collection(searchable);
			}

			function isModelSearchable(model) {
				var trail = model.getParents(true);
				var config = model.get("_search");
				if (config && config._isDisabled) return false;

				var firstDisabledTrailItem = trail.find(function(item) {
					var config = item.get("_search");
					if (!config) return false;
					if (config && !config._isDisabled) return false;
					return true;
				});
				return firstDisabledTrailItem === undefined;
			}

			function recursivelyCollectModelTexts(json, level) {
				var texts = [];
				for (var i = 0, l = searchAttributes.length; i < l; i++) {
					var attributeObject = searchAttributes[i];
					if (!json[attributeObject._attributeName]) continue;
					switch (typeof json[attributeObject._attributeName]) {
					case "object":
						if (json[attributeObject._attributeName] instanceof Array) {
							for (var sa = 0, sal = json[attributeObject._attributeName].length; sa < sal; sa++) {
								switch (typeof json[attributeObject._attributeName][sa]) {
								case "object":
									texts = texts.concat(recursivelyCollectModelTexts(json[attributeObject._attributeName][sa], attributeObject._level));		
									break;
								case "string":
									addString(json[attributeObject._attributeName][sa], attributeObject._level, attributeObject);
								}
							}
						} else {
							texts = texts.concat(recursivelyCollectModelTexts(json[attributeObject._attributeName], attributeObject._level));
						}
						break;
					case "string":
						addString(json[attributeObject._attributeName], level, attributeObject);
						break;
					}
				}
				return texts;

				function addString(string, level, attributeObject) {
					var textLevel = level || attributeObject._level;
					var text = $("<div>"+string.replace(regularExpressions.trimReplaceWhitespace, "")+"</div>").text();
					text = text.replace(regularExpressions.trimReplaceWhitespace,"");
					if (!text) return;
					texts.push({
						score: 1/textLevel,
						text: text,
						searchAttribute: attributeObject
					});
				}
			}

			return getSearchableModels();

		},

		makeModelTextProfiles: function() {
      		// Handle _ignoreWords as a special case to support the authoring tool
      		var ignoreWords = Object.prototype.toString.call(this.model.get('_ignoreWords')) == "[object Array]" 
        		? this.model.get("_ignoreWords")
        		: this.model.get("_ignoreWords").split(',');
        
			var regularExpressions = this._regularExpressions;
			var searchAttributes = this.model.get("_searchAttributes");
			var minimumWordLength = this.model.get("_minimumWordLength");

			var scores = _.uniq(_.pluck(searchAttributes, "_level"));
			scores = _.map(scores, function(l) { return 1/l; });

			for (var i = 0, l = this._searchableModels.models.length; i < l; i++) {
				var item = this._searchableModels.models[i];
				var profile = item.get("_searchProfile");
				makeModelPhraseProfile(profile);
				makeModelPhraseWordAndWordProfile(profile);
			}

			function makeModelPhraseProfile(profile) {
				profile._phrases = [];
				var phrases = _.groupBy(profile._raw, function(phrase) {
					return phrase.text;
				});
				for (var p in phrases) {
					var bestItem = _.max(phrases[p], function(item) {
						return item.score;
					});
					profile._phrases.push({
						searchAttribute: bestItem.searchAttribute,
						phrase: bestItem.text,
						score: bestItem.score,
						words: []
					});
				}
				return profile;
			}

			function makeModelPhraseWordAndWordProfile(profile) {
				profile._words = [];
				for (var l = 0, ll = scores.length; l < ll; l++) {
					var score = scores[l];
					var phrases = _.where(profile._phrases, { score: score });
					var scoreWords = [];
					for (var i = 0, pl = phrases.length; i < pl; i++) {
						var phraseObject = phrases[i];
						var chunks = phraseObject.phrase.match(regularExpressions.matchNotWordBoundaries);
						var words = _.map(chunks, function(chunk) {
							return chunk.replace(regularExpressions.trimReplaceNonWordCharacters, "");
						});
						phraseObject.words = _.countBy(words, function (word) { return word.toLowerCase(); });
						phraseObject.words = _.omit(phraseObject.words, ignoreWords);
						scoreWords = scoreWords.concat(words);
					}
					scoreWords = _.filter(scoreWords, function(word) { return word.length >= minimumWordLength; });
					scoreWords = _.countBy(scoreWords, function (word) { return word.toLowerCase(); });
					scoreWords = _.omit(scoreWords, ignoreWords);
					for (var word in scoreWords) {
						profile._words.push({
							word: word,
							score: score,
							count: scoreWords[word]
						});
					}
				}
				return profile;
			}

		},

		indexTextProfiles: function() {

			this._wordIndex = {};

			for (var i = 0, il = this._searchableModels.models.length; i < il; i++) {
				var item = this._searchableModels.models[i];
				var id = item.get("_id");
				var searchProfile = item.get("_searchProfile");

				for (var w = 0, wl = searchProfile._words.length; w < wl; w++) {
					var word = searchProfile._words[w].word;
					if (Object.prototype.hasOwnProperty && !this._wordIndex.hasOwnProperty(word)) {
						this._wordIndex[word] = [];
					} else {
						this._wordIndex[word] = this._wordIndex[word] || [];
					}
					this._wordIndex[word].push(id);
				}
				
			}

			for (var word in this._wordIndex) {
				this._wordIndex[word] = _.uniq(this._wordIndex[word]);
			}

		},

		find: function(findPhrase) {

			/*
			returns [
					{
						score: (float)score     = bestPhraseAttributeScore * (wordOccurencesInSection * frequencyMultiplier)
						model: model,
						foundWords: {
							"foundWord": (int)occurencesInSection
						},
						foundPhrases: [
							{
								"score": (float)score   = (1/attributeLevel)
								"phrase": "Test phrase",
								"words": {
									"Test": (int)occurencesInPhrase,
									"phrase": (int)occurencesInPhrase
								}
							}
						]
					}
				];
			*/

			var regularExpressions = this._regularExpressions;
			var wordIndex = this._wordIndex;
      		// Handle _ignoreWords as a special case to support the authoring tool
      		var ignoreWords = Object.prototype.toString.call(this.model.get('_ignoreWords')) == "[object Array]" 
        		? this.model.get("_ignoreWords")
        		: this.model.get("_ignoreWords").split(',');
			var scoreQualificationThreshold = this.model.get("_scoreQualificationThreshold");
			var minimumWordLength = this.model.get("_minimumWordLength");
			var frequencyImportance = this.model.get("_frequencyImportance");

			var json = this._searchableModels.toJSON();

			function getFindPhraseWords(findPhrase) {
				var findChunks = findPhrase.match(regularExpressions.matchNotWordBoundaries);
				var findWords = _.map(findChunks, function(chunk) {
					return chunk.replace(regularExpressions.trimReplaceNonWordCharacters,"");
				});
				findWords = _.countBy(findWords, function(word){ return word.toLowerCase(); });
				findWords = _.omit(findWords, ignoreWords);
				findWords = _.omit(findWords, function(count, item) {
					return item.length < minimumWordLength;
				});
				return findWords;
			}

			function getMatchingIdScoreObjects(findWords) {
				var matchingIdScoreObjects = {};
 
				for (var findWord in findWords) {
					for (var indexWord in wordIndex) {
						//allow only start matches on findWord beginning with indexWord i.e. find: oneness begins with index: one 
						var rIndexWord = new RegExp("^"+regularExpressions.escapeRegExp(indexWord),"g");
						//allow all matches on indexWord containing findWord i.e. index: someone contains find: one, index: anti-money contains find: money
						var rFindWord = new RegExp(regularExpressions.escapeRegExp(findWord),"g");

						var isIndexMatch = rIndexWord.test(findWord);
						var isFindMatch = rFindWord.test(indexWord);

						var isFullMatch = findWord == indexWord;
						var isPartMatch = isIndexMatch || isFindMatch;

						if (!isFullMatch && !isPartMatch) continue;

						var partMatchRatio = 1;
						if (isPartMatch && !isFullMatch) {
							if (findWord.length > indexWord.length) partMatchRatio = indexWord.length/findWord.length;
							else partMatchRatio = findWord.length / indexWord.length
						}

						updateIdScoreObjectsForWord(matchingIdScoreObjects, indexWord, isFullMatch, partMatchRatio);
						
					}
				}
				return _.values(matchingIdScoreObjects);
			}

			function updateIdScoreObjectsForWord(matchingIdScoreObjects, word, isFullMatch, partMatchRatio) {

				for (var i = 0, l = wordIndex[word].length; i < l; i++) {
					var id = wordIndex[word][i];
					var model = _.findWhere(json, {_id: id});
					
					if (matchingIdScoreObjects[id] === undefined) {
						matchingIdScoreObjects[id] = {
							score: 0,
							foundWords: {},
							foundPhrases: null,
							model: Adapt.findById(id)
						};
					}

					if (matchingIdScoreObjects[id].foundWords[word] === undefined) matchingIdScoreObjects[id].foundWords[word] = 0;

					var allPhraseWordRatingObjects = _.where(model._searchProfile._words, { word: word });
					var wordFrequency = _.reduce(allPhraseWordRatingObjects, function(memo, item) { return memo + item.count; }, 0);
					var wordFrequencyHitScore = _.reduce(allPhraseWordRatingObjects, function(memo, item) { 
						var frequencyBonus = (item.score * item.count) / frequencyImportance;
						return memo + item.score + frequencyBonus;
					}, 0);

					matchingIdScoreObjects[id].foundWords[word]+=wordFrequency;

					if (isFullMatch) {
						matchingIdScoreObjects[id].score += wordFrequencyHitScore;
					} else {
						matchingIdScoreObjects[id].score += wordFrequencyHitScore * partMatchRatio;
					}
				}
			}

			function filterAndSortQualifyingMatches(matchingIdScoreObjects) {
				var qualifyingScoreThreshold = 1/scoreQualificationThreshold;
				var qualifyingMatches = _.filter(matchingIdScoreObjects, function(item) {
					//remove items which don't meet the score threshold
					return item.score >= qualifyingScoreThreshold;
				});
				qualifyingMatches = _.sortBy(qualifyingMatches, function(item) {
					//sort by highest score first
					return 1 / item.score;
				});
				return qualifyingMatches;
			}

			function mapSearchPhrasesToMatchingWords(matchingIdScoreObjects) {
				for (var i = 0, l = matchingIdScoreObjects.length; i < l; i++) {
					var matchingPhrases = [];
					var scoreObject = matchingIdScoreObjects[i];
					var foundWords = _.keys(scoreObject.foundWords);
					var modelPhrases = scoreObject.model.get("_searchProfile")._phrases;
					for (var p = 0, lp = modelPhrases.length; p < lp; p++) {
						var modelPhrase = modelPhrases[p];
						if (!modelPhrase.searchAttribute._allowTextPreview) continue;

						if (_.intersection(foundWords, _.keys(modelPhrase.words)).length > 0) {
							matchingPhrases.push(modelPhrase);
						}
					}
					scoreObject.foundPhrases = matchingPhrases;
				}
			}

			var findWords = getFindPhraseWords(findPhrase);
			var matchingIdScoreObjects = getMatchingIdScoreObjects(findWords);
			mapSearchPhrasesToMatchingWords(matchingIdScoreObjects);
			var qualifyingMatchedScoreObjects = filterAndSortQualifyingMatches(matchingIdScoreObjects);
						
			return qualifyingMatchedScoreObjects;
		}

	}, Backbone.Events);


	search.initialize();	

	window.search = search;

	return search;


});