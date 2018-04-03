<!-- 投保管理教师端 -->
<template>
  <div class="wrapper">
    <div class="zjy-table">
      <el-table :data="list" style="width: 100%" :row-style="rowStyle" :header-row-style="rowStyle" :header-cell-style="rowStyle" v-loading="loading">
        <el-table-column type="index" label="序号" :index="1" width="45">
        </el-table-column>
        <el-table-column prop="insuranceName" label="险种名称" width="200">
        </el-table-column>
        <el-table-column prop="insuranceCompany" label="保险公司" width="120">
        </el-table-column>
        <el-table-column prop="insuranceCategory" label="险种类别" width="120">
        </el-table-column>
        <el-table-column prop="insuranceCost" label="保险费用" width="100">
        </el-table-column>
        <el-table-column prop="insuranceLimit" label="保险期限" width="100">
        </el-table-column>
        <el-table-column prop="applyStatus" label="状态" width="300" :formatter="statusFormate">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div class="table-oper-group">
              <a href="javascript:" @click="view(scope.row)" class="zjy-btn-view">
                <i class="zjy-icon"></i>
                <span>查看</span>
              </a>

              <a href="javascript:" @click="create(scope.row)" class="zjy-btn-delete" v-if="scope.row.applyStatus ==='0'">
                <i class="zjy-icon"></i>
                <span>申请</span>
              </a>
            </div>
          </template>
        </el-table-column>

        <span slot="empty">{{ empty }}</span>
      </el-table>
    </div>
    <div class="zjy-pagination" v-if="list.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" @current-change="currentChange">
      </zjy-pagination>
    </div>

    <el-dialog :title="title" :visible.sync="visible" width="800px">
      <student-process
        :data="data"
        v-model="value"
        :type="type"
        :visible.sync="visible"
        @submit="handleSubmit"
      >
        <template slot-scope="props">
          <zjy-form :data="props.formData"></zjy-form>
        </template>
      </student-process>
    </el-dialog>
  </div>
</template>

<script>
import insuranceAPI from '@/api/student/insurance/all'
import commonAPI from '@/api/common'
import ZjyPagination from '@/components/pagination'
import { getPermissionId } from '@/utils'

import StudentProcess from './StudentProcess'
import ZjyForm from './form'
import axios from 'axios'

export default {
  data () {
    return {
      data: {}, // 保单设置详情
      value: {},   // 保单对应审批
      list: [],
      currentPage: 1,
      total: 0,
      query: {
        offset: 0,
        limit: 10
      },
      title: '保单详情',
      empty: '数据加载中....',
      loading: false,
      visible: false,
      type: 1, // 查看或申请操作
      types: {
        VIEW: 1,
        APPLY: 2
      }
    }
  },

  methods: {
    statusFormate (row, column, cellValue) {
      return ['可申请', '申请中'][+cellValue]
    },

    handleSubmit (data, steps) {

      insuranceAPI.create(data.inssettingUid, steps).then(response => {
        if (response.code === 1) {
          this.$alert('申请成功')
          this.visible = false
          this.refresh()
        } else {
          this.$alert(response.message)
        }
      }).catch(error => {

      })
      // this.visible = false
      // // 查看操作时关闭
      //
      // if (val === 1) {
      //   this.refresh()
      // }
    },

    rowStyle ({ row, rowIndex }) {
      return {
        textAlign: 'center'
      }
    },

    view (row) {
      this.title = '保单详情'
      this.type = this.types.VIEW
      insuranceAPI.queryForObject(row.inssettingUid).then(response => {
        this.data = response.data
        this.visible = true
      }).catch(error => {})
    },

    create (row) {
      this.title = '保单申请'
      this.type = this.types.APPLY

      axios.all([
        commonAPI.queryInitial(getPermissionId(this.$route)),
        insuranceAPI.queryForObject(row.inssettingUid)
      ]).then(
        axios.spread((r1, r2) => {
          this.value = r1.data
          this.data = r2.data
          this.visible = true
        })
      )
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
    ZjyPagination,

    StudentProcess,
    ZjyForm
  },

  props: {
    active: Boolean
  },

  watch: {
    currentPage: {
      immediate: true,
      handler (val, oldval) {
        if (val === -1) return

        this.loading = true
        this.query.offset = this.query.limit * (val - 1)
        insuranceAPI.queryForList(this.query).then(response => {
            this.list = response.rows
            this.total = response.total
            this.loading = false
          }).catch(err => {
            this.loading = false
          })
      }
    },

    list (val) {
      if (val) { this.empty = val.length === 0 ? '暂无数据' : '数据加载中...' }
    },

    active (val) {
      if (val) this.refresh()
    }
  }
}
</script>
<style lang='scss' scoped>

</style>
