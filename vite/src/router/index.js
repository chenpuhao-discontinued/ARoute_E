// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from "../components/Login/Login.vue";
import Register from "../components/Register/Register.vue";
import ResetPassword from "../components/ResetPassword/ResetPassword.vue";

const routes = [

    {
        path: '/console',
        name: 'Console',
        redirect: '/console/login'
    },
    {
        path: '/console/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/console/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/console/reset',
        name: 'ResetPassword',
        component: ResetPassword
    }

]

const router = createRouter({
    history: createWebHistory('/'),
    routes
});

export default router