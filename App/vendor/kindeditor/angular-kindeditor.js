/**
 * @license AngularJS v1.2.9
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 * Created by Zed on 19-11-2014.
 */
(function (window, angular) {
    'use strict';

    angular
        .module('ngKeditor', [])
        .directive('keditor', function () {

            var linkFn = function (scope, elm, attr, ctrl) {
                var editor;
                if (typeof KindEditor === 'undefined') {
                    console.error('Please import the local resources of kindeditor!');
                    return;
                }

                var config = {
                    width: '100%',
                    autoHeightMode: false,
                    afterCreate: function () {
                        this.loadPlugin('autoheight');
                    }
                };

                var editorId = elm[0],
                    //编辑器配置
                    editorConfig = scope.config || config;
                ctrl.$render = function () {
                    editor.html(ctrl.$viewValue);
                }
                editorConfig.afterChange = function () {
                    var html = this.html();
                    if (!scope.$$phase && html) {
                        ctrl.$setViewValue(html);
                    }
                };

                if (KindEditor) {
                    //创建一个KindEditor编辑器实例
                    editor = KindEditor.create(editorId, editorConfig);
                }

                ctrl.$parsers.push(function (viewValue) {
                    ctrl.$setValidity('keditor', viewValue);
                    return viewValue;
                });
                //销毁编辑器对象
                scope.$on('$destroy', function () {
                    KindEditor.remove(editorId);
                    editorId = null;
                });
            };

            return {
                require: 'ngModel',
                scope: { config: '=config' },
                link: linkFn
            };
        });
})(window, window.angular);