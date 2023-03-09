//index-nav
module.exports = [{
  index: 0,
  path: {
    path: '/'
  },
  hint: { type: "count", count: 0 }, //count,dot
  iconClass: 'icon-wallet',
  text: 'wallet'
}, {
  index: 1,
  path: {
    path: '/resource'
  },

  hint: { type: "count", count: 0 },
  iconClass: 'icon-resource',
  text: 'resources'
}, {
  index: 2,
  path: {
    path: '/application'
  },
  hint: { type: "dot", count: 0 },
  iconClass: 'icon-application',
  text: 'application'
}, {
  index: 3,
  path: {
    path: '/setting'
  },
  hint: { type: null, count: 0 },
  iconClass: 'icon-setting',
  text: 'setting'
}]
