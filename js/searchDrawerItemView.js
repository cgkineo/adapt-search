import Adapt from 'core/js/adapt';

export default class SearchDrawerItemView extends Backbone.View {

  className() {
    return 'search';
  }

  events() {
    return {
      'click .js-search-textbox-change': this.onSearch,
      'keyup .js-search-textbox-change': this.onSearch
    };
  }

  initialize(options) {
    this.listenTo(Adapt, 'drawer:empty', this.remove);
    this.render();
    this.search = _.debounce(this.onSearch.bind(this), 1000);
    if (!options.query) return;
    this.$('.js-search-textbox-change').val(options.query);
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates.searchBox;
    this.$el.html(template(data));
    return this;
  }

  onSearch(event) {
    if (event && event.preventDefault) event.preventDefault();
    const query = this.$('.js-search-textbox-change').val();
    Adapt.trigger('search:query', query);
  }

}
