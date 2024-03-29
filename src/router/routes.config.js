import { BasicLayout } from '@/layouts'
export default [
  {
    path: '/',
    name: 'index',
    redirect: '/hello',
    component: BasicLayout,
    children: [
      {
        name: 'hello',
        path: '/hello',
        component: resolve =>
          import(/* webpackMode: "eager" */ '@views/hello/index').then(module =>
            resolve(module)
          )
      }
    ]
  }
]
