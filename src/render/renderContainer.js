const getCard = (title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);

  const cardTitle = document.createElement('div');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = title;
  cardBody.append(cardTitle);

  return card;
};

const updateModal = ({ modalTitle, modalBody, fullArticle }, { title, description, link }) => {
  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticle.href = link;
};

const getPostEl = (i18n, currPostData, {
  title, status, link, id,
}) => {
  const postEl = document.createElement('li');
  postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const browseCB = () => {
    currPostData.currPostId = id;
  };

  const a = document.createElement('a');
  a.href = link;
  const classes = (status === 'read') ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
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
  browse.textContent = i18n.t('browse');
  browse.addEventListener('click', browseCB);
  postEl.append(browse);
  return postEl;
};

const getFeedEl = ({ feedTitle, feedDescription }) => (
  `<li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">${feedTitle}</h3>
    <p class="m-0 small text-black-50">${feedDescription}</p>
  </li>`
);

const renderContainer = (i18n, { container: { currPostData, feeds, posts } }, elements) => {
  const { feedsEl, postsEl } = elements;

  const feedsCard = getCard(i18n.t('feeds'));
  feedsEl.replaceChildren(feedsCard);
  const postsCard = getCard(i18n.t('posts'));
  postsEl.replaceChildren(postsCard);

  const feedsUl = feedsCard.querySelector('ul');
  const feedsElements = feeds.map(getFeedEl);
  feedsUl.innerHTML = feedsElements.join('\n');

  const postsUl = postsCard.querySelector('ul');
  posts.forEach((post) => {
    postsUl.prepend(getPostEl(i18n, currPostData, post));
  });
};

export { renderContainer, updateModal };
