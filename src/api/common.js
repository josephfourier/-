import ajax from '@/utils/ajax'

export default {
  // 查询初始流程信息（当补办信息为空时发送)
  queryInitial (id) {
    return ajax({
      url: '/manage/swmsApproval/initSwmsApproval/' + id,
      method: 'get'
    })
  },

  queryApprovalProcess (sid, did) {
    return ajax({
      url: '/manage/swmsApproval/' + sid + '/' + did,
      method: 'get'
    })
  },

  queryFacultyList () {
    return ajax.get('/manage/insurance/faculty')
  },

  querySpecialtyByFaculty (code) {
    return ajax.get('/manage/insurance/specialty/' + code)
  },

  queryClassList () {
    return ajax.get('/manage/stufile/student/class')
  },

  queryHolidayTypeList () {
    return ajax.get('/manage/common/dict/DICT_HOLIDAY_TYPE')
  }
}
