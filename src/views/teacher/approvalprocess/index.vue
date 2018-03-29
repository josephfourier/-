<template>
  <div class="app-approval">
    <MultiMenu 
      class="zjy-multi-menu" 
      :data="data" 
      v-model="value" 
      :titles="titles" 
      :widths="widths" 
      :filterable="filterable" 
      :props="props" 
      :types="types" 
      :placeholder="placeholder" 
      :render-content="renderFunc" 
      :selected="selected" 
      :elts="elts" 
      :defaultSelected="data[0]" 
      @selected-change="selectedChange" 
      @del="del" 
      @create="create" 
      @config="config"
      :highlights="[true, false]"
      :loading="loading"
    >
      <a slot="header">添加步骤</a>
    </MultiMenu>

    <el-dialog title="节点处理人配置" :visible.sync="dialogVisible" @close="reset" width="675px">
      <div class="zjy-radio-container">
        <div class="zjy-radio-wrap">
          <template>
            <span>{{ levels.length > 0 ? levels[0].dictName : 'radio' }}</span>
            <el-radio-group v-model="level">
              <el-radio v-for="(item) in levels" :key="item.valueId" :label="item.valueKey">
                {{ item.valueName }}
              </el-radio>
            </el-radio-group>
          </template>
        </div>

        <div class="zjy-radio-wrap">
          <span>{{ handlers.length > 0 ? handlers[0].dictName : 'radio' }}</span>
          <template>
            <el-radio-group v-model="handler">
              <el-radio v-for="(item) in handlers" :key="item.valueId" :label="item.valueKey">
                {{ item.valueName }}
              </el-radio>
            </el-radio-group>
          </template>
        </div>
      </div>

      <MultiMenu 
        class="zjy-multi-menu" 
        :data="positions" 
        v-model="teachers" 
        :titles="['选择职务','选择个人']" 
        :widths="['285px', '285px']" 
        :filterable="[true, true]" 
        :props="props2" 
        :elts="['radio','radio']" 
        :dialogVisible="dialogVisible"
        :level="level"
        :handler="handler"
        :defaultSelected="defaultSelectedPost"
        :defaultSelectedSub="defaultSelectedTeacher"
        @selected-change="updateTeachers"
        @selected-change_="selectTeacher"
        :hightlights="[false,false]">
      </MultiMenu>

      <div slot="footer" class="dialog-footer">
        <zjy-button @click.native="reset" type="plain">取 消</zjy-button>
        <zjy-button @click="saveOrUpdate" type="primary">确 定</zjy-button>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import MultiMenu from "@/components/multi-menu/Menu"
import approvalAPI from "@/api/approval"

import ZjyButton from "@/components/button"

