const renderFinished = (i18n, { input, feedback, submit }) => {
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = i18n.t('feedback.finished');
  input.value = null;
  submit.disabled = false;
};

const renderFailed = (error, i18n, { input, feedback, submit }) => {
  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18n.t(`feedback.errors.${error}`);
  submit.disabled = false;
};

const clearForm = ({ input, feedback }) => {
  input.classList.remove('is-invalid');
  feedback.textContent = null;
};

export { clearForm, renderFailed, renderFinished };
