/*
* adapt-search
* Adapt extension that takes 1 or more search terms and displays a list of blocks ranked by relevance of keywords
* License - https://github.com/cgkineo/adapt-search/blob/master/LICENSE
* Maintainers - Gavin McMaster <gavin.mcmaster@kineo.com>
*/
define(function(require) {
    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var SearchDrawerItemView = require('extensions/adapt-search/js/searchDrawerItemView');
    var SearchResultsView = require('extensions/adapt-search/js/searchResultsView');
    var contentMatches;

    Adapt.on('drawer:openedItemView', function() {
        var searchObject = Adapt.course.get('_search');

        var drawerObject = {
            title: searchObject.title,
            description: searchObject.description
        };

        var searchModel = new Backbone.Model(drawerObject);
        // Search needs to be the last item in the drawer (cannot enforce this adding it to the collection),
        // as search results extend down into the drawer
        $('.drawer-inner').append(new SearchDrawerItemView({model:searchModel}).el);
     });

    Adapt.on('search:filterTerms', function(query) {
        search.call(this, query);
        Adapt.trigger('search:termsFiltered');
        showResults.call();
    });

    Adapt.once('drawer:noItems', function() {
        $('.navigation-drawer-toggle-button').removeClass('display-none');
    }); 

    function search(query) {
        //console.log("Adapt.Search: " + query);
        var maxWeighting = 1;
        var minWeighting = 0.5;
        var weightingDecrement = 0.1;
        var maxUnMatchedPenalty = 0.3;
        var unMatchedPenaltyDecrement = 0.1;
        var minUnMatchedPenalty = 0.1;
        var queryWords;
        contentMatches = [];
        
        if(query.indexOf(",") != -1) query = query.replace(/\s*,\s*/g, " ");     
        queryWords = _.uniq(query.match(/\S+/g));
        
        _.each(Adapt.blocks.models, function(model) {
                                  
            if(!model.get('_search')) {
                return;  
            }
           
            var matchedKeywords = 0;
            var unMatchedKeywords = 0;            
            var taggedKeywords = model.get('_search').keywords;
            var weighting = maxWeighting;
            var unMatchedPenalty = maxUnMatchedPenalty;
            var searchScore = 0;
            var searchPenalty = 0;
            var searchPercentage = 0;
            var contentID = model.get('_id');
            var visible = model.get('_isVisible');
            var topRankedMatchIndex = -1;
            var title = model.get("title");

            _.each(taggedKeywords, function(keyword) {
                var keywordMatched = false;
                _.each(queryWords, function(word) {
                    if(word.toLowerCase() === keyword.toLowerCase()) {
                        searchScore += weighting;
                        matchedKeywords++;
                        keywordMatched = true;
                        if(topRankedMatchIndex === -1) {
                            topRankedMatchIndex = _.indexOf(taggedKeywords, keyword);
                        }
                    }
                })
                if(!keywordMatched) {
                    searchPenalty += unMatchedPenalty;  
                } 
                
                weighting-= weightingDecrement;
                if(weighting < minWeighting) {
                    weighting = minWeighting;
                }
                unMatchedPenalty -= unMatchedPenaltyDecrement;
                if(unMatchedPenalty < minUnMatchedPenalty) {
                    unMatchedPenalty = minUnMatchedPenalty;  
                } 
            })
            
            unMatchedKeywords = taggedKeywords.length - matchedKeywords;
            // console.log("matchedKeywords: " + matchedKeywords + ",unMatchedKeywords: "+ unMatchedKeywords + ", searchScore: "+ searchScore);
            
            // Lovely rounding error in javascript
            searchScore = Math.round(searchScore * 10)/10;
            searchPenalty = Math.round(searchPenalty * 10)/10;
            searchPercentage = searchScore*100;
            
            if(matchedKeywords > 0) {
                var contentData = {id:contentID, visible:visible, title:title, matchedKeywords:matchedKeywords, unMatchedKeywords:unMatchedKeywords, searchScore:searchScore, searchPenalty:searchPenalty, searchPercentage:searchPercentage, topRankedMatchIndex: topRankedMatchIndex, keywords:taggedKeywords.toString()};
                contentMatches.push(contentData);
            }                    
        });
        
        if(contentMatches.length > 0) {
            orderList();
        }
    }
    
    function orderList() {
        contentMatches.sort(function(a, b) {
                
            if(a.searchScore !== b.searchScore) {
                return b.searchScore - a.searchScore;
            }
             
            if(a.searchPenalty !== b.searchPenalty) {
                return a.searchPenalty - b.searchPenalty;
            }
           
            return a.topRankedMatchIndex - b.topRankedMatchIndex;  
        })        
      
        if(console.table) console.table(contentMatches, ["id", "keywords", "searchScore", "searchPenalty", "topRankedMatchIndex"]);        
    }

    function showResults() {
        var searchObject = {
            searchResults: contentMatches,
            noResultsMessage: Adapt.course.get('_search').noResultsMessage
        }

        var searchResultsModel = new Backbone.Model(searchObject);
        $('.drawer-inner').append(new SearchResultsView({model:searchResultsModel}).el);
    }

    var results = function () {
        return contentMatches;
    };

    // provide handlers for external access
    return { search: search, results: results };
});