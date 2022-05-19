const clearForm = () => {
  const input = document.querySelector('#url-input');
  input.classList.remove('is-invalid');

  const feedback = document.querySelector('.feedback');
  feedback.textContent = null;
};

const renderFormFailed = (state) => {
  clearForm();
  const input = document.querySelector('#url-input');
  input.classList.add('is-invalid');

  const formError = state.getFormError();
  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = state.getText(`form.errors.${formError}`);

  const submit = document.querySelector('button[type="submit"]');
  submit.disabled = false;
};

const renderFormProcessing = () => {
  clearForm();
  const submit = document.querySelector('button[type="submit"]');
  submit.disabled = true;
};

const renderFormFinished = (state) => {
  clearForm();
  const input = document.querySelector('#url-input');
  input.value = null;
  input.focus();

  const feedback = document.querySelector('.feedback');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.textContent = state.getText('form.finished');

  const submit = document.querySelector('button[type="submit"]');
  submit.disabled = false;
};

export {
  clearForm, renderFormFailed, renderFormProcessing, renderFormFinished,
};
