import uniqueId from 'lodash/uniqueId';

export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  if (!doc.querySelector('rss')) throw new Error('not an RSS');

  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const posts = [];
  const docItems = doc.querySelectorAll('item');
  docItems.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    posts.unshift({
      title,
      description,
      link,
      id: uniqueId(),
    });
  });
  return {
    feed: {
      feedTitle, feedDescription,
    },
    posts,
  };
};
