/*
* adapt-search
* License - https://github.com/cgkineo/adapt-search/blob/master/LICENSE
* Maintainers - Gavin McMaster <gavin.mcmaster@kineo.com>
*/
define(function(require){
    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var SearchDrawerItemView = require('extensions/adapt-search/js/searchDrawerItemView');
    var SearchResultsView = require('extensions/adapt-search/js/searchResultsView');
    var SearchAlgorithm = require('./search-algorithm');

    var lastSearchQuery = null;
    var lastSearchObject = null;

    var searchConfigDefault = {
        _previewWords: 15,
        _previewCharacters: 30,
        _showHighlights: true,
        _showFoundWords: true,
        title: "Search",
        description: "Type in search words",
        noResultsMessage:"Sorry, no results were found",
        awaitingResultsMessage: "Formulating results..."
    };


    Adapt.on('search-algorithm:ready', function(){    
        Adapt.course.set('_search',_.extend(searchConfigDefault, Adapt.course.get('_search')) );


        var searchConfig = Adapt.course.get('_search');
        searchConfig.title =searchConfig.title || 'search';
        searchConfig.description = searchConfig.description || 'description';

        var drawerObject = {
            title: searchConfig.title,
            description: searchConfig.description,
            className: 'search-drawer'
        };

        Adapt.drawer.addItem(drawerObject, 'resources:showSearch');
    });


    Adapt.on('drawer:openedItemView', function(){
        
        console.log("search.js,drawer:openedItemView");

        var searchConfig = Adapt.course.get('_search');
        searchConfig = new Backbone.Model(searchConfig);

        var $searchDrawerButton = $(".search-drawer");
        var $replacementButton = $("<div></div>");
        $replacementButton.attr("class", $searchDrawerButton.attr("class"));
        $searchDrawerButton.children().appendTo($replacementButton);
        $searchDrawerButton.replaceWith($replacementButton);

        $('.drawer-inner .search-drawer').append(new SearchDrawerItemView({model:searchConfig, query: lastSearchQuery}).el);   
        $('.drawer-inner .search-drawer').append(new SearchResultsView({model:searchConfig, searchObject: lastSearchObject}).el);  
        
    });


    Adapt.on('search:filterTerms', function(query){

        var searchConfig = Adapt.course.get('_search');

        lastSearchQuery = query;
        if (query.length === 0) {

            var searchObject = _.extend({}, searchConfig, {
                query: query,
                searchResults: [],
                isAwaitingResults: false,
                isBlank: true
            });

        } else if (query.length < searchConfig._minimumWordLength) {

            var searchObject = _.extend({}, searchConfig, {
                query: query,
                searchResults: [],
                isAwaitingResults: true,
                isBlank: false
            });
        } else {
        
            var results = SearchAlgorithm.find(query);

            var searchObject = _.extend({}, searchConfig, {
                query: query,
                searchResults: results,
                isAwaitingResults: false,
                isBlank: false
            });
        }

        lastSearchObject = searchObject;
        Adapt.trigger('search:termsFiltered', searchObject); 
    });


    Adapt.once('drawer:noItems', function(){
        console.log("search,drawer:noItems");
        $('.navigation-drawer-toggle-button').removeClass('display-none');
    }); 


});