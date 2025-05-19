import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import BombListView from '../views/BombListView.vue'
import BombMonitorView from '../views/BombMonitorView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView
  },
  {
    path: '/bombs',
    name: 'bombs',
    component: BombListView
  },
  {
    path: '/bombs/:id',
    name: 'bomb-monitor',
    component: BombMonitorView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/signup'];
  const authRequired = !publicPages.includes(to.path);
  const user = localStorage.getItem('user');

  if (authRequired && !user) {
    return next('/login');
  }

  next();
})

export default router
