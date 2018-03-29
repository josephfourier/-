<!-- 学生查看保险或申请保险（全部保险菜单) -->
<template>
  <panel>
    <!-- <div class="status" v-if="type === 2">
      <img src="./ic_wait.png" alt="确认状态">
      <span>134134</span>
    </div> -->
    <panel-item class="item" label="保险名称：" labelWidth="70px"><p class="text" :title="data.insuranceName">{{ data.insuranceName }}</p></panel-item>
    <panel-item class="item" label="保险公司：" labelWidth="70px"><p class="text" :title="data.insuranceCompany">{{ data.insuranceCompany }}</p></panel-item>
    <panel-item class="item" label="险种类别：" labelWidth="70px"><p class="text" :title="data.insuranceCategory">{{ data.insuranceCategory }}</p></panel-item>
    <panel-item class="item" label="保险费用：" labelWidth="70px"><p class="text" :title="data.insuranceCost">{{ data.insuranceCost }}</p></panel-item>
    <panel-item class="item" label="保险期限：" labelWidth="70px"><p class="text" :title="data.insuranceLimit">{{ data.insuranceLimit }}</p></panel-item>
    <div class="details">
      <p class="title">详细条款</p>
      <div class="content">
        {{ data.detailedTerms }}
      </div>
    </div>
    <!-- <panel-item class="item block" label="是否开通：" labelWidth="70px">
        <el-radio-group v-model="value">
          <el-radio :label="'1'">开通</el-radio>
          <el-radio :label="'0'">不开通</el-radio>
        </el-radio-group>
      </panel-item> -->
    <p v-if="type === 2">审批流程</p>
    <panel-item v-if="type === 2" class="item block">
      <p v-if="steps.length === 0"> 还未配置流程</p>
      <div class="zjy-steps" v-else>
        <zjy-steps :active="step" align-center>
          <zjy-step title="发起人" :description="'(' + user.fullName + ')'">
          </zjy-step>
          <zjy-step v-for="(item, index) in steps" :key="item.approvalStep" :title="item.postName" :custom="item">
            <div slot="description">
              <div v-if="item.approvalType == 2 || item.approvalStatus">
                ({{ item.teacherName }})
              </div>
              <div v-else>
                <p v-if="index === step - 1 && approver">
                  ({{ nextApproverName }})
                </p>

              </div>
              <!-- 审批状态 -->
              <div v-if="index <= step - 1 && item.approvalStatus">
                <p :class="[
                { statusYes: item.approvalStatus == 1 },
                { statusNo: item.approvalStatus == 2 }, 
                { statusWait: item.approvalStatus == 0 }, 
                  'status'
                ]">
                  ({{ item.approvalStatus | statusFormat }})
                </p>
              </div>
            </div>
            <!-- 学生端只初始化第一步的审批人 index === 0 -->
            <el-select 
              class="zjy-select" 
              v-model="approver" 
              placeholder="请选择审批人" 
              slot="custom" 
              slot-scope="props" 
              @change="handleChange" 
              v-if="props.data.approvalType == 1 
              && index === 0 
              && !props.data.approvalStatus"
            >
              <el-option v-for="item in approverList" :key="item.teacherId" :label="item.teacherName" :value="item.teacherId">
              </el-option>
            </el-select>
          </zjy-step>
        </zjy-steps>
      </div>
    </panel-item>
    <div class="zjy-footer">
      <template v-if="type === 2 && steps.length !== 0">
        <zjy-button type="plain" @click="cancel">取消</zjy-button>
        <zjy-button type="primary" @click="create">确认</zjy-button>
      </template>
      <zjy-button v-if="type === 1" type="primary" @click="close">关闭</zjy-button>
    </div>
  </panel>
</template>

<script>
import Panel from '@/components/panel/panel'
import PanelItem from '@/components/panel-item/panel-item'
import ZjyButton from '@/components/button'
import { ZjyStep, ZjySteps } from '@/components/steps'

import allInsuranceAPI from '@/api/student/insurance/all'

import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      step: 1,                // 申请操作与查看操作分开，因此申请操作中的step总是1
      steps: [],              // 审批流程步骤
      approver: '',           // select v-model
      approverList: [],       // 下一步需要初始化的审批教师列表
      hasNextApprover: false, // 是否需要初始化第一步的教师列表
      nextApproverName: '',
      nextApproverId: ''
    }
  },

  props: {
    type: Number,  // 1-查看 2-申请 
    data: Object,  // 投保设置信息
    value: Object,  //
    closed: Boolean
  },

  computed: {
    ...mapGetters(['user'])
  },

  components: {
    Panel,
    PanelItem,
    ZjyButton,
    ZjySteps,
    ZjyStep
  },

  methods: {
    // 学生选择下一审批教师
    handleChange(val) {
      this.nextApproverId = val
      if (this.hasNextApprover)
        this.nextApproverName = this.approverList.find(
          x => x.teacherId === val
        ).teacherName
    },

    // 学生申请保险提交
    create() {
      if (this.hasNextApprover && !this.approver) {
        this.$alert('请填写审批人')
        return
      }

      this.fullscreenLoading = true

      if (this.hasNextApprover) {
        const _ = this.steps.find(x => x.approvalStep == this.step)
        if (_ && _.approvalType == 1) {
          _.teacherId = this.nextApproverId
          _.teacherName = this.nextApproverName
        }
      }

      allInsuranceAPI.create(this.data.inssettingUid, this.steps).then(response => {
        if (response.code === 1) {
          this.$alert('申请成功')
          this.refresh(1) // 通知父组件刷新 1 正常保存数据刷新 0 只关闭未操作数据不刷新 2失败时处理...
        } else {
          this.$alert(response.message)
        }
      }).catch(error => {

      })
    },

    //申请时关闭
    cancel() {
      this.$emit('submit', 0)
      this.clear()
    },

    clear () {
      this.step = 1               
      this.steps = []              
      this.approver = ''         
      this.approverList = []    
      this.hasNextApprover = false
      this.nextApproverName = ''
      this.nextApproverId = ''
    },
    // 查看时关闭
    close() {
      this.$emit('submit', 0)
    },

    refresh (code) {
      this.$emit('submit', code)
    }
  },

  mounted() {
  },

  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (this.$empty(val)) return

        this.approverList = val[+Object.keys(val).find(x => Number(x) == x)] || {}
        this.steps = val.swmsApprovals.sort(
          (x, y) => x.approvalStep - y.approvalStep
        )
        this.hasNextApprover = !this.$empty(this.approverList)
      }
    },

    closed(val) {
      if (val) this.clear()
    }
  }
}
</script>
<style lang='scss' scoped>
.item {
  .text {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  width: 180px;
  margin-right: 20px;
  margin-bottom: 15px;
  &:first-child {
    width: 300px
  }
  &:nth-of-type(3) {
    width: 150px;
  }
  &:nth-of-type(4) {
    width: 300px;
  }
  &.block {
    width: 100%;
    .zjy-panel-item__label {
      display: block;
    }
  }
}
.status {
  > span,
  > img {
    vertical-align: middle;
  }
  margin-bottom: 10px;
}
.details {
  padding: 20px;
  background-color: #f5f5f5;
  .title {
    color: #333333;
    font-weight: bold;
  }
  margin-bottom: 15px;
}

.content {
  overflow-y: auto;
  max-height: 200px;
}
</style>