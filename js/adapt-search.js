import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import SearchDrawerItemView from './searchDrawerItemView';
import SearchResultsView from './searchResultsView';
import SEARCH_DEFAULTS from './SEARCH_DEFAULTS';
import Searcher from './Searcher';

class Search extends Backbone.Controller {

  initialize() {
    this.isSetup = false;
    this.lastSearchQuery = null;
    this.lastSearchObject = null;
    this.reIndex = _.debounce(this.reIndex.bind(this), 10);
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady,
      'search:query': this.query,
      'resources:showSearch': this.onShowSearch,
      'drawer:openedItemView search:draw': this.onOpenedItemView,
      'drawer:closed': this.onDrawerClosed,
      'drawer:noItems': this.onNoItems,
      'change:_isStarted': this.onAdaptIsStartedChange
    });
  }

  onAdaptIsStartedChange(model, value) {
    if (value) return;
    this.onPreLanguageChange();
  }

  onPreLanguageChange() {
    this.isSetup = false;
    this.stopListening(data, {
      'add remove change:_isAvailable change:_isLocked': this.reIndex
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
    this.listenTo(data, {
      'add remove change:_isAvailable change:_isLocked': this.reIndex
    });
    this.reIndex();
    this.clearSearchResults();
    this.addDrawerItem();
  }

  reIndex() {
    if (!this.isSetup) return;
    window.search = this.searcher = new Searcher();
  }

  clearSearchResults() {
    this.lastSearchQuery = null;
    this.lastSearchObject = null;
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
    const searchConfig = Adapt.course.get('_search');
    const template = Handlebars.templates.searchSingleItem;
    const $element = $(template(searchConfig));
    Adapt.drawer.triggerCustomView($element, true);
    Adapt.trigger('search:draw');
  }

  onOpenedItemView() {
    this.isSearchShown = true;
    const searchConfigModel = new Backbone.Model(Adapt.course.get('_search'));
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
    $('.drawer__holder .is-search')
      .append(new SearchDrawerItemView({ model: searchConfigModel, query: this.lastSearchQuery }).el)
      .append(new SearchResultsView({ model: searchConfigModel, searchObject: this.lastSearchObject }).el);
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
