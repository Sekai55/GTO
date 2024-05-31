import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import Register from '@/components/Register'
import UserBoard from '@/components/UserBoard'
import Admin from '@/components/Admin'
import TeamList from '@/components/TeamList'
import ResultList from '@/components/ResultList'
import Privacypolicy from '@/docs/Privacy-policy'
import Consenprocessing from '@/docs/Consen-processing'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { 
        guest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { 
        guest: true
      }
    },
    {
      path: '/dashboard',
      name: 'userboard',
      component: UserBoard,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/teams',
      name: 'teams',
      component: TeamList,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/results',
      name: 'results',
      component: ResultList,
      meta: { 
        requiresAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      meta: { 
        requiresAuth: true,
        is_admin : true
      }
    },
    {
      path: '/Consen-processing',
      name: 'Consen-processing',
      component: Consenprocessing
    },
    {
      path: '/Privacy-policy',
      name: 'Privacy-policy',
      component: Privacypolicy
    }
  ]
})
router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('jwt') == null) {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      let user = JSON.parse(localStorage.getItem('user'))
      if(to.matched.some(record => record.meta.is_admin)) {
        if(user.is_admin == 1){
          next()
        }
        else{
          next({ name: 'userboard'})
        }
      }else {
        next()
      }
    }
  } else if(to.matched.some(record => record.meta.guest)) {
    if(localStorage.getItem('jwt') == null){
      next()
    }
    else{
      next({ name: 'userboard'})
    }
  }else {
    next() 
  }
})
export default router