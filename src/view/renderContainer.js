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

const getFeedElement = ({ title, description }) => {
  const feedElement = document.createElement('li');
  feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');

  const titleElement = document.createElement('h3');
  titleElement.classList.add('h6', 'm-0');
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.classList.add('m-0', 'small', 'text-black-50');
  descriptionElement.textContent = description;

  feedElement.append(titleElement, descriptionElement);
  return feedElement;
};

const getPostElement = (state, {
  title, link, id, isRead,
}) => {
  const postElement = document.createElement('li');
  postElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const browseCB = () => {
    state.setCurrentId(id);
  };

  const linkElement = document.createElement('a');
  const classes = (isRead === 'true') ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
  linkElement.classList.add(...classes);
  linkElement.href = link;
  linkElement.target = '_blank';
  linkElement.rel = 'noopener noreferer';
  linkElement.textContent = title;
  linkElement.dataset.id = id;
  linkElement.addEventListener('click', browseCB);
  postElement.append(linkElement);

  const browseButton = document.createElement('button');
  browseButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  browseButton.dataset.bsToggle = 'modal';
  browseButton.dataset.bsTarget = '#modal';
  browseButton.textContent = state.getText('browseButton');
  browseButton.addEventListener('click', browseCB);
  postElement.append(browseButton);

  return postElement;
};

export default (state) => {
  const feedsElement = document.querySelector('.feeds');
  const feedsCard = getCard(state.getText('container.feeds'));
  const feedsList = feedsCard.querySelector('ul');
  const postsElement = document.querySelector('.posts');
  const postsCard = getCard(state.getText('container.posts'));
  const postsList = postsCard.querySelector('ul');
  const { feeds, posts } = state.getContainerData();

  feedsElement.replaceChildren(feedsCard);
  postsElement.replaceChildren(postsCard);

  feedsList.append(...feeds.map(getFeedElement));
  postsList.append(...posts.map((post) => getPostElement(state, post)));
};
