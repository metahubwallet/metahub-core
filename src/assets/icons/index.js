import Vue from 'vue'
import svgIcon from '../../components/SvgIcon'
Vue.component('svg-icon', svgIcon) // 注册全局组件
const req = require.context('../icons', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
