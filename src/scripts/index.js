import {getVacancies} from "./api/vacancy";
import { Notyf } from 'notyf';

const App = function () {
  const notyf = new Notyf();

  const testFn = async () => {
    const x = await getVacancies();
    console.log(x);

    notyf.error('Please fill out the form');
  }

  testFn();
}

App();
