import Vue from 'vue'
import Router from "vue-router"
import WalletIndex from '../popup/wallet/Index'
import ImportKey from '../popup/wallet/ImportKey'
import ImportProtocol from '../popup/wallet/ImportProtocol'
import Transation from '../popup/wallet/Transation'
import AddToken from '../popup/wallet/AddToken'
import Settings from '../popup/setting/Settings'
import NetworkManager from '../popup/setting/NetworkManager'
import GenerateKey from '../popup/setting/GenerateKey'
import SettingNode from '../popup/setting/SettingNode'
import SelectNetwork from '../popup/setting/SelectNetwork'
import AddNetwork from '../popup/setting/AddNetwork'
import AddCustomNetwork from '../popup/setting/AddCustomNetwork'
import SettingLanguage from '../popup/setting/SettingLanguage'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/',
            meta: {
                index: 1
            }
        },
        {
            path: '/',
            name: 'wallet',
            component: WalletIndex,
            meta: {
                index: 1
            }
        },
        {
            path: '/wallet/import',
            name: 'ImportKey',
            component: ImportKey,
            meta: {
                index: 10
            }
        },
        {
            path: '/wallet/protocol',
            name: 'ImportProtocol',
            component: ImportProtocol,
            meta: {
                index: 14
            }
        },
        {
            path: '/network',
            name: 'NetworkManager',
            component: NetworkManager,
            meta: {
                index: 14
            }
        },
        {
            path: '/network/addNetwork',
            name: 'AddNetwork',
            component: AddNetwork,
            meta: {
                index: 15
            }
        },
        {
            path: '/network/addCustomNetwork',
            name: 'AddCustomNetwork',
            component: AddCustomNetwork,
            meta: {
                index: 15
            }
        },
        {
            path: '/wallet/AddToken',
            name: 'AddToken',
            component: AddToken,
            meta: {
                index: 2
            }
        },
        {
            path: '/wallet/receive',
            name: 'Receive',
            component: require('../popup/wallet/Receive').default,
            meta: {
                index: 3
            }
        },
        {
            path: '/wallet/transfer',
            name: 'Transfer',
            component: require('../popup/wallet/Transfer').default,
            meta: {
                index: 3
            }
        },
        {
            path: '/wallet/tokenTraces/:token',
            name: 'TokenTraces',
            component: require('../popup/wallet/TokenTraces').default,
            meta: {
                index: 2
            }
        },
        {
            path: '/wallet/transation',
            name: 'Transation',
            component: Transation,
            meta: {
                index: 3
            }
        },
        {
            path: '/setting',
            name: 'Settings',
            component: Settings,
            meta: {
                index: 3
            }
        },
        {
            path: '/language',
            name: 'SettingLanguage',
            component: SettingLanguage,
            meta: {
                index: 4
            }
        },
        {
            path: '/node/manager',
            name: 'SettingNode',
            component: SettingNode,
            meta: {
                index: 5
            },
            props: true
        },
        {
            path: '/blockchains',
            name: 'SelectNetwork',
            component: SelectNetwork,
            meta: {
                index: 4
            }
        },
        {
            path: '/account/generate',
            meta: { index: 8 },
            component: GenerateKey
        }
    ]
})
