import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId';
import ru from './locales/ru.js';
import parse from './parser.js';
import {
  clearForm, renderFailed, renderFinished, renderContainer, updateModal,
} from './render';

const schema = yup.string().url().required();

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submit: document.querySelector('button[type="submit"]'),
    postsEl: document.querySelector('.posts'),
    feedsEl: document.querySelector('.feeds'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    fullArticle: document.querySelector('.full-article'),
  };

  const state = onChange({
    timerId: null,
    usedUrls: [],
    loopStatus: 'ready for processing',
    form: {
      status: 'ready for processing',
      error: null,
    },
    container: {
      currPostData: {
        currPostId: null,
      },
      feeds: [],
      posts: [],
    },
  }, (path, value) => {
    if (path === 'form') {
      clearForm(elements);
      switch (value.status) {
        case 'failed':
          renderFailed(value.error, i18n, elements);
          break;
        case 'processing':
          elements.submit.disabled = true;
          break;
        case 'finished':
          renderFinished(i18n, elements);
          renderContainer(i18n, state, elements);
          clearTimeout(state.timerId);
          break;
        default:
          break;
      }
    }
    if (path === 'container.currPostData.currPostId') {
      const { container: { posts } } = state;
      const currPost = posts.find(({ id }) => id === value);
      currPost.status = 'read';
      renderContainer(i18n, state, elements);
      updateModal(elements, currPost);
    }
  });

  const { input, modal, form } = elements;

  input.addEventListener('input', () => {
    document.body.setAttribute('wfd-invisible', 'true');
    modal.setAttribute('wfd-invisible', 'true');
  });

  const getData = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

  const loop = () => {
    Promise.all(state.usedUrls.map(getData))
      .then((response) => response.reduce((acc, { data: { contents } }) => {
        const { parsedPosts } = parse(contents);
        acc.push(...parsedPosts);
        return acc;
      }, []))
      .then((parsedPosts) => {
        const { container: { posts } } = state;
        parsedPosts.forEach((parsedPost) => {
          if (!posts.find(({ pubDate }) => pubDate === parsedPost.pubDate)) {
            posts.push({ ...parsedPost, id: uniqueId() });
          }
        });
      })
      .then(() => renderContainer(i18n, state, elements))
      .then(() => {
        state.timerId = setTimeout(loop, 5000);
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    schema.validate(url)
      .then((validated) => {
        if (state.usedUrls.includes(validated)) throw new Error('already used');

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
