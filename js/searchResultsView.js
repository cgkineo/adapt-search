
define(function(require) {
    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');
    	
	var SearchResultsView = Backbone.View.extend({

        initialize: function() {
            this.listenTo(Adapt, 'drawer:empty search:termsFiltered', this.remove);
            var searchLength = this.model.get("searchResults").length;
            if (searchLength === 0) {
                this.model.set("noResults", true);
            }
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
            Adapt.navigateToElement("." + blockID);
            Adapt.trigger('drawer:closeDrawer');
        }

	});

	 return SearchResultsView;

});