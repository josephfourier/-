<!-- 教师端学生投保申请管理 -->
<template>
  <div class="zjy-table">
    <div class="zjy-table-search">
      <div class="zjy-table-search__item">
        <span>保单状态</span>
        <el-select v-model="query.dataStatus" placeholder="请选择">
        </el-select>
      </div>
      <div class="zjy-table-search__item">
        <span>申请年份</span>
        <el-select v-model="query.appYear" placeholder="请选择">
        </el-select>
      </div>
      <div class="zjy-table-search__item">
        <span>学号</span>
        <zjy-input></zjy-input>
      </div>
      <a href="javascript:;" class="zjy-table-search__button" @click="search"></a>
    </div>
    <div class="zjy-line"></div>
    <div class="zjy-table-oper">
      <div class="zjy-table-oper__item">
        <div class="zjy-table-oper--">
          <a href="javascript:;" @click="batch">批量投保</a>
        </div>
      </div>
    </div>
    <el-table :data="list" style="width: 100%" v-loading="loading">
      <!-- <el-table-column type="selection" width="30">
      </el-table-column> -->
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
      <el-table-column prop="insuranceName" label="险种名称" width="300">
      </el-table-column>
      <el-table-column prop="insuranceCost" label="保险费用" width="80">
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
    <div class="zjy-pagination" v-if="list.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" :pageSize="limit" @current-change="currentChange">
      </zjy-pagination>
    </div>

    <el-dialog title="保单审批" :visible.sync="visible" width="800px">
      <insurance-process
        v-if="visible"
        :data="setting" 
        v-model="value"
        @submit="handleSubmit"
      >
      </insurance-process>
    </el-dialog>
  </div>
</template>

<script>
import insuranceManageAPI from "@/api/teacher/insurance/manage"
import commonAPI from "@/api/common"
import { selfMerge, dateFormat as _dateFormat } from "@/utils"
import ZjyInput from "@/components/input"
import ZjyPagination from "@/components/pagination"
import InsuranceProcess from "./InsuranceProcess"
// 审批状态：0-待审批，1-已通过，2-已拒绝，3-审批中，4-待确认，5-待付款
export default {
  data() {
    return {
      setting: {}, // 保险设置信息
      value: {}, // 审批流程进度信息
      currentPage: 1,
      list: [],
      limit: 10,
      total: 0,
      visible: false,
      query: {
        offset: 0,
        limit: 10,
        dataStatus: "",
        appYear: "",
        studentCode: ""
      },
      loading: false,
      empty: "暂无数据"
    }
  },

  methods: {
    search() {},

    currentChange(pageNumber) {
      this.currentChange = pageNumber
    },
    // 批量投保
    batch() {},

    dateFormat(row, column, cellValue) {
      return _dateFormat(cellValue)
    },

    handleSubmit(val) {
      this.visible = false
      // 查看操作时关闭

      if (val === 1) {
        this.refresh()
      }
    },

    statusFormate(row, column, cellValue) {
      return ["待审批", "已通过", "已拒绝", "审批中", "待确认", "待付款"][
        +cellValue
      ]
    },

    // 保单审批
    view(row) {
      console.log(row)
      // insuranceManageAPI.queryForObject(row.insuranceUid).then(response => {
      //   console.log(response)
      // })
      commonAPI
        .queryApprovalProcess(row.studentId, row.insuranceUid)
        .then(response => {
          this.setting = row
          this.value = response.data
          this.visible = true
        })
    },

    refresh() {
      const old = this.currentPage
      this.currentPage = -1
      setTimeout(() => (this.currentPage = old), 100)
    }
  },

  created() {},
  components: {
    ZjyInput,
    ZjyPagination,
    InsuranceProcess
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val, oldval) {
        if (val === -1) return

        this.loading = true
        this.query.offset = this.query.limit * (val - 1)
        insuranceManageAPI
          .queryForList(this.query)
          .then(response => {
            if (response.code !== 1) {
              // this.empty = response.message
              alert(response.message)
            } else {
              this.list = response.rows
              this.total = response.total
            }
            this.loading = false
          })
          .catch(err => {
            this.loading = false
          })
      }
    },

    list(val) {
      if (!val) return
      this.empty = val.length === 0 ? "暂无数据" : "数据加载中...."
    }
  }
}
</script>
<style lang='scss' scoped>

</style>