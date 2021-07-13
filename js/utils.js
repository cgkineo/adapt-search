import WORD_CHARACTERS from './WORD_CHARACTERS';

const replaceTagsRegEx = /<{1}[^>]+>/g;
const replaceEscapedTagsRegEx = /&lt;[^&gt;]+&gt;/g;
const replaceEndTagsRegEx = /<{1}\/{1}[^>]+>/g;
const replaceEscapedEndTagsRegEx = /&lt;\/[^&gt;]+&gt;/g;

export function stripTags (text) {
  text = $('<span>' + text + '</span>').html();
  return text
    .replace(replaceEndTagsRegEx, ' ')
    .replace(replaceTagsRegEx, '')
    .replace(replaceEscapedEndTagsRegEx, ' ')
    .replace(replaceEscapedTagsRegEx, '')
    .trim();
}

export function tag(words, text) {
  let initial = '';
  Object.entries(words).forEach(([word, count]) => {
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

export const matchNotWordBoundaries = new RegExp('[' + WORD_CHARACTERS + ']+', 'g');

export const trimReplaceNonWordCharacters = new RegExp('^([^' + WORD_CHARACTERS + '])+|([^' + WORD_CHARACTERS + '])+$', 'g');

export const trimReplaceWhitespace = /^\s+|\s+$/g;

export const escapeRegExp = str => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
