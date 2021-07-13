import Adapt from 'core/js/adapt';
import SearchDrawerItemView from './searchDrawerItemView';
import SearchResultsView from './searchResultsView';
import SEARCH_DEFAULTS from './SEARCH_DEFAULTS';
import Searcher from './Searcher';

class Search extends Backbone.Controller {

  initialize() {
    this.isSetup = false;
    this.lastSearchQuery = null;
    this.lastSearchObject = null;
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady,
      'app:languageChanged': this.clearSearchResults,
      'search:query': this.query,
      'resources:showSearch': this.onShowSearch,
      'drawer:openedItemView search:draw': this.onOpenedItemView,
      'drawer:closed': this.onDrawerClosed,
      'drawer:noItems': this.onNoItems
    });
  }

  onDataReady() {
    const config = Adapt.course.get('_search');
    if (!config || config._isEnabled === false) return;
    this.setupConfig();
  }

  setupConfig() {
    const model = Adapt.course.get('_search') || {};
    const modelWithDefaults = $.extend(true, {}, SEARCH_DEFAULTS, model);
    Adapt.course.set('_search', modelWithDefaults);
    this.isSetup = true;
    window.search = this.searcher = new Searcher();
  }

  clearSearchResults() {
    this.query('');
    this.addDrawerItem();
    if (!this.isSetup) return;
    window.search = this.searcher = new Searcher();
  }

  addDrawerItem() {
    const searchConfig = Adapt.course.get('_search');
    searchConfig.title = searchConfig.title || 'Search';
    searchConfig.description = searchConfig.description || 'Description';
    const drawerObject = {
      title: searchConfig.title,
      description: searchConfig.description,
      className: 'is-search',
      drawerOrder: searchConfig._drawerOrder || 0
    };
    Adapt.drawer.addItem(drawerObject, 'resources:showSearch');
  }

  onShowSearch() {
    if (this.isSearchShown) return;
    let searchConfig = Adapt.course.get('_search');
    searchConfig = new Backbone.Model(searchConfig);
    const template = Handlebars.templates.searchSingleItem;
    const $element = $(template(searchConfig.toJSON()));
    Adapt.drawer.triggerCustomView($element, true);
    Adapt.trigger('search:draw');
  }

  onOpenedItemView() {
    this.isSearchShown = true;
    let searchConfig = Adapt.course.get('_search');
    searchConfig = new Backbone.Model(searchConfig);
    const $searchDrawerButton = $('.is-search');
    if ($searchDrawerButton.is(':not(div)')) {
      const $replacementButton = $('<div></div>');
      $replacementButton.attr('class', $searchDrawerButton.attr('class'));
      $searchDrawerButton.children().appendTo($replacementButton);
      $searchDrawerButton.replaceWith($replacementButton);
    }
    if (this.lastSearchObject && this.lastSearchObject.searchResults && this.lastSearchObject.searchResults.length === 0) {
      this.lastSearchObject = null;
      this.lastSearchQuery = null;
    }
    $('.drawer__holder .is-search').append(new SearchDrawerItemView({ model: searchConfig, query: this.lastSearchQuery }).el);
    $('.drawer__holder .is-search').append(new SearchResultsView({ model: searchConfig, searchObject: this.lastSearchObject }).el);
  }

  onDrawerClosed() {
    this.isSearchShown = false;
  }

  query(query) {
    if (!this.isSetup) return;
    this.lastSearchQuery = query;
    const searchObject = this.searcher.search(query);
    this.lastSearchObject = searchObject;
    Adapt.trigger('search:queried', searchObject);
  }

  onNoItems() {
    $('.nav-drawer-btn').removeClass('u-display-none');
  }

}

export default (Adapt.search = new Search());
