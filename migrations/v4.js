import { describe, getCourse, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, testStopWhere, testSuccessWhere } from 'adapt-migrations';

describe('adapt-search - v4.2.8 to v4.3.0', async () => {

  // https://github.com/cgkineo/adapt-search/compare/v4.2.8..v4.3.0

  let course, searchItems;
  const listAttributes = ['_ignoreWords', '_hideComponents', '_hideTypes'];
  const toCommaString = value => value.map(item => String(item).trim()).filter(Boolean).join(',');
  const toArray = value => value.split(',').map(item => item.trim()).filter(Boolean);

  whereFromPlugin('adapt-search - from v4.2.8', { name: 'adapt-search', version: '<4.3.0' });

  whereContent('adapt-search - where search is configured', async content => {
    course = getCourse();
    searchItems = content.filter(({ _search }) => _search);
    return searchItems.length;
  });

  mutateContent('adapt-search - convert course list attributes to comma-separated strings', async () => {
    if (!course?._search) return true;
    listAttributes.forEach(name => {
      const value = course._search[name];
      if (Array.isArray(value)) course._search[name] = toCommaString(value);
    });
    return true;
  });

  mutateContent('adapt-search - convert keywords to an array', async () => {
    searchItems.forEach(item => {
      const keywords = item._search.keywords;
      if (typeof keywords === 'string') item._search.keywords = toArray(keywords);
    });
    return true;
  });

  checkContent('adapt-search - check course list attributes', async () => {
    const isValid = !course?._search || listAttributes.every(name => !Array.isArray(course._search[name]));
    if (!isValid) throw new Error('adapt-search - course list attributes not converted to comma-separated strings');
    return true;
  });

  checkContent('adapt-search - check keywords', async () => {
    const isValid = searchItems.every(({ _search }) => typeof _search.keywords !== 'string');
    if (!isValid) throw new Error('adapt-search - keywords not converted to an array');
    return true;
  });

  updatePlugin('adapt-search - update to v4.3.0', { name: 'adapt-search', version: '4.3.0', framework: '>=5.8' });

  testSuccessWhere('search with array course attributes and string keywords', {
    fromPlugins: [{ name: 'adapt-search', version: '4.2.8' }],
    content: [
      { _type: 'course', _search: { _ignoreWords: ['a', 'an'], _hideComponents: ['blank'], _hideTypes: [] } },
      { _type: 'component', _search: { keywords: 'alpha, beta' } }
    ]
  });

  testSuccessWhere('search already using the authored formats', {
    fromPlugins: [{ name: 'adapt-search', version: '4.2.8' }],
    content: [
      { _type: 'course', _search: { _ignoreWords: 'a,an' } },
      { _type: 'component', _search: { keywords: ['alpha'] } }
    ]
  });

  testStopWhere('search not configured', {
    fromPlugins: [{ name: 'adapt-search', version: '4.2.8' }],
    content: [
      { _type: 'course' }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-search', version: '4.3.0' }]
  });
});
