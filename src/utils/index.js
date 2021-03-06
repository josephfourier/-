// import Layout from '@/views/Layout'
import { MessageBox } from 'element-ui'

let resolve = (resource, list, routes) => {
  if (resource.type === 0) return // 系统
  if (resource.type === 1) { // 目录
    const childrenList = list.filter(item => item.pid === resource.permissionId)
    const children = childrenList.map((item) => {
      return {
        path: item.uri,
        name: item.name,
        component: () => import('@/views' + item.uri + '.vue'),
        meta: {
          icon: item.icon,
          status: item.status,
          permissionId: item.permissionId // 菜单权限id 根据菜单id取流程模板时可以用到
        }
      }
    })

    routes.push({
      path: '/',
      component: () => import('@/views/index/Layout'),
      name: resource.name,
      meta: {
        icon: resource.icon,
        status: resource.status
      },
      children: children
    })

    for (let i = 0; i < children.length; ++i) {
      resolve(children[i], list, routes)
    }
  }
}

let param2Obj = (url) => {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
}

let relogin = () => {
  MessageBox.alert('请重新登录', '登录失效', {
    confirmButtonText: '确定',
    callback: action => {
      location.href = process.env.SSO_URL
    }
  })
}

let reback = () => {
  MessageBox.alert('返回个人中心', '没有权限', {
    confirmButtonText: '确定',
    callback: action => {
      location.href = process.env.SSO_URL
    }
  })
}

let selfMerge = (resource, target) => {
  function* objectEntries (obj) {
    let propKeys = Reflect.ownKeys(obj)

    for (let propKey of propKeys) {
      yield [propKey, obj[propKey]]
    }
  }
  if (Object.keys(resource).length === 0) return

  for (let [key, value] of objectEntries(resource)) {
    if (value.constructor === Object) {
      selfMerge(resource[key], target)
    } else {
      target[key] = value
    }
  }
}

let getPermissionId = (route) => route.meta.permissionId

let dateFormat =  val => {
  if (!val) return
  const date = new Date(val)
  const m = date.getMonth() + 1
  const d = date.getDate() + 1
  return (
    date.getFullYear() +
    '-' +
    (m < 10 ? '0' + m : m) +
    '-' +
    (d < 10 ? '0' + d : d)
  )
}

function refresh ()  {
  const old = this.currentPage
  this.currentPage = -1
  setTimeout(_ => {
    this.currentPage = old
  }, +this.$t('zjy.refresh.delay'))
}

export { resolve, relogin, reback, param2Obj, selfMerge, dateFormat, getPermissionId, refresh as _refresh }
