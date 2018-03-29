<template>
    <div class="zjy-app zjy-account">
        <AccountList
        :query="query">
          <zjy-search
            class="zjy-table-search"
            :label="'用户姓名'"
            placeholder="请输入姓名"
            @handleChange="update"
            @handleClick="search">
          </zjy-search>
        </AccountList>
    </div>
</template>
<script>
import AccountList from './AccountList.vue'
import ZjySearch from '@/components/search'
import ZjyInput from '@/components/input'
export default {
  data () {
    return {
      msg: 'table',
      query: ''
    }
  },

  methods: {
    search (val) {
      this.query = val
    },
    update (val) {
      // this.query = val
    }
  },

  components: {
    ZjySearch,
    AccountList,
    ZjyInput
  }
}
</script>
<style lang="scss">
.zjy-account {

  .zjy-table-search {
    margin-bottom: 10px;
  }
}
</style>
