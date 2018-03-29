<!-- 公用表格搜索 -->
<template>
  <div class="zjy-search-panel__body">
    <label class="zjy-search-panel__label">{{ label }}</label>
    <el-input :placeholder="placeholder" v-model="value"></el-input>
    <a href="javascript:;" class="zjy-search-panel__button" @click="handleClick"></a>
  </div>
</template>

<script>
export default {
  data () {
    return {
      value: ''
    }
  },

  props: {
    label: String,
    placeholder: String
  },

  methods: {
    handleClick() {
      this.$emit('click', this.value)
    }
  },

  watch: {
    value(val) {
      this.$emit('change', val)
    }
  }
}

</script>

<style lang='scss' scoped>
.zjy-search-panel__body {
  .zjy-search-panel__label {
    font-size: 12px;
    color: #444444;
  }
  .zjy-search-panel__button {
    background: #37c6d4 url(./ic_search.png) 16px 10px no-repeat;
    width: 50px;
    height: 34px;
    display: inline-block;
    vertical-align: top;
  }
  .el-input {
    width: auto;
  }
}
</style>