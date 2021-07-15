// override in course.json "_search": {}
const SEARCH_DEFAULTS = {

  title: 'Search',
  description: 'Type in search words',
  placeholder: '',
  noResultsMessage: 'Sorry, no results were found',
  awaitingResultsMessage: 'Formulating results...',
  _previewWords: 15,
  _previewCharacters: 30,
  _showHighlights: true,
  _showFoundWords: true,

  _searchAttributes: [
    {
      _attributeName: '_search',
      _level: 1,
      _allowTextPreview: false
    },
    {
      _attributeName: '_keywords',
      _level: 1,
      _allowTextPreview: false
    },
    {
      _attributeName: 'keywords',
      _level: 1,
      _allowTextPreview: false
    },
    {
      _attributeName: 'displayTitle',
      _level: 2,
      _allowTextPreview: true
    },
    {
      _attributeName: 'title',
      _level: 2,
      _allowTextPreview: false
    },
    {
      _attributeName: 'body',
      _level: 3,
      _allowTextPreview: true
    },
    {
      _attributeName: 'alt',
      _level: 4,
      _allowTextPreview: false
    },
    {
      _attributeName: '_alt',
      _level: 4,
      _allowTextPreview: false
    },
    {
      _attributeName: '_items',
      _level: 5,
      _allowTextPreview: false
    },
    {
      _attributeName: '_options',
      _level: 5,
      _allowTextPreview: false
    },
    {
      _attributeName: 'items',
      _level: 5,
      _allowTextPreview: false
    },
    {
      _attributeName: 'text',
      _level: 5,
      _allowTextPreview: true
    }
  ],

  _hideComponents: [
    'blank',
    'assessmentResults'
  ],

  _hideTypes: [

  ],

  _ignoreWords: [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
    'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
    'that', 'the', 'to', 'was', 'were', 'will', 'wish', ''
  ],

  _matchOn: {
    _contentWordBeginsPhraseWord: false,
    _contentWordContainsPhraseWord: false,
    _contentWordEqualsPhraseWord: true,
    _phraseWordBeginsContentWord: true
  },

  _scoreQualificationThreshold: 20,
  _minimumWordLength: 2,
  _frequencyImportance: 5

};

export default SEARCH_DEFAULTS;
