import uniqueId from 'lodash/uniqueId';

export default (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response, 'text/xml');
  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const items = [];
  const docItems = doc.querySelectorAll('item');
  docItems.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    items.push({
      title,
      description,
      link,
      id: uniqueId(),
    });
  });
  return { feedTitle, feedDescription, items };
};