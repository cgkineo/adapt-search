import Adapt from 'core/js/adapt';
import {
  matchNotWordBoundaries,
  trimReplaceNonWordCharacters
} from './utils';

export default class SearchablePhrase {

  constructor({
    phrase,
    score,
    allowTextPreview
  } = {}) {
    this.phrase = phrase;
    this.score = score;
    this.allowTextPreview = allowTextPreview;
    const config = Adapt.course.get('_search');
    // Handle _ignoreWords as a special case to support the authoring tool
    const ignoreWords = Array.isArray(config._ignoreWords)
      ? config._ignoreWords
      : config._ignoreWords.split(',');
    const minimumWordLength = config._minimumWordLength;
    const chunks = this.phrase.match(matchNotWordBoundaries);
    const words = chunks.map(chunk => chunk.replace(trimReplaceNonWordCharacters, '')).filter(word => word.length >= minimumWordLength);
    this.words = _.countBy(words, word => word.toLowerCase());
    this.words = _.omit(this.words, ignoreWords);
  }

}
