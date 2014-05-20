
define(function(require){
    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');
    	
	var SearchResultsView = Backbone.View.extend({

        initialize: function() {
          //console.log("SearchResultsView, initialize");
          this.listenTo(Adapt, 'drawer:empty search:termsFiltered', this.remove);

          var searchLength = this.model.get("searchResults").length;
          if (searchLength == 0) this.model.set("noResults", true);    
          this.render();          
        },

        events: {
          "click .result-title":"navigateToResultPage"
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['searchResults'];
            $(this.el).html(template(data));

            return this;
        },

        navigateToResultPage: function(event) {
            event.preventDefault();
            var blockID = $(event.currentTarget).attr("data-id");
            //console.log("navigateToResultPage: " + blockID);
            
            var blockModel = Adapt.blocks.findWhere({_id:blockID});
            var pageModel = blockModel.findAncestor("contentObjects");
            var pageID = pageModel.get('_id');

            console.log("Adapt.currentLocation: " + Adapt.currentLocation + ", pageID: " + pageID);

            if(pageID === Adapt.currentLocation){
                console.log("scroll to block location on current page");
                this.scrollToSelectedBlock(blockID);                
            } else{
                Adapt.on('pageView:ready', _.bind(this.scrollToSelectedBlock, this, blockID));
                Backbone.history.navigate('#/id/' + pageID, {trigger: true});
            }

            Adapt.trigger('drawer:closeDrawer');
        },

        scrollToSelectedBlock: function(blockID){
            console.log("scrollToSelectedBlock: " + blockID);
            $(window).scrollTo("." + blockID, {offset:{top:-$('.navigation').height()}});
        }

	});

	 return SearchResultsView;

});