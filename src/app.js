import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import ru from './locales/ru.js';
import parser from './parser.js';

const schema = yup.string().url().required();

export default () => {
  const usedUrls = [];

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');

  const getCard = (title) => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    card.append(cardBody);

    const cardTitle = document.createElement('div');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = title;
    cardBody.append(cardTitle);

    return card;
  };

  const renderFeeds = (feeds) => {
    const postsCard = getCard(i18nextInstance.t('posts'));
    const feedsCard = getCard(i18nextInstance.t('feeds'));

    postsEl.replaceChildren(postsCard);
    feedsEl.replaceChildren(feedsCard);

    const postsUl = document.createElement('ul');
    postsUl.classList.add('list-group', 'border-0', 'rounded-0');
    postsCard.append(postsUl);

    const feedsUl = document.createElement('ul');
    feedsUl.classList.add('list-group', 'border-0', 'rounded-0');
    feedsCard.append(feedsUl);

    feeds.forEach(({ feedTitle, feedDescription, items }) => {
      const feedEl = document.createElement('li');
      feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedsUl.append(feedEl);

      const feedTitleEl = document.createElement('h3');
      feedTitleEl.classList.add('h6', 'm-0');
      feedTitleEl.textContent = feedTitle;
      feedEl.append(feedTitleEl);

      const feedDescriptionEl = document.createElement('p');
      feedDescriptionEl.classList.add('m-0', 'small', 'text-black-50');
      feedDescriptionEl.textContent = feedDescription;
      feedEl.append(feedDescriptionEl);

      items.forEach(({ title, link, id }) => {
        const postEl = document.createElement('li');
        postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        postsUl.append(postEl);

        const a = document.createElement('a');
        a.href = link;
        a.classList.add('fw-bold');
        a.target = '_blank';
        a.rel = 'noopener noreferer';
        a.textContent = title;
        a.dataset.id = id;
        postEl.append(a);

        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.textContent = i18nextInstance.t('button');
        postEl.append(button);
      });
    });
  };

  const renderFinished = () => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18nextInstance.t('feedback.finished');
  };

  const renderErrors = (error) => {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = i18nextInstance.t(`feedback.errors.${error}`);
  };

  const renderLoop = (feeds) => {
    renderFeeds(feeds);
    setTimeout(() => {
      renderLoop(feeds);
    }, 5000);
  };

  const state = onChange({
    form: {
      status: 'ready for processing',
      error: '',
    },
    feeds: [],
  }, (path, value, prevValue) => {
    if (prevValue.status === 'failed') {
      input.classList.remove('is-invalid');
      feedback.textContent = '';
    }
    if (path === 'form') {
      switch (value.status) {
        case 'failed':
          renderErrors(state.form.error);
          submit.disabled = false;
          break;
        case 'processing':
          submit.disabled = true;
          break;
        case 'finished':
          renderLoop(state.feeds);
          renderFinished();
          input.value = null;
          submit.disabled = false;
          break;
        default:
          break;
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    schema.validate(url)
      .then((validated) => {
        if (usedUrls.includes(validated)) throw new Error('already used');

        state.form = { status: 'processing', error: '' };
        return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(validated)}`);
      })
      .then(({ data: { contents } }) => {
        usedUrls.push(url);
        const parsedFeed = parser(contents);
        state.feeds.unshift(parsedFeed);
        state.form = { status: 'finished', error: '' };
      })
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
          default:
            state.form = { status: 'failed', error: '' };
            break;
        }
      });
  });
};
