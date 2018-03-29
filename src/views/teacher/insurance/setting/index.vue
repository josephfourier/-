<!-- 投保管理教师端 -->
<template>
  <div class="zjy-app zjy-insurance">
    <div class="zjy-table">
      <div class="zjy-table-oper">

        <div class="zjy-table-oper__item">
          <div class="zjy-table-oper--create">
            <a href="javascript:;" @click="create">新增</a>
          </div>
        </div>

        <div class="zjy-table-oper__item">
          <div class="zjy-table-oper--del">
            <a href="javascript:;" @click="batchRemove">批量删除</a>
          </div>
        </div>
      </div>
      <el-table 
        @selection-change="handleSelectionChange" 
        :data="insuranceList" 
        style="width: 100%" 
        :row-style="rowStyle" 
        :header-row-style="rowStyle" 
        :header-cell-style="rowStyle" 
        v-loading="loading"
      >
        <el-table-column type="selection" width="30">
        </el-table-column>
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
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div class="table-oper-group">
              <a href="javascript:" @click="edit(scope.row)" class="zjy-btn-edit">
                <i class="zjy-icon"></i>
                <span>编辑</span>
              </a>

              <a href="javascript:" @click="_delete(scope.row)" class="zjy-btn-delete">
                <i class="zjy-icon"></i>
                <span>删除</span>
              </a>
            </div>
          </template>
        </el-table-column>

        <span slot="empty">{{ empty }}</span>
      </el-table>
    </div>
    <div class="zjy-pagination" v-if="insuranceList.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" @current-change="currentChange">
      </zjy-pagination>
    </div>

    <el-dialog :title="title" :visible.sync="visible" width="800px" @close="handleClose">
      <insurance-setting
        v-if="visible"
        :formData="setting" 
        :type="type" 
        @closed="handleInnerClose"
      >
      </insurance-setting>
    </el-dialog>
   
  </div>
</template>

<script>
import insuranceAPI from '@/api/teacher/insurance/setting'
import InsuranceSetting from './InsuranceSetting'
import ZjyPagination from '@/components/pagination'

export default {
  data() {
    return {
      insuranceList: [],
      currentPage: 1,
      total: 0,
      query: {
        offset: 0,
        limit: 10
      },
      title: '',
      empty: '数据加载中....',
      loading: false,
      visible: false,
      type: 1, // 1编辑 2新增
      setting: {
        isOpen: '1',
        isPay: '1'
      } // 新增投保设置
    }
  },

  methods: {
    create() {
      this.setting = {
        isOpen: '1',
        isPay: '1'
      }
      this.title = '新增保险'
      this.type = 2
      this.visible = true
    },

    edit(row) {
      this.title = '编辑保险'
      this.type = 1
      this.visible = true
      insuranceAPI
        .queryForObject(row.inssettingUid)
        .then(response => {
          this.setting = response.data
        })
        .catch(error => {})
    },

    _delete(row) {
      insuranceAPI
        .delete(row.inssettingUid)
        .then(response => {
          this.refresh()
        })
        .catch(error => {})
    },

    handleClose() {
      this.visible = false
    },

    handleInnerClose() {
      this.visible = false
      this.refresh()
    },

    batchRemove() {},

    handleSelectionChange(rows) {
      this.selectedRows = rows
    },

    rowStyle({ row, rowIndex }) {
      return {
        textAlign: 'center'
      }
    },

    currentChange(pageNumber) {
      this.currentPage = pageNumber
    },

    refresh() {
      const old = this.currentPage
      this.currentPage = -1
      setTimeout(() => {
        this.currentPage = old
      }, 100)
    }
  },

  components: {
    ZjyPagination,
    InsuranceSetting
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val, oldval) {
        if (val === -1) return

        this.loading = true
        this.query.offset = this.query.limit * (val - 1)
        insuranceAPI
          .queryForList(this.query)
          .then(response => {
            this.insuranceList = response.rows
            this.total = response.total
            this.loading = false
          })
          .catch(err => {
            this.loading = false
          })
      }
    },

    insuranceList(val) {
      this.empty = val.length === 0 ? '暂无数据' : '数据加载中....'
    }
  }
}
</script>
<style lang='scss' scoped>

</style>