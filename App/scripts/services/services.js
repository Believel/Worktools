(function () {
    //创建一个 angularjs 服务模块
    var service = angular.module("Mealtime.Services");
    service.factory("linkService", [function () {
        var links = [];
        links.push({
            name: '做菜信息', urls: [
                { link: '/cook/list', title: '做菜管理' },
                { link: '/cook/form', title: "添加做菜" },
                { link: '/material/list', title: "食材管理" },
                { link: '/tag/list', title: "标签列表" }
            ]
        });
        links.push({
            name: '用户管理', urls: [
                 { link: '/member/list', title: "会员管理" }//,
                 //{ link: '/privilege/list', title: "会员等级" }
            ]
        });
        links.push({
            name: '财务管理', urls: [
                 { link: '/voucher/list', title: "点播券管理" },
                  /*{ link: '/recharge/list', title: "充值财务统计" }*/
            ]
        });

        /*
        links.push({
            name: '订单管理', urls: [
                 { link: '/order/list', title: "订单管理" },
                 { link: '/order/statistics', title: "订单统计" }
            ]
        });
        */
        links.push({
            name: '网站管理', urls: [
                 { link: '/navigation/list', title: "导航管理" },
                 { link: '/keyword/list', title: "搜索关键词" },
                 { link: '/banner/list', title: "广告管理" },
                 { link: '/feedbackOptions/list', title: "系统设置用户快速反馈" },
                 { link: '/feedback/list', title: "用户反馈" }
            ]
        });
        links.push({
            name: '控制面板', urls: [
                 { link: '/enums/list', title: "系统枚举值" }
            ]
        });
        links.push({
            name: '管理员', urls: [
                 { link: '/admin/list', title: "管理员列表" },
                 { link: '/admin/form', title: "添加管理员" }
            ]
        });
        links.push({
            name: '权限管理', urls: [
                 { link: '/role/list', title: "角色管理" },
                 { link: '/power/list', title: "权限管理" }
            ]
        });
        links.push({
            name: '站内文章', urls: [
                 { link: '/article/foodList', title: "美食专题" },
                 { link: '/article/activities', title: "活动专题" },
                 { link: '/article/list', title: "文章管理" },
                 { link: '/article/category', title: "文章分类" }
                  //{ link: '/article/cateUiTree', title: "分类管理" }
            ]
        });
        links.push({
            name: '推送消息', urls: [
                 { link: '/message/pushSet', title: "消息管理 " }
            ]
        });
        links.push({
            name: '系统日志', urls: [
                 { link: '/systemLog/list', title: "日志查看 " }
            ]
        });
        return links;
    }]);
    service.factory("http", ['$http', "$uibModal", function ($http, $modal) {
        var methods = {
            'call': function (type, url, params, data) {
                var vals = {
                    method: type, url: url,
                    headers: { 'Access-Token': config.token }, params: params, data: data
                };
                return $http(vals).success(methods.success).error(methods.errorModal);
            },
            'success': function (data) {
                return data;
            },
            'errorModal': function (data) {
                $modal.open({
                    templateUrl: 'utils-errorModal ',
                    backdrop: "static",
                    controller: "errorModal",
                    resolve: {
                        error: function () {
                            return data;
                        }
                    }
                });
            },
            'get': function (url, params) {
                return methods.call('GET', url, params);
            },
            'put': function (url, data) {
                return methods.call('PUT', url, null, data);
            },
            'post': function (url, data) {
                return methods.call('POST', url, null, data);
            },
            'delete': function (url, data) {
                return methods.call('DELETE', url, data, null);
            }
        }
        return methods;
    }]);
    service.factory("utils", [
        "$http", "$uibModal", function ($http, $modal) {
            var methods = {
                confirm: function (text) {
                    return $modal.open({
                        templateUrl: 'utils-confirmModal ',
                        backdrop: "static",
                        controller: "confirmmModal",
                        resolve: {
                            items: function () {
                                return text;
                            }
                        }
                    });
                },
                notify: function (content, type) {
                    $.notify(content, { type: type, delay: 1000, z_index: 1000000, placement: { from: 'top', align: 'right' } });
                },
                /**
                 * toastr 通知插件
                 * @param {} content 
                 * @param {} title 
                 * @param {} $scope 
                 * @param {} toastr 
                 * @returns {} 
                 */
                notifySuccess: function (content, title, $scope, toastr) {
                    toastr.success(content, title, {
                        progressBar: true,
                        timeOut: 3000,
                        closeButton: true
                    });
                },
                notifyInfo: function (content, title, $scope, toastr) {
                    toastr.info(content, title, {
                        progressBar: true,
                        timeOut: 3000,
                        closeButton: true
                    });
                },
                notifyError: function (content, title, $scope, toastr) {
                    toastr.error(content, title, {
                        progressBar: true,
                        timeOut: 3000,
                        closeButton: true
                    });
                },
                notifyWarning: function (content, title, $scope, toastr) {
                    toastr.warning(content, title, {
                        progressBar: true,
                        timeOut: 3000,
                        closeButton: true
                    });
                },
                notifyNotitle: function (content, title, $scope, toastr) {
                    toastr.success(content, {
                        progressBar: true,
                        timeOut: 3000,
                        closeButton: true
                    });
                },
                remove: function (list, item, fn) { //从list集合中，删除一项
                    angular.forEach(list, function (i, v) {
                        if (fn ? (fn(i, item)) : (i.$$hashKey === item.$$hashKey)) {
                            list.splice(v, 1);
                            return false;
                        }
                        return true;
                    });
                },
                inArray: function (val, array, fn) {
                    var has = false;
                    angular.forEach(array, function (v) {
                        if (fn && fn(val, v) || val === v) {
                            has = true;
                            return false;
                        }
                        return true;
                    });
                    return has;
                },
                enums: function () {
                    return window.enumVals;
                }
            }
            return methods;
        }
    ]);
    service.factory("adminService", ["http", function (http) {
        var methods = {
            level: [
                { key: 1, name: "高级管理员" },
                { key: 2, name: "普通管理员" },
                { key: 3, name: "网站管理员" },
                { key: 4, name: "查看管理员" }
            ],
            list: {
                "get": function (param) {
                    return http.get("/api/admin", param);
                },
                "delete": function (id) {
                    return http.delete("/api/admin/" + id);
                }
            },
            admin: {
                "get": function (param) {
                    return http.get("/api/admin", param);
                },
                "getModel": function (id) {
                    return http.get("/api/admin/" + id);
                },
                "post": function (param) {
                    return http.post("/api/admin", param);
                },
                "put": function(param) {
                    return http.put("/api/admin",param);
                },
                //删除 用户--角色 关系
                "deleteRoleRefAdmin": function (id, roleId) {
                    return http.delete("/api/admin/" + id + "/role/" + roleId);
                },
                //修改 用户--角色 关系
                "putRoleRefAdmin": function (params) {
                    return http.put("/api/admin/roles", params);
                }
            },
            /**
             * 系统权限
             */
            power: {
                "getPower": function (param) {
                    return http.get("/api/admin/power/list", param);
                },
                "postPower": function (param) {
                    return http.post("/api/admin/power", param);
                },
                "putPower": function (param) {
                    return http.put("/api/admin/power", param);
                },
                "deletePower": function (id) {
                    return http.delete("/api/admin/power/" + id);
                }
            },
            /**
             * 系统角色
             */
            role: {
                "getRoles": function (param) {
                    return http.get("/api/admin/role/list", param);
                },
                "postRole": function (param) {
                    return http.post("/api/admin/role", param);
                },
                "putRole": function (param) {
                    return http.put("/api/admin/role", param);
                },
                "deleteRole": function (id) {
                    return http.delete("/api/admin/role/" + id);
                }

            },
            log: {
                "get": function (param) {
                    return http.get("/api/systemlog/list", param);
                }
            }
        };
        return methods;
    }]);
    service.factory("websiteService", ["http", function (http) {
        var methods = {
            enums: {
                "get": function (param) {
                    return http.get("/api/enums", param);
                },
                "post": function (param) {
                    return http.post("/api/enums", param);
                },
                "put": function (param) {
                    return http.put("/api/enums", param);
                },
                "delete": function (id) {
                    return http.delete("/api/enums/" + id);
                }
            },
            vals: {
                "get": function (gid) {
                    return http.get("/api/enums/" + gid + "/vals/");
                },
                "post": function (param) {
                    return http.post("/api/enums/" + param.GroupId + "/vals/", param);
                },
                "put": function (param) {
                    return http.put("/api/enums/" + param.GroupId + "/vals/" + param.Id, param);
                },
                "delete": function (param) {
                    return http.delete("/api/enums/" + param.GroupId + "/vals/" + param.Id);
                }
            },
            keyword: {
                "get": function (param) {
                    return http.get("/api/keyword", param);
                },
                "post": function (param) {
                    return http.post("/api/keyword", param);
                },
                "put": function (param) {
                    return http.put("/api/keyword/" + param.Id, param);
                },
                "delete": function (param) {
                    return http.delete("/api/keyword/" + param.Id);
                }
            },
            navmenu: {
                "get": function (param) {
                    return http.get("/api/navmenu", param);
                },
                "post": function (param) {
                    return http.post("/api/navmenu", param);
                },
                "put": function (param) {
                    return http.put("/api/navmenu/" + param.Id, param);
                },
                "delete": function (param) {
                    return http.delete("/api/navmenu/" + param.Id);
                }
            },
            banner: {
                "get": function (params) {
                    return http.get("/api/banner/", params);
                },
                "post": function (params) {
                    return http.post("/api/banner", params);
                },
                "put": function (params) {
                    return http.put("/api/banner/" + params.Id, params);
                },
                "delete": function (id) {
                    return http.delete("/api/banner/" + id);
                },
                "getModel": function (id) {
                    return http.get("/api/banner/" + id);
                }
            },
            feedbackOptions: {//系统处理用户反馈
                "get": function (params) {
                    return http.get("/api/feedback/options/", params);
                },
                "post": function (params) {
                    return http.post("/api/feedback/options/", params);
                },
                "put": function (params) {
                    return http.put("/api/feedback/options/" + params.Id, params);
                },
                "delete": function (id) {
                    return http.delete("/api/feedback/options/" + id);
                },
                "getModel": function (id) {
                    return http.get("/api/feedback/options/" + id);
                }

            },
            feedback: {//查看用户反馈
                "get": function (params) {
                    return http.get("/api/feedback/", params);
                },
                "getPictureList": function (id) {
                    return http.get("/api/feedback/pictures/" + id);
                },
                "putState": function(id, state) {
                    return http.put("/api/feedback/" + id +"/state/" + state);
                }
            }
        };

        return methods;
    }]);
    service.factory("articleService", ["http", function (http) {
        var methods = {
            /**
             * 普通文章管理
             */
            article: {
                "get": function (param) {
                    return http.get("/api/article", param);
                },
                "post": function (param) {
                    return http.post("/api/article", param);
                },
                "put": function (param) {
                    return http.put("/api/article/" + param.Id, param);
                },
                "delete": function (id) {
                    return http.delete("/api/article/" + id);
                },
                "getModel": function (id) {
                    return http.get("/api/article/" + id);
                }
            },
            /**
             * 美食专题服务
             */
            thematic: {
                "get": function (param) {
                    return http.get("/api/article/thematic", param);
                },
                "postThematic": function (param) {
                    return http.post("/api/article/thematic/", param);
                },
                "putThematic": function (param) {
                    return http.put("/api/article/thematic/", param);
                },
                "deleteThematic": function (id) {
                    return http.delete("/api/article/thematic/" + id);
                },
                //获取专题内容
                "getThematic": function (id) {
                    return http.get("/api/article/thematic/" + id);
                }
            },
            /*
             * 文章分类服务 
             */
            category: {
                //获取所有的分类列表信息
                "getCategories": function (params) {
                    return http.get("/api/category/list/parentId/" + params.parentId, params);
                },
                //获取子类列表
                "getChildCategories": function (params) {
                    return http.get("/api/category/list/parentId/" + params.parentId + "/id/" + params.id, params);
                },
                "putCategory": function (params) {
                    return http.put("/api/category/", params);
                },
                "postCategory": function (params) {
                    return http.post("/api/category/parentId/" + params.ParentId, params);
                },
                "deleteCategory": function (param) {
                    return http.delete("/api/category/" + param.Id);
                }
            },
            /**
             * 活动专题
             */
            activities: {
                "getActivities": function (param) {
                    return http.get("/api/article/activities", param);
                },
                "getActivity": function (id) {
                    return http.get("/api/article/activity/" + id);
                },
                "postActivity": function (param) {
                    return http.post("/api/article/activity/", param);
                },
                "putActivity": function (param) {
                    return http.put("/api/article/activity/", param);
                },
                "deleteActivity": function (id) {
                    return http.delete("/api/article/activity/" + id);
                }
            }
        };
        return methods;
    }
    ]);
    service.factory("tagService", ["http", function (http) {
        var methods = {
            /**
             * 标签组
             */
            group: {
                "get": function (param) {
                    return http.get("/api/tag/group", param);
                },
                "post": function (param) {
                    return http.post("/api/tag/group", param);
                },
                "put": function (param) {
                    return http.put("/api/tag/group/" + param.Id, param);
                },
                "delete": function () {
                    return http.delete("/api/tag/group/" + param.Id, param);
                }
            },
            /**
             * 普通标签
             */
            tag: {
                "post": function (param) {
                    return http.post("/api/tag/", param);
                },
                "put": function (param) {
                    return http.put("/api/tag/" + param.Id, param);
                },
                "delete": function (param) {
                    return http.delete("/api/tag/" + param.Id);
                },
                "getTagModel": function (id) {
                    return http.get("/api/tag/" + id);
                },
                "putChkBox": function (params) {
                    return http.put("/api/tag/" + params.TagId + "/option/" + params.Option + "/bit/" + params.Bit);
                }
            },
            /**
             * 场景标签
             */
            scene: {
                "getTagSceneModel": function (id) {
                    return http.get("/api/tag/scene/" + id);
                },
                "postScene": function (params) {
                    return http.post("/api/tag/scene/", params);
                },
                "putScene": function (params) {
                    return http.put("/api/tag/scene/" + params.Id, params);
                }
            },
            /**
             * 食材标签
             */
            material: {
                "getTagMaterialModel": function (id) {
                    return http.get("/api/tag/extension/material/" + id);
                },
                "postMaterial": function (params) {
                    return http.post("/api/tag/extension/material/", params);
                },
                "putMaterial": function (params) {
                    return http.put("/api/tag/extension/material/" + params.Id, params);
                }
            }
        };
        return methods;
    }]);
    service.factory("materialService", ["http", function (http) {
        var methods = {
            list: {
                "get": function (params) {
                    return http.get("/api/material/", params);
                },
                "put": function (params) {
                    return http.put("/api/material/" + params.Id, params);
                },
                "post": function (params) {
                    return http.post("/api/material", params);
                },
                "delete": function (id) {
                    return http.delete("/api/material/" + id);
                },
                "getModel": function (id) {
                    return http.get("/api/material/" + id);
                }
            },
            tags: {
                "get": function (id) {
                    return http.get("/api/material/" + id + "/tags/");
                },
                "put": function (id, params) {
                    return http.put("/api/material/" + id + "/tags/", params);
                },
                //1.修改标签的number 2. 保存标签--食材的关系
                "putMatetialTag": function (materialId, params) {
                    return http.put("/api/tag/material/" + materialId, params);
                }
            }
        }
        return methods;
    }]);
    service.factory("cookService", ["http", function (http) {
        var methods = {
            list: {
                //美食视频列表
                "get": function (params) {
                    return http.get("/api/cook/", params);
                },
                "put": function (params) {
                    return http.put("/api/cook/" + params.Id, params);
                },
                "getModel": function (id) {
                    return http.get("/api/cook/" + id);
                },
                "post": function (params) {
                    return http.post("/api/cook/", params);
                },
                "putCookState": function (params) {
                    return http.put("/api/cook/" + params.Id + "/state/" + params.State + "/title/" + params.Title);
                }
            },
            event: {
                //烹饪事件
                "get": function (cookId) {
                    return http.get("/api/cook/" + cookId + "/event/");
                },
                "put": function (params) {
                    return http.put("/api/cook/" + params.CookId + "/event/" + params.Id, params);
                },
                "post": function (params) {
                    return http.post("/api/cook/" + params.CookId + "/event/", params);
                },
                "delete": function (params) {
                    return http.delete("/api/cook/" + params.CookId + "/event/" + params.Id);
                },
                //获取一条烹饪事件
                "getEventModel": function (params) {
                    return http.get("/api/cook/" + params.cookId + "/event/" + params.eventId);
                }
            },
            goods: {
                //烹饪商品信息
                "put": function (params) {
                    return http.put("/api/cook/" + params.CookId + "/goods/", params);
                },
                "get": function (id) {
                    return http.get("/api/cook/" + id + "/goods/");
                }
            },
            tags: {
                "get": function (id) {
                    return http.get("/api/cook/" + id + "/tags/");
                },
                "put": function (id, params) {
                    return http.put("/api/cook/" + id + "/tags/", params);
                },
                //1.修改标签的number 2. 保存标签--视频的关系
                "putNumber": function (cookId, params) {
                    return http.put("/api/tag/cook/" + cookId, params);
                }
            },
            material: {
                //烹饪食材关联表
                "put": function (params) {
                    return http.put("/api/cook/" + params.CookId + "/materials/" + params.Id, params); //烹饪食材，修改烹饪关联表（params是页面参数集合）
                }, //新增（修改）关联 cookId--食材
                "get": function (id) {
                    return http.get("/api/cook/" + id + "/materials/"); //根据cookId查询出来，该cookId相关联的食材信息
                }, //获取 关联表list集合
                "delete": function (params) {
                    return http.delete("/api/cook/" + params.CookId + "/materials/" + params.Id);
                },
                "post": function (params) {
                    return http.post("/api/cook/" + params.CookId + "/materials", params);
                }
            },
            memberCollection: {
                "get": function (params) {
                    return http.get("/api/cook/" + params.cookId + "/memberCollection", params);
                }
            },
            cookVote: {
                "get": function (params) {
                    return http.get("/api/cook/" + params.cookId + "/cookVote", params);
                }
            },
            cookVideo: {
                "get": function (id) {
                    return http.get("/api/cook/" + id + "/cookVideo");
                }
            },
            cookShare: {
                "get": function (params) {
                    return http.get("/api/cook/" + params.cookId + "/cookShare", params);
                }
            },
            topic: {
                //视频主题
                "getTopic": function (id) {
                    return http.get("/api/cook/" + id + "/topic/");
                },
                //修改主题信息
                "putTopic": function (params) {
                    return http.put("/api/cook/" + params.Id + "/topic/", params);
                }
            }
        }
        return methods;
    }]);
    service.controller("confirmmModal", ['$scope', '$uibModalInstance', 'items', function ($scope, $uibModalInstance, items) {
        var methods = {
            ok: function () {
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            text: items
        };
        $.extend($scope, methods);
    }]);
    service.controller("errorModal", ['$scope', '$uibModalInstance', 'error', function ($scope, $uibModalInstance, error) {
        var methods = {
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            report: function () {
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods, error);
    }]);
    /**
     * 会员管理服务模块
     */
    service.factory("memberService", ["http", function (http) {
        var methods = {
            list: {
                //会员列表
                "get": function (params) {
                    return http.get("/api/member/list/", params);
                },
                "put": function (params) {
                    return http.put("/api/member/" + params.Id, params);
                },
                "getModel": function (id) { //会员详细模型
                    return http.get("/api/member/" + id);
                },
                "getVoucher": function (id) { //会员优惠券拥有的总数
                    return http.get("/api/voucher/member/" + id + "/total");
                },
                "putState": function (id, state) {
                    return http.put("/api/member/" + id + "/state/" + state);
                }
            },
            voucherlist: {
                //会员拥有的优惠券列表
                "getVoucherList": function (params) {
                    return http.get("/api/voucher/member/" + params.memberId + "/list", params);
                }
            },
            logList: {
                "getIntegralLog": function (params) {
                    return http.get("/api/member/" + params.memberId + "/integralList", params); //积分列表
                },
                "getIdealMoneyLog": function (params) {
                    return http.get("/api/member/" + params.memberId + "/idealMoneyList", params); //虚拟币列表
                }
            },
            orderlist: {
                "get": function (params) {
                    //订单列表
                    return http.get("/api/member/" + params.memberId + "/orders", params);
                }
            },
            //会员等级
            privilege: {
                "getPrivilege": function (params) {
                    //会员等级列表
                    return http.get("/api/member/privilege", params);
                },
                "getPrivilegeModel": function (id) {
                    return http.get("/api/member/privilege/" + id);
                },
                "postPrivilege": function (params) {
                    return http.post("/api/member/privilege/", params);
                },
                "putPrivilege": function (params) {
                    return http.put("/api/member/privilege/" + params.Id, params);
                },
                "deletePrivilege": function (id) {
                    return http.delete("/api/member/privilege/" + id);
                },
                "getMemberRefPrivileges": function (id) {
                    return http.get("/api/member/" + id + "/privileges/list");
                }
            },
            //充值方式
            recharge: {
                "getRecharge": function (params) {
                    //等级充值方式列表
                    return http.get("/api/member/privilege/" + params.Id + "/rechargeWay/list", params.params);
                },
                "getRechargeWayModel": function (id) {
                    return http.get("/api/member/privilege/rechargeWay/" + id);//这里不必为 privilege 指定id 否则会导致充值编辑页面刷新时候报错
                },
                "putRechargeWay": function (params) {
                    return http.put("/api/member/privilege/" + params.PrivilegeId + "/rechargeWay/" + params.Id, params);
                },
                "postRechargeWay": function (params) {
                    return http.post("/api/member/privilege/" + params.PrivilegeId + "/rechargeWay", params);
                },
                "deleteRechargeWay": function (id) {
                    return http.delete("/api/member/privilege/rechargeWay/" + id);
                }
            },
            //特权功能
            features: {
                "getFeatures": function (params) {
                    //特权特性列表获取
                    return http.get("/api/member/privilege/" + params.PrivilegeId + "/features/list", params.params);
                },
                "getFeaturesModel": function (id) {
                    return http.get("/api/member/privilege/features/" + id);//这里不必为 privilege 指定id 否则会导致特权编辑页面刷新时候报错
                },
                "postFeatures": function (params) {
                    return http.post("/api/member/privilege/" + params.PrivilegeId + "/features", params);
                },
                "putFeatures": function (params) {
                    return http.put("/api/member/privilege/" + params.PrivilegeId + "/features/" + params.Id, params);
                },
                "deleteFeatures": function (id) {
                    return http.delete("/api/member/privilege/features/" + id);
                }
            },
            //相关等级会员查看
            refMember: {
                "getRefMembers": function (params) {
                    //查看会员列表
                    return http.get("/api/member/privilege/" + params.Privileged + "/members/list", params.params);
                }
            }
        };
        return methods;
    }]);
    service.factory("commentService", ["http", function (http) {//视频评论模块
        var methods = {
            cookComment: {
                "get": function (params) { //获取视频评论列表
                    return http.get("/api/comment/" + params.cookId + "/list", params);
                },
                "getModel": function (id) {
                    return http.get("/api/comment/" + id);
                },
                "put": function (params) { //修改视频评论是否删除
                    return http.put("/api/comment/" + params.Id + "/state/" + params.IsDelete);
                }
            },
            discussion: {
                "get": function (params) { //获取一个评论对应的回复列表
                    return http.get("/api/comment/" + params.commentId + "/discussions/list", params);
                },
                "getModel": function (params) {
                    return http.get("/api/comment/" + params.commentId + "/discussion/" + params.replyId);
                },
                "putReply": function (params) {
                    return http.put("/api/comment/" + params.CommentId + "/discussion/" + params.Id + "/state/" + params.IsDelete);
                }
            }
        };
        return methods;
    }]);
    service.factory("orderService", ["http", function (http) {
        var methods = {
            list: {
                "getOrders": function (params) { //获取所有的订单列表信息
                    return http.get("/api/all/orders", params);
                },
                "getModel": function (id) {
                    return http.get("/api/order/" + id);
                },
                "getAddress": function (id) {
                    return http.get("/api/order/" + id + "/address");
                },
                "getGoods": function (id) {
                    return http.get("/api/order/" + id + "/goods");
                },
                "getEvents": function (id) {
                    return http.get("/api/order/" + id + "/events");
                },
                "put": function (id, params) {
                    return http.put("/api/order/" + id, params);//订单id 参数模型
                },
                "putAddress": function (params) {
                    return http.put("/api/order/" + params.orderId + "/address", params.address);
                }
            },
            statistics: {
                "getOrder": function (params) {
                    return http.get("/api/order/", params);
                },
                "getOrderBySuper": function (params) {
                    return http.get("/api/order/super/", params);
                }
            }
        };
        return methods;
    }]);
    /**
     * 财务管理服务模块
     */
    service.factory("financeService", ["http", function (http) {
        var methods = {
            list: {
                //获取所有的优惠券列表信息
                "getVouchers": function (params) {
                    return http.get("/api/voucher/list", params);
                },
                "getVoucherModel": function (id) {
                    return http.get("/api/voucher/" + id);
                },
                "putVoucher": function (params) {
                    return http.put("/api/voucher/" + params.Id, params);
                },
                "postVoucher": function (params) {
                    return http.post("/api/voucher/", params);
                },
                "deleteVoucher": function (id) {
                    return http.delete("/api/voucher/" + id);
                }
            }
        };
        return methods;
    }]);
    /**
     * 论坛管理服务模块
     */
    service.factory("forumService", ["http", function (http) {
        var methods = {
            //论坛主题版块
            list: {
                //获取所有视频主题信息
                "getTopics": function (params) {
                    return http.get("/api/forum/topic/list", params);
                },
                "put": function (params) {
                    return http.put("/api/forum/topic/" + params.Id + "/" + params.Sort);
                },
                "delete": function (id) {
                    return http.delete("/api/forum/topic/" + id);
                }
            },
            //主题帖子
            posts: {
                "getPosts": function (params) {
                    return http.get("/api/forum/topic/" + params.id + "/posts/list", params);
                },
                "putState": function (params) {
                    return http.put("/api/forum/topic/" + params.TopicId + "/post/" + params.PostId + "/state/" + params.State);
                },
                "putChkBox": function (params) {
                    return http.put("/api/forum/topic/" + params.TopicId + "/post/" + params.PostId + "/option/" + params.Option + "/bit/" + params.Bit);
                },
                "getVotes": function (params) {
                    return http.get("/api/forum/topic/" + params.topicId + "/post/" + params.postId, params);
                },
                "getAlbum": function (params) {
                    return http.get("/api/forum/topic/" + params.TopicId + "/post/" + params.PostId + "/album/");
                },
                "getReplys": function (params) {
                    return http.get("/api/forum/topic/" + params.topicId + "/post/" + params.postId + "/replys", params);
                },
                "getReplyAlbum": function (params) {
                    return http.get("/api/forum/topic/" + params.TopicId + "/post/" + params.PostId + "/reply/" + params.ReplyId + "/album/");
                },
                "getAllPosts": function (params) {
                    return http.get("/api/forum/posts/list", params);
                }
            }
        };
        return methods;
    }]);

    service.factory("messageService", ["http", function (http) {
        var methods = {
            list: {
                //发送推送消息请求
                "push": function (params) {
                    return http.post("/api/message/send", params);
                },
                "pushMembers": function (params) {
                    return http.post("/api/message/send/members", params);
                }
            }
        };
        return methods;
    }]);


})()