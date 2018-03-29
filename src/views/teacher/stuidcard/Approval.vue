<!-- 教师审批流程查看 -->
<template>
  <div class="stuidcard" v-loading="loading">
    <div class="zjy-form">
      <div class="form-item">
        <span>学号:</span>
        <span>{{ student.studentNo }}</span>
      </div>
      <div class="form-item">
        <span>学生姓名:</span>
        <span>{{ student.studentName }}</span>
      </div>
      <div class="form-item">
        <span>年级:</span>
        <span>{{ student.facultyName }}</span>
      </div>
      <div class="form-item">
        <span>院系:</span>
        <span>{{ student.facultyName }}</span>
      </div>
      <div class="form-item">
        <span>专业:</span>
        <span>{{ student.specialtyName }}</span>
      </div>
      <div class="form-item">
        <span>班级:</span>
        <span>{{ student.className }}</span>
      </div>
      <div class="form-item">
        <span>申请日期:</span>
        <span>{{ reissued.applyDate | dateFormat }}</span>
      </div>
    </div>
    <div class="reason">
      <p class="title">申请原因</p>
      <p>{{ reissued.applyReason }}</p>
    </div>

    <div class="zjy-steps">
      <p class="title">审批进度</p>
      <zjy-steps :active="step" align-center>
        <zjy-step title="发起人" :description="'(' + student.studentName + ')'" v-if="steps.length !== 0">
        </zjy-step>
        <zjy-step v-for="(item,index) in steps" :key="item.approvalStep" :title="item.postName" :custom="item">
          <div slot="description">
            <div v-if="item.approvalType == 2 || item.approvalStatus">
              ({{ item.teacherName }})
            </div>
            <div v-else>
              <!-- 当前流程动态绑定 -->
              <p v-if="index === step - 1 && value">
                ({{nextTeacherName}})
              </p>
              <!-- 其它只绑定一次,也可以不绑定(还未选择教师) -->
              <!-- <span v-else v-once>({{ value }})</span> -->
            </div>
            <!--  -->
            <div v-if="index <= step - 1 && item.approvalStatus">
              <p
                :class="[
                { statusYes: item.approvalStatus == 1 },
                { statusNo: item.approvalStatus == 2 },
                { statusWait: item.approvalStatus == 0 },
                  'status'
                ]">
                ({{ item.approvalStatus | statusFormat }})
              </p>
            </div>
          </div>
          <!-- 只初始化当前流程的教师列表 (index === step - 1) -->
          <!-- 若存在流程状态属性则不初始化 (approvalStatus) -->
          <el-select class="zjy-select" v-model="value" placeholder="请选择审批人" slot="custom" slot-scope="props"
                     @change="handleChange"
                     v-if="props.data.approvalType == 1 && index === step - 1 && !props.data.approvalStatus && approved && !reason">
            <el-option v-for="item in approverList" :key="item.teacherId" :label="item.teacherName"
                       :value="item.teacherId">
            </el-option>
          </el-select>
        </zjy-step>
      </zjy-steps>
    </div>
    <div class="zjy-footer" v-if="user.userDetailId === currentStep.teacherId && !isCompleted">
      <template v-if="!approved">
        <zjy-button type="plain" @click="no">拒 绝</zjy-button>
        <zjy-button type="primary" @click="yes">同 意</zjy-button>
      </template>
      <zjy-button v-else type="primary" @click="submit">提 交</zjy-button>
    </div>

    <el-dialog width="30%" title="请输入拒绝原因" :visible.sync="innerVisible" append-to-body>
      <zjy-input type="textarea" v-model="reason"></zjy-input>
      <div class="zjy-footer">
        <zjy-button type="plain" @click="innerNo">拒 绝</zjy-button>
        <zjy-button type="primary" @click="innerYes">同 意</zjy-button>
      </div>
    </el-dialog>
    <p v-if="reason && isCompleted" class="refused">拒绝原因: {{reason}}</p>
  </div>
</template>

<script>
import cardAPI from '@/api/teacher/stuidcard'
import ZjyInput from '@/components/input'
import {ZjyStep, ZjySteps} from '@/components/steps'
import ZjyButton from '@/components/button'

import {mapGetters} from 'vuex'

