import Adapt from 'core/js/adapt';
import WORD_CHARACTERS from './WORD_CHARACTERS';
import { stripTags, tag, escapeRegExp } from './utils';

export default class SearchResultsView extends Backbone.View {

  className() {
    return 'search__items-container is-inactive';
  }

  events() {
    return {
      'click [data-id]': 'navigateToResultPage'
    };
  }

  initialize({ searchObject = null } = {}) {
    this.listenTo(Adapt, {
      'drawer:empty': this.remove,
      'search:queried': this.updateResults
    });
    this.render();
    if (!searchObject) return;
    this.updateResults(searchObject);
  }

  render() {
    const template = Handlebars.templates.searchResults;
    $(this.el).html(template());
    return this;
  }

  updateResults(searchObject) {
    this.$el.removeClass('is-inactive');
    const formattedResults = this.formatResults(searchObject);
    this.renderResults(formattedResults);
  }

  formatResults(searchObject) {
    const resultsLimit = Math.min(5, searchObject.searchResults.length);
    const previewWords = this.model.get('_previewWords');
    const previewCharacters = this.model.get('_previewCharacters');
    const formattedResults = searchObject.searchResults.slice(0, resultsLimit).map(result => {
      const foundWords = _.keys(result.foundWords).join(' ');
      const title = stripTags(result.model.get('title'));
      const displayTitle = stripTags(result.model.get('displayTitle'));
      const body = stripTags(result.model.get('body'));
      const searchTitle = !title
        ? $('<div>' + displayTitle + '</div>').text() || 'No title found'
        : $('<div>' + title + '</div>').text();
      let textPreview = '';
      let finder;
      // select preview text
      if (result.foundPhrases.length > 0) {
        let phrase = stripTags(result.foundPhrases[0].phrase);
        let lowerPhrase = phrase.toLowerCase();
        const lowerSearchTitle = searchTitle.toLowerCase();

        if (lowerPhrase === lowerSearchTitle && result.foundPhrases.length > 1) {
          phrase = stripTags(result.foundPhrases[1].phrase);
          lowerPhrase = phrase.toLowerCase();
        }

        if (lowerPhrase === lowerSearchTitle) {
          // if the search phrase and title are the same
          finder = new RegExp('(([^' + WORD_CHARACTERS + ']*[' + WORD_CHARACTERS + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
          if (body) {
            textPreview = body.match(finder)[0] + '...';
          }
        } else {
          const wordMap = Object.entries(result.foundWords).map(([word, count]) => ({ word, count }));
          wordMap.sort((a, b) => a.count - b.count);
          let wordIndex = 0;
          let wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
          while (wordInPhraseStartPosition === -1) {
            wordIndex++;
            if (wordIndex === wordMap.length) throw new Error('search: cannot find word in phrase');
            wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
          }
          const regex = new RegExp('(([^' + WORD_CHARACTERS + ']*[' + WORD_CHARACTERS + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})' + escapeRegExp(wordMap[wordIndex].word) + '(([' + WORD_CHARACTERS + ']{1}[^' + WORD_CHARACTERS + ']*){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
          const snippet = phrase.match(regex)[0];
          const snippetIndexInPhrase = phrase.indexOf(snippet);
          textPreview = `${(snippetIndexInPhrase !== 0) ? '...' : ''}${snippet}${(snippetIndexInPhrase + snippet.length !== phrase.length) ? '...' : ''}`;
        }

      } else {
        finder = new RegExp('(([^' + WORD_CHARACTERS + ']*[' + WORD_CHARACTERS + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
        if (body) {
          textPreview = body.match(finder)[0] + '...';
        }
      }

      const searchTitleTagged = tag(result.foundWords, searchTitle);
      const textPreviewTagged = tag(result.foundWords, textPreview);
      const id = result.model.get('_id');
      return {
        searchTitleTagged,
        searchTitle,
        foundWords,
        textPreview,
        textPreviewTagged,
        id
      };
    });
    searchObject.formattedResults = formattedResults;
    return searchObject;
  }

  renderResults(results) {
    const template = Handlebars.templates.searchResultsContent;
    this.$('.search__items-container-inner').html(template(results));
  }

  navigateToResultPage(event) {
    event && event.preventDefault();
    const blockID = $(event.currentTarget).attr('data-id');
    Adapt.navigateToElement('.' + blockID);
    Adapt.trigger('drawer:closeDrawer');
  }

}
