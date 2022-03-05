import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.string().url().required();

export default () => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');

  const state = onChange({
    url: '',
    form: {
      validation: 'valid',
    },
  }, (path, value) => {
    if (path === 'url') {
      schema.validate(value).then(() => {
        state.form.validation = 'valid';
      }).catch(() => {
        state.form.validation = 'invalid';
      });
    }
    if (path === 'form.validation') {
      if (value === 'valid') {
        input.classList.remove('is-invalid');
        feedback.textContent = '';
      } else {
        input.classList.add('is-invalid');
        feedback.textContent = 'Ссылка должна быть валидным URL';
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const url = formData.get('url');
    state.url = url;
  });
};
