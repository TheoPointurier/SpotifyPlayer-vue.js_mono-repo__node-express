// src/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import { fetchToken } from '../services/authService'
import HomePage from '../views/HomePage.vue'
import MainLayout from '../layouts/MainLayout.vue'
import MyPlaylists from '../views/MyPlaylists.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', 
        component: HomePage,
        meta: { requiresAuth: true },
       },
      {
        path: 'my-playlists',
        component: MyPlaylists,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/service-unavailable',
    component: () => import('../views/ServiceUnavailable.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory('/spotify-app/'),
  routes,
})

router.beforeEach(async (to, from, next) => {
  // Routes publiques qui ne nécessitent pas de vérification
  const publicRoutes = ['/login', '/service-unavailable'];

  if (publicRoutes.includes(to.path)) {
    next(); // Passe directement pour ces routes
    return;
  }

  // Vérifie les routes nécessitant une authentification ou le backend
  if (to.meta.requiresAuth) {
    try {
      await fetchToken(); // Vérifie si le backend est disponible et l’auth valide
      next();
    } catch (error) {
      console.error('Backend indisponible ou auth échouée:', error);
      if ((error as Error).message === 'Non authentifié. Veuillez vous reconnecter.') {
        next('/login'); // Redirige vers /spotify-app/login grâce à createWebHistory
      } else {
        next('/service-unavailable');
      }
    }
  } else {
    next(); // Routes sans requiresAuth (ex. '/')
  }
});

export default router
