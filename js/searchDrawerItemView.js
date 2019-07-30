define([
  'coreJS/adapt',
], function(Adapt) {

  var SearchDrawerItemView = Backbone.View.extend({

    className: 'js-drawer-textbox-change',

    events: {
      'click .start-search':'search',
      'keyup .search__textbox':'search'
    },

    initialize: function(options) {

      this.listenTo(Adapt, 'drawer:empty', this.remove);
      this.render();

      this.search = _.debounce(_.bind(this.search, this), 1000);
      if(options.query){
        this.$(".search__textbox").val(options.query);
      }

    },

    render: function() {

      var data = this.model.toJSON();

      var template = Handlebars.templates['searchBox']
      $(this.el).html(template(data));

      return this;
    },

    search: function(event) {

      if(event) event.preventDefault();
      var searchVal = this.$(".search__textbox").val();

      Adapt.trigger("search:filterTerms", searchVal);
    }

  });

  return SearchDrawerItemView;
})
