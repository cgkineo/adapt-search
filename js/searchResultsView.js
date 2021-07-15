import Adapt from 'core/js/adapt';
import WORD_CHARACTERS from './WORD_CHARACTERS';
import escapeRegExp from './escapeRegExp';
import replaceAccents from './replaceAccents';

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
    const stripHTMLAndHandlebars = (text) => {
      const replaceTagsRegEx = /<{1}[^>]+>/g;
      const replaceEscapedTagsRegEx = /&lt;[^&gt;]+&gt;/g;
      const replaceEndTagsRegEx = /<{1}\/{1}[^>]+>/g;
      const replaceEscapedEndTagsRegEx = /&lt;\/[^&gt;]+&gt;/g;
      const replaceHandlebarsRegEx = /{{[^}}]*/g;
      const replaceHandlebarsEndRegEx = /}}/g;
      text = $(`<span>${text}</span>`).html();
      return text
        .replace(replaceEndTagsRegEx, ' ')
        .replace(replaceTagsRegEx, '')
        .replace(replaceEscapedEndTagsRegEx, ' ')
        .replace(replaceEscapedTagsRegEx, '')
        .replace(replaceHandlebarsRegEx, ' ')
        .replace(replaceHandlebarsEndRegEx, '')
        .trim();
    };
    const checkSkipTitlePhrases = (title, result) => {
      return result.foundPhrases.find(foundPhrase => {
        const lowerPhrase = stripHTMLAndHandlebars(foundPhrase.phrase).toLowerCase();
        const lowerTitle = title.toLowerCase();
        const isNotTitle = (lowerPhrase !== lowerTitle);
        return isNotTitle;
      }) || result.foundPhrases[result.foundPhrases.length - 1];
    };
    const makeTextPreview = result => {
      const numberOfPreviewCharacters = this.model.get('_previewCharacters');
      const numberOfPreviewWords = this.model.get('_previewWords');
      /**
       * Note: This regexp makes no sense but it works, need to find a better way
       * of matching multilanguage words, which are sometimes a single character
       */
      const bodyPrettify = new RegExp(`(([^${WORD_CHARACTERS}]*[${WORD_CHARACTERS}]{1}){1,${numberOfPreviewWords * 2}}|.{0,${numberOfPreviewCharacters * 2}})`, 'i');
      const title = stripHTMLAndHandlebars(result.model.get('_search')?.title || '') || stripHTMLAndHandlebars(result.model.get('title')) || stripHTMLAndHandlebars(result.model.get('displayTitle')) || 'No title found';
      const safeTitle = replaceAccents(title);
      const body = stripHTMLAndHandlebars(result.model.get('body')) || '';
      const hasNoFoundPhrases = (result.foundPhrases.length === 0);
      if (hasNoFoundPhrases) {
        const textPreview = body.match(bodyPrettify)[0] + '...';
        return [title, textPreview];
      }
      const foundPhrase = checkSkipTitlePhrases(title, result);
      const phrase = stripHTMLAndHandlebars(foundPhrase.phrase);
      const safePhrase = stripHTMLAndHandlebars(foundPhrase.safePhrase);
      const lowerPhrase = safePhrase.toLowerCase();
      const lowerTitle = safeTitle.toLowerCase();
      if (lowerPhrase === lowerTitle) {
        // if the search phrase and title are the same still
        const textPreview = body.match(bodyPrettify)[0] + '...';
        return [title, textPreview];
      }
      const word = result
        .foundWords
        .slice(0)
        .sort((a, b) => a.count - b.count)
        .find(({ word }) => lowerPhrase.includes(word))
        .word;
      /**
       * Note: This regexp makes no sense but it works, need to find a better way
       * of matching multilanguage words, which are sometimes a single character
       */
      const snippetMatcher = new RegExp(`(([^${WORD_CHARACTERS}]*[${WORD_CHARACTERS}]{1}){1,${numberOfPreviewWords}}|.{0,${numberOfPreviewCharacters}})${escapeRegExp(word)}(([${WORD_CHARACTERS}]{1}[^${WORD_CHARACTERS}]*){1,${numberOfPreviewWords}}|.{0,${numberOfPreviewCharacters}})`, 'i');
      const snippet = safePhrase.match(snippetMatcher)[0];
      const snippetIndexInPhrase = safePhrase.indexOf(snippet);
      const snippetEndInPhrase = (snippetIndexInPhrase + snippet.length);
      const isSnippetAtPhraseStart = (snippetIndexInPhrase === 0);
      const isSnippetAtPhraseEnd = (snippetEndInPhrase === phrase.length);
      const unsafeSnippet = phrase.slice(snippetIndexInPhrase, snippetEndInPhrase);
      const textPreview = `${isSnippetAtPhraseStart ? '' : '...'}${unsafeSnippet}${isSnippetAtPhraseEnd ? '' : '...'}`;
      return [title, textPreview];
    };
    const wrapWordsWithSpan = (words, text) => {
      const tagWords = words.map(({ word }) => word);
      const initial = [];
      while (text) {
        const lowerCaseText = text.toLowerCase();
        const wordTextPositions = tagWords.map(word => lowerCaseText.indexOf(word));
        const firstWordIndex = wordTextPositions.reduce((firstWordIndex, wordTextPosition, wordIndex) => {
          if (wordTextPosition === -1) return firstWordIndex;
          if (firstWordIndex === -1) return wordIndex;
          const firstWordTextPosition = wordTextPositions[firstWordIndex];
          if (wordTextPosition >= firstWordTextPosition) return firstWordIndex;
          return wordIndex;
        }, -1);
        if (firstWordIndex === -1) break;
        const word = tagWords[firstWordIndex];
        const wordTextPosition = wordTextPositions[firstWordIndex];
        initial.push(text.slice(0, wordTextPosition));
        initial.push(`<span class='is-found'>${text.slice(wordTextPosition, wordTextPosition + word.length)}</span>`);
        text = text.slice(wordTextPosition + word.length, text.length);
      }
      initial.push(text);
      return initial.join('');
    };
    const resultsLimit = Math.min(5, searchObject.searchResults.length);
    const formattedResults = searchObject.searchResults.slice(0, resultsLimit).map(result => {
      const [title, textPreview] = makeTextPreview(result);
      return {
        title,
        textPreview,
        titleTagged: wrapWordsWithSpan(result.foundWords, title),
        textPreviewTagged: wrapWordsWithSpan(result.foundWords, textPreview),
        foundWords: result.foundWords.map(({ word }) => word).join(' '),
        id: result.model.get('_id')
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
