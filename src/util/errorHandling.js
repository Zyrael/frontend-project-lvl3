export default (state) => (error) => {
  if (error.isAxiosError) {
    state.setStatus('failed', 'networkError');
  }
  state.setStatus('failed', error.message);
};
