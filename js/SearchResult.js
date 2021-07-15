import Adapt from 'core/js/adapt';

/**
 * Represents a matching model, its matching words and phrases and the score of
 * the search result.
 */
export default class SearchResult {

  constructor({
    searchableModel,
    score = 0,
    foundWords = [],
    foundPhrases = []
  } = {}) {
    this.searchableModel = searchableModel;
    this.model = this.searchableModel.model;
    this.score = score;
    this.foundWords = foundWords;
    this.foundPhrases = foundPhrases;
  }

  /**
   * Update search result score, words and phrases with a newly found word.
   * @param {string} word
   * @param {boolean} isFullMatch
   * @param {number} partMatchRatio
   */
  addFoundWord(word, isFullMatch, partMatchRatio) {
    if (this.foundWords.find(({ word: matchWord }) => matchWord === word)) return;
    const config = Adapt.course.get('_search');
    const frequencyImportance = config._frequencyImportance;
    const searchableWord = this.searchableModel.words.find(({ word: matchWord }) => matchWord === word);
    this.foundWords.push(searchableWord);
    const frequencyBonus = (searchableWord.score * searchableWord.count) / frequencyImportance;
    const wordFrequencyHitBonus = searchableWord.score + frequencyBonus;
    this.score += isFullMatch
      ? wordFrequencyHitBonus
      : wordFrequencyHitBonus * partMatchRatio;
    // Find all matching phrases
    const foundWords = this.foundWords.map(({ word }) => word);
    const phrases = this.searchableModel.phrases;
    this.foundPhrases = [];
    for (const phrase of phrases) {
      if (!phrase.allowTextPreview) continue;
      if (!_.intersection(foundWords, Object.keys(phrase.words)).length > 0) continue;
      this.foundPhrases.push(phrase);
    }
  }

}
