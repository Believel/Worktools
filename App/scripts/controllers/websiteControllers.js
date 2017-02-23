(function () {
    //控制器模块
    var app = angular.module("Mealtime.Controllers");
    app.controller("enums", ["$scope", "$uibModal", "websiteService", "utils", "language", function ($scope, $modal, websiteService, utils, language) {
        var service = websiteService.enums;
        var vals = utils.enums();
        var lang = language(true, "rolesList");
        var methods = {
            UserTypes: vals.EnumUserType,
            lang: lang,
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
                var data = { Id: 0, Name: '', CallKey: '', isModified: true, Enums: [] }
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
                if (!$.trim(item.CallKey)) {
                    utils.notify("调用Key不能为空", "warning");
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
                                utils.notify(lang.saveSuccess, "success");
                                item.Id = data.Id;
                                item.isModified = false;
                                break;
                            case 2:
                                utils.notify("当前调用Key已经在服务器中存在", "warning");
                                break;
                            case 6:
                                utils.notify("失败！您没有新增枚举组的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！");
                                break;
                        }
                    });
                } else {
                    service.put(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify(lang.saveSuccess, "success");
                                item.isModified = false;
                                return;
                            case 3:
                                utils.notify("当前枚举组不存在", "warning");
                                return;
                            case 6:
                                utils.notify("失败！您没有修改枚举组的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！");
                                break;
                        }
                    });
                }
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
                                utils.notify("失败！您没有删除枚举组的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！");
                                break;
                        }
                    });
                });
            },
            viewEnums: function (item) {
                if (item.Id <= 0) {
                    utils.confirm({ msg: "当前枚举枚举组，未保存", ok: "确定" });
                    return;
                }
                $modal.open({
                    templateUrl: 'enums-viewEnums',
                    controller: "viewEnums",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            size: 10
        }
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("viewEnums", ["$scope", "$uibModal", "websiteService", "utils", "$uibModalInstance", "params", function ($scope, $modal, websiteService, utils, $uibModalInstance, params) {
        var service = websiteService.vals;
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var start = (($scope.current || 1) - 1) * 10;
                var end = $scope.current * 10;
                $scope.list = params.Enums.slice(start, end);
                $scope.total = params.Enums.length;
            },
            create: function () {
                var data = { Id: 0, Name: '', Val: '', GroupId: params.Id, isModified: true }
                $scope.list.push(data);
            },
            close: function () {
                $uibModalInstance.close(true);
            },
            check: function (item) {
                if (!$.trim(item.Name)) {
                    utils.notify("名称不能为空", "warning");
                    return false;
                }
                if (!$.trim(item.Val)) {
                    utils.notify("值不能为空", "warning");
                    return false;
                }
                return true;
            },
            save: function (item) {
                if (!methods.check(item)) return;
                if (item.Id === 0) {
                    service.post(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功", "success");
                                item.Id = data.Id;
                                item.isModified = false;
                                return;
                            case 2:
                                utils.notify("当前调用Key已经在服务器中存在", "warning");
                                return;
                            case 6:
                                utils.notify("失败！您没有新增枚举值的权限", "warning");
                                break;
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
                            case 6:
                                utils.notify("失败！您没有修改枚举值的权限", "warning");
                                break;
                        }
                    });
                }
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: "是否确认删除当前项目", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.delete(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除成功", "success");
                                utils.remove($scope.list, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除枚举组的权限", "warning");
                                break;
                        }
                    });
                });
            },
            edit: function (item) {
                item.org = angular.copy(item);
                item.isModified = true;
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
            }
        }
        methods.search();
        angular.extend($scope, methods);
    }]);
    app.controller("keyword", ["$scope", "$uibModal", "websiteService", "utils", function ($scope, $modal, websiteService, utils) {
        var service = websiteService.keyword;
        var vals = utils.enums();
        var methods = {
            keysState: vals.HotKeywordState,
            search: function (isPage) { //搜索
                $scope.loadingState = true; //加载搜索列表
                if (!isPage) $scope.current = 1;
                service.get({ keyword: $scope.Name, type: $scope.type, current: $scope.current, size: $scope.size }).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            create: function () { //添加
                var data = { Id: 0, Name: '', Sort: '', State: 1, isModified: true }
                $scope.list.push(data);
            },
            edit: function (item) { //编辑
                item.isModified = true;
                item.org = angular.copy(item);
            },
            save: function (item) { //保存
                if (!methods.check(item)) return;
                delete item.org;
                if (item.Id > 0) {
                    service.put(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改成功！", "success");
                                item.isModified = false;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的Keyword！", "warning");
                                break;
                            case 3:
                                utils.notify("当前编辑的Keyword服务器不存在", "warning");
                                break;
                        }
                    });
                } else {
                    service.post(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增成功！", "success");
                                item.isModified = false;
                                item.Id = data.Id;
                                break;
                            case 2:
                                utils.notify("服务器已经存在相同的Keyword！", "warning");
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
                    utils.notify("关键词不能为空", "warning");
                    return false;
                }
                if (!item.Sort || !/^\d+$/.test(item.Sort)) {
                    utils.notify("排序为数字且非空！", "warning");
                    return false;
                }
                return true;
            },
            remove: function (item) { //删除
                var modal = utils.confirm({ msg: "是否删除当前关键词。", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.delete(item).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功！", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("navmenu", ["$scope", "$uibModal", "websiteService", "utils", function ($scope, $modal, websiteService, utils) {
        var service = websiteService.navmenu;
        var vals = utils.enums();
        var methods = {
            navmenuState: vals.NavmenuState,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            modal: function (item) {
                if (!item) {
                    item = { Target: 1, State: 1, Sort: 225, Url: 'http://' };
                } else {
                    item.org = angular.copy(item);
                }
                var result = $modal.open({
                    templateUrl: 'navmenu-navform',
                    controller: "navform",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                }).result;
                result.then(
                    function (item) {
                        if (item.org) {
                            delete item.org;
                        } else {
                            $scope.list.push(item);
                        }
                    },
                    function (item) {
                        if (!item.org) return;
                        var org = item.org;
                        delete item.org;
                        angular.extend(item, org);
                    });


            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("navform", ["$scope", "$uibModal", "websiteService", "utils", "$uibModalInstance", "params", function ($scope, $modal, websiteService, utils, $uibModalInstance, params) {
        var service = websiteService.navmenu;
        var vals = utils.enums();
        var methods = {
            model: params,
            targets: vals.UrlOpenMode,
            states: vals.NavUrlState,
            ok: function () {
                var model = $scope.model;
                if (!methods.check(model)) return;
                if (model.Id > 0) {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功", "success");
                                $uibModalInstance.close(params);
                                break;
                        }
                    });
                } else {
                    service.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("保存成功", "success");
                                params.Id = data.Id;
                                $uibModalInstance.close(params);
                                return;
                        }
                    });
                }
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            check: function (model) {
                if (!$.trim(model.Name)) {
                    utils.notify("导航名称不能为空", "warning");
                    return false;
                }
                if (!$.trim(model.Url)) {
                    utils.notify("Url不能为空", "warning");
                    return false;
                }
                if (!model.Sort || !/^\d+$/.test(model.Sort)) {
                    utils.notify("请填写排序数字", "warning");
                    return false;
                }
                return true;
            }
        };
        angular.extend($scope, methods);
    }]);
    app.controller("banner", ["$scope", "$uibModal", "websiteService", "utils", "language", function ($scope, $modal, websiteService, utils, language) {
        var service = websiteService.banner;//提供数据服务
        var lang = language(true, "bannerList");//弹窗语言设置
        var vals = utils.enums();//获取枚举值
        var methods = {//创建methods对象
            lang: lang,//初始化lang对象
            Locations: vals.BannerPosition,
            States: vals.BannerState,
            ImgTypes: vals.BannerImgType,
            search: function (isPage) { //搜索事件
                $scope.loadingState = true;//加载数据时候显示gif图
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.pageTotal || 10 };//根据关键词，搜索类型。搜索本页结果;或者只是传递参数为一共total页，当前页，本页显示size条
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;//加载成功屏蔽gif图
                });
            },
            Remove: function (item) {//删除事件
                var modal = utils.confirm({ msg: lang.confirmDelete, ok: lang.ok, cancel: lang.cancel });//删除弹窗确认
                modal.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify(lang.deleteSuccess, "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            },
            viewBanner: function (item) {
                $modal.open({//打开模态模块
                    templateUrl: 'banner-viewBanner',
                    controller: "viewBanner",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            }
        };

        angular.extend($scope, methods);//把方法对象，放置到内置对象 $scope
        methods.search(); //找指定的方法
    }]);
    app.controller("bannerForm", ["$scope", "$uibModal", "websiteService", "utils", "$routeParams", "language", function ($scope, $modal, websiteService, utils, $routeParams, language) {
        var service = websiteService.banner;//提供数据请求服务
        var lang = language(true, "bannerList");
        var id = $routeParams.id;
        var vals = utils.enums();

        ////map["k"_t]
        var methods = {
            init: function () {
                //如果id值为空，初始化新增页面
                if (!id) {
                    $scope.model = { Location: 1, State: 0, Type: 1, Id: 0 };
                    $scope.isCreate = true;
                } else {
                    //初始化编辑页面
                    service.getModel(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                break;
                        }
                    });
                }
            },
            Locations: vals.BannerPosition,
            States: vals.BannerState,
            ImgTypes: vals.BannerImgType,
            //显示要关联视频的模态
            showVideoList: function () {
                $modal.open({
                    templateUrl: 'banner-videos', controller: 'videosCtrl', size: 'lg',
                    resolve: {
                        params: function () {
                            return $scope.model;//用于获取使用这个视频的id信息
                        }
                    }
                });
            },
            //显示要关联社区版块的模态
            showForumTopicList: function () {
                $modal.open({
                    templateUrl: 'banner-forumTopic', controller: 'topicCtrl', size: 'lg',
                    resolve: {
                        params: function () {
                            return $scope.model;//用于获取使用这个视频的id信息
                        }
                    }
                });
            },
            //显示要关联帖子的模态
            showForumPostList: function () {
                $modal.open({
                    templateUrl: 'banner-forumPost', controller: 'postCtrl', size: 'lg',
                    resolve: {
                        params: function () {
                            return $scope.model;//用于获取使用这个视频的id信息
                        }
                    }
                });
            },
            save: function () {
                var model = $scope.model;
                if (!$.trim(model.Title)) {//如果广告名字为空，提示
                    utils.notify(lang.notAllowEmpty, "warning");
                    return;
                }
                if (model.Id <= 0) {//model的id没有值，新增保存
                    service.post(model).success(function (data) {
                        if (data.State === 0) {//状态码为0
                            utils.notify(lang.saveSuccess, "success");
                            model.Id = data.Id;
                            $scope.model.ImgAccessKey = config.temHttp + "Default/Banner/default-v1.0_750x350.jpg";
                        } else {
                            utils.notify(lang.saveFail, "warning");
                        }
                    });
                } else {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify(lang.saveSuccess, "success");
                                break;
                            default:
                                break;
                        }
                    });
                }
            },
            imgFormat: function (url) {
                var ext = "_750x350.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    //加载供选择的视频列表
    app.controller("videosCtrl", ["$scope", "cookService", "$uibModalInstance", "params", "utils", "toastr", function ($scope, cookService, $uibModalInstance, params, utils, toastr) {
        var service = cookService.list;
        //用于存放用户勾选的视频条目信息，但是只要数组最后一个元素，因为这个是用户最后的选择
        var org = [];
        var obj;
        //获取系统枚举数
        var vals = utils.enums();
        var methods = {
            videoState: vals.VideoState,
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var post = { keyword: $scope.Name, current: $scope.current, type: $scope.Type || 0, size: $scope.pageTotal || 5 };
                $scope.loadingState = true;
                service.get(post).success(function (data) {
                    //如果已经有勾选的，就给够上
                    angular.forEach(data.Data, function (l) {
                        ///一定要使用“弱”等号
                        if (l.Id == params.ObjectId) {
                            l.isChecked = true;
                            org.push(l);//l是选中的那个项目
                        }
                    });
                    $scope.list = data.Data;
                    $scope.temArr = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            ok: function () {
                //勾选的视频的 id title 赋值给params对象
                //数组不为空
                if (org.length > 0) {
                    //获取数组最后一个元素
                    obj = org[org.length - 1];
                    //单击选中的视频项目 Id 赋值到 ObjectId 中
                    params.ObjectId = obj.Id;
                    //在文本框进行显示勾选了哪个视频
                    params.ShowVideoName = obj.Title;
                } else {
                    utils.notifyWarning("您没有选择要关联的视频信息", "警告：", $scope, toastr);
                    return;
                }
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            //单击选中视频
            checked: function (item) {
                item.isChecked = !item.isChecked;
                //如果选项没有勾选
                if (!item.isChecked) {
                    utils.remove(org, item, function (i, v) {
                        return i.Id == v.Id;
                    });
                } else {
                    org.push(item);
                }
            }
        }
        //页面打开第一次加载数据列表
        methods.search(false);
        angular.extend($scope, methods);
    }]);
    //加载供选择的社区版块列表
    app.controller("topicCtrl", ["$scope", "forumService", "$uibModalInstance", "params", "utils", "toastr", function ($scope, forumService, $uibModalInstance, params, utils, toastr) {
        var service = forumService.list;
        //用于存放用户勾选的视频条目信息，但是只要数组最后一个元素，因为这个是用户最后的选择
        var org = [];
        var obj;
        //获取系统枚举数
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var params = { keyword: $scope.Name, current: $scope.current, size: $scope.size, type: $scope.type };
                $scope.loadingState = true;//加载数据时候显示gif图
                service.getTopics(params).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            ok: function () {
                //勾选的视频的 id title 赋值给params对象
                //数组不为空
                if (org.length > 0) {
                    //获取数组最后一个元素
                    obj = org[org.length - 1];
                    //单击选中的视频项目 Id 赋值到 ObjectId 中
                    params.ObjectId = obj.Id;
                    //在文本框进行显示勾选了哪个视频
                    params.ShowForumTopic = obj.Title;
                } else {
                    utils.notifyWarning("您没有选择要关联的社区版块信息", "警告：", $scope, toastr);
                    return;
                }
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            //单击选中视频
            checked: function (item) {
                item.isChecked = !item.isChecked;
                //如果选项没有勾选
                if (!item.isChecked) {
                    utils.remove(org, item, function (i, v) {
                        return i.Id == v.Id;
                    });
                } else {
                    org.push(item);
                }
            }
        }
        $scope.size = 5;
        //页面打开第一次加载数据列表
        methods.search(false);
        angular.extend($scope, methods);
    }]);
    //加载供选择的帖子列表
    app.controller("postCtrl", ["$scope", "forumService", "$uibModalInstance", "params", "utils", "toastr", function ($scope, forumService, $uibModalInstance, params, utils, toastr) {
        var service = forumService.posts;
        //用于存放用户勾选的视频条目信息，但是只要数组最后一个元素，因为这个是用户最后的选择
        var org = [];
        var obj;
        //获取系统枚举数
        var methods = {
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var params = { keyword: $scope.Name, current: $scope.current, size: 5 };
                $scope.loadingState = true;//加载数据时候显示gif图
                service.getAllPosts(params).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;//加载成功屏蔽gif图
                });
            },
            ok: function () {
                //勾选的视频的 id title 赋值给params对象
                //数组不为空
                if (org.length > 0) {
                    //获取数组最后一个元素
                    obj = org[org.length - 1];
                    //单击选中的视频项目 Id 赋值到 ObjectId 中
                    params.ObjectId = obj.Id;
                    //在文本框进行显示勾选了哪个视频
                    params.ShowForumPost = obj.Title;
                } else {
                    utils.notifyWarning("您没有选择要关联的帖子信息", "警告：", $scope, toastr);
                    return;
                }
                $uibModalInstance.close(true);
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            //单击选中视频
            checked: function (item) {
                item.isChecked = !item.isChecked;
                //如果选项没有勾选
                if (!item.isChecked) {
                    utils.remove(org, item, function (i, v) {
                        return i.Id == v.Id;
                    });
                } else {
                    org.push(item);
                }
            }
        }
        //页面打开第一次加载数据列表
        methods.search(false);
        angular.extend($scope, methods);
    }]);
    app.controller("viewBanner", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            model: params,
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods);//methods放入到$scope对象
    }
    ]);
    app.controller("feedbackOptions", ["$scope", "$uibModal", "websiteService", "utils", function ($scope, $modal, websiteService, utils) {
        var service = websiteService.feedbackOptions;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            modal: function (item) {
                if (!item) {
                    item = {}
                } else {
                    item.org = angular.copy(item);
                }
                var result = $modal.open({
                    templateUrl: 'feedbackOptions-feedbackform',
                    controller: "feedbackOptionsform",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                }).result;
                result.then(
                    function (item) {
                        if (item.org) {
                            delete item.org;
                        } else {
                            $scope.list.push(item);
                        }
                    },
                    function (item) {
                        if (!item.org) return;
                        var org = item.org;
                        delete item.org;
                        angular.extend(item, org);
                    });
            },
            remove: function (item) {
                var modal = utils.confirm({ msg: "是否删除？", ok: "删除成功" });//删除弹窗确认
                modal.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        if (data.State === 0) {
                            utils.notify("删除成功", "success");
                            utils.remove($scope.list, item);
                        }
                    });
                });
            }
        };
        $scope.size = 10;
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("feedbackOptionsform", ["$scope", "$uibModal", "websiteService", "$uibModalInstance", "params", "utils", function ($scope, $modal, websiteService, $uibModalInstance, params, utils) {
        var service = websiteService.feedbackOptions;
        var methods = {
            model: params,
            ok: function () {
                var model = $scope.model;
                if (!methods.check(model)) return;
                if (model.Id > 0) {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("编辑保存成功", "success");
                                $uibModalInstance.close(params);
                                break;
                        }
                    });
                } else {
                    service.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功", "success");
                                params.Id = data.Id;
                                $uibModalInstance.close(params);
                                break;
                            case 2:
                                utils.notify("标题名称已存在", "warning");
                                break;
                        }
                    });
                }
            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            },
            check: function (model) {
                if (!$.trim(model.Title)) {
                    utils.notify("标题不能为空", "warning");
                    return false;
                }
                if (!$.trim(model.Description)) {
                    utils.notify("回复内容不能为空", "warning");
                    return false;
                }
                return true;
            }
        };
        angular.extend($scope, methods);
    }]);
    app.controller("feedback", ["$scope", "$uibModal", "websiteService", function ($scope, $modal, websiteService) {
        var service = websiteService.feedback;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var pages = { keyword: $scope.Name, type: $scope.type || 0, current: $scope.current, size: $scope.size };
                service.get(pages).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            viewDetail: function (item) {
                $modal.open({
                    templateUrl: 'feedback-feedbackDetail', controller: 'feedbackDetail', size: 'lg',
                    resolve: {
                        params: function () {
                            return item;//当前选中的反馈，
                        }
                    }
                });
            }
        };
        $scope.size = 10;
        angular.extend($scope, methods);
        methods.search();
    }]);
    app.controller("feedbackDetail", ['$scope', "$uibModal", 'websiteService', "utils", "$uibModalInstance", "params", function ($scope, $uibModal, websiteService, utils, $uibModalInstance, params) {
        var vals = utils.enums();
        var service = websiteService.feedback;
        $scope.model = params;
        var methods = {
            feedbackState: vals.FeedbackState,
            init: function () {
                service.getPictureList(params.Id).success(function (data) {
                    if (data.State === 0)
                        $scope.pictures = data.Data;
                });
            },
            viewPicture: function (item) {
                $uibModal.open({//打开模态模块
                    templateUrl: 'feedback-viewPicture',
                    controller: "viewPicture",
                    resolve: {
                        params: function () {
                            return item;
                        }
                    }
                });
            },
            viewMember: function (id) {
                $uibModal.open({ //查看会员详细信息模态窗口
                    templateUrl: 'member-form',
                    controller: 'memberForm',//到会员控制器中
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: id };
                        }
                    }
                });
            },
            changeState: function (Id, state) {//点击状态按钮
                service.putState(Id, state).success(function (data) {
                    if (data.State === 0) {
                        $scope.model.State = state;
                        switch (state) {
                            case 1:
                                utils.notify("用户反馈已成功处理！", "success");
                                break;
                            case 2:
                                utils.notify("反馈问题还未处理");
                                break;
                            default: break;
                        }
                    }
                });
            },
            close: function () {
                $uibModalInstance.close(true);
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    app.controller("viewPicture", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            model: params.ImgAccessKey,
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods); //methods放入到$scope对象
    }]);
})()