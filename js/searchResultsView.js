import Adapt from 'core/js/adapt';
import SearchAlgorithm from './search-algorithm';

const replaceTagsRegEx = /<{1}[^>]+>/g;
const replaceEscapedTagsRegEx = /&lt;[^&gt;]+&gt;/g;
const replaceEndTagsRegEx = /<{1}\/{1}[^>]+>/g;
const replaceEscapedEndTagsRegEx = /&lt;\/[^&gt;]+&gt;/g;

export default class SearchResultsView extends Backbone.View {

  className() {
    return 'search__items-container is-inactive';
  }

  events() {
    return {
      'click [data-id]': 'navigateToResultPage'
    };
  }

  initialize(options) {
    this.listenTo(Adapt, {
      'drawer:empty': this.remove,
      'search:termsFiltered': this.updateResults
    });

    this.render();

    if (options.searchObject) {
      this.updateResults(options.searchObject);
    }
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
    const self = this;
    const resultsLimit = Math.min(5, searchObject.searchResults.length);

    const formattedResults = _.map(_.first(searchObject.searchResults, resultsLimit), function(result) {
      return self.formatResult(result);
    });

    searchObject.formattedResults = formattedResults;
    return searchObject;
  }

  formatResult(result, query) {
    const foundWords = _.keys(result.foundWords).join(' ');
    let title = result.model.get('title');
    let displayTitle = result.model.get('displayTitle');
    let body = result.model.get('body');
    const previewWords = this.model.get('_previewWords');
    const previewCharacters = this.model.get('_previewCharacters');
    const wordCharacters = window.search._regularExpressions.wordCharacters;

    // trim whitespace
    title = title.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace, '');
    displayTitle = displayTitle.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace, '');
    body = body.replace(SearchAlgorithm._regularExpressions.trimReplaceWhitespace, '');

    // strip tags
    title = this.stripTags(title);
    displayTitle = this.stripTags(displayTitle);
    body = this.stripTags(body);

    let searchTitle = '';
    let textPreview = '';

    // select title
    if (!title) {
      searchTitle = $('<div>' + displayTitle + '</div>').text() || 'No title found';
    } else {
      searchTitle = $('<div>' + title + '</div>').text();
    }

    let finder;
    // select preview text
    if (result.foundPhrases.length > 0) {
      let phrase = result.foundPhrases[0].phrase;
      // strip tags
      phrase = this.stripTags(phrase);

      let lowerPhrase = phrase.toLowerCase();
      const lowerSearchTitle = searchTitle.toLowerCase();

      if (lowerPhrase === lowerSearchTitle && result.foundPhrases.length > 1) {
        phrase = result.foundPhrases[1].phrase;
        // strip tags
        phrase = this.stripTags(phrase);
        lowerPhrase = phrase.toLowerCase();
      }

      if (lowerPhrase === lowerSearchTitle) {
        // if the search phrase and title are the same
        finder = new RegExp('(([^' + wordCharacters + ']*[' + wordCharacters + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
        if (body) {
          textPreview = body.match(finder)[0] + '...';
        }
      } else {
        const wordMap = _.map(result.foundWords, function(count, word) {
          return { word: word, count: count };
        });
        _.sortBy(wordMap, function(item) {
          return item.count;
        });
        let wordIndex = 0;
        let wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
        while (wordInPhraseStartPosition === -1) {
          wordIndex++;
          if (wordIndex === wordMap.length) throw new Error('search: cannot find word in phrase');
          wordInPhraseStartPosition = lowerPhrase.indexOf(wordMap[wordIndex].word);
        }
        const regex = new RegExp('(([^' + wordCharacters + ']*[' + wordCharacters + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})' + SearchAlgorithm._regularExpressions.escapeRegExp(wordMap[wordIndex].word) + '(([' + wordCharacters + ']{1}[^' + wordCharacters + ']*){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
        const snippet = phrase.match(regex)[0];
        const snippetIndexInPhrase = phrase.indexOf(snippet);
        if (snippet.length === phrase.length) {
          textPreview = snippet;
        } else if (snippetIndexInPhrase === 0) {
          textPreview = snippet + '...';
        } else if (snippetIndexInPhrase + snippet.length === phrase.length) {
          textPreview = '...' + snippet;
        } else {
          textPreview = '...' + snippet + '...';
        }
      }

    } else {
      finder = new RegExp('(([^' + wordCharacters + ']*[' + wordCharacters + ']{1}){1,' + previewWords + '}|.{0,' + previewCharacters + '})', 'i');
      if (body) {
        textPreview = body.match(finder)[0] + '...';
      }
    }

    const searchTitleTagged = tag(result.foundWords, searchTitle);
    const textPreviewTagged = tag(result.foundWords, textPreview);

    return {
      searchTitleTagged: searchTitleTagged,
      searchTitle: searchTitle,
      foundWords: foundWords,
      textPreview: textPreview,
      textPreviewTagged: textPreviewTagged,
      id: result.model.get('_id')
    };

    function tag(words, text) {
      let initial = '';
      _.each(words, function(count, word) {
        const wordPos = text.toLowerCase().indexOf(word);
        if (wordPos < 0) return;
        initial += text.slice(0, wordPos);
        const highlighted = text.slice(wordPos, wordPos + word.length);
        initial += "<span class='is-found'>" + highlighted + '</span>';
        text = text.slice(wordPos + word.length, text.length);
      });
      initial += text;
      return initial;
    }
  }

  stripTags (text) {
    text = $('<span>' + text + '</span>').html();
    return text
      .replace(replaceEndTagsRegEx, ' ')
      .replace(replaceTagsRegEx, '')
      .replace(replaceEscapedEndTagsRegEx, ' ')
      .replace(replaceEscapedTagsRegEx, '');
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
