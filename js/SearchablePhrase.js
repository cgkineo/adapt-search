import Adapt from 'core/js/adapt';
import WORD_CHARACTERS from './WORD_CHARACTERS';
import replaceAccents from './replaceAccents';

const matchNotWordBoundaries = new RegExp(`[${WORD_CHARACTERS}]+`, 'g');
const trimReplaceNonWordCharacters = new RegExp(`^([^${WORD_CHARACTERS}])+|([^${WORD_CHARACTERS}])+$`, 'g');

/**
 * Represents a searchable phrase at a model attribute.
 */
export default class SearchablePhrase {

  constructor({
    phrase,
    score = null,
    level = null,
    allowTextPreview = null,
    searchAttribute = null
  } = {}) {
    this.name = searchAttribute?._attributeName ?? null;
    this.phrase = phrase;
    this.safePhrase = replaceAccents(phrase).toLowerCase();
    this.level = level ?? searchAttribute?._level ?? null;
    this.score = score ?? (this.level !== null ? (1 / this.level) : null);
    this.allowTextPreview = (allowTextPreview ?? searchAttribute?._allowTextPreview) ?? null;
    const config = Adapt.course.get('_search');
    // Handle _ignoreWords as a special case to support the authoring tool
    const ignoreWords = Array.isArray(config._ignoreWords)
      ? config._ignoreWords
      : config._ignoreWords.split(',');
    const minimumWordLength = config._minimumWordLength;
    this.words = this.safePhrase
      .match(matchNotWordBoundaries)
      .map(chunk => chunk.replace(trimReplaceNonWordCharacters, ''))
      .filter(word => word.length >= minimumWordLength)
      .reduce((wordCounts, word) => {
        word = word.toLowerCase();
        if (ignoreWords.includes(word)) return wordCounts;
        wordCounts[word] = wordCounts[word] || 0;
        wordCounts[word]++;
        return wordCounts;
      }, {});
  }

  /**
   * Returns all searchable phrases from the given model.
   * @param {Backbone.Model} model
   * @returns {[SearchablePhrase]}
   */
  static allFromModel(model) {
    const htmlToText = html => $(`<div>${html.trim()}</div>`).text().trim();
    const searchAttributes = Adapt.course.get('_search')._searchAttributes;
    const searchablePhrases = [];
    const processValue = (value, searchAttribute, level) => {
      if (typeof value === 'object') return _recursivelyCollectPhrases(value, searchAttribute._level);
      if (typeof value !== 'string') return;
      const phrase = htmlToText(value);
      if (!phrase) return;
      searchablePhrases.push(new SearchablePhrase({
        phrase,
        level,
        searchAttribute
      }));
    };
    const _recursivelyCollectPhrases = (json = model.toJSON(), level = 1) => {
      for (const searchAttribute of searchAttributes) {
        const attributeName = searchAttribute._attributeName;
        const attributeValue = json[attributeName];
        if (!attributeValue) continue;
        if (Array.isArray(attributeValue)) {
          for (const attributeValueItem of attributeValue) {
            processValue(attributeValueItem, searchAttribute, level);
          }
          continue;
        }
        processValue(attributeValue, searchAttribute, level);
      }
    };
    _recursivelyCollectPhrases();
    return searchablePhrases;
  }

}
