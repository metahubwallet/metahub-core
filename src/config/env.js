/**
 * 配置编译环境和线上环境之间的切换
 * 
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * imgBaseUrl: 图片所在域名地址
 * 
 */

let respayerUrl = 'https://res.metahub.cash';


// if (process.env.NODE_ENV == 'development') {
// 	respayerUrl = 'http://127.0.0.1:7001';
// }

export {
	respayerUrl,
}