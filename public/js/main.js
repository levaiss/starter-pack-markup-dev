(function () {
  'use strict';

  const wait = ms => {
    if (typeof ms !== 'number' && ms < 0) {
      throw new Error('ms must be number!');
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const testFn = async () => {
    await wait(1000);
    console.log('test!');
  };
  testFn();

})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbInNyYy9hc3NldHMvc2NyaXB0cy91dGlscy9pbmRleC5qcyIsInNyYy9hc3NldHMvc2NyaXB0cy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3Qgd2FpdCA9IChtcykgPT4ge1xyXG4gIGlmICh0eXBlb2YgbXMgIT09ICdudW1iZXInICYmIG1zIDwgMCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdtcyBtdXN0IGJlIG51bWJlciEnKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xyXG59XHJcbiIsImltcG9ydCB7d2FpdH0gZnJvbSBcIi4vdXRpbHNcIjtcclxuXHJcbmNvbnN0IHRlc3RGbiA9IGFzeW5jICgpID0+IHtcclxuICBhd2FpdCB3YWl0KDEwMDApO1xyXG4gIGNvbnNvbGUubG9nKCd0ZXN0IScpXHJcbn1cclxuXHJcbnRlc3RGbigpO1xyXG4iXSwibmFtZXMiOlsid2FpdCIsIm1zIiwiRXJyb3IiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJ0ZXN0Rm4iLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7RUFBTyxNQUFNQSxJQUFJLEdBQUlDLEVBQUUsSUFBSztJQUMxQixJQUFJLE9BQU9BLEVBQUUsS0FBSyxRQUFRLElBQUlBLEVBQUUsR0FBRyxDQUFDLEVBQUU7RUFDcEMsSUFBQSxNQUFNLElBQUlDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0VBQ3ZDLEdBQUE7SUFDQSxPQUFPLElBQUlDLE9BQU8sQ0FBQ0MsT0FBTyxJQUFJQyxVQUFVLENBQUNELE9BQU8sRUFBRUgsRUFBRSxDQUFDLENBQUMsQ0FBQTtFQUN4RCxDQUFDOztFQ0hELE1BQU1LLE1BQU0sR0FBRyxZQUFZO0lBQ3pCLE1BQU1OLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtFQUNoQk8sRUFBQUEsT0FBTyxDQUFDQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7RUFDdEIsQ0FBQyxDQUFBO0VBRURGLE1BQU0sRUFBRTs7Ozs7OyJ9