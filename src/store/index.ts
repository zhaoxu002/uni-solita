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

interface Location {
  location: string;
  title: string;
  _id: string;
}

const store = new Store<{
  cart?: Cart,
  locationList: Location[]
}>({
  state() {
    return {
      cart: undefined,
      locationList: []
    }
  },
  mutations: {
    updateCart(state, payload: Cart) {
      state.cart = payload
    },

    updateLocationList(state, payload: Location[]) {
      state.locationList = payload
    }
  }
})

export default store