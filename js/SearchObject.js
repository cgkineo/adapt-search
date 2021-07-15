import Adapt from 'core/js/adapt';

/**
 * Represents all of the settings used for the search, the search results and
 * the user interface search state.
 */
export default class SearchObject {

  constructor(shouldSearch, searchPhrase, searchResults) {
    const searchConfig = Adapt.course.get('_search');
    Object.assign(this, searchConfig, {
      query: searchPhrase,
      searchResults: searchResults,
      isAwaitingResults: (searchPhrase.length !== 0 && !shouldSearch),
      isBlank: (searchPhrase.length === 0)
    });
  }

}
