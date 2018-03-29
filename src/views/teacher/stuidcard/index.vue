<!-- 教师端学生证管理 -->
<template>
  <div class="zjy-app zjy-card">

    <div class="zjy-table">
      <div class="zjy-table-search">
        <div class="zjy-table-search__item">
          <span>入学年份:</span>
          <el-select v-model="query.enterYear" placeholder="请选择">
            <el-option v-for="item in years" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="zjy-table-search__item">
          <span>审批状态:</span>
          <el-select v-model="query.dataStatus" placeholder="请选择">
            <el-option v-for="item in status" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="zjy-table-search__item">
          <span>学号:</span>
          <zjy-input v-model="query.studentCode"></zjy-input>
        </div>
        <div class="zjy-table-search__item search-btn">
          <a href="javascript:;" class="zjy-search-panel__button" @click="handleClick"></a>
        </div>
      </div>
      <div class="zjy-table-oper">
        <div class="zjy-table-oper__item">
          <div class="zjy-table-oper--del">
            <a href="javascript:;" @click="batchRemove">批量删除</a>
          </div>
        </div>
      </div>
      <el-table ref="cardTable" @selection-change="handleSelectionChange" :data="list" style="width: 100%" :row-style="rowStyle" :header-row-style="rowStyle" :header-cell-style="rowStyle" v-loading="loading">
        <el-table-column type="selection" width="30">
        </el-table-column>
        <el-table-column type="index" label="序号" :index="1" width="45">
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="150">
        </el-table-column>
        <el-table-column prop="studentName" label="姓名" width="120">
        </el-table-column>
        <el-table-column prop="facultyName" label="院系" width="120">
        </el-table-column>
        <el-table-column prop="enterYear" label="入学年份" width="100">
        </el-table-column>
        <el-table-column prop="appNum" label="申请次数" width="100">
        </el-table-column>
        <el-table-column prop="dataStatus" label="状态" :formatter="statusFormat" width="100">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div class="btn-group">
              <a href="javascript:" @click="view(scope.row)" class="zjy-btn-view">
              <i class="zjy-icon"></i>
              <span>查看</span>
            </a>

            <a href="javascript:" @click="del(scope.row)" class="zjy-btn-delete" v-if="scope.row.dataStatus == 1">
              <i class="zjy-icon"></i>
              <span>删除</span>
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
    <el-dialog title="学生证补办审批" :visible.sync="visible" width="800px">
      <zjy-approval :uid="uid" :closed="!visible" @submit="handleSubmit"></zjy-approval>
    </el-dialog>
  </div>
</template>

<script>
import cardAPI from "@/api/teacher/stuidcard"
import ZjyPagination from "@/components/pagination"
import ZjyApproval from "./Approval"
import ZjyInput from "@/components/input"

export default {
  data() {
    return {
      list: [],
      //limit: 1, // 测试分页
      total: 0,
      currentPage: 1,
      visible: false,
      uid: "", // 当前查看补办信息的id
      query: {
        offset: 0,
        limit: 10,
        dataStatus: "", //0:待审批, 1:已通过, 2:已拒绝, 3:审批中
        enterYear: "",
        studentCode: ""
      },
      loading: true,
      empty: "数据加载中....",
      selectedRows: [],
      years: [
        {
          label: 2017,
          value: 2017
        },
        {
          label: 2018,
          value: 2018
        }
      ],

      status: [
        {
          label: "待审批",
          value: 0
        },

        {
          label: "已通过",
          value: 1
        },
        {
          label: "已拒绝",
          value: 2
        },
        {
          label: "审批中",
          value: 3
        }
      ]
    }
  },

  methods: {
    view(row) {
      this.uid = row.stuidcardUid
      this.visible = true
    },

    handleSelectionChange(rows) {
      this.selectedRows = rows
    },

    handleClick() {
      this.loading = true
      this.query.offset = this.query.limit * (this.currentPage - 1)
      cardAPI
        .queryForList(this.query)
        .then(response => {
          this.loading = false
          this.list = response.rows
          this.total = response.total
        })
        .catch(err => {
          this.loading = false
        })
    },

    // approval组件提交请求后关闭弹窗
    handleSubmit(error) {
      this.visible = false
      // 如果是正常提交数据则需要刷新
      if (!error) {
        const old = this.currentPage
        this.currentPage = -1
        setTimeout(() => (this.currentPage = old), 100)
      }
    },

    batchRemove() {
      if (this.selectedRows.length === 0) return
      let ids = ""
      this.selectedRows.forEach(x => {
        ids += "-" + x.studentId + "-"
      })
      this.loading = true
      cardAPI
        .batchRemove(ids.replace(/^-|-$/g, ""))
        .then(response => {
          this.loading = false
          this.refresh()
        })
        .catch(error => {})
    },

    del(row) {
      this.loading = true
      cardAPI
        .batchRemove(row.studentId)
        .then(response => {
          this.loading = false
          this.refresh()
        })
        .catch(error => {})
    },

    currentChange(pageNumber) {
      this.currentPage = pageNumber
    },

    rowStyle({ row, rowIndex }) {
      return {
        textAlign: "center"
      }
    },

    statusFormat(row, column, cellValue) {
      return ["待审批", "已通过", "已拒绝", "审批中"][+cellValue]
    },

    refresh() {
      this.loading = true
      this.query.offset = this.query.limit * (this.currentPage - 1)
      cardAPI
        .queryForList(this.query)
        .then(response => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        })
        .catch(err => {})
    }
  },

  components: {
    ZjyPagination,
    ZjyApproval,
    ZjyInput
  },

  computed: {},

  watch: {
    currentPage: {
      immediate: true,
      handler(val, oldval) {
        if (val === -1) return
        this.query.offset = this.query.limit * (val - 1)
        cardAPI
          .queryForList(this.query)
          .then(response => {
            console.log(response)
            if (response.code !== 1) {
              this.$alert(response.message)
              return
            }

            this.list = response.rows
            this.total = response.total
            this.loading = false
          })
          .catch(err => {})
      }
    },

    visible(val) {
      if (!val) this.uid = ""
    },

    list(val, oldVal) {
      this.empty = val.length === 0 ? "暂无数据" : "数据加载中...."
    }
  }
}
</script>
<style lang='scss' scoped>
.zjy-btn-view {
  margin: 0 10px;;
}
.zjy-search-panel__button {
  background: #37c6d4 url(./ic_search.png) 16px 10px no-repeat;
  width: 50px;
  height: 34px;
  display: inline-block;
  vertical-align: top;
}

.zjy-table-oper {
  padding: 10px 0;
  .zjy-table-oper__item {
    display: inline-block;
    font-size: 12px;
  }

}

.btn-group {
  width: 150px;
  margin: 0 auto;
  text-align: left;
}
</style>