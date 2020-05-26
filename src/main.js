// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import mavonEditor from 'mavon-editor'
// import 'echarts/theme/macarons.js'
// import echarts from 'echarts'
import store from './store'



//设置反向代理，前端请求默认发送到 http://localhost:8443/api
var axios = require('axios')
axios.defaults.baseURL = 'http://localhost:8443/api'
// 全局注册，之后可在其他组件使用this.$axios发送数据
Vue.prototype.$axios = axios

// Vue.prototype.$echarts = echarts

//作用是阻止vue 在启动时生成生产提示
Vue.config.productionTip = false

// 使用elementUI
Vue.use(ElementUI)
// 使用markdown编辑器
Vue.use(mavonEditor)

// 通过一下配置前端每次发送请求时就会带上 sessionId，shiro 就可以通过 sessionId 获取登录状态并执行是否登录的判断。
axios.defaults.withCredentials = true


// 全局前置守卫
// 使用钩子函数判断页面是否被拦截
// requireAuth == true 会被拦截
// 如果此时username值不为null（null <=> false）继续进行，username == null 重定向到登录
router.beforeEach((to, from, next) => {

  // 什么时候加载菜单？当用户已经登录并访问以/admin开头的路由时请求菜单
  if (store.state.user.username && to.path.startsWith('/admin')) {
    // 为保证确实登录，需要向后端发送验证请求
    // initAdminMenu 用于执行请求，调用格式化方法并向路由表中添加信息
    initAdminMenu(router, store)
  }
  // 已登录状态下访问 login 页面直接跳转到后台首页
  // if (store.state.user && to.path.startsWith('/login')) {
  //   next({
  //     path: 'admin/dashboard'
  //   })
  // }

  //首先判断访问的路径是否需要被拦截进行登录
  if (to.meta.requireAuth) {
    //判断 store 里有没有存储 user的username 的信息，如果存在，则放行
    //不能用store.state.user不然会导致存储成功
    if (store.state.user.username) {
      console.log(store.state.user)
      axios.get('/authentication').then(resp => {
        if (resp.data) {
          next()
        } else {
          //否则跳转到登录页面
          //并存储访问的页面路径（以便在登录后跳转到访问页）
          next({
            path: 'login',
            query: {redirect: to.fullPath}
          })
        }
      })
    } else {
      next({
        path: 'login',
        query: {redirect: to.fullPath}
      })
    }
  } else {
    next()
  }
})

// 用于执行请求，调用格式化方法并向路由表中添加信息，
const initAdminMenu = (router, store) => {
  // 首先看下菜单里有没有数据，如果有即可无需加载
  if (store.state.adminMenus.length > 0) {
    return
  }
  // 没有就向后端接口请求数据
  // 并通过formatRoutes对路由进行格式化
  // 然后将路由添加到router里
  // 最后将格式化的数据fmtRoutes存储起来
  axios.get('/menu').then(resp => {
    if (resp && resp.status === 200) {
      var fmtRoutes = formatRoutes(resp.data)
      router.addRoutes(fmtRoutes)
      console.log(fmtRoutes)
      store.commit('initAdminMenu', fmtRoutes)
    }
  })
}

// 通过该方法，能将从后台传的数据转换成路由能够识别的格式
/*
这里传入的参数 routes 代表我们从后端获取的菜单列表。遍历这个列表，首先判断一条菜单项是否含子项，如果含则进行递归处理。
下面的语句就是把路由的属性与菜单项的属性对应起来，其它的都好说，主要是 component 这个属性是一个对象，因此需要根据名称做出解析（即获取对象引用）。
同时我们需要把组件导入进来，因此可以利用 Vue 的异步组件加载机制（也叫懒加载），在解析的同时完成导入。
我们数据库中存储的是组件相对 @components/admin 的路径，所以解析时要根据 js 文件的位置加上相应的前缀。
 */
const formatRoutes = (routes) => {
  let fmtRoutes = []

  // 递归
  routes.forEach(route => {
    if (route.children) {
      route.children = formatRoutes(route.children)
    }
    let fmtRoute = {
      path: route.path,
      component: resolve => {
        require(['./components/admin/' + route.component + '.vue'], resolve)
      },
      name: route.name,
      nameZh: route.nameZh,
      iconCls: route.iconCls,
      children: route.children
    }
    fmtRoutes.push(fmtRoute)
  })
  return fmtRoutes
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store,
  components: {App},
  template: '<App/>'
})
