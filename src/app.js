import init from './init.js';
import {
  validate, errorHandling, getData, parseXML, update,
} from './util/index.js';

export default () => {
  init().then((state) => {
    const formElement = document.querySelector('.rss-form');
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      state.setStatus('processing');

      const formData = new FormData(formElement);
      const url = formData.get('url');
      validate(url, state.getUrls())
        .then(getData)
        .then(({ data: { contents } }) => {
          const timerId = state.getTimerId();
          clearTimeout(timerId);
          const parsed = parseXML(contents);
          state.setContainerData(parsed);
          state.setStatus('finished');
        })
        .then(() => {
          state.addUrlToList(url);
          update(state);
        })
        .catch(errorHandling(state));
    });
  });
};
