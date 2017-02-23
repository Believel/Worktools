(function () {
    /**
     * 标签模块
     */
    var app = angular.module("Mealtime.Controllers");
    /**
     * 标签列表
     */
    app.controller("tag", ["$scope", "$uibModal", "tagService", "utils", function ($scope, $modal, tagService, utils) {
        var service = tagService.group;
        var vals = utils.enums();
        var methods = {
            tagUseType: vals.TagGroupUserType,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, type: $scope.type, current: $scope.current, size: $scope.size }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            create: function () {
                var data = { Id: 0, Name: '', isModified: true, Tags: [], IsFilter: true };
                $scope.list.push(data);
            },
            edit: function (item) {
                item.org = angular.copy(item);
                item.isModified = true;
            },
            check: function (item) {
                if (!$.trim(item.Name)) {
                    utils.notify("名称不能为空", "warning");
                    return false;
                }
                return true;
            },
            cancel: function (item) {
                if (item.Id <= 0) {
                    utils.remove($scope.list, item);
                    return;
                }
                var org = item.org;
                delete item.org;
                angular.extend(item, org);
                item.isModified = false;
            },
            save: function (item) {
                if (!methods.check(item)) return;
                if (item.Id === 0) {
                    service.post(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("创建成功！", "success");
                                item.Id = data.Id;
                                item.isModified = false;
                                return;
                            case 2:
                                utils.notify("分组在数据库中已经存在", "warning");
                                return;
                        }
                    });
                } else {
                    service.put(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功！", "success");
                                item.isModified = false;
                                return;
                            case 3:
                                utils.notify("当前枚举组不存在", "warning");
                                return;
                        }

                    });
                }
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            },
            viewTags: function (item) {
                if (item.Id <= 0) {
                    utils.confirm({ msg: "当前枚举枚举组，未保存", ok: "确定" });
                    return;
                }
                if (item.ExtensionType != 2 && item.ExtensionType != 3) {
                    item.ExtensionType = 1; //默认添加的标签组都是不是场景那种形式的
                }
                $modal.open({
                    templateUrl: 'Tag-viewTags',
                    size: 'lg',
                    controller: "viewTags",
                    resolve: {
                        params: function () {
                            return item;
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
     * 从标签列表中打开一个标签集合页面控制器 && 普通标签扩展表CRUD控制器
     */
    app.controller("viewTags", ["$scope", "$uibModal", "tagService", "utils", "$uibModalInstance", "params", "toastr", function ($scope, $modal, tagService, utils, $uibModalInstance, params, toastr) {
        var service = tagService.tag;
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var start = (($scope.current || 1) - 1) * 10;
                var end = $scope.current * 10;
                $scope.list = params.Tags.slice(start, end);
                $scope.total = params.Tags.length;
            },
            //点击搜索按钮
            find: function () {
                var listArr = params.Tags;
                var seed = $scope.SearchName;
                for (var i = 0; i < listArr.length; i++) {
                    //搜索关键词：标签标识、标签名称、排序
                    //注意：这里使用的是JS里的弱等号，如果使用强等号，导致功能不能使用 Id 和搜索进行排序搜索
                    if (listArr[i].Name == seed || listArr[i].Id == seed || listArr[i].Sort == seed) {
                        $scope.list = params.Tags.slice(i, i + 1);
                        $scope.total = params.Tags.length;
                    }
                }
            },
            size: 10,
            //新增
            create: function () {
                //如果标签组的扩展类型是 1 则按照默认格式新增
                switch (params.ExtensionType) {
                    case 1:
                        //普通新增标签
                        var data = { Id: 0, Name: '', GroupId: params.Id, isModified: true };
                        $scope.list.push(data);
                        break;
                    case 2:
                        //弹窗,进入场景标签新增页面
                        $modal.open({
                            templateUrl: 'tag-scene',
                            controller: "sceneTag",
                            resolve: {
                                paramScene: function () {
                                    return { GroupId: params.Id, list: $scope.list };
                                }
                            }
                        });
                        break;
                    case 3:
                        //弹窗,进入食材标签新增页面
                        $modal.open({
                            templateUrl: 'tag-material',
                            controller: "materialTag",
                            resolve: {
                                paramScene: function () {
                                    return { GroupId: params.Id, list: $scope.list };
                                }
                            }
                        });
                        break;
                }
            },
            //编辑 
            edit: function (item) {
                //如果标签组的扩展类型是 1 则按照默认格式编辑
                switch (params.ExtensionType) {
                    case 1:
                        item.org = angular.copy(item);
                        item.isModified = true;
                        break;
                    case 2:
                        //弹窗,进入场景标签编辑页面
                        $modal.open({
                            templateUrl: 'tag-scene',
                            controller: "sceneTag",
                            resolve: {
                                paramScene: function () {
                                    return { GroupId: params.Id, TagId: item.Id, List: $scope.list };
                                }
                            }
                        });
                        break;
                    case 3:
                        //弹窗,进入食材标签编辑页面
                        $modal.open({
                            templateUrl: 'tag-material',
                            controller: "materialTag",
                            resolve: {
                                paramScene: function () {
                                    return { GroupId: params.Id, TagId: item.Id, list: $scope.list };
                                }
                            }
                        });
                        break;
                    default:
                }
            },
            close: function () {
                $uibModalInstance.close(true);
            },
            check: function (item) {
                if (!$.trim(item.Name)) {
                    utils.notify("名称不能为空", "warning");
                    return false;
                }
                if (!/^\d+/.test(item.Sort)) {
                    utils.notify("排序须为数字！", "warning");
                    return false;
                }
                return true;
            },
            save: function (item) {
                if (!methods.check(item)) return;
                if (item.Id === 0) {
                    //新增：Number字段默认设置为0 
                    //Number为相关视频个数
                    item.Number = 0;
                    service.post(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功", "success");
                                item.Id = data.Id;
                                item.isModified = false;
                                return;
                            case 2:
                                utils.notify("当前标签名字已经在服务器中存在", "warning");
                                return;
                        }
                    });
                } else {
                    service.put(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功", "success");
                                item.isModified = false;
                                return;
                            case 3:
                                utils.notify("当前枚举组不存在", "warning");
                                return;
                        }
                    });
                }
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: "是否确认删除当前项目", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.delete(item).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            },
            cancel: function (item) {
                if (item.Id <= 0) {
                    utils.remove($scope.list, item);
                    return;
                }
                var org = item.org;
                delete item.org;
                angular.extend(item, org);
                item.isModified = false;
            },
            chkboxChange: function (tag, option, bit) {
                service.putChkBox({ TagId: tag.Id, Option: option, Bit: bit }).success(function (data) {
                    if (bit) {
                        switch (data.State) {
                            case 0:
                                if (option === 1) {
                                    utils.notifySuccess("标签:'" + tag.Name + "',已经在PC端显示！", "系统提示", $scope, toastr);
                                } else if (option === 2) {
                                    utils.notifySuccess("标签:'" + tag.Name + "',已经在APP端显示！", "系统提示", $scope, toastr);
                                }
                                break;
                            default:
                                utils.notify("修改失败！");
                                break;
                        }
                    } else {
                        switch (data.State) {
                            case 0:
                                if (option === 1) {
                                    utils.notifyWarning("标签:'" + tag.Name + "',取消在PC端显示！", "系统提示", $scope, toastr);
                                } else if (option === 2) {
                                    utils.notifyWarning("标签:'" + tag.Name + "',取消在APP端显示！", "系统提示", $scope, toastr);
                                }
                                break;
                            default:
                                utils.notify("修改失败！");
                                break;
                        }
                    }
                });
            }
        };
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 场景标签扩展表CRUD控制器
     */
    app.controller("sceneTag", ["$scope", "paramScene", "tagService", "$uibModalInstance", "utils", function ($scope, paramScene, tagService, $uibModalInstance, utils) {
        var service = tagService.scene;
        //页面加载，初始化数据
        var methods = {
            //初始化
            init: function () {
                //获取标签的id
                var sceneId = paramScene.TagId;
                //编辑
                if (sceneId) {
                    $scope.isCreate = false;
                    //获取扩展标签表单
                    service.getTagSceneModel(sceneId).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.isCreate = false;
                                $scope.model = data.Model;
                                break;
                            default:
                                $scope.isCreate = false;
                                utils.notify("数据加载失败", "warning");
                                break;
                        }
                    });
                    //新增
                } else {
                    $scope.isCreate = true;
                    //初始化标签输入框参数
                    $scope.model = { Id: 0, Name: '', GroupId: paramScene.GroupId, Sort: "", IsChoose: true, Alias: '', ImgAccessKey: '' };
                }
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            save: function () {
                var model = $scope.model;
                //检验：签名 排序规则 图片是否上传
                if (!methods.check(model)) return;
                if (model.Id <= 0) {
                    //保存: 1.标签表. 2.标签扩展表 
                    //获取用户输入的内容
                    service.postScene(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                $uibModalInstance.dismiss('cancel');
                                model.Id = data.Id;
                                //console.log(model);
                                paramScene.list.push({ Id: data.Id, Name: model.Name, Sort: model.Sort, isModified: false,Number:0 });
                                //$scope.list.push($scope.model);
                                //app.controller("viewTags").methods.search();
                                break;
                            case 2:
                                utils.notify("当前调用Key已经在服务器中存在", "warning");
                                break;
                        }
                    });
                } else {
                    service.putScene($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改保存成功！", "success");
                                $uibModalInstance.dismiss('cancel');
                                break;
                            case 3:
                                utils.notify("当前枚举组不存在", "warning");
                                break;
                        }
                    });
                }
            },
            check: function (model) {
                if (!$.trim(model.Name)) {
                    utils.notify("名称不能为空", "warning");
                    return false;
                }
                var str = /^\d+$/;
                if (!str.test(model.Sort)) {
                    utils.notify("排序须为数字", "warning");
                    return false;
                }
                return true;
            },
            imgFormat: function (url) {
                var ext = "_234x268.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 食材标签扩展表CRUD控制器
     */
    app.controller("materialTag", ["$scope", "paramScene", "tagService", "$uibModalInstance", "utils", function ($scope, paramMaterial, tagService, $uibModalInstance, utils) {
        var service = tagService.material;
        var vals = utils.enums();
        var methods = {
            materialCategory: vals.MaterialCategory,
            init: function () {
                //获取标签的id
                var materialId = paramMaterial.TagId;
                //编辑
                if (materialId) {
                    $scope.isCreate = false;
                    //获取扩展标签表单
                    service.getTagMaterialModel(materialId).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.isCreate = false;
                                $scope.model = data.Model;
                                break;
                            default:
                                $scope.isCreate = false;
                                utils.notify("数据加载失败", "warning");
                                break;
                        }
                    });
                    //新增
                } else {
                    $scope.isCreate = true;
                    //初始化标签输入框参数
                    $scope.model = { Id: 0, Name: '', GroupId: paramMaterial.GroupId, Sort: "", IsChoose: true, Alias: '', };
                }
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            save: function () {
                var model = $scope.model;
                //检验：签名 排序规则 
                if (!methods.check(model)) return;
                console.log(model);
                if (model.Id <= 0) {
                    //保存: 1.标签表. 2.标签扩展表 
                    //获取用户输入的内容
                    service.postMaterial(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                $uibModalInstance.dismiss('cancel');
                                model.Id = data.Id;
                                paramMaterial.list.push({ Id: data.Id, Name: model.Name, Sort: model.Sort, isModified: false ,Number:0 });
                                break;
                            case 2:
                                utils.notify("当前调用Key已经在服务器中存在", "warning");
                                break;
                        }
                    });
                } else {
                    service.putMaterial($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改保存成功！", "success");
                                $uibModalInstance.dismiss('cancel');
                                break;
                            case 3:
                                utils.notify("当前枚举组不存在", "warning");
                                break;
                        }
                    });
                }
            },
            check: function (model) {
                if (!$.trim(model.Name)) {
                    utils.notify("名称不能为空", "warning");
                    return false;
                }
                var str = /^\d+$/;
                if (!str.test(model.Sort)) {
                    utils.notify("排序须为数字", "warning");
                    return false;
                }
                if (!model.hasOwnProperty("Category")) {
                    utils.notify("请勾选标签所在食材的分组");
                    return false;
                }
                return true;
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
})();

