import Adapt from 'core/js/adapt';

export default class SearchDrawerItemView extends Backbone.View {

  className() {
    return 'search';
  }

  events() {
    return {
      'click .js-search-textbox-change': 'search',
      'keyup .js-search-textbox-change': 'search'
    };
  }

  initialize(options) {
    this.listenTo(Adapt, 'drawer:empty', this.remove);
    this.render();
    this.search = _.debounce(this.search.bind(this), 1000);
    if (options.query) {
      this.$('.js-search-textbox-change').val(options.query);
    }
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates.searchBox;
    $(this.el).html(template(data));
    return this;
  }

  search(event) {
    if (event && event.preventDefault) event.preventDefault();
    const searchVal = this.$('.js-search-textbox-change').val();
    Adapt.trigger('search:filterTerms', searchVal);
  }

}
