export default (contents) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/xml');
  const feedTitle = doc.querySelector('title').textContent;
  const feedDescription = doc.querySelector('description').textContent;
  const docItems = doc.querySelectorAll('item');
  const parsedFeed = { feedTitle, feedDescription };
  const parsedPosts = [];

  docItems.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const pubDate = item.querySelector('pubDate').textContent;

    parsedPosts.unshift({
      status: 'unread',
      title,
      description,
      link,
      pubDate,
    });
  });

  return { parsedFeed, parsedPosts };
};
