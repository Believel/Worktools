(function () {
    //控制器模块
    var app = angular.module("Mealtime.Controllers");
    /*
     * 美食专题列表控制器
     */
    app.controller("foodList", ["$scope", "articleService", "language", "utils", "$uibModal", function ($scope, articleService, language, utils, $modal) {
        var service = articleService.thematic;
        var lang = language(true, "articleList");
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size:$scope.pageTotal || 10 };
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            remove: function (item) {
                var model = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                model.result.then(function () {
                    service.deleteThematic(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify(lang.deleteSuccess, "success");
                            utils.remove($scope.list, item);
                        } else {
                            utils.notify(lang.deleteFail, "warning");
                        }
                    });
                });
            },
            viewPicture: function (path) {
                $modal.open({
                    templateUrl: 'article-viewPicture',
                    controller: "thematic",
                    resolve: {
                        params: function () {
                            return path;
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 查看专题缩略图控制器
     */
    app.controller("thematic", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            model: params,
            close: function () {
                $uibModalInstance.close(true);
            }
        };
        angular.extend($scope, methods);
    }]);
    /**
     * 美食表单控制器
     */
    app.controller("foodForm", ["$scope", "articleService", "$routeParams", "language", "utils", function ($scope, articleService, $routeParams, language, utils) {
        var service = articleService.thematic;
        var lang = language(true, "articleList");
        var id = $routeParams.id;
        var methods = {
            init: function () {
                if (id) {//编辑初始化
                    $scope.isCreate = false;
                    service.getThematic(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.isCreate = false;
                                $scope.model = data.Model;
                                //编辑展示已经选中的图片
                                $scope.model.ImgAccessKey = data.Model.ImgAccessKey + ".jpg";
                                break;
                            default:
                                break;
                        }
                    });
                } else {//新增初始化
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, Cate: { Id: 0, TreePath: '0,2,4' }, Sort: 255, Contents: "", ImgAccessKey: "" };
                }
            },
            save: function () {
                //验证 图片  内容
                if (!methods.check($scope.model)) return;
                if ($scope.model.Id <= 0) {//新增保存
                    service.postThematic($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增专题保存成功！", "success");
                                $scope.model.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "warning");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                } else {//修改保存
                    service.putThematic($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改专题保存成功！", "success");
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "warning");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                }
            },
            check: function (model) {
                    //        http://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
                //var reg = /^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$/;
                //var reg = new RegExp();//RegExp是一个对象,和Aarray一样
                //reg = new RegExp("http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?", "i");//第二个参数,表示匹配时不分大小写 

                //if (!reg.test(model)) {
                //    utils.notify("请填写正确的Url地址！", "warning");
                //    return false;
                //}
                if (!$.trim(model.ImgAccessKey)) {
                    utils.notify("请上传专题图片！", "warning");
                    return false;
                }
                if (!$.trim(model.Contents)) {
                    utils.notify("专题内容不能为空！", "warning");
                    return false;
                }
                return true;
            },
            imgFormat: function (url) {
                var ext = "_710x300.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            }
        };
        $scope.config = {
            "uploadJson": "api/files/upload/article",
            "basePath": "/app/vendor/kindeditor/"
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 文章列表控制器
     */
    app.controller("article", ["$scope", "$uibModal", "articleService", "utils", "language", function ($scope, $modal, articleService, utils, language) {
        var service = articleService.article;
        var lang = language(true, "articleList");
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size:$scope.pageTotal || 10 };
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            remove: function (item) {
                var model = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                model.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify(lang.deleteSuccess, "success");
                            utils.remove($scope.list, item);
                        } else {
                            utils.notify(lang.deleteFail, "warning");
                        }
                    });
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 文章表单控制器
     */
    app.controller("articleForm", ["$scope", "$uibModal", "articleService", "utils", "$routeParams", "language", function ($scope, $modal, articleService, utils, $routeParams, language) {
        var service = articleService.article;
        var lang = language(true, "articleList");
        var id = $routeParams.id;
        var methods = {
            init: function () {
                if (id) {//编辑初始化
                    $scope.isCreate = false;
                    service.getModel(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                break;
                            default:
                                break;
                        }
                    });
                } else {//新增初始化
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, Cate: { Id: 0 }, Sort: 255, Contents: "" };
                }
            },
            save: function () {
                var model = $scope.model;
                if (!methods.check($scope.model)) return;
                if (model.Id <= 0) {//新增保存
                    service.post($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                model.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "warning");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                } else {//修改保存
                    service.put($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改保存成功！", "success");
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "warning");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                }
            },
            check: function (model) {
                if (!$.trim(model.Contents)) {
                    utils.notify("文章内容不能为空！", "warning");
                    return false;
                }
                return true;
            },
            call: function (id) {
                $scope.model.Category = { Id: id }
            }
        };
        angular.extend($scope, methods);
        $scope.config = {
            "uploadJson": "api/files/upload/article",
            "basePath": "/app/vendor/kindeditor/"
        }
        methods.init();
    }]);
    /**
    * 文章类别管理
    */
    app.controller("category", ["$scope", "articleService", "utils", function ($scope, articleService, utils) {
        var service = articleService.category;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                //首次加载 只显示顶级的分类列表
                var post = { keyword: $scope.Name, type: $scope.type, current: $scope.current, size: $scope.size, parentId: 0 };
                service.getCategories(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    //父级Id
                    $scope.parentId = data.ParentId;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            //初始化
            //添加
            create: function (parentId) {
                var data = { Id: 0, Name: '', isModified: true, ParentId: parentId }
                $scope.list.push(data);
            },
            //编辑
            edit: function (item) {
                item.isModified = true;
                item.org = angular.copy(item);
            },
            //保存
            save: function (item) {
                if (!methods.check(item)) return;
                delete item.org;
                //编辑
                if (item.Id) {
                    service.putCategory(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改成功！", "success");
                                item.isModified = false;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的分类名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的分类名称，服务器不存在！", "warning");
                                break;
                        }
                    });
                    //新增
                } else {
                    service.postCategory(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增成功！", "success");
                                item.isModified = false;
                                item.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的分类名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的Keyword服务器不存在", "warning");
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
                    utils.notify("类别名称不能为空", "warning");
                    return false;
                }
                return true;
            },
            remove: function (item) { //删除
                var modal = utils.confirm({ msg: "是否删除当前类别。", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.deleteCategory(item).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            }
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("categoryChild", ["$scope", "articleService", "utils", "$routeParams", function ($scope, articleService, utils, $routeParams) {
        //从路由中获取 这个分类的Id
        var id = $routeParams.id;
        //从路由中获取 这个分类的父级id
        var parentId = $routeParams.parentId;
        var service = articleService.category;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { keyword: $scope.Name, type: $scope.type, current: $scope.current, size: $scope.size, parentId: parentId, id: id };
                service.getChildCategories(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    //父级Id
                    $scope.parentId = data.ParentId;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            //初始化
            //添加
            create: function (parentId) {
                var data = { Id: 0, Name: '', isModified: true, ParentId: parentId }
                $scope.list.push(data);
            },
            //编辑
            edit: function (item) {
                item.isModified = true;
                item.org = angular.copy(item);
            },
            //保存
            save: function (item) {
                if (!methods.check(item)) return;
                delete item.org;
                //编辑
                if (item.Id) {
                    service.putCategory(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改成功！", "success");
                                item.isModified = false;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的分类名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的分类名称，服务器不存在！", "warning");
                                break;
                        }
                    });
                    //新增
                } else {
                    service.postCategory(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增成功！", "success");
                                item.isModified = false;
                                item.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的分类名称！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的Keyword服务器不存在", "warning");
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
                    utils.notify("类别名称不能为空", "warning");
                    return false;
                }
                return true;
            },
            remove: function (item) { //删除
                var modal = utils.confirm({ msg: "是否删除当前类别。", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.deleteCategory(item).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            }
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * TreeUi测试
     */
    //app.controller('basicExampleCtrl', ['$scope', function ($scope) {
    //    var methods = {
    //        remove : function (scope) {
    //            scope.remove();
    //        },
    //        toggle :function (scope) {
    //            scope.toggle();
    //        },
    //        moveLastToTheBeginning :function () {
    //            var a = $scope.data.pop();
    //            $scope.data.splice(0, 0, a);
    //        },
    //        newSubItem: function (scope) {
    //            var nodeData = scope.$modelValue;
    //            nodeData.nodes.push({
    //                id: nodeData.id * 10 + nodeData.nodes.length,
    //                title: nodeData.title + '.' + (nodeData.nodes.length + 1),
    //                nodes: []
    //            });
    //        }, collapseAll: function () {
    //            $scope.$broadcast('angular-ui-tree:collapse-all');
    //        }, expandAll: function () {
    //            $scope.$broadcast('angular-ui-tree:expand-all');
    //        }
    //    };
    //    angular.extend($scope,methods);
    //    //数据绑定
    //    $scope.data = [
    //                    {
    //                        'id': 1,
    //                        'title': '系统分类',
    //                        'nodes': []
    //                    }, {
    //                        'id': 2,
    //                        'title': '网站分类',
    //                        'nodrop': true, // An arbitrary property to check in custom template for nodrop-enabled
    //                        'nodes': [
    //                            {
    //                                'id': 21,
    //                                'title': '网站公告',
    //                                'nodes': []
    //                            },
    //                            {
    //                                'id': 22,
    //                                'title': '美食专题',
    //                                'nodes': []
    //                            },
    //                            {
    //                                'id': 23,
    //                                'title': '新手入门',
    //                                'nodes': []
    //                            },
    //                           {
    //                               'id': 23,
    //                               'title': '食材搭配',
    //                               'nodes': []
    //                           }
    //                        ]
    //                    }];
    //}]);
    /**
     * 活动专题控制器
     */
    app.controller("systemActivies", ["$scope", "articleService", "utils", "$uibModal", "language", function ($scope, articleService, utils, $modal, language) {
        var service = articleService.activities;
        var lang = language(true, "articleList");
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.pageTotal || 10 };
                service.getActivities(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            remove: function (item) {
                var model = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                model.result.then(function () {
                    service.deleteActivity(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功", "success");
                            utils.remove($scope.list, item);
                        } else {
                            utils.notify("删除失败", "warning");
                        }
                    });
                });
            },
            viewPicture: function (path) {
                $modal.open({
                    templateUrl: 'article-viewPicture',
                    controller: "activityPic",
                    resolve: {
                        params: function () {
                            return path;
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 活动表单控制器
     */
    app.controller("activitiesForm", ["$scope", "articleService", "$routeParams", "language", "utils", function ($scope, articleService, $routeParams, language, utils) {
        var service = articleService.activities;
        var lang = language(true, "articleList");
        var id = $routeParams.id;
        var methods = {
            init: function () {
                if (id) {//编辑初始化
                    $scope.isCreate = false;
                    service.getActivity(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.isCreate = false;
                                $scope.model = data.Model;
                                $scope.model.Contents = "活动专题";
                                break;
                            default:
                                break;
                        }
                    });
                } else {//新增初始化
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, Cate: { Id: 0, TreePath: '0,2,31' }, Sort: 255, Contents: "活动专题", ImgSrc: "" };
                }
            },
            save: function () {
                //验证 图片  内容
                if (!methods.check($scope.model)) return;
                if ($scope.model.Id <= 0) {//新增保存
                    service.postActivity($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增活动专题保存成功！", "success");
                                $scope.model.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "warning");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                } else {//修改保存
                    service.putActivity($scope.model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改活动专题保存成功！", "success");
                                break;
                            case 2:
                                utils.notify("调用Key已经存在！", "success");
                                break;
                            default:
                                utils.notify(lang.saveFail, "warning");
                                break;
                        }
                    });
                }
            },
            check: function(model) {
                if (!$.trim(model.ImgAccessKey)) {
                    utils.notify("请上传活动专题图片！", "warning");
                    return false;
                }
                return true;
            },
            imgFormat: function (url) {
                var ext = "_545x242.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /*
     * 查看缩略图控制器
     */
    app.controller("activityPic", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            model: params,
            close: function () {
                $uibModalInstance.close(true);
            }
        };
        angular.extend($scope, methods);
    }]);

})()