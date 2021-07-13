import Adapt from 'core/js/adapt';

export default class SearchableText {

  constructor({
    text,
    level,
    searchAttribute
  } = {}) {
    this.name = searchAttribute._attributeName;
    this.allowTextPreview = searchAttribute._allowTextPreview;
    this.level = (level || searchAttribute._level);
    this.text = text;
    this.score = (1 / this.level);
  }

  static allFromModel(model) {
    const searchAttributes = Adapt.course.get('_search')._searchAttributes;
    const searchableTexts = [];
    const processValue = (value, searchAttribute, level) => {
      if (typeof value === 'object') return _recursivelyCollectTexts(value, searchAttribute._level);
      if (typeof value !== 'string') return;
      const text = $('<div>' + value.trim() + '</div>').text().trim();
      if (!text) return;
      searchableTexts.push(new SearchableText({
        text,
        level,
        searchAttribute
      }));
    };
    const _recursivelyCollectTexts = (json = model.toJSON(), level = 0) => {
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
    _recursivelyCollectTexts();
    return searchableTexts;
  }

}
