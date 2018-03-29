<!-- 学生档案管理(教师) -->
<template>
  <div class="zjy-app">
    <div class="zjy-table">
      <div class="zjy-table-oper">
        <div class="zjy-table-oper__item">
          <div class="zjy-table-oper--create">
            <a href="javascript:;" @click="create">新增</a>
          </div>
        </div>
      </div>
      <el-table :data="list" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" :index="1" width="150">
        </el-table-column>
        <el-table-column prop="stufileName" label="档案材料名称" width="200">
        </el-table-column>
        <el-table-column prop="description" label="档案描述" width="300">
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:" @click="edit(scope.row)" class="zjy-btn-edit">
              <i class="zjy-icon"></i>
              <span>编辑</span>
            </a>

            <a href="javascript:" @click="_delete(scope.row)" class="zjy-btn-delete">
              <i class="zjy-icon"></i>
              <span>删除</span>
            </a>
          </template>
        </el-table-column>
        <span slot="empty">{{ empty }}</span>
      </el-table>

      <el-dialog title="请输入档案材料名称" :visible.sync="visible" width="800px">
        <stufile
          v-if="visible"
          :formData="stufile" 
          :list="list" 
          :type="type" 
          @close="handleClose"
        ></stufile>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import stufileAPI from '@/api/teacher/stufile/setting'
import Stufile from './Stufile'

export default {
  data() {
    return {
      list: [],
      stufile: {
        stufileName: '',
        status: '1'
      },
      type: 1, // 1编辑 2新增
      loading: false,
      visible: false,
      empty: '暂无数据'
    }
  },

  methods: {
    create() {
      this.type = 2
      this.visible = true
    },

    _delete(row) {
      stufileAPI.delete(row.stufilesettingUid).then(response => {
        if (response.code === 1) {
          this.$alert('删除成功')
          this.refresh()
        }
      })
    },

    edit(row) {
      this.type = 1
      this.stufile = { ...row }
      this.visible = true
    },

    handleClose(val) {
      this.visible = false
      this.stufile = {
        stufileName: '',
        status: '1'
      }
      if (val !== 0) {
        this.refresh()
      }
    },

    refresh() {
      this.loading = true
      stufileAPI
        .queryForList()
        .then(response => {
          this.list = response.data
          this.loading = false
        })
        .catch(error => {
          this.loading = false
        })
    }
  },

  components: {
    Stufile
  },

  created() {
    this.refresh()
  },

  watch: {
    list(val) {
      if (!val) return
      this.empty = val.length === 0 ? '暂无数据' : '数据加载中....'
    }
  }
}
</script>
<style lang='scss' scoped>

</style>