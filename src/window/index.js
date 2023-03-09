import Vue from 'vue'
import root from './root.vue'
import router from '../router/window'
import store from '../store'
import i18n from '../libraries/lang';
/* eslint-disable no-new */
Vue.config.productionTip = false

new Vue({
  el: '#root',
  store,
  router,
  i18n,
  render: h => h(root)
})
