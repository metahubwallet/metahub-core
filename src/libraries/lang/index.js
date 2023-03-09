import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Element from 'element-ui'
import elEnLocale from 'element-ui/lib/locale/lang/en';
import elZhLocale from 'element-ui/lib/locale/lang/zh-CN';
import locale from 'element-ui/lib/locale'
import 'element-ui/lib/theme-chalk/index.css';
import enLocale from './en';
import zhLocale from './zh-CN';

import { getStorage } from '../../util/utils'

Vue.use(VueI18n);
// 注册loadmore事件 监听el-scrollbar滚动
Vue.directive('loadmore', {
  bind(el, binding) {
    const SELECTWRAP_DOM = el.querySelector('.el-scrollbar__wrap');
    SELECTWRAP_DOM.addEventListener('scroll', function() {
      const CONDITION = this.scrollHeight - this.scrollTop <= this.clientHeight;
      if(CONDITION) {
        binding.value();
      }
    });
  }
})
const messages = {
  'zh-CN': { // 中文简体包
    ...zhLocale,
    ...elZhLocale
  },
  'en': { // 英文包
    ...enLocale,
    ...elEnLocale
  },
};



const i18n = new VueI18n({
  locale: 'zh-CN', // set locale
  messages // locale messages
});
// locale.i18n((key, value) => {//   i18n.t(key, value)
// });
Vue.use(Element, {
  i18n: (key, value) => i18n.t(key, value)
})

getStorage('language').then((locale) => {
  if (locale && locale != i18n.locale) {
    i18n.locale = locale;
  }
})

export default i18n;
