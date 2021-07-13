import Adapt from 'core/js/adapt';
import SearchableText from './SearchableText';
import SearchablePhrase from './SearchablePhrase';
import SearchableWord from './SearchableWord';
/**
 * {
        score: (float)score = bestPhraseAttributeScore * (wordOccurencesInSection * frequencyMultiplier)
        model: model,
        foundWords: {
          "foundWord": (int)occurencesInSection
        },
        foundPhrases: [
          {
            "score": (float)score   = (1/attributeLevel)
            "phrase": "Test phrase",
            "words": {
              "Test": (int)occurencesInPhrase,
              "phrase": (int)occurencesInPhrase
            }
          }
        ]
      }
 */
export default class SearchableModel {

  constructor({ model } = {}) {
    this.model = model;
    this._texts = null;
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

  get texts() {
    if (this._texts) return this._texts;
    return (this._texts = SearchableText.allFromModel(this.model));
  }

  get phrases() {
    if (this._phrases) return this._phrases;
    const phrases = [];
    const groupedPhrases = _.groupBy(this.texts, text => text.text);
    for (const p in groupedPhrases) {
      const bestItem = _.max(groupedPhrases[p], item => item.score);
      phrases.push(new SearchablePhrase({
        phrase: bestItem.text,
        score: bestItem.score,
        allowTextPreview: bestItem.allowTextPreview
      }));
    }
    return (this._phrases = phrases);
  }

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
        searchableWord.score = _.max([
          searchableWord.score,
          phrase.score
        ]);
      }
    }
    const words = Object.values(indexedSearchableWords)
      .filter(searchableWord => searchableWord.word.length >= minimumWordLength)
      .filter(searchableWord => !ignoreWords.includes(searchableWord.word));
    return (this._words = words);
  }

  static get all() {
    return Adapt.data.map(model => new SearchableModel({ model })).filter(model => model.isSearchable);
  }

}
