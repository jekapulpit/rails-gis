import store from '../store'

export default {
  name: 'app',
  data: () => ({
    showNavigation: false,
    authorized: false
  }),
  computed: {
    isAuthorized() {
      return store.state.authorize
    }
  },
  methods: {
    goToAuthorization: function () {
      this.$router.push({ path: 'authorization' })
    },
    goToMap: function () {
      this.$router.push({ path: 'map' })
    },
    goToSpecial: function () {
      this.$router.push({ path: 'example' })
    },
    logout: function () {
      store.commit('setUnAuthorize')
    }
  }
}
