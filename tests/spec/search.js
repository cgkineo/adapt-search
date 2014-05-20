/*
* adapt-search
* License - https://github.com/cgkineo/adapt-search/blob/master/LICENSE
* Maintainers - Gavin McMaster <gavin.mcmaster@kineo.com>
*/
//define(['coreJS/adapt'],function(Adapt) {
 /* var Adapt = require('coreJS/adapt');
  var Backbone = require('backbone');
  var SearchDrawerItemView = require('extensions/adapt-search/js/searchDrawerItemView');
  var SearchResultsView = require('extensions/adapt-search/js/searchResultsView');*/

  ;(function(){

  var contentMatches;

  Adapt.Search = function(query){
      search.call(this, query);
      return this;
  }

  Adapt.Search.results = function(){
    //return (contentMatches.length > 0) ? contentMatches : "There are no results to display";
    return contentMatches;
  }

  Adapt.on('drawer:openedItemView', function(){
    console.log("search.js,drawer:openedItemView");
    var searchObject = Adapt.course.get('_search');

    var drawerObject = {
      title: searchObject.title,
      description: searchObject.description
    };

     var searchModel = new Backbone.Model(drawerObject);
     $('.drawer-inner').append(new SearchDrawerItemView({model:searchModel}).el);
  });


 function search(query){
        console.log("Adapt.Search: " + query);
        var maxWeighting = 1;
        var minWeighting = 0.5;
        var weightingDecrement = 0.1;
        var maxUnMatchedPenalty = 0.3;
        var unMatchedPenaltyDecrement = 0.1;
        var minUnMatchedPenalty = 0.1;
        var queryWords;
        contentMatches = [];
        
        if(query.indexOf(",") != -1) query = query.replace(/\s*,\s*/g, " ");     
        //console.log("query: "+ query);
        queryWords = _.uniq(query.match(/\S+/g));
        
        //console.log(Adapt.blocks.models.length);
        _.each(Adapt.blocks.models, function(model){
            //console.log(model.get('_id'));
                        
            if(!model.get('_search')) return;
            console.log(model.get('_search').keywords);
            //console.log( model.get('_search').keywords.length);

            var matchedKeywords = 0;
            var unMatchedKeywords = 0;            
            var taggedKeywords = model.get('_search').keywords;
            
            //console.log(taggedKeywords);
            //console.log( taggedKeywords.length);
            
            var weighting = maxWeighting;
            var unMatchedPenalty = maxUnMatchedPenalty;
            var searchScore = 0;
            var searchPenalty = 0;
            var searchPercentage = 0;
            var contentID = model.get('_id');
           // var available = model.get('available');
            var visible = model.get('_isVisible');
            var topRankedMatchIndex = -1;
            var title = model.get("title");

            //console.log(contentID + " - " + title);
                        
            _.each(taggedKeywords, function(keyword){
                //console.log(keyword);
                var keywordMatched = false;
                _.each(queryWords, function(word){
                    //console.log(word);
                    if(word.toLowerCase()===keyword.toLowerCase()){
                        searchScore += weighting;
                        matchedKeywords++;
                        keywordMatched = true;
                        if(topRankedMatchIndex == -1) topRankedMatchIndex = _.indexOf(taggedKeywords, keyword);
                    }
                })
                //console.log("keywordMatched: "+ keywordMatched);
                if(!keywordMatched) searchPenalty += unMatchedPenalty;
                
                weighting-= weightingDecrement;
                if(weighting < minWeighting) weighting = minWeighting;
                unMatchedPenalty -= unMatchedPenaltyDecrement;
                if(unMatchedPenalty < minUnMatchedPenalty) unMatchedPenalty = minUnMatchedPenalty;
            })
            
            unMatchedKeywords = taggedKeywords.length - matchedKeywords;
            //console.log("matchedKeywords: " + matchedKeywords + ",unMatchedKeywords: "+ unMatchedKeywords + ", searchScore: "+ searchScore);
            
            // lovely rounding error in javascript
            searchScore = Math.round(searchScore * 10)/10;
            searchPenalty = Math.round(searchPenalty * 10)/10;
            searchPercentage = searchScore*100;
            
            if(matchedKeywords > 0){
                //var contentData = {id:contentID, available:available, visible:visible, title:title, matchedKeywords:matchedKeywords, unMatchedKeywords:unMatchedKeywords, searchScore:searchScore, searchPenalty:searchPenalty, searchPercentage:searchPercentage, topRankedMatchIndex: topRankedMatchIndex, keywords:taggedKeywords.toString()};
                var contentData = {id:contentID, visible:visible, title:title, matchedKeywords:matchedKeywords, unMatchedKeywords:unMatchedKeywords, searchScore:searchScore, searchPenalty:searchPenalty, searchPercentage:searchPercentage, topRankedMatchIndex: topRankedMatchIndex, keywords:taggedKeywords.toString()};
                contentMatches.push(contentData);
            }
                    
        });
        
        if(contentMatches.length > 0) orderList();

                
        //return contentMatches.length;
    }
    
    function orderList(){
        console.log(contentMatches.length + " content matches");
      
        contentMatches.sort(function(a, b){
                
           if(a.searchScore !== b.searchScore) return b.searchScore - a.searchScore;
             
           if(a.searchPenalty !== b.searchPenalty) return a.searchPenalty - b.searchPenalty;
           
           return a.topRankedMatchIndex - b.topRankedMatchIndex;  
        })        
      
        if(console.table) console.table(contentMatches, ["id", "keywords", "searchScore", "searchPenalty", "topRankedMatchIndex"]);
        
    }

    /*function showResults(){
      console.log("Search:showResults");
      //var searchObject = {results:contentMatches};
      var searchObject = {
        searchResults: contentMatches,
        noResultsMessage: Adapt.course.get('_search').noResultsMessage
      }

      var searchResultsModel = new Backbone.Model(searchObject);
      $('.drawer-inner').append(new SearchResultsView({model:searchResultsModel}).el);
    }*/

})();