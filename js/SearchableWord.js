export default class SearchableWord {

  constructor({
    word,
    score,
    count
  } = {}) {
    this.word = word;
    this.score = score;
    this.count = count;
  }

}
