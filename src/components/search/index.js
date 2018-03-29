import Search from './search'

export default {
  name: 'ZjySearch',

  render (h) {
    let template = <div class="zjy-search-panel"><Search label={this.label} placeholder={this.placeholder} on-click={this.click} on-change={this.valueUpdate}></Search></div>
    return template
  },

  methods: {
    click (value) {
      this.$emit('handleClick', value)
    },

    valueUpdate (value) {
      this.$emit('handleChange', value)
    }
  },

  components: {
    Search
  },

  props: {
    label: String,
    placeholder: String
  }
}
