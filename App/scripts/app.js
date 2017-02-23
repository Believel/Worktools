'use strict';
(function () {
    /**
     * jkuri.gallery 画册模块、toastr弹窗提示模块
     */
    var app = angular.module("Mealtime", ['toastr', 'ngRoute', 'ngKeditor', "ui.bootstrap", "jkuri.gallery", "Mealtime.Controllers", "Mealtime.Services", "Mealtime.Filters", "Mealtime.Directives"]);
    app.config(['$routeProvider', function ($routeProvider) {
        //路由配置
        var route = $routeProvider;
        //管理员列表路由
        route.when("/admin/list", { controller: 'users', templateUrl: '/admin-list' });
        //新增管理员路由
        route.when("/admin/form/", { controller: 'usersForm', templateUrl: '/admin-form' });
        //编辑管理员路由
        route.when("/admin/form/:id", { controller: 'usersForm', templateUrl: '/admin-form' });

        //权限列表
        route.when("/power/list", { controller: 'power', templateUrl: '/power-list' });
        //角色列表
        route.when("/role/list", { controller: 'role', templateUrl: '/role-list' });

        route.when("/member/list", { controller: 'member', templateUrl: '/member-list' });
        //进入会员等级 列表
        route.when("/privilege/list", { controller: 'privilege', templateUrl: '/privilege-list' });
        //进入会员等级 新增
        route.when("/privilege/form", { controller: 'privilegeForm', templateUrl: '/privilege-form' });
        //进入会员等级 编辑
        route.when("/privilege/form/:id", { controller: 'privilegeForm', templateUrl: '/privilege-form' });
        //进入会员等级充值 列表
        route.when("/privilege/listRechargeWay/:id", { controller: 'rechargeList', templateUrl: '/privilege-listRechargeWay' });
        //进入会员等级充值 新增
        route.when("/privilege/:privilegeId/rechargeWay", { controller: 'rechargeWayForm', templateUrl: '/privilege-rechargeWay' });
        //进入会员等级充值 编辑
        route.when("/privilege/rechargeWay/:id", { controller: 'rechargeWayForm', templateUrl: '/privilege-rechargeWay' });
        //进入会员等级特权 列表
        route.when("/privilege/listFeatures/:id", { controller: 'featuresList', templateUrl: '/privilege-listFeatures' });
        //进入会员等级特权 新增
        route.when("/privilege/:privilegeId/features", { controller: 'featuresForm', templateUrl: '/privilege-features' });
        //进入会员等级特权 编辑
        route.when("/privilege/features/:id", { controller: 'featuresForm', templateUrl: '/privilege-features' });
        route.when("/enums/list", { controller: 'enums', templateUrl: '/enums-list' });
        //订单管理
        route.when("/order/list", { controller: 'order', templateUrl: '/order-list' });
        route.when("/order/form/", { controller: 'orderForm', templateUrl: '/order-form' });
        route.when("/material/list", { controller: 'material', templateUrl: '/material-list' });
        route.when("/material/form/", { controller: 'materialForm', templateUrl: '/material-form' });
        route.when("/material/form/:id/current/:page", { controller: 'materialForm', templateUrl: '/material-form' });
        route.when("/tag/list/", { controller: 'tag', templateUrl: '/tag-list' });
        route.when("/cook/list/", { controller: 'cook', templateUrl: '/cook-list' });
        route.when("/cook/form/", { controller: 'cookForm', templateUrl: '/cook-form' });
        route.when("/cook/form/:id/current/:page", { controller: 'cookForm', templateUrl: '/cook-form' });
        route.when("/lookUpCook/lookUpCookForm/:id", { controller: 'lookUpCookForm', templateUrl: '/lookUpCook-form' });
        route.when("/keyword/list/", { controller: 'keyword', templateUrl: '/keyword-list' });
        route.when("/navigation/list", { controller: 'navmenu', templateUrl: '/navmenu-list' });
        route.when("/feedbackOptions/list", { controller: 'feedbackOptions', templateUrl: '/feedbackOptions-list' });
        route.when("/feedback/list", { controller: 'feedback', templateUrl: '/feedback-list' });
        /**
         * 普通文章路由
         */
        route.when("/article/list", { controller: 'article', templateUrl: '/article-list' });
        route.when("/article/articleForm", { controller: 'articleForm', templateUrl: '/article-articleForm' });
        route.when("/article/articleForm/:id/current/:page/cook/:Name", { controller: 'articleForm', templateUrl: '/article-articleForm' });
        /**
         * 美食专题路由
         */
        route.when("/article/foodList", { controller: 'foodList', templateUrl: '/article-foodList' });
        route.when("/article/foodForm", { controller: 'foodForm', templateUrl: '/article-foodForm' });
        route.when("/article/foodForm/:id/current/:page/cook/:Name", { controller: 'foodForm', templateUrl: '/article-foodForm' });
        /**
         * 活动专题路由
         */
        route.when("/article/activities", { controller: 'systemActivies', templateUrl: '/article-activities' });
        route.when("/article/activitiesForm", { controller: 'activitiesForm', templateUrl: '/article-activitiesForm' });
        route.when("/article/activitiesForm/:id/current/:page/cook/:Name", { controller: 'activitiesForm', templateUrl: '/article-activitiesForm' });

        route.when("/banner/list", { controller: 'banner', templateUrl: '/banner-list' });
        route.when("/banner/form", { controller: 'bannerForm', templateUrl: '/banner-form' });
        route.when("/banner/form/:id/current/:page", { controller: 'bannerForm', templateUrl: '/banner-form' });
        route.when("/banner/videos", { controller: 'videosCtrl', templateUrl: '/banner-videos' });
        route.when("/banner/articles", { controller: 'articleCtrl', templateUrl: '/banner-articles' });
        route.when("/banner/thematic", { controller: 'thematicCtrl', templateUrl: '/banner-thematic' });

        route.when("/voucher/list", { controller: 'voucher', templateUrl: '/voucher-list' });
        route.when("/voucher/form", { controller: 'voucherForm', templateUrl: '/voucher-form' });
        route.when("/voucher/form/:id/current/:page/cook/:Name", { controller: 'voucherForm', templateUrl: '/voucher-form' });
        //订单统计
        route.when("/order/statistics", { controller: 'statistics', templateUrl: '/order-statistics' });
        //充值财务统计
        route.when("/recharge/list", { controller: 'recharge', templateUrl: '/recharge-list' });
        route.when("/article/category", { controller: 'category', templateUrl: '/article-category' });
        //进入文章 新增界面（重新进入分类列表界面）
        route.when("/article/category/:parentId/id/:id", { controller: 'categoryChild', templateUrl: '/article-category' });

        /**
         * 消息推送路由
         */
        route.when("/message/pushSet", { controller: 'pushSet', templateUrl: '/message-pushSet' });
        /**
         * 系统日志路由
         */
        route.when("/systemLog/list", { controller: 'SystemLog', templateUrl: '/systemLog-list' });
        //使用uiTree，，
        //route.when("/article/cateUiTree", { controller: 'basicExampleCtrl', templateUrl: '/article-cateUiTree' });
        route.when("/", { redirectTo: '/admin/list' });
        route.otherwise({ templateUrl: '/utils-404' });
    }
    ]);
})();
