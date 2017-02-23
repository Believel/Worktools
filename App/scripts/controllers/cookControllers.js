(function () {
    var app = angular.module("Mealtime.Controllers");
    /**
     * 菜单列表控制器
     */
    app.controller("cook", ["$scope", "$uibModal", "cookService", "utils", "toastr", function ($scope, $modal, cookService, utils, toastr) {
        var service = cookService.list;
        var vals = utils.enums();//获取系统枚举数
        var methods = {
            videoState: vals.VideoState,
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var params = { keyword: $scope.Name, current: $scope.current, type: $scope.Type || 0, size: $scope.pageTotal || 10 };
                $scope.loadingState = true;//加载数据时候显示gif图
                service.get(params).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;//加载成功屏蔽gif图
                });
            },
            changeState: function (item, state) {//点击视频状态按钮
                service.putCookState({ Id: item.Id, State: state, Title: item.Title }).success(function (data) {
                    switch (data.State) {
                        case 0:
                            switch (state) {
                                case 1:
                                    item.State = state;
                                    utils.notifySuccess("视频已经上架", "系统提示", $scope, toastr);
                                    break;
                                case 2:
                                    item.State = state;
                                    utils.notifyWarning("视频已经下架", "系统提示", $scope, toastr);
                                    break;
                            }
                            break;
                        case 6:
                            utils.notify("失败！您没有修改视频状态信息的权限！！", "warning");
                            break;
                        default:
                            utils.notify("修改失败！", "success");
                            break;
                    }
                });
            },
            lookUp: function (item) {
                $modal.open({
                    templateUrl: 'lookUpCook-form', controller: 'lookUpCookForm',
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return item;//当前行选中会员返回，需要使用这个视频的id信息
                        }
                    }
                });
            }
        };
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 新增编辑菜单控制器
     */
    app.controller("cookForm", ["$scope", "$uibModal", "cookService", "utils", "$routeParams", "$location", "toastr", function ($scope, $modal, cookService, utils, $routeParams, $location, toastr) {
        var id = $routeParams.id;//获取视频的Id
        var service = cookService.list;
        var eventService = cookService.event;
        var goodsService = cookService.goods;
        var tagsService = cookService.tags;
        var materialService = cookService.material;
        var topicService = cookService.topic;
        var vals = utils.enums();
        var methods = {
            //**********************************************************************************************
            //视频相关枚举初始化

            //难易程度
            difficulties: vals.Difficulties,
            goodsState: vals.GoodsState,
            //商品状态
            Units: vals.Unit,
            //做菜视频相关食材关系界面单位显示
            cookMaterial: vals.CookMaterial,
            pepperies: vals.Peppery,
            videoLevels: vals.VideoLevels,

            //（模块一）**********************************************************************************************
            //视频基本信息编辑、新增界面初始化

            init: function () {
                $scope.loadingState = false;
                //如果是做菜编辑（此时id不为空，且id是数字)id是cookid
                if (id && /^\d+$/.test(id)) {
                    //1. 加载视频基本信息模型
                    service.getModel(id).success(function (data) {
                        switch (data.State) {
                            //加载数据返回成功
                            case 0:
                                $scope.loadingState = true;
                                $scope.model = data.Model;
                                $scope.model.isAdd = false;
                                break;
                            default:
                                $scope.loadingState = true;
                                break;
                        }
                    });
                    //2. 加载商品信息
                    goodsService.get(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.loadingState = true;
                                $scope.goods = data.Model;
                                break;
                            default:
                                $scope.loadingState = true;
                                $scope.goods = { IsUnder: 0, CookId: id };
                                break;
                        }
                    });
                    //3. 加载标签信息
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
                    //4. 加载事件信息
                    eventService.get(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.loadingState = true;
                                $scope.events = data.Data;
                                break;
                            case 3:
                                $scope.loadingState = true;
                            default:
                                $scope.loadingState = true;
                                utils.notify("服务器出错", "warning");
                                break;
                        }
                    });
                    //5. 加载视频关联的食材列表信息
                    materialService.get(id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.loadingState = true;
                                //烹饪食材关联表
                                $scope.material = data.Data;
                                break;
                            default:
                                $scope.loadingState = true;
                                break;
                        }
                    });
                    //视频基本信息新增初始化
                } else {
                    //只初始化做菜基本表单的下拉框，其他选项卡都禁用
                    $scope.loadingState = true;//显示初始化界面
                    $scope.model = {
                        VideoLevel: 3, Id: 0, isAdd: true, Difficulty: 1, Peppery: 1, Contents: "", ImgAccessKey: ""
                    };
                }
            },
            //视频基本信息保存
            save: function () {
                var model = $scope.model;
                if (!methods.check(model)) return;
                if (model.Id <= 0) {
                    service.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("新增保存成功！", "success");
                                $location.path('/cook/form/' + data.Id + '/current/1');
                                return;
                            case 6:
                                utils.notify("失败！您没有新增视频信息的权限！", "warning");
                                return;
                            default:
                                utils.notify("新增失败:" + data.Message, "warning");
                                return;
                        }
                    });
                } else {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("编辑保存成功", "success");
                                model.isModified = false;
                                return;
                            case 6:
                                utils.notify("失败！您没有编辑视频信息的权限！", "warning");
                                return;
                            default:
                                utils.notify("编辑保存失败:" + data.Message, "warning");
                                return;
                        }
                    });
                }
            },
            check: function (model) {
                if (model.Difficulty == 1) {
                    utils.notify("提示：没有选择难易程度！", "warning");
                    return false;
                }
                if (!$.trim(model.Contents)) {
                    utils.notify("提示：菜单内容不能为空！", "warning");
                    return false;
                }
                return true;
            },
            //（模块二）**********************************************************************************************
            //** 视频商品信息管理

            goodsSave: function () {
                goodsService.put($scope.goods).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("更新视频商品信息成功！", "success");
                            return;
                        case 6:
                            utils.notify("失败！您没有修改视频商品信息的权限！", "warning");
                            return;
                        default:
                            utils.notify("更新视频信息失败", "warning");
                            return;
                    }
                });
            },
            //（模块三）**********************************************************************************************
            //** 标签管理
            change: function (tag) {
                if (tag.IsChoose) {
                    tagsService.putNumber($scope.model.Id, tag).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notifySuccess("勾选标签:'" + tag.Name + "',成功！", "系统提示", $scope, toastr);
                                return;
                            case 6:
                                utils.notify("失败！您没有修改视频标签信息的权限", "warning");
                                return;
                            default:
                                utils.notifyError("更新标签信息失败", "错误！", $scope, toastr);
                                return;
                        }
                    });
                } else {
                    tagsService.putNumber($scope.model.Id, tag).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notifyWarning("取消标签:'" + tag.Name + "',成功！", "系统提示", $scope, toastr);
                                return;
                            case 6:
                                utils.notify("失败！您没有修改视频标签信息的权限", "warning");
                                return;
                            default:
                                utils.notifyError("更新标签信息失败", "错误！", $scope, toastr);
                                return;
                        }
                    });
                }
            },
            //（模块四）**********************************************************************************************
            //** 事件管理
            //0. 声明事件数组
            events: [],
            //1. 事件添加
            eventAdd: function () {
                $modal.open({
                    templateUrl: 'cook-eventForm',
                    controller: "eventController",
                    resolve: {
                        paramEvent: function () {
                            return { CookId: $scope.model.Id, list: $scope.events };
                        }
                    }
                });
            },
            //2. 事件编辑
            eventEdit: function (eventId) {
                $modal.open({
                    templateUrl: 'cook-eventForm',
                    controller: "eventController",
                    resolve: {
                        paramEvent: function () {
                            return { CookId: $scope.model.Id, EventId: eventId, list: $scope.events };
                        }
                    }
                });
            },
            //3. 事件删除
            eventRemove: function (item) {
                var modal = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    eventService.delete(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除成功！", "success");
                                utils.remove($scope.events, item);
                                break;
                            case 6:
                                utils.notify("失败！，您没有删除做菜事件的权限！", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "warning");
                                break;
                        }
                    });
                });
            },
            //（模块五）**********************************************************************************************
            //** 做菜视频相关食材管理
            //1. 做菜视频相关食材点击 添加 按钮，执行
            materialAdd: function () {
                //打开模态对话框：加载可选的食材列表
                $modal.open({
                    templateUrl: 'cook-chooseMaterials',
                    controller: 'chooseMaterial',
                    //指定模态的大小
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return $scope.material;
                        }
                    }
                });
            },
            //2. 做菜视频相关食材供选择界面,点击取消按钮执行
            materialCancel: function (item) {
                if (!item.Id) {
                    utils.remove($scope.material, item);
                    return;
                }
                var org = item.org;
                delete item.org;
                angular.extend(item, org);
                item.isModified = false;
            },
            //3. 做菜视频相关食材编辑
            materialEdit: function (item) {
                item.isModified = true;
                item.org = angular.copy(item);//当前编辑的食材，存储到org对象
            },
            //4. 做菜视频相关食材删除
            materialRemove: function (item) {
                var modal = utils.confirm({ msg: "是否需要删除当前项目？删除后无法恢复", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    materialService.delete(item).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("删除成功！", "success");
                                utils.remove($scope.material, item);
                                break;
                            case 6:
                                utils.notify("失败！您没有删除与视频关联食材信息的权限", "warning");
                                break;
                            default:
                                utils.notify("操作失败！", "warning");
                                break;
                        }
                    });
                });
            },
            //5. 烹饪食材关联保存
            materialSave: function (item) {
                //做菜视频id
                item.CookId = id;
                //数量和食材总价格必须写上
                if (item.Number >= 0) {
                    //烹饪关系中的总价格 ===数量 * 单价
                    item.Price = item.Number * item.UnitPrice;
                    //烹饪关系这条记录的id是不为空 => 新增保存！！
                    if (!item.Id) {
                        materialService.post(item).success(function (data) {
                            switch (data.State) {
                                case 0:
                                    utils.notify("新增成功！", "success");
                                    item.Id = data.Id;
                                    item.isModified = false;
                                    return;
                                case 6:
                                    utils.notify("失败！，您没有添加视频关联食材基本信息的权限！", "warning");
                                    return;
                                default:
                                    utils.notify("新增失败:" + data.Message, "warning");
                                    return;
                            }
                        });
                    } else {
                        materialService.put(item).success(function (data) {
                            switch (data.State) {
                                case 0:
                                    utils.notify("修改成功！", "success");
                                    item.isModified = false;
                                    return;
                                case 6:
                                    utils.notify("失败！，您没有编辑视频关联食材基本信息的权限！", "warning");
                                    return;
                                default:
                                    utils.notify("修改失败:" + data.Message, "warning");
                                    return;
                            }
                        });
                    }
                } else {
                    utils.notify("食材数量和总价格不能为空", "warning");
                    return;//否则返回（数量和食材总价格没写）
                }
            },
            imgFormat: function (url) {
                var ext = "_640x360.jpg";
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
     * 加载菜单可供选择的食材控制器
     */
    app.controller("chooseMaterial", ["$scope", "cookService", "$uibModal", "materialService", "tagService", "utils", "$uibModalInstance", "params", function ($scope, cookService, $modal, materialService, tagService, utils, $uibModalInstance, params) {
        var service = materialService.list;
        var vals = utils.enums();
        var choose;
        var methods = {
            categories: vals.MaterialCategory,
            search: function (isPage) {
                choose = angular.copy(params);
                if (!isPage)
                    $scope.current = 1;
                $scope.loadingState = true;
                service.get({ keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size }).success(function (data) {
                    angular.forEach(data.Data, function (v) {
                        angular.forEach(params, function (z) {
                            if (v.Id === z.MaterialId) {
                                v.isChecked = true;
                                v.isDisabled = z.Id > 0;
                            }
                        });
                    });
                    $scope.loadingState = false;
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                });
            },
            cancel: function () {
                $uibModalInstance.close(true);
            },
            click: function (item) {
                if (item.isDisabled) return;
                item.isChecked = !item.isChecked;
                if (item.isChecked) {
                    var data = {
                        MaterialId: item.Id, Name: item.Name, Number: 1,
                        UnitPrice: item.Price, Category: item.Category,
                        Unit: item.Unit, isModified: true,
                        ImageAccessKey: item.ImageAccessKey
                    };
                    choose.push(data);
                } else {
                    var fn = function (i, v) { return i.MaterialId === v.Id };
                    utils.remove(choose, item, fn);
                }
            },
            close: function () {
                params.length = 0;
                angular.forEach(choose, function (v) {
                    params.push(v);
                });
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods);
        methods.search();

    }]);
    /**
     * params接收传入的一个做菜视频的item对象
     */
    app.controller("lookUpCookForm", ["$scope", "cookService", "$uibModal", "materialService", "tagService", "utils", "$uibModalInstance", "params", function ($scope, cookService, $modal, materialService, tagService, utils, $uibModalInstance, params) {
        $scope.cookId = params.Id;
        var methods = {
            close: function () {
                $uibModalInstance.close(true);
            }
        };
        angular.extend($scope, methods);
    }]);
    /**
     * 做菜事件控制器
     */
    app.controller("eventController", ["$scope", "utils", "cookService", "paramEvent", "$uibModalInstance", "$uibModal", function ($scope, utils, cookService, paramEvent, $uibModalInstance, $modal) {
        var service = cookService.event;
        var cookId = paramEvent.CookId;
        var eventId = paramEvent.EventId;
        var arr = paramEvent.list;
        var methods = {
            //初始化
            init: function () {
                //编辑
                if (eventId) {
                    $scope.isCreate = false;
                    //获取一条事件的内容
                    service.getEventModel({ cookId: cookId, eventId: eventId }).success(function (data) {
                        switch (data.State) {
                            case 0:
                                $scope.model = data.Model;
                                break;
                            default:
                                $scope.model.isCreate = false;
                                utils.notify("事件数据加载失败", "warning");
                                break;
                        }
                    });
                    //新增
                } else {
                    $scope.isCreate = true;
                    $scope.model = { Id: 0, EventTime: 0, Message: '', CookId: cookId };
                }
            },
            save: function () {
                var model = $scope.model;
                if (!methods.check(model)) return;
                //编辑
                if (model.Id) {
                    service.put(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("修改成功,请刷新本页面查看！", "success");
                                // 1. 查找编辑的数组中的对象
                                // 2. 删除对象
                                // 3. 插入新编辑的对象到删除的位置
                                $.each(arr, function (i, value) {
                                    if (this.Id === model.Id) {
                                        //console.log(this.i);
                                    }
                                    // [ Object { Id=3054,  EventTime=13,  Message="123123123",  更多...}, Object { Id=3061,  EventTime=234,  Message="asdfasdfasdf",  更多...},

                                    //this指向当前元素

                                    //i; //i表示Array当前下标

                                    //value; //value表示Array当前元素

                                });
                                //paramEvent.list.push({
                                //    Id: data.Id,
                                //    EventTime: model.EventTime,
                                //    Message: model.Message,
                                //    CookId: model.CookId,
                                //    ImgAccessKey: model.ImgAccessKey,
                                //    isModified: false
                                //});
                                $uibModalInstance.close(true);
                                return;
                            case 6:
                                utils.notify("失败！您没有修改做菜事件信息的权限", "warning");
                                return;
                            default:
                                utils.notify("修改失败", "warning");
                                return;
                        }
                    });
                    //新增
                } else {
                    service.post(model).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notify("创建成功！", "success");
                                paramEvent.list.push({
                                    Id: data.Id,
                                    EventTime: model.EventTime,
                                    Message: model.Message,
                                    CookId: model.CookId,
                                    ImgAccessKey: model.ImgAccessKey,
                                    isModified: false
                                });
                                $uibModalInstance.close(true);
                                model.Id = data.Id;
                                return;
                            case 6:
                                utils.notify("失败！,您没有添加做菜事件信息的权限", "warning");
                                return;
                            default:
                                utils.notify("创建失败", "warning");
                                return;
                        }
                    });
                }
            },
            check: function (model) {

                if (!model.EventTime || !/^\d+$/.test(model.EventTime)) {
                    utils.notify("请填写大于0的正整数", "warning");
                    return false;
                }
                if (!$.trim(model.Message)) {
                    utils.notify("描述信息不能为空！", "warning");
                    return false;
                }
                return true;
            },
            cancel: function () {
                $uibModalInstance.close(true);
            },
            viewPicture: function (path) {
                $modal.open({
                    templateUrl: 'cook-viewPicture',
                    controller: "viewPictures",
                    resolve: {
                        params: function () {
                            return path;
                        }
                    }
                });
            },
            imgFormat: function (url) {
                var ext = "_640x360.jpg";
                if (url.indexOf(ext) > 0) return url;
                if (url.indexOf('.jpg') <= 0) return url + ext;
                return url.replace(".jpg", ext);
            },
            imgEventFormat: function (url) {
                var ext = "_160x90.jpg";
                //上传图片情况
                if (url.indexOf(".jpg") > 0) return url.replace(".jpg", ext);
                //从数据库中加载图片情况 - 加载默认图片
                if (url.indexOf("default-v1.0") > 0) return url + ext;
                //从数据库中加载图片情况 - 加载真实图片
                return url + ext;
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    app.controller("viewPictures", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            model: params,
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            },
            //图片上传之后，上出插件返回的url是带“.jpg”的，过滤掉
            imgFormat: function (url) {
                if (url.indexOf(".jpg") > 0) return url.replace(".jpg", "");
                return url;
            }
        }
        angular.extend($scope, methods); //methods放入到$scope对象
    }]);
    /**
     * 视频基本信息
     */
    app.controller("lookUpCookBase", ["$scope", "cookService", "$uibModal", "utils", function ($scope, cookService, $modal, utils) {
        var service = cookService.list;
        var methods = {
            init: function () {
                $scope.loadingState = true;
                service.getModel($scope.cookId).success(function (data) {
                    switch (data.State) {
                        case 0://加载数据返回成功
                            $scope.model = data.Model;
                            $scope.model.isAdd = false;
                            $scope.loadingState = false;
                            break;
                        default:
                            utils.notify("服务器出错", "warning");
                            break;
                    }
                });
            },
            viewCookPicture: function (model) {
                $modal.open({//打开模态模块
                    templateUrl: 'lookUpCook-viewPicture',
                    controller: "viewPictures",
                    resolve: {
                        params: function () {
                            return model;
                        }
                    }
                });
            },
            descriptionDetail: function (content) {
                $modal.open({//打开基本描述模态模块
                    templateUrl: 'lookUpCook-descriptionDetail',
                    controller: "descriptionBook",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return content;
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 视频文章描述控制器
     */
    app.controller("descriptionBook", ["$scope", "$uibModalInstance", "params", function ($scope, $uibModalInstance, params) {
        var methods = {
            description: params,
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            }
        }
        angular.extend($scope, methods); //methods放入到$scope对象
    }]);
    /**
     * 视频收藏控制器
     */
    app.controller("lookUpCookCollection", ["$scope", "cookService", "$uibModal", function ($scope, cookService, $modal) {
        var service = cookService.memberCollection;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { cookId: $scope.cookId, keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookUpMember: function (memberId) {
                $modal.open({//打开模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            size: 20
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 视频点赞控制器
     */
    app.controller("lookUpCookVote", ["$scope", "cookService", "$uibModal", function ($scope, cookService, $modal) {
        var service = cookService.cookVote;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { cookId: $scope.cookId, keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookUpMember: function (memberId) {
                $modal.open({//打开模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            size: 20
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 视频信息控制器
     */
    app.controller("lookUpCookVideo", ["$scope", "cookService", function ($scope, cookService) {
        var service = cookService.cookVideo;
        var methods = {
            search: function () {
                $scope.loadingState = true;
                service.get($scope.cookId).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 视频分享控制器
     */
    app.controller("lookUpCookShare", ["$scope", "cookService", "$uibModal", function ($scope, cookService, $modal) {
        var service = cookService.cookShare;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { cookId: $scope.cookId, keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookUpMember: function (memberId) {
                $modal.open({//打开模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            size: 20
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 评论列表控制器
     */
    app.controller("lookUpCookComment", ["$scope", "commentService", "$uibModal", 'utils', function ($scope, commentService, $modal, utils) {
        var service = commentService.cookComment;
        var vals = utils.enums();
        var methods = {
            commentIsDelete: vals.CommentIsDelete,
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { cookId: $scope.cookId, keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 4,
            lookUpMember: function (memberId) {
                $modal.open({//打开模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            commentDetail: function (commentId) {//查看评论内容详情
                $modal.open({//打开模态模块
                    templateUrl: 'lookUpCook-commentDetail',
                    controller: "commentDetail",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return commentId;
                        }
                    }
                });
            },
            replyList: function (commentId) {//查看回复列表
                $modal.open({//打开模态模块
                    templateUrl: 'lookUpCook-reply',
                    controller: "replyForComment",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return commentId;
                        }
                    }
                });
            }
        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 评论详情控制器
     */
    app.controller("commentDetail", ["$scope", "commentService", "$uibModalInstance", "params", "utils", function ($scope, commentService, $uibModalInstance, params, utils) {
        var service = commentService.cookComment;
        var vals = utils.enums();//获取系统枚举数
        var methods = {
            commentIsDelete: vals.CommentIsDelete,
            init: function () {
                service.getModel(params).success(function (data) {
                    if (data.State === 0) {
                        $scope.model = data.Model;
                    }
                });
            },
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            },
            save: function () {//点击评论"保存"开关按钮
                service.put($scope.model).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("更新评论状态信息成功！", "success");
                            return;
                        default:
                            utils.notify("更新评论状态信息失败", "warning");
                            return;
                    }
                });
            }
        }
        angular.extend($scope, methods); //methods放入到$scope对象
        methods.init();
    }]);
    /**
     * 评论"回复"列表控制器 
     */
    app.controller("replyForComment", ["$scope", "commentService", "$uibModal", "$uibModalInstance", "params", function ($scope, commentService, $modal, $uibModalInstance, params) {
        var service = commentService.discussion;
        var methods = {
            search: function (isPage) {
                $scope.loadingState = true;
                if (!isPage) $scope.current = 1;
                var post = { commentId: params, keyword: $scope.Name, current: $scope.current, type: $scope.type, size: $scope.size };
                service.get(post).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 5,
            lookUpMember: function (memberId) {
                $modal.open({//打开模态模块
                    templateUrl: 'member-form',
                    controller: "memberForm",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            replyDetail: function (replyId) {//查看回复内容详情
                $modal.open({//打开模态模块
                    templateUrl: 'lookUpCook-replyDetail',
                    controller: "replyDetail",
                    size: 'lg',
                    resolve: {
                        params: function () {
                            return { replyId: replyId, commentId: params };
                        }
                    }
                });
            },
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            }

        };
        angular.extend($scope, methods);
        methods.search();
    }]);
    /**
     * 视频评论"回复",详情控制器
     */
    app.controller("replyDetail", ["$scope", "commentService", "$uibModalInstance", "params", "utils", function ($scope, commentService, $uibModalInstance, params, utils) {
        var service = commentService.discussion;
        var methods = {
            init: function () {
                service.getModel(params).success(function (data) {//加载回复评论模型
                    if (data.State === 0) {
                        $scope.model = data.Model;
                    }
                });
            },
            close: function () { //关闭模态
                $uibModalInstance.close(true);
            },
            save: function () {//点击"保存"按钮
                service.putReply($scope.model).success(function (data) {
                    switch (data.State) {
                        case 0:
                            utils.notify("更新回复状态信息成功！", "success");
                            return;
                        default:
                            utils.notify("更新回复状态信息失败", "warning");
                            return;
                    }
                });
            }
        }
        angular.extend($scope, methods); //methods放入到$scope对象
        methods.init();
    }]);
    /**
     * 视频标签控制器
     */
    app.controller("lookUpCookTag", ["$scope", "cookService", function ($scope, cookService) {
        var service = cookService.tags;
        var methods = {
            init: function () {
                $scope.loadingState = true;
                service.get($scope.cookId).success(function (data) {
                    $scope.list = data.Data;
                    $scope.loadingState = false;
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    /**
     * 视频关联食材控制器
     */
    app.controller("lookUpCookMaterial", ["$scope", "cookService", function ($scope, cookService) {
        var service = cookService.material;
        var methods = {
            init: function () {
                $scope.loadingState = true;
                service.get($scope.cookId).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
    app.controller("lookUpCookGoods", ["$scope", "cookService", function ($scope, cookService) {
        var service = cookService.goods;
        var methods = {
            init: function () {
                $scope.loadingState = true;
                service.get($scope.cookId).success(function (data) {
                    $scope.goods = data.Model;
                    $scope.loadingState = false;
                });
            }
        };
        angular.extend($scope, methods);
        methods.init();
    }]);
})()