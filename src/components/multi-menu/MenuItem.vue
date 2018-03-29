<template>
  <div class="zjy-menu-panel" :style="{width: width}" v-loading="innderLoading">
    <div class="zjy-menu-panel__header">
      <span>{{ title }}</span>
      <slot name="header"></slot>
    </div>
    <div class="zjy-menu-panel__body">
      <div class="zjy-search__input" v-if="filterable" >
        <a class="zjy-btn-search">
          <i class="zjy-icon"></i>
        </a>
        <input v-model="query" :placeholder="placeholder" />
      </div>
      <table v-if="type === 'table'" class="zjy-menu-panel__table">
        <slot name="th"></slot>
        <slot name="tip"></slot>
        <slot name="tr" v-for="(item,index) in filteredData" :arg="item" :del="index === filteredData.length -1" :border="index > 3 && index === filteredData.length -1 ? false : true"></slot>
      </table>
      <ul v-else class="zjy-menu-panel__list">

        <li 
        class="zjy-menu-panel__item"
        :style="{border: elt =='radio' ? 'none' : ''}"
        v-for="(item,index) in filteredData" 
        :key="item[labelProp]" 
        @click="select(item, index)" 
        :class="{selected: highlight && selected 
          ? selected[keyProp] === item[keyProp] 
          : false}">
          <el-content :option="item" v-if="elt === ''"></el-content>
          <span v-if="elt == 'radio'">
            <el-radio v-model="radio" :label="item[labelProp]">{{ item[labelProp] }}</el-radio>
          </span>
        </li>
        
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "MenuItem",
  componentName: "MenuItem",
  data() {
    return {
      query: '',
      selected: {},
      radio: -1,
      innderLoading: false
    }
  },

  methods: {
    select(item, index) {
      this.selected = item
    }
  },

  components: {
    elContent: {
      props: {
        option: {
          type: Object
        },
        td: String
      },

      render(h) {
        const getParent = vm => {
          if (vm.$options.componentName === "MenuItem") {
            return vm
          } else if (vm.$parent) {
            return getParent(vm.$parent)
          } else {
            return vm
          }
        }
        const parent = getParent(this)
        return parent.renderContent ? (
          parent.renderContent(h, this.option, parent.type)
        ) : (
          <p>{this.option[parent.labelProp] || this.option[parent.keyProp]}</p>
        )
      }
    }
  },

  props: {
    data: {
      type: Array
    },
    title: {
      type: String,
      default: "title"
    },
    width: {
      type: String
    },
    filterable: {
      type: Boolean,
      default: false
    },
    props: Object,
    type: {
      type: String,
      default: "ul"
    },
    elt: {
      type: String,
      default: ""
    },
    renderContent: Function,
    defaultSelected: {
      type: Object,
      default() {
        return {}
      }
    },
    //是否高亮选中项
    highlight: Boolean,
    placeholder: String,
    // 耦合度较高!
    dialogVisible: Boolean,
    handler: String,
    level: String,
    loading: Boolean
  },

  computed: {
    filteredData() {
      return this.data.filter(item => {
        if (typeof this.filterMethod === "function") {
          return this.filterMehond(this.query, item)
        } else {
          const label = item[this.labelProp]
          try {
            return label.toLowerCase().indexOf(this.query.toLowerCase()) > -1
          } catch (e) {
          }
        }
      })
    },

    keyProp() {
      return this.props.key || "key"
    },

    labelProp() {
      return this.props.label || "label"
    }
  },
  watch: {
    selected(val) {
      if (val && val[this.keyProp]) this.$emit("selected-change", val)
    },

    defaultSelected: {
      immediate: true,
      handler(v, o) {
        this.selected = v
        this.radio = v[this.labelProp]
      }
    },

    // 重置所有radio
    dialogVisible(val, old) {
      this.radio = val ? this.radio : -1
    },

    level(val, old) {
        if (Object.keys(this.defaultSelected).length === 0)
          this.radio = '-1'
      
    },

    handler(val, old) {
      if (Object.keys(this.defaultSelected).length === 0)
        this.radio = '-1'
    },

    loading(val) {
      if (val) this.innderLoading = true
      else this.innderLoading = false
    }
  }
}
</script>
<style scoped lang="scss">
.zjy-menu-panel {
  font-size: 14px;

  // 头部
  .zjy-menu-panel__header {
    height: 40px;
    background-color: #f2f2f2;
    border: 1px solid #c6c6c6;
    border-bottom: 0;
    position: relative;
    span {
      color: #222222;
      line-height: 38px;
      padding-left: 20px;
    }

     .zjy-btn-add {
        position: absolute;
        right: 15px;
        top: 13px;
        font-size: 12px;
        color: #222222;

        .zjy-icon {
          width: 18px;
          height: 18px;
          top: -1px;
          background: url("./zjy-icon-add.png") no-repeat 0 0;
        }
      }
  }

  .zjy-menu-panel__body {
    border: 1px solid #c6c6c6;
    min-height: 246px;
    .zjy-search__input {
      border-bottom: 1px solid #c6c6cc;
      height: 39px;
      input {
        border: none;
        padding: 8px 0 8px 10px;
        outline: none;
      }
      .zjy-btn-search {
        position: relative;
        left: 10px;
        .zjy-icon {
          background: url("./zjy-icon-search.png") no-repeat 0 0;
        }
      }
    }
    .zjy-menu-panel__list {
      .zjy-menu-panel__item {
        height: 40px;
        line-height: 40px;
        color: #222222;
        padding-left: 20px;
        cursor: pointer;
        &:first-child {
          margin-top: -1px;
        }
        &.selected {
          background-color: #36c6d3;
          color: #ffffff;
        }
      }
    }

    .zjy-menu-panel__table {
      width: 100%;
      tr {
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #c6c6c6;
        &>th,&>td:not(.zjy-tip){text-align:center;}
        &>td:last-child{text-align: left;}
        &>th:nth-child(1) {width: 100px;}
        &>th:nth-child(2) {width: 300px;}
        &>th:nth-child(3) {width: 100px;}
      }
      .zjy-tip {
        padding: 0px 20px;
        .zjy-icon {
          width: 18px;
          height: 18px;
          background: url("./zjy-icon-warning.png") no-repeat 0 0px;
        }
      }
    }
  }

  // 主菜单
  &.main-menu {
    width: 260px;
  }
  // 二级菜单
  &.sub-meun {
    width: 600px;
  }
}
</style>