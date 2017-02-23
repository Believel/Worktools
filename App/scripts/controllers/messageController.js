(function () {
    /**
     * 消息推送控制器模块
     */
    var app = angular.module("Mealtime.Controllers");
    /**
     * 消息推送控制器
     */
    app.controller("pushSet", ["$scope", "$uibModal", "messageService", "utils", "toastr", function ($scope, $uibModal, messageService, utils, toastr) {

        var service = messageService.list;
        $scope.isCollapsed = true;
        $scope.isComplex = true;
        var vals = utils.enums();
        // 查询条件对象
        var postData = {};
        var members = [];
        $scope.Members = members.toString();
        var methods = {
            type: vals.NotificationType,
            //加载可选的用户
            members: function () {
                $uibModal.open({
                    templateUrl: 'message-members',
                    controller: 'members',
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return members; //收集用户的选择的条件
                        }
                    }
                });
            },
            //初始化页面，模型绑定,初始化选择条件都为空
            init: function () {
                $scope.model = {
                    Conditions: "", Content: "",
                    BeginDate: '', EndDate: '', Cond1: '',
                    V1: '', V2: '', V3: '', V4: '', V5: '', Cond2: '',
                    General: '', Vip: '', Outdated: '', Cond3: '',
                    Android: '', iOS: '', WinPhone: '', PC: '', Cond4: ''
                };
            },
            //显示时间框
            showInpuTime: function () {
                //显示 关闭 时间框
                $scope.IsshowCalendar = !$scope.IsshowCalendar;
            },
            //显示等级框
            showLevel: function () {
                $scope.IsShowLevel = !$scope.IsShowLevel;
            },
            //显示会员身份
            showVip: function () {
                $scope.IsShowVip = !$scope.IsShowVip;
            },
            //显示用户来自平台
            showFrom: function () {
                $scope.IsShowFrom = !$scope.IsShowFrom;
            },
            //打开条件选择面板
            openPannel: function () {
                $scope.isCollapsed = !$scope.isCollapsed;
                $scope.isComplex = !$scope.isComplex;
            },
            check: function () {
                //1. 勾选了时间
                if ($scope.IsshowCalendar) {
                    //获取输入的时间
                    postData.TimeRange = {
                        Start: $scope.model.BeginDate,
                        End: $scope.model.EndDate,
                        IsOr: !!$scope.model.Cond1
                    };
                    // 如果勾选了时间，时间的起始和结束必须都填写上
                    if (!$.trim($scope.model.BeginDate) || !$.trim($scope.model.EndDate)) {
                        utils.notifyError("起始和结束时间为必填项", "提示！", $scope, toastr);
                        return false;
                    }
                } else {
                    delete postData.TimeRange;
                };

                //获取用户勾选的等级
                if ($scope.IsShowLevel) {
                    postData.Level = { Levels: [], IsOr: !!$scope.model.Cond2 }
                    for (var i = 1; i <= 5; i++) {

                        if (!!$scope.model["V" + i])
                            postData.Level.Levels.push(i);
                    }
                } else {
                    delete postData.Level;
                }

                //勾选了会员身份
                if ($scope.IsShowVip) {
                    postData.Vip = { Vips: [], IsOr: !!$scope.model.Cond3 }
                    if ($scope.model.Vip)
                        postData.Vip.Vips.push(0);
                    if ($scope.model.General)
                        postData.Vip.Vips.push(1);
                    if ($scope.model.Outdated)
                        postData.Vip.Vips.push(2);
                } else {
                    delete postData.Vip;
                }

                //勾选了来自平台
                if ($scope.IsShowFrom) {
                    postData.Platform = { Platforms: [], IsOr: !!$scope.model.Cond4 }
                    if ($scope.model.Android)
                        postData.Platform.Platforms.push(1);
                    if ($scope.model.iOS)
                        postData.Platform.Platforms.push(2);
                    if ($scope.model.WinPhone)
                        postData.Platform.Platforms.push(3);
                    if ($scope.model.PC)
                        postData.Platform.Platforms.push(4);
                } else {
                    delete postData.Platform;
                }
                return true;
            },
            checkNumber: function(number) {
                var reg = /\d+/;
                if (!reg.test(number)) {
                    utils.notify("关联对象Id须为数字", "warning");
                    return false;
                }
                return true;
            },
            pushMsg: function () {
                postData.Notification = {
                    Type: $scope.model.Type, Message: $scope.model.Message, ObjectId: $scope.model.ObjectId, Url: $scope.model.Url
                };
                if (!methods.checkNumber($scope.model.ObjectId)) return;
                //如果面板是展开的，用户可以勾选的
                if (!$scope.isCollapsed) {
                    //获取用户勾选的条件,并且用户勾选的条件都通过验证
                    if (methods.check()) {
                        if (methods.isEmptyObject(postData)) {
                            utils.notify("没有选择任何条件");
                            return;
                        }
                        service.push(postData).success(function (data) {
                            switch (data.State) {
                                case 0:
                                    utils.notify("推送成功", "success");
                                    break;
                                case 6:
                                    utils.notify("失败！您没有发送消息通知的权限", "success");
                                    break;
                                default:
                                    utils.notify("推送失败", "warning");
                                    break;
                            }
                        });
                    }
                } else {
                    console.log('用户集合推送');
                    postData.Members = members.toString();
                    service.pushMembers(postData).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("推送成功", "success");
                                break;
                            case 6:
                                utils.notify("失败！您没有发送消息通知的权限", "success");
                                break;
                            default:
                                utils.notify("推送失败", "warning");
                                break;
                        }
                    });
                }
            },
            //判断是否为空对象
            isEmptyObject: function (obj) {
                for (var name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        return false;
                    }
                }
                return true;
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
        methods.init();
        angular.extend($scope, methods);
    }]);

    /**
   * 供选择的用户控制器
   */
    app.controller("members", ["$scope", "messageService", "memberService", "utils", "$uibModal", "$uibModalInstance", "params", function ($scope, messageService, memberService, utils, $modal, $uibModal, params) {
        var memberServer = memberService.list;
        var choose = angular.copy(params);
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var post = { keyword: $scope.Name, current: $scope.current, size: $scope.size };
                $scope.loadingState = true;
                memberServer.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            lookup: function (item) {
                $modal.open({
                    templateUrl: 'member-form', controller: 'memberForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: item.Id };
                        }
                    }
                });
            },
            cancel: function () {
                $uibModal.close(true);
            },
            checked: function (item) {
                item.isChecked = !item.isChecked;
                if (item.isChecked) {
                    var data = {
                        Id: item.Id, Nickname: item.Nickname
                    };
                    choose.push(data);
                } else {
                    var fn = function (i, v) { return i.Id === v.Id }
                    utils.remove(choose, item, fn);
                }
            },
            //点击：“确定”按钮  推送选中 用户名 到 input框
            ok: function () {
                angular.forEach(choose, function (v) {
                    params.push(v.Id);
                    console.log(params);
                });
                $uibModal.close(true);
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
})()