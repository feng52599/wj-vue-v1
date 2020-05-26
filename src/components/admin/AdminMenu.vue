<template>
  <div>
    <el-menu
      :default-active="'/admin/users'"
      class="el-menu-admin"
      router
      mode="vertical"
      background-color="#4F4F4F"
      text-color="#fff"
      active-text-color="#ffd04b">
      <div style="height: 80px;"></div>
      <!-- 导航栏样式-->
      <template v-for="(item,i) in adminMenus">
        <!--index 没有用但是必需字段-->
        <el-submenu :key="i" :index="i + ''" style="text-align: left">
          <span slot="title" style="font-size: 17px;">
            <i :class="item.iconCls"></i>
            {{item.nameZh}}
          </span>
          <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
            <i :class="child.icon"></i>
            {{ child.nameZh }}
          </el-menu-item>
        </el-submenu>
      </template>
    </el-menu>
  </div>
</template>

<script>
  export default {
    name: 'AdminMenu',
    computed: {
      // 这个menu在访问admin开头的时候就被存储到store里了
      adminMenus () {
        return this.$store.state.adminMenus
      }
    }
  }
</script>

<style scoped>
  .el-menu-admin {
    height: 1200px;
    border-radius: 5px;
  }
</style>
