<!-- 教师端学生档案管理 -->
<template>
  <div class="zjy-table">
    <div class="zjy-table-search">
      <div class="zjy-table-search__item">
        <span>年份</span>
        <el-select v-model="query.enterYear" placeholder="请选择">
        </el-select>
      </div>
      <div class="zjy-table-search__item">
        <span>班级</span>
        <el-select v-model="query.classId" placeholder="请选择">
        </el-select>
      </div>
      <div class="zjy-table-search__item">
        <span>学号</span>
        <zjy-input v-model="query.studentNo"></zjy-input>
      </div>
      <a href="javascript:;" class="zjy-table-search__button" @click="search"></a>
    </div>
    <div class="zjy-line"></div>
    <div class="zjy-table-oper">
      <div class="zjy-table-oper__item">
        <div class="zjy-table-oper--create">
          <a href="javascript:;" @click="create">新增</a>
        </div>
      </div>
      <div class="zjy-table-oper__item">
        <div class="zjy-table-oper--">
          <a href="javascript:;" @click="_import">导入</a>
        </div>
      </div>
      <div class="zjy-table-oper__item">
        <div class="zjy-table-oper--">
          <a href="javascript:;" @click="_export">导出</a>
        </div>
      </div>
    </div>
    <transition name="slide-fade">
      <div class="svg" v-if="show">
        <svg style="top:5px; left:70px;position:relative;z-index:999;overflow:hidden" width="20" height="10" viewBox="0 0 20 10" xmlns="http://www.w3.org/2000/svg" version="1.1">
          <polygon points="10,0 20,11 0,11" style="fill:rgb(255,255,255);stroke:rgb(55,198,212);stroke-width:1" />
        </svg>
        <div class="upload" >
        </div>
      </div>
    </transition>
    <el-table :data="list" style="width: 100%" v-loading="loading">
      <el-table-column type="selection" width="30">
      </el-table-column>
      <el-table-column type="index" label="序号" :index="1" width="50">
      </el-table-column>
      <el-table-column prop="studentNo" label="学号" width="100">
      </el-table-column>
      <el-table-column prop="studentName" label="姓名" width="120">
      </el-table-column>
      <el-table-column prop="facultyName" label="院系" width="120">
      </el-table-column>
      <el-table-column prop="facultyName" label="专业" width="120">
      </el-table-column>
      <el-table-column prop="className" label="班级" width="120">
      </el-table-column>
      <el-table-column prop="applyDate" label="建档日期" :formatter="dateFormat" width="120">
      </el-table-column>
      <el-table-column prop="facultyName" label="入学年份" width="120">
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <a href="javascript:" @click="edit(scope.row)" class="zjy-btn-view">
            <i class="zjy-icon"></i>
            <span>编辑</span>
          </a>
        </template>
      </el-table-column>

      <span slot="empty">{{ empty }}</span>
    </el-table>
    <div class="zjy-pagination" v-if="list.length !== 0">
      <zjy-pagination :currentPage="currentPage" :total="total" :pageSize="limit" @current-change="currentChange">
      </zjy-pagination>
    </div>

    <el-dialog :title="title" :visible.sync="visible" width="800px">

      <file 
        v-if="visible"
        :formData="file"
        v-model="settings" 
        @close="handleClose"
        :type="type"
        :list="fileList"
        :outterClose="!visible"
      ></file>
    </el-dialog>
  </div>
</template>

<script>
import stufileManageAPI from '@/api/teacher/stufile/manage'
import stufileAPI from '@/api/teacher/stufile/setting'

import File from './File'
import ZjyInput from '@/components/input'
import ZjyPagination from '@/components/pagination'
import { dateFormat as _dateFormat } from '@/utils'

export default {
  data() {
    return {
      currentPage: 1,
      list: [],
      limit: 10,
      total: 0,
      visible: false,
      title: '',
      query: {
        offset: 0,
        limit: 10,
        enterYear: '',
        classId: '',
        studentNo: ''
      },
      loading: false,
      empty: '暂无数据',
      show: false,
      file: {}, // 学生档案
      fileList: [],
      settings: [],
      type: 2 //0-查看 1-编辑 2新增
    }
  },

  methods: {
    clearFileList() {
      for (let i = 0; i < this.fileList.length; ++i) {
        this.fileList[i].stufileName = ''
        this.fileList[i].stufilePath = ''
        this.fileList[i].listUid = ''
        this.fileList[i].stufileUid = ''
      }
    },

    create() {
      this.type = 2
      this.file = {}
      this.title = '新增学生档案'
      this.visible = true
      this.clearFileList()
    },

    edit(row) {
      
      this.type = 1
      this.title = '编辑学生档案'
      stufileManageAPI.queryForObject(row.stufileUid).then(response => {
        
        if (response.code !== 1) this.$alert('获取学生档案失败')
        this.file = response.data
        const _ = response.data.stufileListList
        this.clearFileList()

        for (let i = 0; i < this.fileList.length; ++i) {
           this.fileList[i].stufileUid = row.stufileUid
        }
        
        for (let i = 0; i < this.fileList.length; ++i) {
          for (let j = 0; j < _.length; ++j) {
            if (_[j].swmsStufileSetting && this.fileList[i].stufilesettingUid == _[j].swmsStufileSetting.stufilesettingUid) {
              this.fileList[i].stufileName = _[j].swmsStufileSetting.stufileName
              this.fileList[i].stufilePath = _[j].stufilePath
              this.fileList[i].listUid = _[j].listUid
            }
          }
        }
        this.visible = true
      }).catch(error => {

      })
    },

    _import() {
      this.show = !this.show
    },

    _export() {},

    search() {},

    currentChange(pageNumber) {
      this.currentPage = pageNumber
    },

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

    refresh() {
      const old = this.currentPage
      this.currentPage = -1
      setTimeout(() => (this.currentPage = old), 100)
    },

    handleClose() {
      this.visible = false
    }
  },

  created() {
    stufileAPI.queryForList().then(resposne => {
      if (resposne.code !==1) {
        this.$alert('获取档案设置失败')
        return
      }
      this.settings = resposne.data
      for (let i = 0; i < this.settings.length; ++i) {
        this.fileList.push({
          index: i,
          stufileName: "",
          stufilesettingUid: this.settings[i].stufilesettingUid,
          stufilePath: ""
        })
      }
    }).catch(error => {
    })
  },
  components: {
    ZjyInput,
    ZjyPagination,
    File
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val, oldval) {
        if (val === -1) return

        this.loading = true
        this.query.offset = this.query.limit * (val - 1)
        stufileManageAPI
          .queryForList(this.query)
          .then(response => {
            if (response.code === 1) {
              this.list = response.rows
              this.total = response.total
            } else {
              this.$alert(response.message)
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
      this.empty = val.length === 0 ? '暂无数据' : '数据加载中....'
    }
  }
}
</script>
<style lang='scss' scoped>
.upload {
  width: 1020px;
  height: 86px;
  border: 1px solid #37c6d4;
  position: relative;
}
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.arrow {
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
    border-bottom-color: #37c6d4;
    top: -12px;
    left: 68px;
  }
}

.svg {
    position: relative;
    top: -16px;
    margin-bottom: -6px;
}
</style>