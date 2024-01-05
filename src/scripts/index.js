import {wait} from "./utils";

const testFn = async () => {
  await wait(1000);
  console.log('test!')
}

testFn();
