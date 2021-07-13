import Adapt from 'core/js/adapt';

export default class SearchResult {

  constructor({
    searchableModel,
    score = 0,
    foundWords = {},
    foundPhrases = null
  } = {}) {
    this.searchableModel = searchableModel;
    this.model = this.searchableModel.model;
    this.score = score;
    this.foundWords = foundWords;
    this.foundPhrases = foundPhrases;
  }

  addFoundWord(word, isFullMatch, partMatchRatio) {
    const config = Adapt.course.get('_search');
    const frequencyImportance = config._frequencyImportance;
    if (this.foundWords[word] === undefined) this.foundWords[word] = 0;
    const allPhraseWordRatingObjects = _.where(this.searchableModel.words, { word });
    const wordFrequency = _.reduce(allPhraseWordRatingObjects, function (memo, item) { return memo + item.count; }, 0);
    const wordFrequencyHitScore = _.reduce(allPhraseWordRatingObjects, function (memo, item) {
      const frequencyBonus = (item.score * item.count) / frequencyImportance;
      return memo + item.score + frequencyBonus;
    }, 0);
    this.foundWords[word] += wordFrequency;
    if (isFullMatch) {
      this.score += wordFrequencyHitScore;
    } else {
      this.score += wordFrequencyHitScore * partMatchRatio;
    }
    // Find all matching phrases
    const foundWords = Object.keys(this.foundWords);
    const phrases = this.searchableModel.phrases;
    this.foundPhrases = [];
    for (const phrase of phrases) {
      if (!phrase.allowTextPreview) continue;
      if (!_.intersection(foundWords, _.keys(phrase.words)).length > 0) continue;
      this.foundPhrases.push(phrase);
    }
  }

}
