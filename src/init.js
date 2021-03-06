import i18next from 'i18next';
import _ from 'lodash';
import view from './view/index.js';
import ru from './locales/index.js';

export default () => {
  const i18n = i18next.createInstance();
  return i18n.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  }).then(() => {
    const state = {
      i18n,
      urls: [],
      currentId: null,
      status: 'ready',
      formError: null,
      timerId: null,
      container: {
        feeds: [],
        posts: [],
      },
      setTimerId(timerTd) {
        this.timerId = timerTd;
      },
      getTimerId() {
        return this.timerId;
      },
      setCurrentId(id) {
        this.currentId = id;
      },
      getCurrentPost() {
        return this.container.posts.find(({ id }) => id === this.currentId);
      },
      setContainerData({ title, description, children }) {
        this.container.feeds.unshift({ title, description });
        this.container.posts.unshift(...children.map((child) => ({ ...child, id: _.uniqueId() })));
      },
      addNewPosts(newPosts) {
        this.container.posts.unshift(...newPosts.map((child) => ({ ...child, id: _.uniqueId() })));
      },
      getContainerData() {
        return this.container;
      },
      getText(key) {
        return i18n.t(key);
      },
      getFormError() {
        return this.formError;
      },
      setStatus(status, message = null) {
        this.formError = message;
        this.status = status;
      },
      getUrls() {
        return this.urls;
      },
      addUrlToList(url) {
        this.urls.push(url);
      },
    };

    return view(state);
  });
};
