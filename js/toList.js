/**
 * Normalises a comma-separated string or an array into an array of trimmed,
 * non-empty strings. The authoring tool stores these settings as strings.
 * @param {string|[string]} value
 * @returns {[string]}
 */
export default function toList(value) {
  const items = Array.isArray(value) ? value : String(value ?? '').split(',');
  return items.map(item => String(item).trim()).filter(Boolean);
}
