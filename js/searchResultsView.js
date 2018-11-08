define(function(require){
    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');
    var SearchAlgorithm = require('./search-algorithm');

    var replaceTagsRegEx = /\<{1}[^\>]+\>/g;
    var replaceEndTagsRegEx = /\<{1}\/{1}[^\>]+\>/g;
        
    var SearchResultsView = Backbone.View.extend({

        className : 'search-results inactive',
        
        initialize: function(options) {

          this.listenTo(Adapt, 'drawer:empty', this.remove);    
          this.listenTo(Adapt, 'search:termsFiltered', _.bind(this.updateResults, this));      
          this.render();  

          if(options.searchObject){
            this.updateResults(options.searchObject);
          }          
        },        

        events: {
          "click [data-id]":"navigateToResultPage"
        },

        render: function() {
            
            var template = Handlebars.templates['searchResults'];
            $(this.el).html(template());

            return this;
        },


        updateResults : function(searchObject){            

            this.$el.removeClass('inactive');
            var formattedResults = this.formatResults(searchObject);
            this.renderResults(formattedResults);
        },

        formatResults : function(searchObject){

            var resultsLimit = Math.min(5, searchObject.searchResults.length);            
            var formattedResults = [];

            for(var i=0;i<resultsLimit;i++){
              formattedResults.push(this.formatResult(searchObject.searchResults[i], searchObject.query));
            }

            searchObject.formattedResults = formattedResults;
            
            return searchObject;
        },

        formatResult : function(result, query){


            var foundWords = _.keys(result.foundWords).join(" ");
            var title = result.model.get("title");
            var displayTitle = result.model.get("displayTitle");
            var body = result.model.get("body");
            var previewWords = this.model.get("_previewWords");
            var previewCharacters = this.model.get("_previewCharacters");
            var wordCharacters = search._regularExpressions.wordCharacters;

            //trim whitespace
            title = title.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace,"");
            displayTitle = displayTitle.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace,"");
            body = body.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace,"");

            //strip tags
            title = this.stripTags(title);
            displayTitle = this.stripTags(displayTitle);
            body = this.stripTags(body);
            
            var searchTitle = "";
            var textPreview = "";

            //select title
            if (!title) {
                searchTitle = $("<div>"+displayTitle+"</div>").text() || "No title found";
            } else {
                searchTitle = $("<div>"+title+"</div>").text();
            }

            //select preview text
            if (result.foundPhrases.length > 0) {

                var phrase = result.foundPhrases[0].phrase;
                //strip tags
                phrase = this.stripTags(phrase);

                var lowerPhrase = phrase.toLowerCase();
                var lowerSearchTitle = searchTitle.toLowerCase();

                if (lowerPhrase == lowerSearchTitle && result.foundPhrases.length > 1) {
                    phrase = result.foundPhrases[1].phrase;
                    //strip tags
                    phrase = this.stripTags(phrase);
                    lowerPhrase = phrase.toLowerCase();
                }
                
                if (lowerPhrase == lowerSearchTitle) {
                    //if the search phrase and title are the same
                    var finder = new RegExp("(([^"+wordCharacters+"]*["+wordCharacters+"]{1}){1,"+previewWords+"}|.{0,"+previewCharacters+"})", "i");
                    if (body) {
                        textPreview = body.match(finder)[0] + "...";
                    }
                } else {
                    var wordMap = _.map(result.foundWords, function(count, word) {
                        return { word: word, count: count};
                    });
                    _.sortBy(wordMap, function(item) {
                        return item.count;
                    });
                    var wordIndex = 0;
                    var wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
                    while(wordInPhraseStartPosition == -1) {
                        wordIndex++;
                        if (wordIndex == wordMap.length) throw "search: cannot find word in phrase";
                        wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
                    } 
                    var regex = new RegExp("(([^"+wordCharacters+"]*["+wordCharacters+"]{1}){1,"+previewWords+"}|.{0,"+previewCharacters+"})"+SearchAlgorithm._regularExpressions.escapeRegExp(wordMap[wordIndex].word)+"((["+wordCharacters+"]{1}[^"+wordCharacters+"]*){1,"+previewWords+"}|.{0,"+previewCharacters+"})", "i");
                    var snippet = phrase.match(regex)[0];
                    var snippetIndexInPhrase = phrase.indexOf(snippet);
                    if (snippet.length == phrase.length) {
                        textPreview = snippet;
                    } else if (snippetIndexInPhrase === 0) {
                        textPreview = snippet + "...";
                    } else if (snippetIndexInPhrase + snippet.length == phrase.length) {
                        textPreview = "..." + snippet;
                    } else {
                        textPreview = "..." + snippet + "...";
                    }
                }
            
            } else {

                var finder = new RegExp("(([^"+wordCharacters+"]*["+wordCharacters+"]{1}){1,"+previewWords+"}|.{0,"+previewCharacters+"})", "i");
                if (body) {
                    textPreview = body.match(finder)[0] + "...";
                }

            }

            var searchTitleTagged = tag(result.foundWords, searchTitle);
            var textPreviewTagged = tag(result.foundWords, textPreview);

            return {
                searchTitleTagged: searchTitleTagged,
                searchTitle: searchTitle,
                foundWords: foundWords,
                textPreview: textPreview,
                textPreviewTagged: textPreviewTagged,
                id: result.model.get('_id')
            };

            function tag(words, text) {
                var initial = "";
                 _.each(words, function(count, word) {
                    var wordPos = text.toLowerCase().indexOf(word);
                    if (wordPos < 0) return;
                    initial += text.slice(0, wordPos);
                    var highlighted = text.slice(wordPos, wordPos+word.length);
                    initial +="<span class='found'>"+highlighted+"</span>";
                    text = text.slice(wordPos+word.length, text.length);
                });
                initial+=text;
                return initial;
            }
        },

        stripTags: function (text) {
            text = $("<span>"+text+"</span>").html();
            text = text.replace(replaceEndTagsRegEx, " ");
            text = text.replace(replaceTagsRegEx, "");
            return text;
        },

        renderResults : function(results){

            var template = Handlebars.templates['searchResultsContent'];
            this.$('.search-results-content').html(template(results));
        },

        navigateToResultPage: function(event) {
            event.preventDefault();
            var blockID = $(event.currentTarget).attr("data-id");            
            
            Adapt.navigateToElement("." + blockID);
            Adapt.trigger('drawer:closeDrawer');
        }

    });

     return SearchResultsView;

});