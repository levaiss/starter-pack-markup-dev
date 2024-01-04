export const wait = (ms) => {
  if (typeof ms !== 'number' && ms < 0) {
    throw new Error('ms must be number!');
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}
