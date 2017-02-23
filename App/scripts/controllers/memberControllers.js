(function () {
    //模块，控制器
    var app = angular.module("Mealtime.Controllers");
    /**
     * 会员列表控制器
     */
    app.controller("member", ['$scope', 'memberService', "$uibModal", 'language', function ($scope, memberService, $modal, language) {
        var service = memberService.list;
        var lang = language(true, "memberList");
        var methods = {
            lang: lang,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, current: $scope.current, type: $scope.type || 0, size: $scope.pageTotal || 10 }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookUp: function (item) {
                $modal.open({
                    templateUrl: 'member-form', controller: 'memberForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return item;//当前行选中会员返回，需要使用这个会员的id信息
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * params接收传入的一个会员的item对象（只要会员的Id）
     */
    app.controller("memberForm", ['$scope', 'memberService', "$uibModalInstance", "params", function ($scope, memberService, $uibModalInstance, params) {
        $scope.memberId = params.Id;//在所有的控制器中，都可以访问
        var methods = {
            close: function () {
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods);
    }]);
    /**
     * 会员基本信息控制器
     */
    app.controller("memberBase", ['$scope', "$uibModal", 'memberService', 'utils', function ($scope, $modal, memberService, utils) {
        var service = memberService.list;
        var vals = utils.enums();
        var methods = {
            educations: vals.Education,
            industries: vals.Industry,
            incomes: vals.Income,
            jobs: vals.Job,
            regTypes: vals.RegType,
            identificationTypes: vals.IdentificationType,
            memberStates: vals.MemberState,
            froms: vals.From,
            init: function () {
                service.getModel($scope.memberId).success(function (data) {//初始化加载会员基本信息
                    if (data.State === 0) {
                        $scope.model = data.Model;
                    }
                });
            },
            changeState: function (state) {//点击状态按钮
                service.putState($scope.memberId, state).success(function (data) {
                    if (data.State === 0) {
                        $scope.model.State = state;
                        switch (state) {
                            case 1:
                                utils.notify("会员状态已启用", "success");
                                break;
                            case 2:
                                utils.notify("会员状态禁用成功！", "success");
                                break;
                            default: break;
                        }
                    }
                });
            }
        }
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 会员财富信息控制器
     */
    app.controller("memberWealth", ['$scope', "$uibModal", 'memberService', function ($scope, $modal, memberService) {
        var service = memberService.list;
        var methods = {
            init: function () {
                service.getModel($scope.memberId).success(function (data) {//加载会员基本信息(这里只是要积分，和辣椒币两个字段值)
                    if (data.State === 0) {
                        $scope.model = data.Model;
                    }
                });
                service.getVoucher($scope.memberId).success(function (data) { //加载获取会员拥有的优惠券总数量
                    if (data.State === 0) {
                        $scope.voucher = data.Total;
                    }
                });
            },
            voucherDetail: function () { //查看详细的优惠券信息模态弹出
                $modal.open({
                    templateUrl: 'member-voucherDetails',
                    controller: 'voucherDetails',
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return $scope.memberId; //点击查看详细，return，会员的id变量
                        }
                    }
                });
            }
        }
        angular.extend($scope, methods);
        methods.init();

    }]);
    /**
     * 会员拥有的优惠券列表控制器
     */
    app.controller("voucherDetails", ['$scope', 'memberService', 'utils', "$uibModalInstance", "params", function ($scope, memberService, utils, $uibModalInstance, params) {
        var service = memberService.voucherlist; //会员拥有的优惠券列表服务
        $scope.size = 5;//优惠券列表每页显示条数(数据请求之前先赋值)
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                $scope.loadingState = true;
                var post = { keyword: $scope.Name, type: $scope.type, memberId: params, current: $scope.current, size: $scope.size };
                service.getVoucherList(post).success(function (data) { //params是会员id
                    if (data.State === 0) {
                        $scope.vouchers = data.Data;
                        $scope.total = data.Total;
                    }
                });
                $scope.loadingState = false;
            },
            close: function () {
                $uibModalInstance.close(true);
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 用户辣椒币变更日志控制器
     */
    app.controller("memberidealMoney", ['$scope', 'memberService', function ($scope, memberService) {
        var serviceLog = memberService.logList;
        $scope.size = 3;//辣币列表每页显示条数(数据请求之前先赋值)
        var methods = {
            //虚拟币列表每页显示条数
            search: function (isPage) { //初始化加载虚拟货币消费日志
                if (!isPage) $scope.current = 1;
                $scope.loadingState = true;
                var post = { memberId: $scope.memberId, current: $scope.current, size: $scope.size, startTime: $scope.from.date, endTime: $scope.to.date };
                serviceLog.getIdealMoneyLog(post).success(function (data) {
                    if (data.State === 0) {
                        $scope.idealMoneies = data.Data;
                        $scope.total = data.Total;
                        $scope.loadingState = false;
                    }
                });
                $scope.loadingState = false;
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
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 用户积分变更日志控制器
     */
    app.controller("memberIntegral", ['$scope', 'memberService', function ($scope, memberService) {
        var serviceLog = memberService.logList;
        $scope.size = 3;//积分列表每页显示条数(数据请求之前先赋值)
        var methods = {
            search: function (isPage) { //初始化加载积分消费日志
                if (!isPage)
                    $scope.current = 1;
                $scope.loadingState = true;
                var post = { memberId: $scope.memberId, Current: $scope.current, size: $scope.size, startTime: $scope.from.date, endTime: $scope.to.date };
                serviceLog.getIntegralLog(post).success(function (data) {
                    if (data.State === 0) {
                        $scope.integrals = data.Data;
                        $scope.total = data.Total;
                    }
                });
                $scope.loadingState = false;
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
        }
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
   
    /**
     * 特权管理列表控制器
     */
    app.controller("featuresList", ["$scope", "memberService", "$routeParams", "utils", function ($scope, memberService, $routeParams,  utils) {
        //等级id
        var id = $routeParams.id;
        $scope.privilegeId = id;
        var service = memberService.features;
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                $scope.loadingState = true;
                var post = { keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.getFeatures({ PrivilegeId: id, params: post }).success(function (data) {
                    if (data.State === 0) {
                        $scope.list = data.Data;
                        $scope.total = data.Total;
                        $scope.loadingState = false;
                    }
                });
            },
            size: 5,
            //删除特权
            remove: function (item) {
                var model = utils.confirm({ msg: "是否删除该特权？", ok: "删除", cancel: "取消" });
                model.result.then(function () {
                    service.deleteFeatures(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        } else {
                            utils.notify("删除失败！", "warning");
                        }
                    });
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 特权管理控制器
     */
    app.controller("featuresForm", ["$scope", "memberService", "$routeParams", "utils", function ($scope, memberService, $routeParams, utils) {
        //特权 id
        var id = $routeParams.id;
        //获取等级id
        var privilegeId = $routeParams.privilegeId;
        var service = memberService.features;
        var methods = {
            //初始化
            init: function () {
                //编辑
                if (id) {
                    $scope.isCreate = false;
                    service.getFeaturesModel(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                //编辑展示已经选中的图片
                                $scope.model.ImgSrc = data.Model.IcoUrl + "_105x105.png";
                                break;
                            default:
                                break;
                        }
                    });
                } else {//新增
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, PrivilegeId: privilegeId };
                }
            },
            call: function () {//图标上传回调函数
                $scope.model.ImgSrc = String.format(config.tempDirFeature, $scope.model.IcoUrl, 105, 105);//doc为图片名字
            },
            check: function (array) {//--遍历对象键值对的键
                for (var key in array) {
                    if (array.hasOwnProperty(key)) {
                        if (key === "IcoUrl") return true;
                    }
                }
                return false;
            },
            //保存
            save: function () {
                var model = $scope.model;
                //检验上传图标内容不能为空
                if (!methods.check(model)) {
                    utils.notify("提示：没有上传图标！", "warning");
                    return;
                }
                //新增
                if (model.Id <= 0) {
                    service.postFeatures($scope.model).success(function (data) {
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
                    service.putFeatures($scope.model).success(function (data) {
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
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 查看会员列表控制器（模态）
     */
    app.controller("membersList", ["$scope", "memberService", "$routeParams", "$uibModalInstance", "$uibModal", "params", function ($scope, memberService, $routeParams, $Modal, $modal, params) {
        var service = memberService.refMember;
        var methods = {
            close: function () {
                $Modal.close(true);
            },
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                $scope.loading = true;
                var post = { keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.getRefMembers({ Privileged: params, params: post }).success(function (data) {
                    switch (data.State) {
                        case 0:
                            $scope.list = data.Data;
                            $scope.total = data.Total;
                            $scope.loading = false;
                            break;
                        case 2:
                            break;
                        default:
                            break;
                    }
                }
                );
            },
            size: 5,
            //查看单个会员信息
            lookupMember: function (memberId) {
                $modal.open({//打开会员查看模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            }
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 查看特权列表控制器（模态）
     */
    app.controller("viewFeaturesList", ["$scope", "memberService", "$routeParams", "$uibModalInstance", "$uibModal", "params", function ($scope, memberService, $routeParams, $Modal, $modal, params) {
        var service = memberService.features;
        var methods = {
            close: function () {
                $Modal.close(true);
            },
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                $scope.loading = true;
                var post = { keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.getFeatures({ PrivilegeId: params, params: post }).success(function (data) {
                    switch (data.State) {
                        case 0:
                            $scope.list = data.Data;
                            $scope.total = data.Total;
                            $scope.loading = false;
                            break;
                        case 2:
                            break;
                        default:
                            break;
                    }
                });
            },
            size: 5
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
})()