<template>
  <div class="zjy-table">
    <slot></slot>
    <el-table :data="accountList" style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" :index="1" width="100">
      </el-table-column>
      <el-table-column prop="username" label="账号" width="150">
      </el-table-column>
      <el-table-column prop="teacherName" label="用户姓名" width="120">
      </el-table-column>
      <el-table-column prop="departmentName" label="部门" width="120">
      </el-table-column>
      <el-table-column prop="postName" label="职务" width="120">
      </el-table-column>
      <el-table-column prop="teacherLevelName" label="级别" width="300">
      </el-table-column>
      <el-table-column label="权限范围">
        <template slot-scope="scope">
          <a href="javascript:" @click="view(scope.row)" class="zjy-btn-config">
            <i class="zjy-icon"></i>
            <span>查看</span>
          </a>
        </template>
      </el-table-column>

      <span slot="empty">{{ empty }}</span>
    </el-table>
    <div class="zjy-pagination" v-if="accountList.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" :pageSize="limit" @current-change="currentChange">
      </zjy-pagination>
    </div>

    <el-dialog title="权限范围" :visible.sync="dialogVisible" width="800px">
      <ZJYList :data="pemissionScope" :status="status" :message="message"></ZJYList>
    </el-dialog>
  </div>
</template>

<script>
import accountAPI from '@/api/teacher/account'
import ZjyPagination from '@/components/pagination'
import ZJYList from '@/components/list'

export default {
  methods: {
    view (row) {
      this.dialogVisible = true
      accountAPI
        .queryPermissionScope(row.teacherLevel, row.departmentId)
        .then(resp => {
          let res = []
          if (typeof resp.data === 'string') { res.push(resp.data) } else res = resp.data
          this.pemissionScope = res
          this.status = resp.code
          this.message = resp.message
        })
        .catch(err => {})
    },
    currentChange (pageNumber) {
      this.currentPage = pageNumber
    }
  },

  data () {
    return {
      accountList: [],
      // 当前页
      currentPage: 1,
      // 每页显示数
      limit: 2,
      // 总记录数
      total: 0,
      pemissionScope: [],
      status: -1,
      dialogVisible: false,
      message: '',
      empty: '数据加载中...',
      loading: true
    }
  },

  props: {
    query: {
      type: String,
      default: ''
    }
  },

  computed: {
  },
  components: {
    ZjyPagination,
    ZJYList
  },

  watch: {
    currentPage: {
      immediate: true,
      handler (val, oldval) {
        this.loading = true
        accountAPI
          .queryForList((val - 1) * this.limit, this.limit, this.query)
          .then(resp => {
            this.accountList = resp.items
            this.total = resp.total
            this.loading = false
          })
          .catch(err => {})
      }
    },

    query (val, oldVal) {
      this.loading = true
      accountAPI
        .queryForList(0, this.limit, val)
        .then(resp => {
          this.accountList = resp.items
          this.total = resp.total
          this.loading = false
        })
        .catch(err => {})
    },

    accountList (val, oldVal) {
      if (!val) return
      if (val.length === 0) this.empty = '暂无数据'
      this.empty = val.length === 0 ? '暂无数据' : '数据加载中....'
    }
  }
}
</script>

<style lang="scss" scoped>
.zjy-btn-config {
  margin-right: 20px;
  .zjy-icon {
    background: url('./zjy-icon-setting.png') no-repeat 0 2px;
  }
}
</style>
