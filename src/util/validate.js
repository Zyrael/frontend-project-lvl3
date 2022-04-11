import * as yup from 'yup';
import { setLocale } from 'yup';

export default (data, urls) => {
  setLocale({
    string: {
      url: 'notAUrl',
    },
    mixed: {
      notOneOf: 'urlIsAlreadyUsed',
    },
  });
  const schema = yup.string().url().notOneOf(urls).required();

  return schema.validate(data);
};
