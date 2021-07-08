import Adapt from 'core/js/adapt';
import SearchDrawerItemView from './searchDrawerItemView';
import SearchResultsView from './searchResultsView';
import SearchAlgorithm from './search-algorithm';

class Search extends Backbone.Controller {

  initialize() {
    this.lastSearchQuery = null;
    this.lastSearchObject = null;
    this.searchConfigDefault = {
      _previewWords: 15,
      _previewCharacters: 30,
      _showHighlights: true,
      _showFoundWords: true,
      title: 'Search',
      description: 'Type in search words',
      placeholder: '',
      noResultsMessage: 'Sorry, no results were found',
      awaitingResultsMessage: 'Formulating results...'
    };
    this.listenTo(Adapt, {
      'search-algorithm:ready': this.onAlgorithmReady,
      'resources:showSearch': this.onShowSearch,
      'drawer:openedItemView search:draw': this.onOpenedItemView,
      'drawer:closed': this.onDrawerClosed,
      'search:filterTerms': this.onFilterTerms,
      'drawer:noItems': this.onNoItems
    });
  }

  onAlgorithmReady() {
    Adapt.course.set('_search', _.extend(this.searchConfigDefault, Adapt.course.get('_search')));

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

  onFilterTerms(query) {
    const searchConfig = Adapt.course.get('_search');
    let searchObject;

    this.lastSearchQuery = query;

    if (query.length === 0) {
      searchObject = _.extend({}, searchConfig, {
        query: query,
        searchResults: [],
        isAwaitingResults: false,
        isBlank: true
      });
    } else if (query.length < searchConfig._minimumWordLength) {
      searchObject = _.extend({}, searchConfig, {
        query: query,
        searchResults: [],
        isAwaitingResults: true,
        isBlank: false
      });
    } else {
      const results = SearchAlgorithm.find(query);

      searchObject = _.extend({}, searchConfig, {
        query: query,
        searchResults: results,
        isAwaitingResults: false,
        isBlank: false
      });
    }

    this.lastSearchObject = searchObject;

    Adapt.trigger('search:termsFiltered', searchObject);
  }

  onNoItems() {
    $('.nav-drawer-btn').removeClass('u-display-none');
  }

}

export default (Adapt.search = new Search());
