/**
 * 权限管理控制器
 */
(function () {
    var app = angular.module("Mealtime.Controllers");
    /**
     * 权限列表控制器
     */
    app.controller("power", ["$scope", "adminService", "utils", function ($scope, adminService, utils) {
        var service = adminService.power;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.getPower(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            //添加权限
            create: function () {
                var data = { Id: 0, Name: '', isModified: true }
                $scope.list.push(data);
            },
            //编辑权限
            edit: function (item) {
                item.isModified = true;
                item.org = angular.copy(item);
            },
            //保存
            save: function (item) {
                if (!methods.check(item)) return;
                delete item.org;
                if (item.Id > 0) {
                    service.putPower(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改成功！", "success");
                                item.isModified = false;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的权限名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的权限不存在服务器", "warning");
                                break;
                            case 6:
                                utils.notify("失败！您没有修改权限名称的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "warning");
                                break;
                        }
                    });
                } else {
                    service.postPower(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增成功！", "success");
                                item.isModified = false;
                                item.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的权限名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的权限不存在服务器", "warning");
                                break;
                            case 6:
                                utils.notify("失败！您没有新增权限名称的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "warning");
                                break;
                        }
                    });
                }
            },
            cancel: function (item) {
                if (item.Id <= 0) {
                    utils.remove($scope.list, item);
                    return;
                }
                var v = item.org;
                delete item.org;
                angular.extend(item, v);
                item.isModified = false;
            },
            check: function (item) {
                if (!$.trim(item.Name)) {
                    utils.notify("权限名称不能为空", "warning");
                    return false;
                }
                return true;
            },
            //删除权限
            remove: function (item) {
                var modal = utils.confirm({ msg: "是否删除当前权限。", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.deletePower(item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除成功！", "success");
                                utils.remove($scope.list, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除权限的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "warning");
                                break;
                        }
                    });
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 角色列表控制器
     */
    app.controller("role", ["$scope", "$uibModal", "adminService", "utils", function ($scope, $uibModal, adminService, utils) {
        var service = adminService.role;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.getRoles(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            //编辑选中的‘角色’条目
            edit: function (item) {
                item.org = angular.copy(item);
                item.isModified = true;
            },
            //取消添加或编辑的 ‘角色’
            cancel: function (item) {
                if (item.Id == 0) {
                    utils.remove($scope.list, item);
                    return;
                }
                var org = item.org;
                delete item.org;
                angular.extend(item, org);
                item.isModified = false;
            },
            //点击文本框，角色选择权限
            change: function (item) {
                $uibModal.open({
                    templateUrl: 'role-choosePower',
                    controller: "choosePower",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            //新增角色
            append: function () {
                var has = false;
                angular.forEach($scope.list, function (v) {
                    //-if有一个角色的Id是0 设置has为 true ，作用：保证为‘角色’添加‘权限’之前，角色已经保存到数据库中，并且是已经有角色Id的
                    if (v.Id == 0) {
                        has = true;
                    }
                });
                if (has) return;
                var obj = { "Powers": [], "Id": 0, "Name": "", "isModified": true };//新增“角色”：‘权限集合’，‘角色Id’，‘角色名称’，‘编辑状态’
                $scope.list.unshift(obj);//新增的角色，添加到列表集合数组中去； 
            },
            //保存角色
            save: function (item) {
                if (!$.trim(item.Name)) {
                    utils.notify("角色名称不能为空", "warning");
                    return;
                }
                //删除备份的数据
                delete item.org;
                //新增 -- item.Id==0  ！0  ==> true
                if (!item.Id) {
                    service.postRole(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                //新增角色id赋值到新增的列表中
                                item.Id = data.Id;
                                item.isModified = false;
                                break;
                            case 6:
                                utils.notify("失败！您没有新增角色的权限！", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "success");
                                break;
                        }
                    });
                } else {
                    service.putRole(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改保存成功", "success");
                                item.isModified = false;
                                break;
                            case 6:
                                utils.notify("失败！您没有修改角色的权限！", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "success");
                                break;
                        }
                    });
                }
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: "确定要删除当前角色吗", ok: "确定" });
                modal.result.then(function () {
                    service.deleteRole(item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除角色成功", "success");
                                utils.remove($scope.list, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除角色的权限", "success");
                                break;
                            default:
                                utils.notify("操作失败", "success");
                                break;
                        }
                    });
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 角色列表界面，勾选‘系统权限’列表控制器
     */
    app.controller("choosePower", ['$scope', 'adminService', "utils", "$uibModalInstance", "params", function ($scope, adminService, utils, $uibModalInstance, params) {
        //获取权限列表服务
        var service = adminService.power;
        //获取选中的一个角色条目中，存放的权限数组，复制到org中
        var org = angular.copy(params.Powers);
        var methods = {
            //选择权限 点击确定按钮
            ok: function () {
                params.Powers = org;
                $uibModalInstance.close(true);
            },
            //选择权限 点击取消按钮
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.getPower(pages).success(function (data) {
                    //获取供选择的权限列表数据成功
                    angular.forEach(data.Data, function (l) { //l是从服务器返回的可选择的权限列表
                        angular.forEach(org, function (v) { //v是从该角色之前选中的‘权限’
                            //如果之前选中的权限和现有的列表中的权限Id相同，设置为选中状态
                            if (l.Id == v.Id) {
                                l.isChecked = true;
                            }
                        });
                    });
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            checked: function (item) {
                item.isChecked = !item.isChecked;
                if (!item.isChecked) {
                    //若果权限没有选中
                    utils.remove(org, item, function (i, v) {
                        //移除从org中；
                        return i.Id == v.Id;
                    });
                } else {
                    //选中的添加到org中
                    org.push(item);
                }
            },
            size:10
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
})()