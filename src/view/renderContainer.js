const getCard = (title) => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('div');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = title;

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  cardBody.append(cardTitle);
  card.append(cardBody);
  card.append(ul);

  return card;
};

const getFeedElement = ({ feedTitle, feedDescription }) => {
  const feedElement = document.createElement('li');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  feedElement.append(title, description);
  return feedElement;
};

const updateModal = ({ title, description, link }) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const fullArticle = document.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticle.setAttribute('href', link);
};

const getLinkElement = ({
  title, status, link, id,
}) => {
  const linkElement = document.createElement('a');
  const linkClasses = (status === 'read') ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
  linkElement.classList.add(...linkClasses);
  linkElement.setAttribute('href', link);
  linkElement.setAttribute('target', '_blank');
  linkElement.setAttribute('rel', 'noopener noreferer');
  linkElement.setAttribute('data-id', id);
  linkElement.textContent = title;
  return linkElement;
};

const getBrowseButton = (i18n) => {
  const browseButton = document.createElement('button');
  browseButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  browseButton.setAttribute('data-bs-toggle', 'modal');
  browseButton.setAttribute('data-bs-target', '#modal');
  browseButton.textContent = i18n.t('browse');
  return browseButton;
};

const getBrowseCB = (state, id) => () => {
  const currPost = state.getCurrPost(id);

  state.setCurrPostId(id);
  updateModal(currPost);
};

const getPostElement = (i18n, state, post) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkElement = getLinkElement(post);
  linkElement.addEventListener('click', getBrowseCB(state, post.id));
  const browseButton = getBrowseButton(i18n);
  browseButton.addEventListener('click', getBrowseCB(state, post.id));
  postElement.append(linkElement, browseButton);

  return postElement;
};

const renderContainer = (i18n, state) => {
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');

  const feedsCard = getCard(i18n.t('feeds'));
  const postsCard = getCard(i18n.t('posts'));

  feedsContainer.replaceChildren(feedsCard);
  postsContainer.replaceChildren(postsCard);

  const feedsList = feedsCard.querySelector('ul');
  const postsList = postsCard.querySelector('ul');

  const feeds = state.getFeeds();
  const posts = state.getPosts();

  feedsList.append(...feeds.map(getFeedElement));
  postsList.append(...posts.map((post) => getPostElement(i18n, state, post)));
};

export { renderContainer, updateModal };
