'use strict';
(function () {
    var app = angular.module("Mealtime.Directives", []);
    app.directive('mCheck', [function () {
        return {
            restrict: 'A',
            replace: false,
            link: function (scope, iElement) {
                var all = "thead input[type='checkbox']";
                var item = "tbody input[type='checkbox']";
                iElement.on("change", all, function () {
                    var o = $(this).prop("checked");
                    var tds = iElement.find(item);
                    tds.each(function (i, check) {
                        $(check).prop("checked", o);
                    });
                });
                iElement.on("change", item, function () {
                    var o = $(this).prop("checked");
                    var isChecked = true;
                    if (o) {
                        iElement.find(item).each(function () {
                            if (!$(this).prop("checked")) {
                                isChecked = false;
                                return false;
                            }
                            return true;
                        });
                    }
                    iElement.find(all).prop("checked", o && isChecked);
                });
            }
        };
    }]);
    app.directive('kUpload', [function () {
        return {
            restrict: 'A',
            require: "ngModel",
            replace: false,
            link: function (scope, iElement, attr, ctrl) {
                if (KindEditor.instances.length === 0)
                    KindEditor.create();
                var uploadbutton = KindEditor.uploadbutton({
                    button: iElement,
                    fieldName: 'imgFile',
                    url: attr["kUpload"],
                    width: 300,
                    afterUpload: function (data) {
                        if (data.error === 0) {
                            ctrl.$setViewValue(data.url);
                        } else {
                            alert(data.message);
                        }
                    },
                    afterError: function (str) {
                        alert('服务器出错: ' + str);
                    }
                });
                uploadbutton.fileBox.change(function (e) {
                    uploadbutton.submit();
                });
                scope.$on('$destroy', function () {
                    KindEditor.remove(iElement);
                    iElement = null;
                });
            }
        }
    }]);
    app.directive('mCategroy', ['http', function (http) {
        return {
            restrict: 'A',
            require: "ngModel",
            replace: false,
            link: function (scope, iElement, attr, ctrl) {
                ctrl.$render = function () {
                    iElement.category({
                        path: ctrl.$modelValue,
                        //拆分字符
                        sChar: ',',
                        change: function (v) {
                            ctrl.$setViewValue(v.join(','));
                        },
                        create: function () {
                            return $('<select>').addClass("form-control");
                        },
                        provider: function (params, callback) {
                            var id = params[params.length - 1];
                            http.get(attr.mCategroy, { "id": id }).success(callback);
                        }
                    });
                }
            }
        };
    }]);
    app.directive('backButton', function () {
        return {
            restrict: 'A',

            link: function (scope, element, attrs) {
                element.bind('click', goBack);

                function goBack() {
                    history.back();
                    scope.$apply();
                }
            }
        }
    });
})();