export default {
  name: "App",
  data() {
    return {
      // 主菜单数据
      data: [],

      // 子菜单数据
      value: [],

      // 主菜单当前项
      selected: {},

      // 菜单标题
      titles: ["1.选择功能", "2.流程设置"],

      // 菜单宽度
      widths: ["200px", "600px"],

      // 菜单是否显示搜索
      filterable: [true, false],

      // 判断配置步骤时为新增或更新
      isUpdate: false,

      props: [
        {
          key: "permissionId",
          label: "name"
        },
        {
          key: "approvalStep",
          label: "postName"
        }
      ],

      // 弹出窗主菜单属性
      props2: [
        {
          key: "postId",
          label: "postName"
        },
        {
          key: "teacherId",
          label: "teacherName"
        }
      ],

      // 菜单主体渲染类型
      types: ["ul", "table"],

      // 渲染函数
      renderFunc(h, option, type) {
        if (type === "ul") {
          return <span>{option.name}</span>
        }
      },

      // 对话框显示
      dialogVisible: false,

      levels: [],

      // 范围 学校 院系
      level: '-1',

      handlers: [],

      // 处理人
      handler: '-1',
    
      // 职务信息
      positions: [],
      
      // 选择的职务
      selectedPost: {},

      // 教师信息(个人)
      teachers: [],

      // 选择的教师
      selectedTeacher: {},

      // handlerSelected: {},
      // teacherSelected: {},

      // 渲染checkbox, radio
      elts: [],

      placeholder: "请输入搜索条件",

      // 更新回显
      // 默认选中的职务
      defaultSelectedPost: {},
      // 默认选中的教师
      defaultSelectedTeacher: {},

      currentUid: '',
      currentStep: -1,
      loading: false
    }
  },

  methods: {
    selectedChange(item) {
      this.selected = item
      this.queryApprovalProcess(this.selected[this.keyPropMain])
    },

    // 根据id查询步骤列表
    queryApprovalProcess(id) {
      this.loading = true
      approvalAPI
        .queryApprovalProcess(id)
        .then(resp => {
          // 过滤错误数据(无templateUid定义为错误数据)
          this.value = resp.data == null
           ? [] 
           : resp.data
            .filter(x => x.templateUid)
            .sort((x, y) => +x.approvalStep - +y.approvalStep)
            this.loading = false
        
        }
        )
        .catch(err => {})
    },

    del(item) {
      if (!item.templateUid) {
        this.value.splice(this.value.length-1, 1)
        this.$alert('删除成功')
        return 
      }

      approvalAPI.deleteProvalProcess(item.templateUid)
      .then(resp => {
        if (resp.code === 1) {
          this.value.splice(this.value.findIndex(v => v.templateUid === item.templateUid), 1)
          this.$alert('删除成功')
        }
      })
      .catch (err => {})
    },

    reset() {
      this.level = this.handler = '-1'
      this.dialogVisible = false
      this.teachers = []
      this.positions = []
      this.selectedPost = {}
      this.selectedTeacher = {}
      this.defaultSelectedPost = {}
      this.defaultSelectedTeacher = {}
    },

    config(item) {
      this.isUpdate = item.arg.templateUid ? true : false
      this.dialogVisible = true
      this.handlers.length === 0 ? this.queryApprovalHandler() : ""
      this.levels.length === 0 ? this.queryApprovalLevel() : ""

      this.currentStep = item.arg.approvalStep

      // 回填信息
      if (this.isUpdate) {
        this.handler = item.arg.approvalType
        this.level = item.arg.teacherLevel
        this.selectedPost = this.defaultSelectedPost = item.arg
        this.currentUid = item.arg.templateUid
      }
    },

    // 查询处理人类型
    queryApprovalHandler() {
      approvalAPI
        .queryApprovalHandler()
        .then(resp => this.handlers = resp.data === null ? [] : resp.data)
        .catch(err => {})
    },

    // 查询处理级别
    queryApprovalLevel() {
      approvalAPI
        .queryApprovalLevel()
        .then(resp => this.levels = resp.data === null ? [] : resp.data)
        .catch(err => {})
    },

    // 根据级别查询职务
    queryPostList(level) {
      this.teachers = []

      if (this.handler == -1 || this.level == -1) return 
  
      approvalAPI
        .queryPostList(level)
        .then(resp => this.positions = resp.data === null ? [] : resp.data)
        .catch(err => {})
    },

    // 添加步骤
    create() {
      const keyProp = this.props[1].key
      const labelProp = this.props[1].label

      if (this.value.length === 0) {
        this.value.push({
          approvalStep: 1,
          postName: ""
        })
      } else {
        const key = this.value[this.value.length - 1][keyProp]
        const done = this.value[this.value.length - 1][labelProp] !== ""
        if (!done) {
          this.$alert("请先配置第" + key + " 步的信息")
          return
        }

        this.value.push({
          approvalStep: key + 1,
          postName: ""
        })
      }
    },

    // 保存流程步骤
    saveOrUpdate() {

      if (Object.keys(this.selectedPost).length === 0) {
        this.$alert('请选择职务')
        return 
      } else if (this.handler === '2' && Object.keys(this.selectedTeacher).length === 0) {
        this.$alert('请选择个人')
        return
      }
      !this.isUpdate
       ? approvalAPI.createProvalProcess(this.__create())
        .then(resp => {
          if (resp.code === 1) {
            this.$alert('配置成功')
            this.queryApprovalProcess(this.selected[this.keyPropMain])
          }
        })
        .catch (err => {})
      : approvalAPI.updateProvalProcess(this.__create())
        .then(resp => {
          this.queryApprovalProcess(this.selected[this.keyPropMain])
        })
        .catch(err => {

        })
        
      this.reset()
    },

    __getType() {
      if (this.handler === '1') {
        return {
          postName: this.selectedPost.postName,
          postId: this.selectedPost.postId,
        }
      } else if (this.handler === '2') {
        return {
          teacherId: this.selectedTeacher.teacherId,
          teacherName: this.selectedTeacher.teacherName,
        }
      }
    },


    // 创建一个表单提交实体
    __create() {
      const type = this.__getType()
      return {
        templateUid     : this.currentUid || null,
        permissionId    : this.selected.permissionId,
        permissionName  : this.selected.name,
        approvalStep    : this.currentStep,
        approvalType    : this.handler,
        teacherLevel    : this.level,
        approvalUri     : this.selected.approvalUri,
        postName        : this.selectedPost.postName || null,
        postId          : this.selectedPost.postId || null,
        teacherId       : this.selectedTeacher.teacherId || null,
        teacherName     : this.selectedTeacher.teacherName || null
      }
    },

    updateTeachers(item) {
      
      this.selectedPost = item
      if (this.handler === '1') return
      approvalAPI.queryTeacherList(item.postId)
        .then (resp => {
          this.teachers = resp.data
          if (this.isUpdate) {
            this.defaultSelectedTeacher = this.teachers.find(i => i.teacherId === item.teacherId)
          }
        })
        .catch (err => {})
    },

    // 选中的教师信息
    selectTeacher(item) {
      this.selectedTeacher = item
    }
  },

  
  components: {
    MultiMenu,
    ZjyButton
  },

  computed: {
    keyPropMain() {
      return this.props[0].key || "key"
    },

    labelPropMain() {
      return this.props[0].label || "label"
    }
  },

  created() {
    approvalAPI
      .queryApprovalList()
      .then(resp => {
        this.data = resp.data
      })
      .catch(err => {})
  },

  watch: {
    level(val, old) {
      if (val === old) return
      
      this.selectedPost = {}
      this.selectedTeacher = {}
      this.queryPostList(val)
    },

    handler(val, old) {
      if (val === old) return
      this.selectedPost = {}
      this.selectedTeacher = {}

      // if (val === '-1' || val === '1') {
      //   this.teachers = []
      //   this.selectedTeacher = {}
      // }

      this.queryPostList(this.level)
      
      if (old === '1' || old === '2') this.defaultSelectedPost = {}
    },

    defaultSelectedPost(val, old) {
    if (Object.keys(val).length !== 0 && this.handler === '2') {
      approvalAPI.queryTeacherList(val.postId)
        .then (resp => {
          this.teachers = resp.data
        })
        .catch (err => {})
    }
  }

  }
}
</script>

<style lang="scss">
.app-approval {
  padding: 30px 40px;

  .zjy-menu-panel {
    display: inline-block;
    vertical-align: top;
  }

  .zjy-radio-container {
    padding-bottom: 10px;
    .zjy-radio-wrap {
      margin-bottom: 10px;
      & > span {
        min-width: 100px;
        display: inline-block;
      }
    }
  }
  .el-radio + .el-radio {
    margin-left: 15px;
  }
  .el-radio__inner {
    width: 22px;
    height: 22px;
  }

  .el-radio__inner::after {
    width: 8px;
    height: 8px;
  }

  .el-radio__input.is-checked + .el-radio__label {
    color: #606266;
  }

  .el-radio__input.is-checked .el-radio__inner {
    background-color: #29c6d4;
    border: 1px solid #29c6d4;
  }
  .el-radio__inner:hover {
    border: 1px solid #29c6d4;
  }
}
</style>
