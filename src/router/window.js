import Vue from 'vue'
import Router from "vue-router"
import LoginWindow from '../window/LoginWindow'
import TranscationWindow from '../window/TranscationWindow'
import UnlockWindow from '../window/UnlockWindow'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/login',
            name: 'LoginWindow',
            component: LoginWindow,
        },
        {
            path: '/transcation',
            name: 'TranscationWindow',
            component: TranscationWindow,
        },
        {
            path: '/unlock',
            name: 'UnlockWindow',
            component: UnlockWindow,
        }
    ]
})