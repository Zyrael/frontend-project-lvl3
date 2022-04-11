import onChange from 'on-change';
import {
  clearForm, renderFormFailed, renderFormProcessing, renderFormFinished,
} from './renderForm.js';
import renderContainer from './renderContainer.js';
import updateModal from './updateModal.js';

export default (state) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      clearForm();
      switch (value) {
        case 'failed':
          renderFormFailed(watchedState);
          break;
        case 'processing':
          renderFormProcessing();
          break;
        case 'finished':
          renderFormFinished(watchedState);
          renderContainer(watchedState);
          break;
        case 'updated':
          renderContainer(watchedState);
          break;
        default:
          clearForm();
      }
    }
    if (path === 'currentId') {
      const currentPost = state.getCurrentPost();
      currentPost.isRead = 'true';
      updateModal(currentPost);
      renderContainer(watchedState);
    }
  }, { details: true });
  return watchedState;
};
