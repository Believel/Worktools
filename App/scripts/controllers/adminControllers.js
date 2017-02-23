/**
 * 管理员管理控制器
 */
(function () {
    var app = angular.module("Mealtime.Controllers", []);
    app.controller("admin", ['$scope', 'adminService', "$uibModal", 'language', 'utils', function ($scope, adminService, $modal, language, utils) {
        var service = adminService.list;
        var vals = utils.enums();
        var lang = language(true, "userList");
        var methods = {
            level: vals.AdminLevel,
            lang: lang,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, current: $scope.current, size: $scope.size, type: $scope.type }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            edit: function (item) {
                item.isModified = true;
                item.org = angular.copy(item);
            },
            save: function (item) {
                if ($.trim(item.Password) && $.trim(item.Email)) {
                    service.put(item).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("修改成功！", "success");
                            item.isModified = false;
                            item.Password = "********";
                            item.Id = item.Id;
                            delete item.org;
                        }
                    });
                }
            },
            cancel: function (item) {
                var v = item.org;
                delete item.org;
                angular.extend(item, v);
                item.isModified = false;
            },
            setPassword: function (item, call) {
                var set = function () {
                    service.pwdPut(item).success(function (data) {
                        if (data.isSaved) {
                            utils.notify("重置密码成功！", "success");
                        }
                    });
                }
                var model = $modal.open({
                    templateUrl: 'authority-setPassword',
                    backdrop: "static",
                    controller: "setPassword",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
                model.result.then(call || set);
            },
            viewRoles: function (item) {
                if (item.Id <= 0) {
                    utils.confirm({ msg: "保存当前用户后，关联角色", ok: "确定" });
                    return;
                }
                $modal.open({
                    templateUrl: 'roles-viewRoles',
                    controller: "viewRoles",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            remove: function (item) {
                var model = utils.confirm({ msg: lang.deleteUser, ok: lang.ok, cancel: lang.cancel });
                model.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除用户成功！", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            },
            size: 10
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("adminForm", ['$scope', 'adminService', "$uibModal", 'utils', function ($scope, adminService, $modal, utils) {
        var service = adminService.form;
        var vals = utils.enums();
        var methods = {
            level: vals.AdminLevel,
            init: function() {
                $scope.model = {Name:'', Email:'', Password:'', PrivilegeLevel:3 }
            },
            save: function () {
                service.post($scope.model).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("创建成功！", "success");
                            break;
                        case 2:
                            utils.notify("用户邮箱重复！", "danger");
                            break;
                        default:
                            utils.notify("创建失败！", "danger");
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    app.controller("SystemLog", ["$scope", "$uibModal", "adminService", "utils",function ($scope, $modal, adminService, utils) {
        var service = adminService.log;
        var vals = utils.enums();
        var methods = {
            search: function(isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, current: $scope.current, size: $scope.pageTotal || 20, type: $scope.type }).success(function(data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
})()