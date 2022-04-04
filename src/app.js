import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import ru from './locales/ru.js';
import parse from './parser.js';
import {
  clearForm, renderFailed, renderFinished, renderContainer, updateModal,
} from './view';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const state = onChange({
    timerId: null,
    usedUrls: [],
    currPostId: null,
    form: {
      status: 'ready for processing',
      error: null,
    },
    container: {
      feeds: [],
      posts: [],
    },
    getUsedUrls() {
      return this.usedUrls;
    },
    getFeeds() {
      return this.container.feeds;
    },
    getPosts() {
      return this.container.posts;
    },
    getFormError() {
      return this.form.error;
    },
    getCurrPost(id) {
      return this.container.posts.find((post) => post.id === id);
    },
    getTimer() {
      return this.timerId;
    },
    setCurrPostId(id) {
      this.currPostId = id;
    },
    setTimer(timer) {
      this.timerId = timer;
    },
  }, (path, value) => {
    if (path === 'form') {
      clearForm();
      const submit = document.querySelector('button[type="submit"]');
      switch (value.status) {
        case 'failed':
          renderFailed(state, i18n);
          break;
        case 'processing':
          submit.disabled = true;
          break;
        case 'finished':
          renderFinished(i18n);
          renderContainer(i18n, state);
          break;
        default:
          break;
      }
    }
    if (path === 'currPostId') {
      const currPost = state.getCurrPost(value);
      currPost.status = 'read';
      renderContainer(i18n, state);
      updateModal(currPost);
    }
  }, { details: true });

  const input = document.querySelector('#url-input');
  input.addEventListener('input', () => {
    const modal = document.querySelector('.modal');

    document.body.setAttribute('wfd-invisible', 'true');
    modal.setAttribute('wfd-invisible', 'true');
  });

  const getData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
  
  const postAlreadyExists = (parsedPost) => {
    const posts = state.getPosts();
    return posts.find(({ pubDate }) => pubDate === parsedPost.pubDate);
  };

  const loop = () => {
    Promise.all(state.usedUrls.map(getData))
      .then((response) => response.reduce((acc, { data: { contents } }) => {
        const { parsedPosts } = parse(contents);
        acc.push(...parsedPosts);
        return acc;
      }, []))
      .then((parsedPosts) => {
        const posts = state.getPosts();
        parsedPosts.forEach((parsedPost) => {
          if (!postAlreadyExists(parsedPost)) {
            posts.push({ ...parsedPost, id: uniqueId() });
          }
        });
      })
      .then(() => renderContainer(i18n, state))
      .then(() => {
        state.setTimer(setTimeout(loop, 5000));
      });
  };

  const usedUrls = state.getUsedUrls();
  const urlSchema = yup.string().url().required();

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    urlSchema.validate(url)
      .then((validated) => {
        state.form = { status: 'processing', error: null };
        return validated;
      })
      .then(getData)
      .then(({ data: { contents } }) => {
        state.usedUrls.push(url);

        const { container: { feeds, posts } } = state;
        const { parsedFeed, parsedPosts } = parse(contents);

        feeds.push(parsedFeed);
        posts.push(...parsedPosts.map((parsedPost) => ({ ...parsedPost, id: uniqueId() })));

        state.form = { status: 'finished', error: null };
      })
      .then(() => {
        clearTimeout(state.getTimer());
      })
      .then(loop)
      .catch((error) => {
        switch (error.message) {
          case 'this must be a valid URL':
            state.form = { status: 'failed', error: 'validationError' };
            break;
          case 'Network Error':
            state.form = { status: 'failed', error: 'networkError' };
            break;
          case 'already used':
            state.form = { status: 'failed', error: 'alreadyUsed' };
            break;
          case 'not an RSS':
            state.form = { status: 'failed', error: 'notAnRSS' };
            break;
          default:
            state.form = { status: 'failed', error: null };
            break;
        }
      });
  });
};
