/*
* adapt-keepScrollPosition
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>, Tom Greenfield
*/

define([
    "coreJS/adapt",
    "coreModels/adaptModel"
], function (Adapt, AdaptModel) {

    if (!AdaptModel.prototype.getParents) {

        AdaptModel.prototype.getParents = function (shouldIncludeChild) {
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
            "a", "an", "and", "are", "as", "at", "be", "by", "for",
            "from", "has", "he", "in", "is", "it", "its", "of", "on",
            "that", "the", "to", "was", "were", "will", "wish", "",
        ],

        _matchOn: {
            _contentWordBeginsPhraseWord: false,
            _contentWordContainsPhraseWord: false,
            _contentWordEqualsPhraseWord: true,
            _phraseWordBeginsContentWord: true
        },

        _scoreQualificationThreshold: 20,
        _minimumWordLength: 2,
        _frequencyImportance: 5

    };

    var wordCharacters = [
        '\u0041-\u005A',
        '\u0030-\u0039',
        '\u0061-\u007A',
        '\u00AA',
        '\u00B5',
        '\u00BA',
        '\u00C0-\u00D6',
        '\u00D8-\u00F6',
        '\u00F8-\u02C1',
        '\u02C6-\u02D1',
        '\u02E0-\u02E4',
        '\u02EC',
        '\u02EE',
        '\u0370-\u0374',
        '\u0376',
        '\u0377',
        '\u037A-\u037D',
        '\u0386',
        '\u0388-\u038A',
        '\u038C',
        '\u038E-\u03A1',
        '\u03A3-\u03F5',
        '\u03F7-\u0481',
        '\u048A-\u0527',
        '\u0531-\u0556',
        '\u0559',
        '\u0561-\u0587',
        '\u05D0-\u05EA',
        '\u05F0-\u05F2',
        '\u0620-\u064A',
        '\u066E',
        '\u066F',
        '\u0671-\u06D3',
        '\u06D5',
        '\u06E5',
        '\u06E6',
        '\u06EE',
        '\u06EF',
        '\u06FA-\u06FC',
        '\u06FF',
        '\u0710',
        '\u0712-\u072F',
        '\u074D-\u07A5',
        '\u07B1',
        '\u07CA-\u07EA',
        '\u07F4',
        '\u07F5',
        '\u07FA',
        '\u0800-\u0815',
        '\u081A',
        '\u0824',
        '\u0828',
        '\u0840-\u0858',
        '\u08A0',
        '\u08A2-\u08AC',
        '\u0904-\u0939',
        '\u093D',
        '\u0950',
        '\u0958-\u0961',
        '\u0971-\u0977',
        '\u0979-\u097F',
        '\u0985-\u098C',
        '\u098F',
        '\u0990',
        '\u0993-\u09A8',
        '\u09AA-\u09B0',
        '\u09B2',
        '\u09B6-\u09B9',
        '\u09BD',
        '\u09CE',
        '\u09DC',
        '\u09DD',
        '\u09DF-\u09E1',
        '\u09F0',
        '\u09F1',
        '\u0A05-\u0A0A',
        '\u0A0F',
        '\u0A10',
        '\u0A13-\u0A28',
        '\u0A2A-\u0A30',
        '\u0A32',
        '\u0A33',
        '\u0A35',
        '\u0A36',
        '\u0A38',
        '\u0A39',
        '\u0A59-\u0A5C',
        '\u0A5E',
        '\u0A72-\u0A74',
        '\u0A85-\u0A8D',
        '\u0A8F-\u0A91',
        '\u0A93-\u0AA8',
        '\u0AAA-\u0AB0',
        '\u0AB2',
        '\u0AB3',
        '\u0AB5-\u0AB9',
        '\u0ABD',
        '\u0AD0',
        '\u0AE0',
        '\u0AE1',
        '\u0B05-\u0B0C',
        '\u0B0F',
        '\u0B10',
        '\u0B13-\u0B28',
        '\u0B2A-\u0B30',
        '\u0B32',
        '\u0B33',
        '\u0B35-\u0B39',
        '\u0B3D',
        '\u0B5C',
        '\u0B5D',
        '\u0B5F-\u0B61',
        '\u0B71',
        '\u0B83',
        '\u0B85-\u0B8A',
        '\u0B8E-\u0B90',
        '\u0B92-\u0B95',
        '\u0B99',
        '\u0B9A',
        '\u0B9C',
        '\u0B9E',
        '\u0B9F',
        '\u0BA3',
        '\u0BA4',
        '\u0BA8-\u0BAA',
        '\u0BAE-\u0BB9',
        '\u0BD0',
        '\u0C05-\u0C0C',
        '\u0C0E-\u0C10',
        '\u0C12-\u0C28',
        '\u0C2A-\u0C33',
        '\u0C35-\u0C39',
        '\u0C3D',
        '\u0C58',
        '\u0C59',
        '\u0C60',
        '\u0C61',
        '\u0C85-\u0C8C',
        '\u0C8E-\u0C90',
        '\u0C92-\u0CA8',
        '\u0CAA-\u0CB3',
        '\u0CB5-\u0CB9',
        '\u0CBD',
        '\u0CDE',
        '\u0CE0',
        '\u0CE1',
        '\u0CF1',
        '\u0CF2',
        '\u0D05-\u0D0C',
        '\u0D0E-\u0D10',
        '\u0D12-\u0D3A',
        '\u0D3D',
        '\u0D4E',
        '\u0D60',
        '\u0D61',
        '\u0D7A-\u0D7F',
        '\u0D85-\u0D96',
        '\u0D9A-\u0DB1',
        '\u0DB3-\u0DBB',
        '\u0DBD',
        '\u0DC0-\u0DC6',
        '\u0E01-\u0E30',
        '\u0E32',
        '\u0E33',
        '\u0E40-\u0E46',
        '\u0E81',
        '\u0E82',
        '\u0E84',
        '\u0E87',
        '\u0E88',
        '\u0E8A',
        '\u0E8D',
        '\u0E94-\u0E97',
        '\u0E99-\u0E9F',
        '\u0EA1-\u0EA3',
        '\u0EA5',
        '\u0EA7',
        '\u0EAA',
        '\u0EAB',
        '\u0EAD-\u0EB0',
        '\u0EB2',
        '\u0EB3',
        '\u0EBD',
        '\u0EC0-\u0EC4',
        '\u0EC6',
        '\u0EDC-\u0EDF',
        '\u0F00',
        '\u0F40-\u0F47',
        '\u0F49-\u0F6C',
        '\u0F88-\u0F8C',
        '\u1000-\u102A',
        '\u103F',
        '\u1050-\u1055',
        '\u105A-\u105D',
        '\u1061',
        '\u1065',
        '\u1066',
        '\u106E-\u1070',
        '\u1075-\u1081',
        '\u108E',
        '\u10A0-\u10C5',
        '\u10C7',
        '\u10CD',
        '\u10D0-\u10FA',
        '\u10FC-\u1248',
        '\u124A-\u124D',
        '\u1250-\u1256',
        '\u1258',
        '\u125A-\u125D',
        '\u1260-\u1288',
        '\u128A-\u128D',
        '\u1290-\u12B0',
        '\u12B2-\u12B5',
        '\u12B8-\u12BE',
        '\u12C0',
        '\u12C2-\u12C5',
        '\u12C8-\u12D6',
        '\u12D8-\u1310',
        '\u1312-\u1315',
        '\u1318-\u135A',
        '\u1380-\u138F',
        '\u13A0-\u13F4',
        '\u1401-\u166C',
        '\u166F-\u167F',
        '\u1681-\u169A',
        '\u16A0-\u16EA',
        '\u1700-\u170C',
        '\u170E-\u1711',
        '\u1720-\u1731',
        '\u1740-\u1751',
        '\u1760-\u176C',
        '\u176E-\u1770',
        '\u1780-\u17B3',
        '\u17D7',
        '\u17DC',
        '\u1820-\u1877',
        '\u1880-\u18A8',
        '\u18AA',
        '\u18B0-\u18F5',
        '\u1900-\u191C',
        '\u1950-\u196D',
        '\u1970-\u1974',
        '\u1980-\u19AB',
        '\u19C1-\u19C7',
        '\u1A00-\u1A16',
        '\u1A20-\u1A54',
        '\u1AA7',
        '\u1B05-\u1B33',
        '\u1B45-\u1B4B',
        '\u1B83-\u1BA0',
        '\u1BAE',
        '\u1BAF',
        '\u1BBA-\u1BE5',
        '\u1C00-\u1C23',
        '\u1C4D-\u1C4F',
        '\u1C5A-\u1C7D',
        '\u1CE9-\u1CEC',
        '\u1CEE-\u1CF1',
        '\u1CF5',
        '\u1CF6',
        '\u1D00-\u1DBF',
        '\u1E00-\u1F15',
        '\u1F18-\u1F1D',
        '\u1F20-\u1F45',
        '\u1F48-\u1F4D',
        '\u1F50-\u1F57',
        '\u1F59',
        '\u1F5B',
        '\u1F5D',
        '\u1F5F-\u1F7D',
        '\u1F80-\u1FB4',
        '\u1FB6-\u1FBC',
        '\u1FBE',
        '\u1FC2-\u1FC4',
        '\u1FC6-\u1FCC',
        '\u1FD0-\u1FD3',
        '\u1FD6-\u1FDB',
        '\u1FE0-\u1FEC',
        '\u1FF2-\u1FF4',
        '\u1FF6-\u1FFC',
        '\u2071',
        '\u207F',
        '\u2090-\u209C',
        '\u2102',
        '\u2107',
        '\u210A-\u2113',
        '\u2115',
        '\u2119-\u211D',
        '\u2124',
        '\u2126',
        '\u2128',
        '\u212A-\u212D',
        '\u212F-\u2139',
        '\u213C-\u213F',
        '\u2145-\u2149',
        '\u214E',
        '\u2183',
        '\u2184',
        '\u2C00-\u2C2E',
        '\u2C30-\u2C5E',
        '\u2C60-\u2CE4',
        '\u2CEB-\u2CEE',
        '\u2CF2',
        '\u2CF3',
        '\u2D00-\u2D25',
        '\u2D27',
        '\u2D2D',
        '\u2D30-\u2D67',
        '\u2D6F',
        '\u2D80-\u2D96',
        '\u2DA0-\u2DA6',
        '\u2DA8-\u2DAE',
        '\u2DB0-\u2DB6',
        '\u2DB8-\u2DBE',
        '\u2DC0-\u2DC6',
        '\u2DC8-\u2DCE',
        '\u2DD0-\u2DD6',
        '\u2DD8-\u2DDE',
        '\u2E2F',
        '\u3005',
        '\u3006',
        '\u3031-\u3035',
        '\u303B',
        '\u303C',
        '\u3041-\u3096',
        '\u309D-\u309F',
        '\u30A1-\u30FA',
        '\u30FC-\u30FF',
        '\u3105-\u312D',
        '\u3131-\u318E',
        '\u31A0-\u31BA',
        '\u31F0-\u31FF',
        '\u3400-\u4DB5',
        '\u4E00-\u9FCC',
        '\uA000-\uA48C',
        '\uA4D0-\uA4FD',
        '\uA500-\uA60C',
        '\uA610-\uA61F',
        '\uA62A',
        '\uA62B',
        '\uA640-\uA66E',
        '\uA67F-\uA697',
        '\uA6A0-\uA6E5',
        '\uA717-\uA71F',
        '\uA722-\uA788',
        '\uA78B-\uA78E',
        '\uA790-\uA793',
        '\uA7A0-\uA7AA',
        '\uA7F8-\uA801',
        '\uA803-\uA805',
        '\uA807-\uA80A',
        '\uA80C-\uA822',
        '\uA840-\uA873',
        '\uA882-\uA8B3',
        '\uA8F2-\uA8F7',
        '\uA8FB',
        '\uA90A-\uA925',
        '\uA930-\uA946',
        '\uA960-\uA97C',
        '\uA984-\uA9B2',
        '\uA9CF',
        '\uAA00-\uAA28',
        '\uAA40-\uAA42',
        '\uAA44-\uAA4B',
        '\uAA60-\uAA76',
        '\uAA7A',
        '\uAA80-\uAAAF',
        '\uAAB1',
        '\uAAB5',
        '\uAAB6',
        '\uAAB9-\uAABD',
        '\uAAC0',
        '\uAAC2',
        '\uAADB-\uAADD',
        '\uAAE0-\uAAEA',
        '\uAAF2-\uAAF4',
        '\uAB01-\uAB06',
        '\uAB09-\uAB0E',
        '\uAB11-\uAB16',
        '\uAB20-\uAB26',
        '\uAB28-\uAB2E',
        '\uABC0-\uABE2',
        '\uAC00-\uD7A3',
        '\uD7B0-\uD7C6',
        '\uD7CB-\uD7FB',
        '\uF900-\uFA6D',
        '\uFA70-\uFAD9',
        '\uFB00-\uFB06',
        '\uFB13-\uFB17',
        '\uFB1D',
        '\uFB1F-\uFB28',
        '\uFB2A-\uFB36',
        '\uFB38-\uFB3C',
        '\uFB3E',
        '\uFB40',
        '\uFB41',
        '\uFB43',
        '\uFB44',
        '\uFB46-\uFBB1',
        '\uFBD3-\uFD3D',
        '\uFD50-\uFD8F',
        '\uFD92-\uFDC7',
        '\uFDF0-\uFDFB',
        '\uFE70-\uFE74',
        '\uFE76-\uFEFC',
        '\uFF21-\uFF3A',
        '\uFF41-\uFF5A',
        '\uFF66-\uFFBE',
        '\uFFC2-\uFFC7',
        '\uFFCA-\uFFCF',
        '\uFFD2-\uFFD7',
        '\uFFDA-\uFFDC'
    ];

    wordCharacters = wordCharacters.join('');

    var search = _.extend({

        model: null,

        _searchableModels: null,
        _wordIndex: null,

        _regularExpressions: {
            matchNotWordBoundaries: new RegExp("[" + wordCharacters + "]+", "g"),
            trimReplaceNonWordCharacters: new RegExp("^([^" + wordCharacters + "])+|([^" + wordCharacters + "])+$", "g"),
            trimReplaceWhitespace: /^\s+|\s+$/g,
            escapeRegExp: function (str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            }
        },

        initialize: function () {
            this.setupListeners();
        },

        setupListeners: function () {
            this.listenTo(Adapt, {
                "app:dataReady": this.onDataReady,
                "app:languageChanged": this.clearSearchResults
            });
        },

        clearSearchResults: function () {
            Adapt.trigger("search:filterTerms", "");
        },

        onDataReady: function () {
            var config = Adapt.course.get("_search");
            if (!config || config._isEnabled === false) return;

            this.setupConfig();
            this._searchableModels = this.collectModelTexts();
            this.makeModelTextProfiles();
            this.indexTextProfiles();
            Adapt.trigger("search-algorithm:ready");
        },

        setupConfig: function () {
            var model = Adapt.course.get("_search") || {};
            //make sure defaults are injected, but original model reference is maintained
            var modelWithDefaults = _.extend(searchDefaults, model);

            Adapt.course.set("_search", modelWithDefaults);

            this.model = new Backbone.Model(modelWithDefaults);

        },

        collectModelTexts: function () {

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

                var filtered = _.filter(rtn, function (model) {
                    var type = model.get("_type"),
                        displayTitle,
                        title;
                    if (_.contains(hideTypes, type)) return false;

                    if (type == "component") {
                        var component = model.get("_component");
                        if (_.contains(hideComponents, component)) return false;
                    }

                    if (model.has("displayTitle")) displayTitle = model.get("displayTitle").replace(regularExpressions.trimReplaceWhitespace, "");
                    if (model.has("title")) title = model.get("title").replace(regularExpressions.trimReplaceWhitespace, "");

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
                if (config && config._isEnabled === false) return false;

                var firstDisabledTrailItem = trail.find(function (item) {
                    var config = item.get("_search");
                    if (!config) return false;
                    if (config && config._isEnabled !== false) return false;
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
                    var text = $("<div>" + string.replace(regularExpressions.trimReplaceWhitespace, "") + "</div>").text();
                    text = text.replace(regularExpressions.trimReplaceWhitespace, "");
                    if (!text) return;
                    texts.push({
                        score: 1 / textLevel,
                        text: text,
                        searchAttribute: attributeObject
                    });
                }
            }

            return getSearchableModels();

        },

        makeModelTextProfiles: function () {
            // Handle _ignoreWords as a special case to support the authoring tool
            var ignoreWords = this.model.get('_ignoreWords') instanceof Array
                ? this.model.get("_ignoreWords")
                : this.model.get("_ignoreWords").split(',');

            var regularExpressions = this._regularExpressions;
            var searchAttributes = this.model.get("_searchAttributes");
            var minimumWordLength = this.model.get("_minimumWordLength");

            var scores = _.uniq(_.pluck(searchAttributes, "_level"));
            scores = _.map(scores, function (l) { return 1 / l; });

            for (var i = 0, l = this._searchableModels.models.length; i < l; i++) {
                var item = this._searchableModels.models[i];
                var profile = item.get("_searchProfile");
                makeModelPhraseProfile(profile);
                makeModelPhraseWordAndWordProfile(profile);
            }

            function makeModelPhraseProfile(profile) {
                profile._phrases = [];
                var phrases = _.groupBy(profile._raw, function (phrase) {
                    return phrase.text;
                });
                for (var p in phrases) {
                    var bestItem = _.max(phrases[p], function (item) {
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
                        var words = _.map(chunks, function (chunk) {
                            return chunk.replace(regularExpressions.trimReplaceNonWordCharacters, "");
                        });
                        phraseObject.words = _.countBy(words, function (word) { return word.toLowerCase(); });
                        phraseObject.words = _.omit(phraseObject.words, ignoreWords);
                        scoreWords = scoreWords.concat(words);
                    }
                    scoreWords = _.filter(scoreWords, function (word) { return word.length >= minimumWordLength; });
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

        indexTextProfiles: function () {

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

        find: function (findPhrase) {

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
            var ignoreWords = this.model.get('_ignoreWords') instanceof Array
                ? this.model.get("_ignoreWords")
                : this.model.get("_ignoreWords").split(',');
            var scoreQualificationThreshold = this.model.get("_scoreQualificationThreshold");
            var minimumWordLength = this.model.get("_minimumWordLength");
            var frequencyImportance = this.model.get("_frequencyImportance");
            var matchOn = this.model.get("_matchOn") || {};

            var json = this._searchableModels.toJSON();

            function getFindPhraseWords(findPhrase) {
                var findChunks = findPhrase.match(regularExpressions.matchNotWordBoundaries);
                var findWords = _.map(findChunks, function (chunk) {
                    return chunk.replace(regularExpressions.trimReplaceNonWordCharacters, "");
                });
                findWords = _.countBy(findWords, function (word) { return word.toLowerCase(); });
                findWords = _.omit(findWords, ignoreWords);
                findWords = _.omit(findWords, function (count, item) {
                    return item.length < minimumWordLength;
                });
                return findWords;
            }

            function getMatchingIdScoreObjects(findWords) {
                var matchingIdScoreObjects = {};

                for (var findWord in findWords) {
                    for (var indexWord in wordIndex) {
                        //allow only start matches on findWord beginning with indexWord i.e. find: oneness begins with index: one 
                        var rIndexWordBegins = new RegExp("^" + regularExpressions.escapeRegExp(indexWord), "g");
                        //allow all matches on indexWord containing findWord i.e. index: someone contains find: one, index: anti-money contains find: money
                        var rFindWordContains = new RegExp(regularExpressions.escapeRegExp(findWord), "g");
                        //allow only start matches on indexWord beginning with findWord i.e. find: one begins index: oneness
                        var rFindWordBegins = new RegExp("^" + regularExpressions.escapeRegExp(findWord), "g");

                        var isIndexBeginsMatch = matchOn._contentWordBeginsPhraseWord === false ? false : rIndexWordBegins.test(findWord);
                        var isFindContainsMatch = matchOn._contentWordContainsPhraseWord === false ? false : rFindWordContains.test(indexWord);
                        var isFindBeginsMatch = matchOn._phraseWordBeginsContentWord === false ? false : rFindWordBegins.test(indexWord);

                        var isFullMatch = matchOn._contentWordEqualsPhraseWord == false ? false : findWord == indexWord;
                        var isPartMatch = isIndexBeginsMatch || isFindContainsMatch || isFindBeginsMatch;

                        if (!isFullMatch && !isPartMatch) continue;

                        var partMatchRatio = 1;
                        if (isPartMatch && !isFullMatch) {
                            if (findWord.length > indexWord.length) partMatchRatio = indexWord.length / findWord.length;
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
                    var model = _.findWhere(json, { _id: id });

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
                    var wordFrequency = _.reduce(allPhraseWordRatingObjects, function (memo, item) { return memo + item.count; }, 0);
                    var wordFrequencyHitScore = _.reduce(allPhraseWordRatingObjects, function (memo, item) {
                        var frequencyBonus = (item.score * item.count) / frequencyImportance;
                        return memo + item.score + frequencyBonus;
                    }, 0);

                    matchingIdScoreObjects[id].foundWords[word] += wordFrequency;

                    if (isFullMatch) {
                        matchingIdScoreObjects[id].score += wordFrequencyHitScore;
                    } else {
                        matchingIdScoreObjects[id].score += wordFrequencyHitScore * partMatchRatio;
                    }
                }
            }

            function filterAndSortQualifyingMatches(matchingIdScoreObjects) {
                var allowedScoreObjects = _.filter(matchingIdScoreObjects, function (item) {
                    return isModelSearchable(item.model);
                });
                var qualifyingScoreThreshold = 1 / scoreQualificationThreshold;
                var qualifyingMatches = _.filter(allowedScoreObjects, function (item) {
                    //remove items which don't meet the score threshold
                    return item.score >= qualifyingScoreThreshold;
                });
                qualifyingMatches = _.sortBy(qualifyingMatches, function (item) {
                    //sort by highest score first
                    return 1 / item.score;
                });
                return qualifyingMatches;
            }

            function isModelSearchable(model) {
                var trail = model.getParents(true);
                var config = model.get("_search");
                if (config && config._isEnabled === false) return false;
                if (model.get("_isLocked")) return false;

                var firstDisabledTrailItem = trail.find(function (item) {
                    var config = item.get("_search");
                    if (item.get("_isLocked")) return true;
                    if (config && config._isEnabled === false) return true;
                    return false;
                });


                return (firstDisabledTrailItem === undefined);
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
