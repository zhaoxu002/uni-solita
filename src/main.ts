import Vue from "vue";
import App from "./App.vue";
import request from "./utils/request";
import store from "./store";

Vue.config.productionTip = false;
Vue.prototype.$request = request;
Vue.prototype.$store = store;

function isPromise(obj: any) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
}

uni.addInterceptor({
  returnValue(res: any) {
    if (!isPromise(res)) {
      return res;
    }
    return new Promise((resolve, reject) => {
      res.then((res: [any, any]) => {
        if (res[0]) {
          reject(res[0]);
        } else {
          resolve(res[1]);
        }
      });
    });
  },
});

const app = new (
  typeof App === "function"
    ? App
    : Vue.extend(Object.assign({ mpType: "app" }, App))
)();
// const app = new Vue({
// 	store,
// 	...App
// })
app.$mount();
