(function () {
    //控制器模块
    var app = angular.module("Mealtime.Controllers");
    /**
     * 优惠券列表管理控制器
     */
    app.controller("voucher", ["$scope", "financeService", "utils", function ($scope, financeService, utils) {
        var service = financeService.list;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.pageTotal || 10 };
                service.getVouchers(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            remove: function (item) {
                var model = utils.confirm({ msg: "是否删除该充值方式？", ok: "删除", cancel: "取消" });
                model.result.then(function () {
                    service.deleteVoucher(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        } else {
                            utils.notify("删除失败！", "warning");
                        }
                    });
                });
            }
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 优惠券管理控制器
     */
    app.controller("voucherForm", ["$scope", "financeService", "$routeParams", "utils", function ($scope, financeService, $routeParams, utils) {
        var id = $routeParams.id;
        var vals = utils.enums();//获取系统枚举数
        var service = financeService.list;
        var methods = {
            //初始化
            init: function () {
                //编辑
                if (id) {
                    $scope.isCreate = false;
                    service.getVoucherModel(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                break;
                            default:
                                break;
                        }
                    });
                } else {
                    //新增
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, UseScope: 1 };//UseScope为model中的值
                }
            },
            useScope: vals.WatchTicket,
            save: function () {
                var model = $scope.model;
                if (!methods.check(model)) return;
                //新增
                if (model.Id <= 0) {
                    service.postVoucher($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                model.Id = data.Id;
                                break;
                            default:
                                utils.notify("保存失败", "warning");
                                break;
                        }
                    });
                } else {
                    service.putVoucher($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改保存成功！", "success");
                                break;
                            default:
                                utils.notify("保存失败", "warning");
                                break;
                        }
                    });
                }
            },
            check: function(model) {
                var reg=/\d+/;
                if (!reg.test(model.Total)) {
                    utils.notify("数量需要为数字", "warning");
                    return false;
                }
                return true;
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
    * 充值财务控制器
    */
    app.controller("recharge", ["$scope", "financeService", function ($scope, financeService) {

    }]);
})()