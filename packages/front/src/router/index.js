import { createRouter, createWebHistory } from 'vue-router';

// Import your components
import Home from '../components/views/HomePage.vue';
// import About from './views/About.vue';
// import NotFound from './views/NotFound.vue';

// Define your routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: About,
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;