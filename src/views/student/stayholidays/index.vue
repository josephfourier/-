<!-- 学生假期留校管理 -->
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
        <el-table-column type="selection" width="30">
        </el-table-column>
        <el-table-column type="index" label="序号" :index="1" width="50">
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="100">
        </el-table-column>
        <el-table-column prop="studentName" label="学生姓名" width="120">
        </el-table-column>
        <el-table-column prop="facultyName" label="院系" width="120">
        </el-table-column>
        <el-table-column prop="applyDate" label="申请日期" :formatter="dateFormat" width="120">
        </el-table-column>
        <el-table-column prop="applyYear" label="申请年份" width="120">
        </el-table-column>
        <el-table-column prop="holidayName" label="假期名称" width="120">
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="120">
        </el-table-column>

        <el-table-column prop="dataStatus" label="状态" width="80" :formatter="statusFormate">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <a href="javascript:" @click="view(scope.row)" class="zjy-btn-view">
              <i class="zjy-icon"></i>
              <span>查看</span>
            </a>
          </template>
        </el-table-column>

        <span slot="empty">{{ empty }}</span>
      </el-table>
    </div>

    <div class="zjy-pagination" v-if="list.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" @current-change="currentChange">
      </zjy-pagination>
    </div>

  </div>
</template>

<script>
import stayholidaysAPI from '@/api/student/stayholidays'
import {dateFormat as _dateFormat} from '@/utils'

import ZjyPagination from '@/components/pagination'

export default {
  data () {
    return {
      list: [],
      currentPage: 1,
      total: 0,
      query: {
        offset: 0,
        limit: 10
      },

      empty: '数据加载中....',
      loading: false,
      visible: false
    }
  },

  methods: {
    create () {

    },

    dateFormat (row, column, cellValue) {
      return _dateFormat(cellValue)
    },

    statusFormate (row, column, cellValue) {
      return ['待审批', '已通过', '已拒绝', '审批中'][+cellValue]
    },

    handleSubmit () {
    },

    rowStyle ({row, rowIndex}) {
      return {
        textAlign: 'center'
      }
    },

    view (row) {

    },

    currentChange (pageNumber) {
      this.currentPage = pageNumber
    },

    refresh () {
      const old = this.currentPage
      this.currentPage = -1
      setTimeout(() => {
        this.currentPage = old
      }, 100)
    }
  },

  components: {
    ZjyPagination
  },

  watch: {
    currentPage: {
      immediate: true,
      handler (val, oldval) {
        if (val === -1) return

        this.loading = true
        this.query.offset = this.query.limit * (val - 1)
        stayholidaysAPI.queryForList(this.query).then(response => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        })
          .catch(error => {
            console.log(error)
            this.loading = false
          })
      }
    },

    list (val) {
      if (val) { this.empty = val.length === 0 ? '暂无数据' : '数据加载中....' }
    }

  }
}
</script>
<style lang='scss' scoped>

</style>
