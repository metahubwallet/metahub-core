import Vue from 'vue'
import root from './root.vue'
import router from '../router'
import store from '../store'
import i18n from '../libraries/lang';
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyload from 'vue-lazyload'
import VueClipboard from "vue-clipboard2";
import FastClick from 'fastclick';
import '../assets/icons/index';


Vue.prototype.$ebus = new Vue();

FastClick.attach(document.body);

Vue.use(VueClipboard);
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: require('../assets/images/eos_icon.png'),
  loading: require('../assets/images/loading.gif'),
  attempt: 1
});

Vue.config.productionTip = false;
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: '#root',
  store,
  router,
  i18n,
  render: h => h(root)
})