// approvalStatus 0:待审批, 1:已通过，2:已拒绝
const STATUS = {
  awaiting: '0',
  yes: '1',
  no: '2'
}
export default {
  data () {
    return {
      reissued: {},
      student: {},
      steps: [],
      value: '',
      reason: '', // 拒绝原因
      currentStep: {},
      nextTeacherId: '',
      nextTeacherName: '',
      isCompleted: true, // 是否已完成所有审批
      innerVisible: false,
      approved: false, // 是否已处理申请
      approverList: {}, // 下一步审批人列表
      step: 1,
      loading: false
    }
  },

  methods: {
    no () {
      this.innerVisible = true
    },

    yes () {
      this.steps[this.step - 1].approvalStatus = STATUS.yes
      this.approved = true
    },

    innerNo () {
      this.innerVisible = false
      this.reason = ''
    },

    innerYes () {
      if (!this.reason) {
        this.$alert('请输入拒绝原因')
        return
      }
      this.steps[this.step - 1].approvalStatus = STATUS.no
      this.approved = true
      this.innerVisible = false
    },

    submit () {
      if (!this.value && !this.$empty(this.approverList) && !this.reason) {
        this.$alert('请选择下一步审批人')
        return
      }

      const _ = this.steps.find(x => x.approvalStep == this.step)
      if (_ && _.approvalType == 1) {
        _.teacherId = this.nextTeacherId
        _.teacherName = this.nextTeacherName
      }

      if (this.reason) {
        this.steps[this.step - 2].approvalOpinion = this.reason
      }

      cardAPI
        .approved(this.reissued, this.steps)
        .then(response => {
          if (response.code === 1) {
            this.$alert('保存成功')
            this.$emit('submit', 0)
          } else {
            this.$alert('保存失败')
            this.$emit('submit', 1)
          }
        })
        .catch(error => {
        })
    },
    // 关闭时清空各个状态
    clear () {
      this.approved = false
      this.value = ''
      this.isCompleted = true
      this.reason = ''
    },

    handleChange (val) {
      this.nextTeacherId = val
      if (!this.$empty(this.approverList)) {
        this.nextTeacherName = this.approverList.find(
          x => x.teacherId === val
        ).teacherName
      }
    }
  },

  props: {
    uid: String,
    closed: Boolean // 当前弹窗关闭状态
  },

  computed: {
    ...mapGetters(['user'])
  },

  components: {
    ZjyStep,
    ZjySteps,
    ZjyButton,
    ZjyInput
  },
  watch: {
    uid: {
      immediate: true,
      handler (val) {
        this.loading = true
        if (val == '') return
        cardAPI
          .queryForObject(val)
          .then(response => {
            this.student = response.data.ucenterStudent
            this.reissued = {
              stuidcardUid: response.data.stuidcardUid,
              applyDate: response.data.applyDate,
              applyReason: response.data.applyReason,
              applyYear: response.data.applyYear,
              studentId: response.data.studentId,
              dataStatus: response.data.dataStatus
            }
            this.loading = false
          })
          .catch(error => {
          })
      }
    },
    // 查询流程进度
    student: {
      deep: true,
      handler (val) {
        cardAPI
          .queryApprovalProcess(this.student.studentId, this.uid)
          .then(response => {
            this.steps = response.data.swmsApprovals.sort(
              (x, y) => x.approvalStep - y.approvalStep
            )

            // 查找审批状态为0的审批步骤序号(已排序)
            // 无approvalStatus为0时，认为已完成
            try {
              this.step = this.steps.find(
                x => x.approvalStatus == 0
              ).approvalStep
              this.currentStep = this.steps[this.step - 1]
            } catch (e) {
              const _ = this.steps.find(x => x.approvalStatus == 2)
              if (_) {
                this.step = _.approvalStep
                this.reason = _.approvalOpinion
              } else {
                this.step = this.steps.length + 1
              }

              this.isCompleted = true
            }

            // 下一步需要设置教师则初始化
            this.approverList = response.data[Object.keys(response.data).filter(x => Number(x) == x)]

            this.isCompleted = this.steps.every(x => x.approvalStatus && x.approvalStatus == 1) || this.steps.some(x => x.approvalStatus && x.approvalStatus == 2)
            this.loading = false
          })
          .catch(error => {
            console.log(error)
            this.loading = false
          })
      }
    },

    approved (val) {
      if (val) this.step++
      else this.step--
    },

    closed (val) {
      if (val) {
        this.clear()
      }
    }
  }
}
</script>
<style lang='scss' scoped>
  .form-item {
    font-size: 14px;
    margin-bottom: 20px;
    margin-right: 20px;
    > span:nth-child(1) {
      color: #666;
    }
    > span:nth-child(2) {
      color: #323232;
    }
  }

  .reason {
    margin-bottom: 10px;

  }

  .title {
    font-weight: bold;
  }

  .refused {
    height: 54px;
    background-color: #f5f5f5;
    font-size: 14px;
    color: #333333;
    line-height: 54px;
    text-indent: 15px;
    margin: 30px 0 15px 0;
    font-weight: bold;
  }

  .zjy-textarea {
    height: 100px;
  }
</style>
