(function () {
    //控制器模块
    var app = angular.module("Mealtime.Controllers");
    /**
     * 管理员列表控制器
     */
    app.controller("users", ['$scope', 'adminService', "$uibModal", 'language', 'utils', function ($scope, adminService, $uibModal, language, utils) {
        var service = adminService.list;
        var vals = utils.enums();
        var lang = language(true, "userList");
        var methods = {
            level: vals.AdminLevel,
            adminState: vals.AdminState,
            lang: lang,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, current: $scope.current, size: $scope.size, type: $scope.type || 0 }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            viewRoles: function (item) {
                if (item.Id <= 0) {
                    utils.confirm({ msg: "保存当前用户后，关联角色", ok: "确定" });
                    return;
                }
                $uibModal.open({
                    templateUrl: 'role-viewRoles',
                    controller: "viewRoles",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            //删除管理员
            remove: function (item) {
                var model = utils.confirm({ msg: "确定废弃这个管理员吗？", ok: "确定", cancel: "取消" });
                model.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("用户已废弃！", "success");
                                break;
                                //utils.remove($scope.list, item);
                            case 6:
                                utils.notify("失败！您没有废弃管理员的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "success");
                                break;
                        }
                    });
                });
            },
            size: 10
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 编辑，新增管理员控制器
     */
    app.controller("usersForm", ['$scope', "adminService", "$routeParams", "utils", "$uibModal", function ($scope, adminService, $routeParams, utils, $uibModal) {
        var service = adminService.admin;
        var rolesService = adminService.role;
        var vals = utils.enums();
        var org;
        var methods = {
            level: vals.AdminLevel,
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            //判断是否为编辑 
            isModified: !!$routeParams.id,
            //点击“关联角色”选项卡，如果用户的角色不为空，加载用户拥有的角色
            checkRoles: function () {
                //console.log($scope.model.Roles);//用户角色为空
                if (!$scope.model.Roles) {
                    rolesService.getRoles({ userId: $scope.model.Id }).success(function (data) {
                        $scope.model.Roles = data.Data;
                    });
                }
            },
            //修改基本信息后保存
            save: function () {
                var model = $scope.model;
                if (!$.trim(model.Name) || !$.trim(model.Password) || !$.trim(model.Email)) return;
                if (model.PrivilegeLevel == 5) {
                    utils.notify("提示：没有选择管理员等级！", "warning");
                    return;
                }
                if (model.State != 1 && model.State != 2 && model.State != 3) {
                    utils.notify("提示：没有选择管理员状态！", "warning");
                    return;
                }
                //新增管理员
                if (!model.Id) {
                    service.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功", "success");
                                $scope.model.Id = data.Id;
                                org = angular.copy(model);
                                break;
                            case 6:
                                utils.notify("失败！您没有新增保存管理员的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "warning");
                                break;
                        }
                    });
                    //编辑管理员
                } else {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("编辑保存成功", "success");
                                org = angular.copy(model);
                                break;
                            case 6:
                                utils.notify("失败！您没有编辑保存管理员的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "warning");
                                break;
                        }
                    });
                }
            },
            //给用户选择角色
            addRole: function () {
                //打开模态,加载可选的角色列表
                var modal = $uibModal.open({
                    templateUrl: 'admin-chooseRoles ',
                    controller: "chooseRole",
                    size: "lg",
                    resolve: {
                        params: function () {
                            return $scope.model;
                        }
                    }
                });
                //关闭模态后，修改 用户--角色 关系 表
                modal.result.then(function () {
                    service.putRoleRefAdmin($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                methods.checkRoles();
                                break;
                            case 6:
                                utils.notify("失败！您没有新增用户关联角色的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "warning");
                                break;
                        }
                    });
                });
            },
            model: {},
            remove: function (item) {
                var modal = utils.confirm({ msg: "确定删除当前项目", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.deleteRoleRefAdmin($scope.model.Id, item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除关联角色成功", "success");
                                //从列表中移除
                                utils.remove($scope.model.Roles, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除用户关联角色的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败", "warning");
                                break;
                        }
                    });
                });
            }
        }
        // 编辑初始化
        if (methods.isModified) {
            service.getModel($routeParams.id).success(function (data) {
                org = data.Model;
                $scope.model = angular.copy(org);
            });
            $scope.Title = "编辑管理员";
        }
            //新增初始化
        else {
            $scope.Title = "新增管理员";
            $scope.model = { PrivilegeLevel: 5, State: 2 };
        }
        angular.extend($scope, methods);
    }
    ]);
    /**
     * 点击管理员表中角色详情列表控制器
     */
    app.controller("viewRoles", ['$scope', "adminService", "$uibModalInstance", "params", function ($scope, adminService, $uibModalInstance, params) {
        var service = adminService.role;
        var methods = {
            search: function () {
                //用户的Id
                service.getRoles({ UserId: params.Id, current: $scope.current, size: $scope.size }).success(function (data) {
                    $scope.roles = data.Data;
                    $scope.total = data.Total;
                });
            },
            ok: function () {
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            size: 10
        }
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 用户选择角色控制器
     */
    app.controller("chooseRole", ['$scope', "adminService", "$uibModalInstance", "params", "utils", function ($scope, adminService, $uibModalInstance, params, utils) {
        var service = adminService.role;
        var org = angular.copy(params.Roles || []);
        var methods = {
            search: function () {
                service.getRoles({ UserId: 0, current: $scope.current, size: $scope.size }).success(function (data) {
                    angular.forEach(data.Data, function (l) {
                        angular.forEach(org, function (v) {
                            if (l.Id == v.Id) {
                                l.isChecked = true;
                            }
                        });
                    });
                    $scope.roles = data.Data;
                    $scope.total = data.Total;
                });
            },
            ok: function () {
                params.Roles = org;
                console.log(params.Roles);
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            checked: function (item) {
                item.isChecked = !item.isChecked;
                //没有选中
                if (!item.isChecked) {
                    utils.remove(org, item, function (i, v) {
                        return i.Id == v.Id;
                    });
                } else {
                    org.push(item);
                }
            },
            size: 10
        }
        methods.search();
        angular.extend($scope, methods);
    }]);
})()