const renderFinished = (i18n) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');

  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('feedback.finished');
  input.value = null;
  submit.disabled = false;
};

const renderFailed = (state, i18n) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');
  const error = state.getFormError();

  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18n.t(`feedback.errors.${error}`);
  submit.disabled = false;
};

const clearForm = () => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');

  input.classList.remove('is-invalid');
  feedback.textContent = null;
};

export { clearForm, renderFailed, renderFinished };
