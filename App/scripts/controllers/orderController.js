(function () {
    //控制器模块
    var app = angular.module("Mealtime.Controllers");
    /**
     * 订单列表控制器
     */
    app.controller("order", ["$scope", "orderService", "$uibModal", function ($scope, orderService, $uibModal) {
        var service = orderService.list;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.getOrders(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookUp: function (item) {
                $uibModal.open({
                    templateUrl: 'order-form', controller: 'orderForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return item;//传递订单的id信息
                        }
                    }
                });
            },
            size: 10
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 选项卡控制器
     */
    app.controller("orderForm", ["$scope", "orderService", "$uibModalInstance", "params", function ($scope, orderService, $uibModalInstance, params) {
        //正好对应会员列表传来的对象Id
        $scope.orderId = params.Id;
        var methods = {
            alertMe: function () {
                //切换选项卡  屏蔽  所有保存按钮  数据保存需要用户自己点击保存之后才能保存
                methods.shieldSave();
            },
            close: function () {
                $uibModalInstance.close(true);
            },
            needSave: function () {//显示订单base页面  “保存”按钮
                $scope.isChange = true;
            },
            /**
             * 屏蔽订单base页面 ，和 address页面的  “保存”按钮
             * @returns {} 
             */
            shieldSave: function () {
                $scope.isChange = false;
                $scope.isModify = false;
            },
            /**
             * 显示address页面  “保存”按钮
             * @returns {} 
             */
            showSaveAddress: function () {
                $scope.isModify = true;
            },
            /**
             * 
             */
            save: $scope.$root.callSave,//订单base页面  点击“保存”按钮后，回调这个函数，保存数据
            saveAddress: $scope.$root.callSaveAddress//订单地址页面  点击“保存”按钮后，回调这个函数，保存地址数据
        };
        angular.extend($scope, methods);
    }]);
    /**
     * 订单基本信息控制器
     */
    app.controller("orderBase", ['$scope', "orderService", "utils", function ($scope, orderService, utils) {
        var service = orderService.list;
        var vals = utils.enums();
        var methods = {
            orderState: vals.OrderState,
            init: function () {
                $scope.loadingState = true;
                service.getModel($scope.orderId).success(function (data) {
                    if (data.State === 0) {
                        $scope.model = data.Model;
                        $scope.loadingState = false;
                    }
                });
            },
            //点击订单状态按钮
            changeState: function (state) {
                //调用显示“保存”按钮
                $scope.needSave();
                $scope.model.State = state;
            },
            check: function (price) {
                if (!$.trim(price) || price <= 0) {
                    utils.notify("价格至少大于0！", "warning");
                    return false;
                }
                var reg = /^[0-9]*$/;
                if (!reg.test(price)) {
                    utils.notify("价格不能为非数字", "warning");
                    return false;
                }
                return true;
            },
            /**
             * value为视图模型
             * @param {} value 
             * @returns {} 
             */
            save: function (value) {
                if (!methods.check($scope.model.Amount) || !methods.check($scope.model.Discount) || !methods.check($scope.model.OrderAmount)) return;
                service.put($scope.orderId, value).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("保存成功！", "success");
                            $scope.shieldSave();//成功  回调屏蔽保存按钮
                            break;
                        default:
                            utils.notify("保存失败！", "success");
                            break;
                    }
                });
            }
        }
        $scope.$root.callSave = function () {
            //点击保存按钮，将整个视图模型更新
            methods.save($scope.model);
        }
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 订单地址控制器
     */
    app.controller("orderAddress", ["$scope", "orderService", "utils", function ($scope, orderService, utils) {
        var service = orderService.list;
        var methods = {
            //页面初始化
            init: function () {
                $scope.loadingState = true;
                service.getAddress($scope.orderId).success(function (data) {
                    switch (data.State) {
                        case 0:
                            $scope.model = data.Model;
                            $scope.loadingState = false;
                            break;
                        default:
                            $scope.loadingState = false;
                            break;
                    }
                });
            },
            save: function () {
                //定单没有数据 未定义 返回数据
                if (!$scope.model.Address) return;
                if (!methods.check($scope.model.Address)) return;
                //订单地址需要从其他控制器传过来
                var post = { orderId: $scope.orderId, address: $scope.model };
                service.putAddress(post).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("地址更新成功！", "success");
                            $scope.shieldSave();//成功   屏蔽保存按钮
                            break;
                        default:
                            utils.notify("地址更新失败！", "warning");
                            break;
                    }
                });
            },
            check: function (address) {
                if (!$.trim(address)) {
                    utils.notify("详细地址不能为空！", "warning");
                    return false;
                }
                return true;
            },
            call: function (id) {
                $scope.model.Category = { Id: id }
            }
        };
        $scope.$root.callSaveAddress = function () {
            //调用地址保存
            methods.save();
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 订单商品控制器
     */
    app.controller("orderGoods", ["$scope", "orderService", "$uibModal", function ($scope, orderService, $modal) {
        var service = orderService.list;
        var methods = {
            init: function () {
                $scope.loadingState = true;
                service.getGoods($scope.orderId).success(function (data) {
                    switch (data.State) {
                        case 0:
                            $scope.list = data.Data;
                            $scope.loadingState = false;
                            break;
                        default:
                            $scope.loadingState = false;
                            break;
                    }
                });
            },
            lookupMaterials: function (item) {
                $modal.open({//打开关联食材模态模块
                    templateUrl: 'lookupCook-form',
                    controller: "lookUpCookForm",
                    size: "lg",
                    resolve: {
                        params: function () {
                            return { Id: item.CookId };
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 订单事件控制器
     */
    app.controller("orderEvents", ['$scope', "orderService", function ($scope, orderService) {
        var service = orderService.list;
        var methods = {
            init: function () {
                $scope.showButton = false;
                $scope.loadingState = true;
                service.getEvents($scope.orderId).success(function (data) {
                    if (data.State === 0) {
                        $scope.list = data.Data;
                        $scope.loadingState = false;
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 订单统计控制器
     */
    app.controller("statistics", ["$scope", "orderService", function ($scope, orderService) {
        var service = orderService.statistics;
        $scope.isCollapsed = true;
        $scope.isComplex = true;
        var methods = {
            //普通搜索按钮
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.getOrder(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            //多条件查询
            superSearch: function(isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, typePay: $scope.typePay || 0, current: $scope.current, size: $scope.size, startTime: $scope.from.date, endTime: $scope.to.date };
                service.getOrderBySuper(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size:10,
            openPannel: function () {
                $scope.isCollapsed = !$scope.isCollapsed;
                $scope.isComplex = !$scope.isComplex;
            },
            open: function (ctr) {
                ctr.openStatus = !ctr.openStatus;
            },
            format: 'yyyy-MM-dd',
            from: {
                openStatus: false,
                date: new Date()
            },
            to: {
                openStatus: false
            },
            dateOptions: {
                formatYear: 'yy',
                startingDay: 1,
                date: new Date()
            }
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
})()