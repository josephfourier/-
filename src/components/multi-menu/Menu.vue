<template>
  <div>
    <menu-item
      v-bind="$props"
      class="main-menu"
      :title="titles[0]"
      :width="widths[0]"
      :filterable="filterable[0]"
      :props="props[0]"
      :type="types[0]"
      :elt="elts[0]"
      :highlight="highlights[0]"
      :defaultSelected="defaultSelected"
      @selected-change="selectedChange">
    </menu-item>
    <menu-item
      v-bind="$props"
      class="sub-menu"
      :data="value"
      :title="titles[1]"
      :width="widths[1]"
      :filterable="filterable[1]"
      :props="props[1]"
      :type="types[1]"
      :elt="elts[1]"
      :defaultSelected="defaultSelectedSub"
      :highlight="highlights[1]"
      @selected-change="selectedChange_">
      <a slot="header" class="zjy-btn-add" @click="create" v-if="$slots.header">
        <i class="zjy-icon"></i>
        {{ $slots.header[0].children[0].text }}
      </a>

      <tr slot="th">
        <th>步骤序号</th>
        <th>审批人职务</th>
        <th>操作</th>
      </tr>
      <tr v-if="value.length === 0" slot="tip" style="border-bottom:0">
        <td colspan="3" class="zjy-tip">
          <i class="zjy-icon"></i>
          <span>请添加步骤</span>
        </td>
      </tr>

      <tr slot="tr" slot-scope="props" :style="{borderBottom: !props.border ? 'none' : ''}">
        <td>{{ props.arg.approvalStep }}</td>
        <td v-if="props.arg.approvalType ==1">
          {{ props.arg.postName }}
        </td>
        <td v-else>{{ props.arg.teacherName }}</td>
        <td>
          <a href="javascript:" @click="config(props)" class="zjy-btn-config">
            <i class="zjy-icon"></i><span>配置</span>
          </a>
          <a href="javascript:;" @click="del(props.arg)" v-if="props.del" class="zjy-btn-delete">
            <i class="zjy-icon"></i><span>删除</span>
          </a>
        </td>
      </tr>
    </menu-item>
  </div>
</template>

<script>
import MenuItem from './MenuItem'

export default {
  name: 'MultiMenu',
  data () {
    return {
    }
  },
  computed: {
  },
  components: {
    MenuItem
  },
  props: {
    data: {
      type: Array,
      default () {
        return []
      }
    },
    value: {
      type: Array,
      default () {
        return []
      }
    },
    titles: {
      type: Array,
      default () {
        return ['title1', 'title2']
      }
    },
    widths: {
      type: Array,
      default () {
        return ['50%', '50%']
      }
    },
    filterable: Array,
    props: {
      type: Array,
      default () {
        return []
      }
    },
    renderContent: Function,
    types: {
      type: Array,
      default () {
        return ['ul', 'ul']
      }
    },
    selected: Object,
    elts: {
      type: Array,
      default () {
        return []
      }
    },
    radioNames: {
      type: Array,
      default () {
        return ['radio1', 'radio2']
      }
    },
    defaultSelected: Object,
    defaultSelectedSub: Object,
    placeholder: String,

    highlights: {
      type: Array,
      default () {
        return [false, false]
      }
    },

    dialogVisible: Boolean,
    level: String,
    handler: String,
    loading: Boolean
  },
  methods: {
    create () {
      this.$emit('create')
    },
    del (props) {
      this.$emit('del', props)
    },
    config (props) {
      this.$emit('config', props)
    },
    selectedChange (item) {
      this.$emit('selected-change', item)
    },
    // 第二菜单事件
    selectedChange_ (item) {
      this.$emit('selected-change_', item)
    }
  },
  mounted () {

  }
}
</script>
<style lang="scss" scoped>
.main-menu {
  margin-right: 15px;
}

.zjy-btn-config {
  margin-right: 15px;
  .zjy-icon {
    background: url("./zjy-icon-setting.png") no-repeat 0 2px;
  }
}

.zjy-btn-delete {
  .zjy-icon {
    background: url("./zjy-icon-delete.png") no-repeat 0 2px;
    top: -1px;
  }
}

</style>
