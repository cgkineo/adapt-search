import Adapt from 'core/js/adapt';
import SearchableModel from './SearchableModel';
import SearchablePhrase from './SearchablePhrase';
import SearchObject from './SearchObject';
import SearchResult from './SearchResult';
import escapeRegExp from './escapeRegExp';

/**
 * Main API
 * The last instance is available through window.search
 */
export default class Searcher {

  constructor() {
    this.searchableModels = SearchableModel.all;
    this.wordIndex = this.searchableModels.reduce((wordIndex, searchableModel) => {
      searchableModel.words.forEach(({ word }) => {
        wordIndex[word] = wordIndex[word] || [];
        wordIndex[word].push(searchableModel);
      });
      return wordIndex;
    }, {});
  }

  /**
   * Returns an array of search results.
   * @param {string} searchPhrase
   * @returns {[SearchResult]}
   */
  query(searchPhrase) {
    const config = Adapt.course.get('_search');
    const wordIndex = this.wordIndex;
    const scoreQualificationThreshold = config._scoreQualificationThreshold;
    const matchOn = config._matchOn || {};
    const findWords = new SearchablePhrase({ phrase: searchPhrase }).words;
    const indexedSearchResults = {};
    for (const findWord in findWords) {
      for (const indexWord in wordIndex) {
        // allow only start matches on findWord beginning with indexWord i.e. find: oneness begins with index: one
        const rIndexWordBegins = new RegExp('^' + escapeRegExp(indexWord), 'g');
        // allow all matches on indexWord containing findWord i.e. index: someone contains find: one, index: anti-money contains find: money
        const rFindWordContains = new RegExp(escapeRegExp(findWord), 'g');
        // allow only start matches on indexWord beginning with findWord i.e. find: one begins index: oneness
        const rFindWordBegins = new RegExp('^' + escapeRegExp(findWord), 'g');
        const isIndexBeginsMatch = matchOn._contentWordBeginsPhraseWord === false ? false : rIndexWordBegins.test(findWord);
        const isFindContainsMatch = matchOn._contentWordContainsPhraseWord === false ? false : rFindWordContains.test(indexWord);
        const isFindBeginsMatch = matchOn._phraseWordBeginsContentWord === false ? false : rFindWordBegins.test(indexWord);
        const isFullMatch = matchOn._contentWordEqualsPhraseWord === false ? false : (findWord === indexWord);
        const isPartMatch = isIndexBeginsMatch || isFindContainsMatch || isFindBeginsMatch;
        if (!isFullMatch && !isPartMatch) continue;
        const partMatchRatio = isFullMatch ? 1 : (findWord.length > indexWord.length) ? indexWord.length / findWord.length : findWord.length / indexWord.length;
        wordIndex[indexWord].forEach(searchableModel => {
          const id = searchableModel.model.get('_id');
          indexedSearchResults[id] = (indexedSearchResults[id] || new SearchResult({ searchableModel }));
          indexedSearchResults[id].addFoundWord(indexWord, isFullMatch, partMatchRatio);
        });
      }
    }
    const searchResults = Object.values(indexedSearchResults);
    const qualifyingScoreThreshold = 1 / scoreQualificationThreshold;
    const qualifyingSearchResults = searchResults.filter(item => item.score >= qualifyingScoreThreshold).sort((a, b) => b.score - a.score);
    return qualifyingSearchResults;
  }

  /**
   * Returns a search object which represents all of the settings used for the
   * search, the search results and the user interface search state.
   * @param {string} searchPhrase
   * @returns {SearchObject}
   */
  search(searchPhrase) {
    const config = Adapt.course.get('_search');
    const shouldSearch = (searchPhrase.length >= config._minimumWordLength);
    const searchResults = shouldSearch ? this.query(searchPhrase) : [];
    return new SearchObject(shouldSearch, searchPhrase, searchResults);
  }

}
