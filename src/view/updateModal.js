export default ({ title, description, link }) => {
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const fullArticle = document.querySelector('.full-article');

  modalTitle.textContent = title;
  modalBody.textContent = description;
  fullArticle.href = link;
};
