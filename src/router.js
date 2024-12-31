import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/UserLogin.vue';
import Register from './components/UserRegister.vue';
import ChatRoom from './components/ChatRoom.vue';
import UserProfile from './components/UserProfile.vue';

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/chat', component: ChatRoom },
    { path: '/profile', component: UserProfile},
    { path: '/', redirect: '/login' }, // Startseite auf Login umleiten
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
