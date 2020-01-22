define([
  'core/js/adapt',
], function(Adapt) {

  var SearchDrawerItemView = Backbone.View.extend({

    className: 'search',

    events: {
      'click .js-search-textbox-change': 'search',
      'keyup .js-search-textbox-change': 'search'
    },

    initialize: function(options) {

      this.listenTo(Adapt, 'drawer:empty', this.remove);
      this.render();

      this.search = _.debounce(this.search.bind(this), 1000);
      if (options.query){
        this.$(".js-search-textbox-change").val(options.query);
      }

    },

    render: function() {
      var data = this.model.toJSON();

      var template = Handlebars.templates['searchBox'];
      $(this.el).html(template(data));

      return this;
    },

    search: function(event) {
      if(event && event.preventDefault) event.preventDefault();

      var searchVal = this.$(".js-search-textbox-change").val();
      Adapt.trigger("search:filterTerms", searchVal);
    }

  });

  return SearchDrawerItemView;

});
