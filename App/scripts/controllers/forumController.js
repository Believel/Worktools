(function () {
    //模块，控制器
    var app = angular.module("Mealtime.Controllers");
    /**
     * 论坛主题控制器
     */
    app.controller("forum", ['$scope', 'forumService', "toastr", "utils", function ($scope, forumService, toastr, utils) {
        var service = forumService.list;
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
            edit: function (item) { //编辑
                item.isModified = true;
                item.org = angular.copy(item);
            },
            //更新
            save: function(item) {
                if (!methods.check(item)) return;
                delete item.org;
                service.put({Id:item.Id,Sort:item.Sort}).success(function(data) {
                    switch (data.State) {
                        case 0:
                            utils.notifySuccess("更新成功！", "系统提示：", $scope, toastr);
                            item.isModified = false;
                            break;
                        case 2:
                            utils.notifyError("服务器已经存在相同的排序数字！","系统提示：",$scope,toastr);
                            break;
                        case 3:
                            utils.notifyError("当前编辑的版块在服务器中不存在！","系统提示：",$scope,toastr);
                            break;
                        default:
                            utils.notifyWarning("网路错误！");
                            break;
                    }
                });
            },
            check: function (item) {
                if (!item.Sort || !/^\d+$/.test(item.Sort)) {
                    utils.notifyWarning("排序为数字且非空！","系统提示：",$scope,toastr);
                    return false;
                }
                return true;
            },
            remove: function (item) { //删除
                var modal = utils.confirm({ msg: "是否删除当前版块。", ok: "确定", cancel: "取消" });
                modal.result.then(function () {
                    service.delete(item.Id).success(function (data) {
                        switch (data.State) {
                            case 0:
                                utils.notifySuccess("删除成功！", "系统提示:", $scope, toastr);
                                utils.remove($scope.list, item);
                                break;
                            case 3:
                                utils.notifyError("当前版块在服务器中不存在！", "系统提示：", $scope, toastr);
                                break;
                            default:
                                utils.notifyWarning("网路错误！");
                                break;
                        }
                    });
                });
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
            }
        };
        $scope.size = 5;
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 主题帖子控制器
     */
    app.controller("forumPosts", ['$scope', '$rootScope', 'forumService', "$routeParams", 'utils', "$uibModal", function ($scope, $rootScope, forumService, $routeParams, utils, $modal) {
        //主题Id
        var id = $routeParams.id;
        var vals = utils.enums();
        var service = forumService.posts;
        var methods = {
            postStates: vals.PostState,
            isHot: vals.IsHot,
            isEssence: vals.IsEssence,
            isTop: vals.IsTop,
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var params = { keyword: $scope.Name, current: $scope.current, size: $scope.size, id: id };
                $scope.loadingState = true;//加载数据时候显示gif图
                service.getPosts(params).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;//加载成功屏蔽gif图
                });
            },
            //修改帖子状态
            changeState: function (item, state) {
                service.putState({ TopicId: id, PostId: item.Id, State: state }).success(function (data) {
                    switch (data.State) {
                        case 0:
                            item.State = state;
                            if (state === 1) {
                                utils.notify("帖子已显示！", "success");
                            } else {
                                utils.notify("帖子已屏蔽！", "success");
                            }
                            break;
                        default:
                            utils.notify("修改失败！", "success");
                            break;
                    }
                });
            },
            //修改帖子：精华、热帖、置顶
            chkboxChange: function (postId, option, bit) {
                service.putChkBox({ TopicId: id, PostId: postId, Option: option, Bit: bit }).success(function (data) {
                    if (bit) {//选中
                        switch (data.State) {
                            case 0:
                                if (option === 1) {
                                    utils.notify("帖子已是热门贴！", "success");
                                } else if (option === 2) {
                                    utils.notify("帖子已是精华帖！", "success");
                                } else {
                                    utils.notify("帖子已经置顶！", "success");
                                }
                                break;
                            default:
                                utils.notify("修改失败！", "success");
                                break;
                        }
                    } else {
                        switch (data.State) {
                            case 0:
                                if (option === 1) {
                                    utils.notify("热门贴取消！", "success");
                                } else if (option === 2) {
                                    utils.notify("精华帖取消！", "success");
                                } else {
                                    utils.notify("置顶取消！", "success");
                                }
                                break;
                            default:
                                utils.notify("修改失败！", "success");
                                break;
                        }
                    }
                });
            },
            //打开点赞列表
            lookupVote: function (item) {
                if (item.Votes === 0) {
                    utils.notify("当前帖子没有点赞信息！", "success");
                    return;
                }
                $modal.open({
                    templateUrl: 'forum-postVotes', controller: 'postVote',
                    size: 'md',
                    resolve: {
                        params: function () {
                            return { TopicId: id, Item: item };
                        }
                    }
                });
            },
            //打开帖子的相册
            openAlbum: function (postId) {
                var total;
                var arr = [];
                service.getAlbum({ TopicId: id, PostId: postId }).success(function (data) {
                    var list = data.Data;
                    //拼接指定数据格式，并存入到数组
                    for (var i = 0; i < list.length ; i++) {
                        var pic = list[i];
                        var src = pic.ImgAccessKey;
                        var desc = pic.Id;
                        var obj = { "thumb": src + "_60x60.jpg", "img": src + "_240x240.jpg", "description": desc };
                        arr.push(obj);
                    }
                    total = data.Total;
                    $rootScope.images = arr;
                    if (arr.length === 0) {
                        utils.notify("当前帖子没有图集！", "success");
                        return;
                    }
                    // 数据加载成功后，打开图片模态！
                    $modal.open({
                        template: '<ng-gallery images="images"></ng-gallery>',
                        windowClass: 'ng-gallery--modal'
                    });
                });
            },
            //查看发帖人详细信息
            lookup: function (item) {
                var memberId = item;
                $modal.open({
                    templateUrl: 'member-form', controller: 'memberForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };
                        }
                    }
                });
            },
            //查看帖子内容
            lookPost: function (item) {
                $modal.open({
                    templateUrl: 'forum-post', controller: 'post', size: 'lg',
                    resolve: {
                        params: function () {
                            return { Title: item.Title, Content: item.Contents };
                        }
                    }
                });
            },
            //查看帖子回复列表信息
            lookupReplys: function (item) {
                if (item.Replys === 0) {
                    utils.notify("当前帖子没有回复信息！", "success");
                    return;
                }
                $modal.open({
                    templateUrl: 'forum-listReplys', controller: 'replys', size: 'lg',
                    resolve: {
                        params: function () {
                            return { TopicId: id, PostId: item.Id, Title: item.Title };
                        }
                    }
                });
            }
        };
        $scope.size = 10;
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 帖子点赞控制器
     */
    app.controller("postVote", ["$scope", "params", "forumService", "$uibModal", "$uibModalInstance", function ($scope, params, forumService, $modal, $Modal) {
        var service = forumService.posts;
        var topicId = params.TopicId;
        var postId = params.Item.Id;
        var methods = {
            title: params.Item.Title,
            search: function (isPage) {
                if (!isPage) $scope.current = 1;
                var params = { keyword: $scope.Name, current: $scope.current, size: $scope.size, topicId: topicId, postId: postId };
                $scope.loadingState = true;
                service.getVotes(params).success(function (data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            lookup: function (item) {
                $modal.open({
                    templateUrl: 'member-form', controller: 'memberForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return item;//当前行选中会员返回，需要使用这个会员的id信息
                        }
                    }
                });
            },
            close: function () {
                $Modal.close(true);
            }
        };
        $scope.size = 10;
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 帖子详细内容查看控制器
     */
    app.controller("post", ["$scope", "params", "$uibModalInstance", function ($scope, params, $Modal) {
        $scope.title = params.Title;
        $scope.content = params.Content;
        $scope.close = function () {
            $Modal.close(true);
        }
    }]);
    /**
     * 帖子回复列表控制器
     */
    app.controller("replys", ["$scope", "params", "$uibModalInstance", 'forumService', "$uibModal", "$rootScope", "utils", function ($scope, params, $Modal, forumService, $modal, $rootScope, utils) {
        var service = forumService.posts;
        var methods = {
            search: function(isPage) {
                if (!isPage) $scope.current = 1;
                var post = { keyword: $scope.Name, current: $scope.current, size: $scope.size, topicId: params.TopicId, postId: params.PostId };
                $scope.loadingState = true;
                service.getReplys(post).success(function(data) {
                    $scope.list = data.Data;
                    $scope.total = data.Total;
                    $scope.loadingState = false;
                });
            },
            size: 10,
            title:params.Title,
            close: function() {
                $Modal.close(true);
            },
            lookup: function (item) {
                var memberId = item.MemberId;
                $modal.open({
                    templateUrl: 'member-form', controller: 'memberForm', size: 'lg',
                    resolve: {
                        params: function () {
                            return { Id: memberId };//当前行选中会员返回，需要使用这个会员的id信息
                        }
                    }
                });
            },
            //查看回复内容
            lookupReplys: function (item) {
                $modal.open({
                    templateUrl: 'forum-reply', controller: 'reply', size: 'lg',
                    resolve: {
                        params: function () {
                            return { Title: item.Title, Content: item.Contents };
                        }
                    }
                });
            },
            //打开回复相册
            openAlbum: function (replyId) {
                    var total;
                    var arr = [];
                    service.getReplyAlbum({ TopicId: params.TopicId, PostId: params.PostId, ReplyId: replyId }).success(function (data) {
                        var list = data.Data;
                        //拼接指定数据格式，并存入到数组
                        for (var i = 0; i < list.length ; i++) {
                            var pic = list[i];
                            var src = pic.ImgAccessKey;
                            var desc = pic.Id;
                            var obj = { "thumb": src + "_60x60.jpg", "img": src + "_240x240.jpg", "description": desc };
                            arr.push(obj);
                        }
                        total = data.Total;
                        $rootScope.images = arr;
                        if (arr.length === 0) {
                            utils.notify("当前回复没有图集！", "success");
                            return;
                        }
                        // 数据加载成功后，打开图片模态！
                        $modal.open({
                            template: '<ng-gallery images="images"></ng-gallery>',
                            windowClass: 'ng-gallery--modal'
                        });
                    });
                }
        };
        methods.search();
        angular.extend($scope, methods);
    }]);
    /**
     * 帖子回复内容查看控制器
     */
    app.controller("reply", ["$scope", "params", "$uibModalInstance", function ($scope, params, $Modal) {
        $scope.content = params.Content;
        $scope.close = function () {
            $Modal.close(true);
        }
    }]);
})()