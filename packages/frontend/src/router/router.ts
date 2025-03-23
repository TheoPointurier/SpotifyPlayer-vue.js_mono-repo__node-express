// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../views/HomePage.vue';
import MainLayout from '../layouts/MainLayout.vue';
import MyPlaylists from '../views/MyPlaylists.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: HomePage }, 
      { path: 'my-playlists', component: MyPlaylists }, 
    ],
  },
];

const router = createRouter({
  history: createWebHistory(), 
  routes,
});

export default router;