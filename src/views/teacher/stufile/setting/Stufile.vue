<!--  -->
<template>
  <div class="zjy-form">
    <el-form :model="formData" :rules="rules" ref="formData">
      <el-form-item prop="stufileName">
        <el-input type="textarea" v-model="formData.stufileName"></el-input>
      </el-form-item>

      <div class="zjy-footer">
        <zjy-button type="plain" @click="$emit('close', 0)">取消</zjy-button>
        <zjy-button type="primary" @click="submitForm('formData')">提交</zjy-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import ZjyButton from '@/components/button'
import stufileAPI from '@/api/teacher/stufile/setting'

export default {
  data () {
    var that = this
    var checkExists = (rule, value, callback) => {
      if (that.list.filter(x => x.stufilesettingUid !== that.formData.stufilesettingUid).find(y => y.stufileName == value)) {
        callback(new Error('档案名称已存在'))
      } else callback()
    }
    return {
      rules: {
        stufileName: [
          {required: true, message: '请输入档案名称', trigger: 'blur'},
          {validator: checkExists, trigger: 'blur'}
        ]
      }
    }
  },

  props: {
    formData: Object,
    type: Number,
    list: Array // 因为无分页所以检查重复可以直接在前端做
    // closed: Boolean
  },

  methods: {
    resetForm (formName) {
      this.$refs[formName].resetFields()
      this.$emit('close', 0)
    },

    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.type === 1) {
            stufileAPI.update(this.formData.stufilesettingUid, this.formData).then(response => {
              if (response.code === 1) {
                this.$emit('close', 1)
              }
            })
          } else {
            stufileAPI.create(this.formData).then(response => {
              if (response.code === 1) {
                this.$emit('close', 1)
              }
            })
          }
        } else {
          return false
        }
      })
    }
  },

  components: {
    ZjyButton
  },

  watch: {
    // closed(val) {
    //   if (val) {
    //     this.$refs['formData'].resetFields()
    //   }
    // }
  }
}

</script>
<style lang='scss' scoped>
</style>
