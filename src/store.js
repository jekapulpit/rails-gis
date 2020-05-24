import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    authorize: true
  },
  mutations: {
    setAuthorize(state) {
      state.authorize = true;
    },
    setUnAuthorize(state) {
      state.authorize = false;
    }
  },
  actions: {

  },
});
