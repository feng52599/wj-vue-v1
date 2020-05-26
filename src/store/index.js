import Vue from 'vue'
import Vuex from 'vuex'

// 前端登录拦截器，可不配合后端独立运行
// 这里我们还用到了 localStorage，即本地存储，在项目打开的时候会判断本地存储中是否有 user 这个对象存在，如果存在就取出来并获得 username 的值，否则则把 username 设置为空。这样我们只要不清除缓存，登录的状态就会一直保存。
Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    user:{
      // 这里获取本地存储的user 并转换为json
      username: window.localStorage.getItem('user' || '[]') == null ? '':JSON.parse(window.localStorage.getItem('user' || '[]')).username
    },
    adminMenus: []
  },
  mutations: {
    initAdminMenu (state, menus) {
      state.adminMenus = menus
    },
    login(state, user){
      state.user = user
      // 存储到本地窗口
      window.localStorage.setItem('user', JSON.stringify(user));
    },
    logout(state){
      state.user = []
      window.localStorage.removeItem('user')
    }
  }
})
