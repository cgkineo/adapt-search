import Adapt from 'core/js/adapt';
import SearchablePhrase from './SearchablePhrase';
import SearchableWord from './SearchableWord';

/**
 * Provides a wrapper for models to extract the searchable phrases and words.
 */
export default class SearchableModel {

  constructor({ model } = {}) {
    this.model = model;
    this._phrases = null;
    this._words = null;
  }

  get isSearchable() {
    const modelConfig = this.model.get('_search');
    if (modelConfig?._isEnabled === false) return false;
    const isUnavailableInPage = this.model.getAncestorModels(true).some(model => (
      model.get('_search')?._isEnabled === false ||
      !model.get('_isAvailable') ||
      model.get('_isLocked') ||
      model.get('_isPartOfAssessment')
    ));
    if (isUnavailableInPage) return false;
    const config = Adapt.course.get('_search');
    const hideComponents = config._hideComponents;
    const hideTypes = config._hideTypes;
    const component = this.model.get('_component');
    const type = this.model.get('_type');
    const shouldIgnore = hideTypes.includes(type) || (type === 'component' && hideComponents.includes(component));
    if (shouldIgnore) return false;
    const displayTitle = this.model.get('displayTitle').trim();
    const title = this.model.get('title').trim();
    const hasTitleOrDisplayTitle = Boolean(displayTitle || title);
    return hasTitleOrDisplayTitle;
  }

  /**
   * Return all searchable phrases in the model
   * @returns {[SearchablePhrase]}
   */
  get phrases() {
    if (this._phrases) return this._phrases;
    return (this._phrases = SearchablePhrase.allFromModel(this.model));
  }

  /**
   * Return all searchable words in the model
   * @returns {[SearchableWord]}
   */
  get words() {
    if (this._words) return this._words;
    const config = Adapt.course.get('_search');
    const minimumWordLength = config._minimumWordLength;
    const ignoreWords = config._ignoreWords;
    const phrases = this.phrases;
    const indexedSearchableWords = {};
    for (const phrase of phrases) {
      for (const word in phrase.words) {
        const count = phrase.words[word];
        const searchableWord = (indexedSearchableWords[word] = indexedSearchableWords[word] || new SearchableWord({ word, count: 0, score: 0 }));
        searchableWord.count += count;
        searchableWord.score = Math.max(
          searchableWord.score,
          phrase.score
        );
      }
    }
    const words = Object.values(indexedSearchableWords)
      .filter(({ word }) => word.length >= minimumWordLength && !ignoreWords.includes(word));
    return (this._words = words);
  }

  /**
   * Returns all searchable models for the whole course
   * @returns {[SearchableModel]}
   */
  static get all() {
    return Adapt.data.map(model => new SearchableModel({ model })).filter(({ isSearchable }) => isSearchable);
  }

}
