<template>
  <div>
    <el-dialog
      title="修改用户信息"
      :visible.sync="dialogFormVisible"
      append-to-body>
      <el-form v-model="selectedUser" style="text-align: left" ref="dataForm">
        <el-form-item label="用户名" label-width="120px" prop="username">
          <label>{{selectedUser.username}}</label>
        </el-form-item>
        <el-form-item label="真实姓名" label-width="120px" prop="name">
          <el-input v-model="selectedUser.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" label-width="120px" prop="phone">
          <el-input v-model="selectedUser.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="120px" prop="email">
          <el-input v-model="selectedUser.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="120px" prop="password">
          <el-button type="warning" @click="resetPassword(selectedUser.username)">重置密码</el-button>
        </el-form-item>
        <el-form-item label="角色分配" label-width="120px" prop="roles">
          <el-checkbox-group v-model="selectedRoles">
              <el-checkbox v-for="(role,i) in roles" :key="i" :label="role.id">{{role.nameZh}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit(selectedUser)">确 定</el-button>
      </div>
    </el-dialog>
    <!--面包屑导航栏-->
    <el-row style="margin: 18px 0px 0px 18px ">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理中心</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户信息</el-breadcrumb-item>
      </el-breadcrumb>
    </el-row>
    <bulk-registration @onSubmit="listUsers()"></bulk-registration>
    <el-card style="margin: 18px 2%;width: 95%">
      <el-table
        :data="users"
        stripe
        :default-sort = "{prop: 'id', order: 'ascending'}"
        style="width: 100%"
        :max-height="tableHeight">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="id"
          label="id"
          sortable
          width="100">
        </el-table-column>
        <el-table-column
          prop="username"
          label="用户名"
          fit>
        </el-table-column>
        <el-table-column
          prop="name"
          label="真实姓名"
          fit>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号"
          fit>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          show-overflow-tooltip
          fit>
        </el-table-column>
        <!--以下几个栏使用了作用域插槽以获取数据，具体参考https://juejin.im/post/5a69ece0f265da3e5a5777ed-->
        <el-table-column
          label="状态"
          sortable
          width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enabled"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="(value) => commitStatusChange(value, scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120">
          <template slot-scope="scope">
            <el-button
              @click="editUser(scope.row)"
              type="text"
              size="small">
              编辑
            </el-button>
            <el-button
              type="text"
              size="small">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 20px 0 20px 0;float: left">
        <el-button>取消选择</el-button>
        <el-button>批量删除</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
  import BulkRegistration from './BulkRegistration'
    export default {
      name: 'UserProfile',
      components: {BulkRegistration},
      data () {
          return {
            users: [],
            roles: [],
            dialogFormVisible: false,
            selectedUser: [],
            selectedRoles: []
          }
      },
      mounted () {
        this.listUsers()
        this.listRoles()
      },
      computed: {
        tableHeight () {
          return window.innerHeight - 100
        }
      },
      methods: {
        // 用户拥有的角色测试已经在users的roles里了
        listUsers () {
          var _this = this
          this.$axios.get('/admin/user').then(resp => {
            if (resp && resp.status === 200) {
              _this.users = resp.data
              // console.log("用户拥有的角色：")
              // console.log(_this.users)

            }
          })
        },
        // 只是把所有角色都选出来, 用来作为选项
        listRoles () {
          var _this = this
          this.$axios.get('/admin/role').then(resp => {
            if (resp && resp.status === 200) {
              _this.roles = resp.data
              // console.log("所有的角色：" )
              // console.log(_this.roles)
            }
          })
        },
        commitStatusChange (value, user) {
          if (user.username !== 'admin') {
            this.$axios.put('/admin/user/status', {
              enabled: value,
              username: user.username
            }).then(resp => {
              if (resp && resp.status === 200) {
                if (value) {
                  this.$message('用户 [' + user.username + '] 已启用')
                } else {
                  this.$message('用户 [' + user.username + '] 已禁用')
                }
              }
            })
          } else {
            user.enabled = true
            this.$alert('不能禁用管理员账户')
          }
        },
        // 编辑成功进行提交
        onSubmit (user) {
          let _this = this
          // 根据视图绑定的角色 id 向后端传送角色信息   被选id的值和roles里面存的是不一致的，在这里他们的
          let roles = []
          for (let i = 0; i < _this.selectedRoles.length; i++) {
            for (let j = 0; j < _this.roles.length; j++) {
              if (_this.selectedRoles[i] === _this.roles[j].id) {
                roles.push(_this.roles[j])
              }
            }
          }
          this.$axios.put('/admin/user', {
            username: user.username,
            name: user.name,
            phone: user.phone,
            email: user.email,
            roles: roles
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.$alert('用户信息修改成功')
              this.dialogFormVisible = false
              // 主要是修改角色后与视图联动
              this.listUsers()
            }
          })
        },
        //roles 是从后端查询到的所有角色信息，我们通过遍历渲染出角色的中文名称，并指定多选框的 label 值为 role.id 。
        // selectedRolesIds 是一个 Array 类型的变量，也就是当前用户对应的角色的 id。组件会根据其中的数据匹配 label 值，并选中相应的内容
        editUser (user) {
          this.dialogFormVisible = true
          this.selectedUser = user
          let roleIds = []
          for (let i = 0; i < user.roles.length; i++) {
            roleIds.push(user.roles[i].id)
          }
          this.selectedRoles = roleIds
        },
        resetPassword (username) {
          this.$axios.put('/admin/user/password', {
            username: username
          }).then(resp => {
            if (resp && resp.status === 200) {
              this.$alert('密码已重置为 123')
          }
          })
        }
      }
    }
</script>

<style scoped>

</style>
