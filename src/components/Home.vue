<template>
  <div>
    <!--写入了一个 <router-view/>，也就是子页面（组件）显示的地方 这个是导航栏组件所要显示的所有地方的路由，需要配合router使用-->
    <!--再home组件的所有组件里添加nav-munu菜单-->
    <nav-menu></nav-menu>
    <router-view/>
  </div>
</template>

<script>
  import NavMenu from './common/NavMenu'
  export default {
    name: 'Home',
    components: {NavMenu}
  }
</script>

<style scoped>

</style>

