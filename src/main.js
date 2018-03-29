import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// import './mock'

import './router-interceptor'
import '@/styles/index.scss'

Vue.use(ElementUI)

Vue.config.productionTip = false

Vue.prototype.$empty = obj => {
  if (!obj) return true
  return Object.keys(obj).length === 0
}

Vue.prototype.$hasPermission = permission => store.getters.permissions.indexOf(permission) !== -1

Vue.filter('statusFormat', val => ['待审批', '已通过', '已拒绝', '审批中'][+val])
Vue.filter('dateFormat', val => {
  if (!val) return
  const date = new Date(val)
  const m = date.getMonth() + 1
  const d = date.getDate() + 1
  return (
    date.getFullYear() +
    '-' +
    (m < 10 ? '0' + m : m) +
    '-' +
    (d < 10 ? '0' + d : d)
  )
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
