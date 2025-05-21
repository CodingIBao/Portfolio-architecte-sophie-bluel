/**
 * Returns a list of unique categories from a list of works.
 * 
 * @param {Object[]} works - Array of work objects.
 * @returns {Object[]} - Array of unique category objects.
 */
export function getUniqueCategories(works) {
  const allCategories = works.map(work => work.category);
  const uniqueCategoryIds = new Set();

  const uniqueCategories = allCategories.filter(category => {
  const isDuplicate = uniqueCategoryIds.has(category.id);
  uniqueCategoryIds.add(category.id);
  return !isDuplicate;
  });

  return uniqueCategories;
}