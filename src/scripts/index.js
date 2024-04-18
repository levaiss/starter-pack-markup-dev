import {Notyf} from 'notyf';
import {wait} from "./utils";

const App = function () {
  const notyf = new Notyf();

  const testFn = async () => {

    await wait(300);

    notyf.error('Test error message');
  }

  testFn();
}

App();
