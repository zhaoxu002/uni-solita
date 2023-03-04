import Vuex, { Store } from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

interface Cart {
  activityId: string;
  goods: {
    id: string;
    amount: number;
  }[]
}

const store = new Store<{
  cart?: Cart
}>({
  state() {
    return {
      cart: undefined
    }
  },
  mutations: {
    updateCart(state, payload: Cart) {
      state.cart = payload
    }
  }
})

export default store