import ajax from '@/utils/ajax'

export default {
  queryForList (query) {
    return ajax.get('/manage/insurance-setting', {
      params: query,
      transformResponse: data => {
        const json = JSON.parse(data)
        if (json.code !== 1) return json

        const total = json.data.total
        const rows = json.data.rows
        const code = json.code
        return {
          code,
          total,
          rows
        }
      }
    })
  },

  create (setting) {
    return ajax.post('/manage/insurance-setting', setting)
  },

  update (id, setting) {
    return ajax.put('/manage/insurance-setting/' + id, setting)
  },

  queryForObject (id) {
    return ajax.get('/manage/insurance-setting/' + id)
  },

  delete (id) {
    return ajax.delete('/manage/insurance-setting/' + id)
  },

  batchRemove (ids) {

  }
}
