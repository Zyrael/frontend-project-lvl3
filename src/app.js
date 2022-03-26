import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import ru from './locales/ru.js';
import parser from './parser.js';

const schema = yup.string().url().required();

export default () => {
  const usedUrls = [];
  const postsData = [];

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: { ru },
  });

  const { body } = document;
  const form = document.querySelector('.rss-form');
  const input = form.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');
  const postsEl = document.querySelector('.posts');
  const feedsEl = document.querySelector('.feeds');
  const modal = document.querySelector('.modal');
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const fullArticle = modal.querySelector('.full-article');

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

  const updateModal = ({ title, description, link }) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = description;
    fullArticle.href = link;
  };

  const renderFeeds = (feeds) => {
    const feedsCard = getCard(i18nextInstance.t('feeds'));

    feedsEl.replaceChildren(feedsCard);

    const feedsUl = document.createElement('ul');
    feedsUl.classList.add('list-group', 'border-0', 'rounded-0');
    feedsCard.append(feedsUl);

    feeds.forEach(({ feedTitle, feedDescription }) => {
      const feedEl = document.createElement('li');
      feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
      feedsUl.prepend(feedEl);

      const feedTitleEl = document.createElement('h3');
      feedTitleEl.classList.add('h6', 'm-0');
      feedTitleEl.textContent = feedTitle;
      feedEl.append(feedTitleEl);

      const feedDescriptionEl = document.createElement('p');
      feedDescriptionEl.classList.add('m-0', 'small', 'text-black-50');
      feedDescriptionEl.textContent = feedDescription;
      feedEl.append(feedDescriptionEl);
    });
  };

  const renderPosts = (posts) => {
    const postsCard = getCard(i18nextInstance.t('posts'));
    postsEl.replaceChildren(postsCard);

    const postsUl = document.createElement('ul');
    postsUl.classList.add('list-group', 'border-0', 'rounded-0');
    postsCard.append(postsUl);

    posts.forEach(({
      title, description, link, id,
    }) => {
      const postEl = document.createElement('li');
      postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
      postsUl.prepend(postEl);

      const postData = postsData.find((post) => post.id === id);

      const browseCB = () => {
        postData.status = 'read';
        updateModal({ title, description, link });
        renderPosts(posts);
      };

      const a = document.createElement('a');
      a.href = link;
      const classes = postData.status === 'unread' ? ['fw-bold'] : ['fw-normal', 'link-secondary'];
      a.classList.add(...classes);
      a.target = '_blank';
      a.rel = 'noopener noreferer';
      a.textContent = title;
      a.dataset.id = id;
      a.addEventListener('click', browseCB);
      postEl.append(a);

      const browse = document.createElement('button');
      browse.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      browse.dataset.bsToggle = 'modal';
      browse.dataset.bsTarget = '#modal';
      browse.textContent = i18nextInstance.t('browse');
      browse.addEventListener('click', browseCB);
      postEl.append(browse);
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

  const renderLoop = ({ feeds, posts }) => {
    renderFeeds(feeds);
    renderPosts(posts);
    setTimeout(() => {
      renderFeeds(feeds);
      renderPosts(posts);
    }, 5000);
  };

  const renderEmpty = () => {
    input.classList.remove('is-invalid');
    feedback.textContent = null;
  };

  const state = onChange({
    form: {
      status: 'ready for processing',
      error: null,
    },
    container: {
      currPostId: null,
      feeds: [],
      posts: [],
    },
  }, (path, value) => {
    if (path === 'form') {
      switch (value.status) {
        case 'failed':
          renderEmpty();

          renderErrors(state.form.error);
          submit.disabled = false;
          break;
        case 'processing':
          renderEmpty();

          submit.disabled = true;
          break;
        case 'finished':
          renderEmpty();

          renderLoop(state.container);
          renderFinished();
          input.value = null;
          submit.disabled = false;
          break;
        default:
          break;
      }
    }
  });

  input.addEventListener('input', () => {
    body.setAttribute('wfd-invisible', 'true');
    modal.setAttribute('wfd-invisible', 'true');
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
        const { feed, posts } = parser(contents);
        state.container.feeds.push(feed);
        state.container.posts.push(...posts);
        postsData.push(...posts.map(({ id }) => ({ id, status: 'unread' })));
        state.form = { status: 'finished', error: null };
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
