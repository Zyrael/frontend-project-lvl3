import getData from './getData.js';
import parseXML from './parseXML.js';

const update = (state) => {
  state.setStatus('updating');
  const urls = state.getUrls();
  Promise.all(urls.map(getData))
    .then((responseArray) => responseArray
      .forEach(({ data: { contents } }) => {
        const { children } = parseXML(contents);
        const { posts } = state.getContainerData();
        const newPosts = children
          .filter(({ pubDate }) => !posts
            .find((post) => post.pubDate === pubDate));
        state.addNewPosts(newPosts);
      }))
    .then(() => {
      state.setTimerId(setTimeout(() => update(state), 5000));
      state.setStatus('updated');
    });
};

export default update;
