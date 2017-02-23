(function () {
    var app = angular.module("Mealtime.Controllers");
    /**
     * 食材列表控制器
     */
    app.controller("material", ["$scope", "$uibModal", "materialService", "utils", "language", function ($scope, $modal, funcsService, utils, language) {
        var service = funcsService.list;
        var lang = language(true, "materialList");
        var methods = {
            lang: lang,
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.pageTotal || 10 }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                });
            },
            viewMaterial: function (item) {
                $modal.open({//打开模态模块
                    templateUrl: 'material-viewMaterial',
                    controller: "viewMaterial",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            append: function () {
                var has = false;
                angular.forEach($scope.list, function (v) {
                    if (v.Id === 0) {
                        has = true;
                    }
                });
                if (has) return;
                var obj = { "Id": 0, "Name": "", "isModified": true };
                $scope.list.unshift(obj);
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: lang.confirmDelete, ok: lang.ok, cancel: lang.cancel });
                modal.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify(lang.deleteSuccess, "success");
                                utils.remove($scope.list, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除食材的权限！", "success");
                                break;
                            default:
                                utils.notify("操作失败！", "success");
                                break;
                        }
                    });
                });
            },
            init: function () {
                $scope.Category = 8;//搜索分类显示名称初始化
            }
        };
        angular.extend($scope, methods);
        methods.search();
        methods.init();
    }]);
    /**
     * 新增、编辑食材控制器
     */
    app.controller("materialForm", ["$scope", "$uibModal", "materialService", "$routeParams", "utils", "language", "toastr", "$location", function ($scope, $modal, materialService, $routeParams, utils, language, toastr, $location) {
        var services = materialService.list;//食材数据服务模块
        var tagsService = materialService.tags;
        var lang = language(true, "materialList");//设置消息提醒
        var id = $routeParams.id;//获取编辑食材id
        var vals = utils.enums();
        var methods = {
            units: vals.Unit,//食材单位显示
            categories: vals.MaterialCategory,
            //初始化
            init: function () {
                //如果id值为空 新增页面
                if (!id) {
                    $scope.model = { Unit: 1, Category: 1, Id: 0, isAdd: true, ImgAccessKey: "" };
                    $scope.isCreate = true;
                } else {
                    //加载食材编辑页面
                    services.getModel(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                $scope.model.isAdd = false;
                                break;
                            default:
                                break;
                        }
                    });
                    $scope.isCreate = false;//初始化页面为 编辑页面
                    //加载食材相关标签信息页面
                    tagsService.get(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.loadingState = true;
                                $scope.tags = data.Data;
                                break;
                            default:
                                $scope.loadingState = true;
                                break;
                        }
                    });
                }
            },
            check: function (model) {
                var reg = /\d+/;
                if (!reg.test(model.Price)) {
                    utils.notify("价格为数字", "warning");
                    return false;
                }
                if (!reg.test(model.MaketPrice)) {
                    utils.notify("市场价格为数字", "warning");
                    return false;
                }
                return true;
            },
            save: function () { //保存食材
                var model = $scope.model;//获取食材模型
                if (!methods.check(model)) return;
                if (model.Id <= 0) {
                    services.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify(lang.saveSuccess, "success");
                                model.Id = data.Id;
                                $scope.model.isAdd = false;
                                $scope.model.ImgAccessKey = config.temHttp + "Default/Material/default-v1.0_240x240.jpg";
                                $location.path('/material/form/' + data.Id + '/current/1');
                                break;
                            case 6:
                                utils.notify("失败！您没有新增食材的权限！", "success");
                                break;
                            default:
                                utils.notify("操作失败！", "success");
                                break;
                        }
                    });
                } else {
                    services.put(model).success(function (data) {
                        switch (data.State) {//检查修改保存的返回状态码
                            case 0:
                                utils.notify(lang.saveSuccess, "success");
                                break;
                            case 6:
                                utils.notify("失败！您没有修改食材的权限！", "success");
                                break;
                            default:
                                utils.notify("操作失败！", "success");
                                break;
                        }
                    });
                }
            },
            //勾选食材标签
            change: function (tag) {
                if (tag.IsChoose) {
                    tagsService.putMatetialTag(id, tag).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notifySuccess("勾选标签:'" + tag.Name + "',成功！", "系统提示", $scope, toastr);
                                return;
                            case 6:
                                utils.notify("失败！您没有修改食材关联标签的权限！", "success");
                                break;
                            default:
                                utils.notifyError("更新标签信息失败", "错误！", $scope, toastr);
                                return;
                        }
                    });
                } else {
                    tagsService.putMatetialTag(id, tag).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notifyWarning("取消标签:'" + tag.Name + "',成功！", "系统提示", $scope, toastr);
                                return;
                            case 6:
                                utils.notify("失败！您没有修改食材关联标签的权限！", "success");
                                break;
                            default:
                                utils.notifyError("更新标签信息失败", "错误！", $scope, toastr);
                                return;
                        }
                    });
                }
            },
            imgFormat: function (url) {
                var ext = "_240x240.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            }
        };
        angular.extend($scope, methods);
        methods.init();//表单页面加载时候先运行初始化方法
    }]);
    /**
     * 查看食材图片控制器
     */
    app.controller("viewMaterial", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {//点击显示大的食材图
            model: params,
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods);//methods放入到$scope对象
    }]);
})();

