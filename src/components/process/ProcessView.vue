<!-- 学生端我的保险查看 -->
<template>
  <div>
    <slot :formData="data"></slot>

    <!--<p v-if="steps.length === 0">还未配置流程</p>-->
    <div class="zjy-steps" v-if="hasStep">
      <p>审批流程</p>
      <zjy-steps :active="step" align-center>
        <zjy-step title="发起人" :description="'(' + user.fullName + ')'">
        </zjy-step>
        <zjy-step v-for="(item,index) in steps" :key="item.approvalStep" :title="item.postName" :custom="item">
          <div slot="description">
            <div v-if="item.approvalType == 2 || item.approvalStatus">
              ({{ item.teacherName }})
            </div>

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
        </zjy-step>
      </zjy-steps>
    </div>

    <p v-if="reason && isFinished" class="refused">拒绝原因: {{ reason }}</p>
    <div class="zjy-footer" v-if="!hasFooter && isFinished && !reason">
      <zjy-button type="plain" @click="$emit('update:visible', false)">取 消</zjy-button>
      <zjy-button type="primary" @click="pay">立即支付</zjy-button>
    </div>

  </div>

</template>

<script>
// import Panel from '@/components/panel/panel'
// import PanelItem from '@/components/panel-item/panel-item'
import {ZjyStep, ZjySteps} from '@/components/steps'
import ZjyButton from '@/components/button'

import {mapGetters} from 'vuex'

export default {
  data () {
    return {
      step: 1,
      steps: [], // 审批流程步骤
      isFinished: false,
      reason: '' // 拒绝原因
      // STATUS: {
      //   awaiting: '0',
      //   yes: '1',
      //   no: '2'
      // }
    }
  },

  props: {
    data: Object,
    value: Object,
    visible: Boolean
  },

  computed: {
    ...mapGetters(['user']),
    hasFooter () { return this.$slots.footer },
    hasStep () { return this.steps.length > 0 }
  },

  components: {
    // Panel,
    // PanelItem,
    ZjySteps,
    ZjyStep,
    ZjyButton
  },

  methods: {
    pay () {
    }
  },

  watch: {
    value: {
      immediate: true,
      handler (val) {
        if (this.$empty(val)) return

        this.steps = val.swmsApprovals.sort((x, y) => x.approvalStep - y.approvalStep)

        try {
          this.step = this.steps.find(x => x.approvalStatus === '0').approvalStep
        } catch (e) {
          const _ = this.steps.find(x => x.approvalStatus === '2')
          if (_) {
            this.step = _.approvalStep
            this.reason = _.approvalOpinion
          } else {
            this.step = this.steps.length + 1
          }
          this.isFinished = true
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
  .item {
    margin-right: 50px;
    margin-bottom: 15px;
    &.block {
      width: 100%;
      display: block;
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
</style>
