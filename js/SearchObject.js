import Adapt from 'core/js/adapt';

export default class SearchObject {

  constructor(shouldSearch, searchPhrase, searchResults) {
    const searchConfig = Adapt.course.get('_search');
    _.extend(this, searchConfig, {
      query: searchPhrase,
      searchResults: searchResults,
      isAwaitingResults: (searchPhrase.length !== 0 && !shouldSearch),
      isBlank: (searchPhrase.length === 0)
    });
  }

}
