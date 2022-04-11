export default (contents) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(contents, 'text/xml');
  if (!data.querySelector('rss')) throw new Error('notAnXML');
  const channel = data.querySelector('channel');
  return Array.from(channel.children)
    .reduce((acc, node) => {
      if (!node.childElementCount) {
        if (node.tagName === 'title') return { ...acc, title: node.textContent };
        if (node.tagName === 'description') return { ...acc, description: node.textContent };
        return acc;
      }
      const item = {
        title: node.querySelector('title').textContent,
        description: node.querySelector('description').textContent,
        link: node.querySelector('link').textContent,
        pubDate: node.querySelector('pubDate').textContent,
        isRead: 'false',
      };

      return { ...acc, children: acc.children ? [...acc.children, item] : [item] };
    }, {});
};
