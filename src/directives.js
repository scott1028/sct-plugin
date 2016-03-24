'use strict';
angular.module('sctPlugin')


//
.directive("shadowDom", function() {
    return {
        restrict: "E",
        replace: true,
        link: function(scope, elem, attrs, ngModelCtrl) {
            var domList = elem.children();
            var hostDom = elem[0];
            //noinspection JSUnresolvedFunction
            hostDom.createShadowRoot();
            for(var idx=0; idx < domList.length; idx++){
                //noinspection JSUnresolvedVariable
                hostDom.shadowRoot.appendChild(domList[idx]);
            }
        }
    }
})
//
.directive('draggable', function($document) {
    return function(scope, element, attr) {
        var zIndex = 9999;
        var startX = 0, startY = 0, x = 0, y = 0;
        element.css({
            position: 'relative',
            cursor: 'pointer',
            'z-index': zIndex
        });

        element.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            element.css({
                'z-index': zIndex += 1,
                opacity: 0.8
            });

            event.preventDefault();
            startX = event.screenX - x;
            startY = event.screenY - y;
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
            y = event.screenY - startY;
            x = event.screenX - startX;
            element.css({
            top: y + 'px',
            left:  x + 'px'
            });
        }

        function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            element.css('opacity', 1);
        }
    };
})
// make ngModel onblur
.directive('ngModelOnblur', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope, elm, attr, ngModelCtrl) {

            //
            console.log('ng-model-onblur API: \n\t"ng-model-onblur" directive to make ngModel onblur instead keypress.');

            if (attr.type === 'radio' || attr.type === 'checkbox') return;

            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(elm.val());
                });
            });

            //
            elm.bind('keypress', function(e) {

                //
                console.log(e);

                //
                if(e.keyCode === 13){
                    scope.$apply(function() {
                        ngModelCtrl.$setViewValue(elm.val());
                    });
                }
            });
        }
    };
})
//
.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A',
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
})
//
.directive('staticInclude', function($http, $templateCache, $compile) {

    console.debug('< …  static-include="/xxx/test.html" … >: To Include Template without Create new Scope.');

    return function(scope, element, attrs) {
        var templatePath = attrs.staticInclude;
        $http.get(templatePath, { cache: $templateCache }).success(function(response) {
            var contents = element.html(response).contents();
            $compile(contents)(scope);
        });
    };
})
//
.directive('ngIncludeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A', /* optional */
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
})
//
.directive('paginator', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'paginator.html',
        link: function($scope, element, attrs, ngModelCtrl){
            // API variables
            // $scope.total_count: count items(*)
            // $scope.total_page: Math.ceil(data.meta.total_count / $scope.pageSize;
            // $scope.current_page_no: 1,2,3,4,5....total_page
            // $scope.onblur = function(){ ... }
            // $scope.ajaxing = true - can be invoked when init controller
            // $scope.lock_ui() - can not be invoked when init controller
            // $scope.unlock_ui() - can not be invoked when init controller
            // $scope.$parent.setPageSize - parent tpl can implement this method with <paginator page-size="...." />


            // API Description
            console.debug('\
                "<paginator />" API Description:\n\
                    $scope.total_count: count items(*)\n\
                    $scope.total_page: Math.ceil(data.meta.total_count / $scope.pageSize;\n\
                    $scope.current_page_no: 1,2,3,4,5....total_page\n\
                    \t$scope.$watch(function(newValue, oldValue){\n\
                    \t\t...\n\
                    \t\t$scope.form.offset = $scope.form.limit * (newValue - 1);\n\
                    \t\t...\n\
                    \t});\n\
                    \n\
                    $scope.onblur = function(){ ... }\n\
                    \n\
                    $scope.ajaxing = true - can be invoked when init controller\n\
                    $scope.lock_ui() - can not be invoked when init controller\n\
                    $scope.unlock_ui() - can not be invoked when init controller\n\
                    \n\
                    $scope.$parent.setPageSize - parent tpl can implement this method with ex: <paginator page-size="20,30,50" />\n\
            ');


            // add pageSize support
            attrs.pageSize = attrs.pageSize || '20';
            $scope.pageSizeList = attrs.pageSize.split(',');
            $scope.showPageSizer = $scope.pageSizeList.length > 1;


            //
            var last_value = 1;


            // expose $scope.ajaxing api
            $scope.ajaxing = $scope.ajaxing || false;


            //
            $scope.$watch('current_page_no', function(new_value, old_value){
                if(new_value === null || new_value === undefined || new_value === ''){
                    $scope.current_page_no = 1;
                    return;
                }

                if(parseInt(new_value) <= 0) $scope.current_page_no = 1;
                
                if(new_value !== null && !angular.isUndefined(new_value) && !new_value.toString().match(/^[0-9]*$/g)){
                    $scope.current_page_no = old_value;
                    return;
                }

                if(!isNaN(parseInt(old_value))){
                    last_value = old_value;
                }

                if(angular.isNumber($scope.total_page) && (new_value > $scope.total_page)){
                    $scope.current_page_no = 1;
                }
            });


            //
            $scope.nextPage = function(){
                $scope.current_page_no < $scope.total_page ? ($scope.current_page_no = parseInt($scope.current_page_no) + 1) : $scope.current_page_no;
            };


            //
            $scope.prevPage = function(){
                $scope.current_page_no > 1 ? ($scope.current_page_no = parseInt($scope.current_page_no) - 1) : $scope.current_page_no;
            };


            // re-pointer parent onblur method for callParent implement.
            if(angular.isFunction($scope.onblur)) $scope._onblur = $scope.onblur;

            $scope.onblur = function(){
                if(isNaN(parseInt($scope.current_page_no))) $scope.current_page_no = last_value;

                // callParent
                if(angular.isFunction($scope._onblur)) $scope._onblur();
            };


            // concurrency control mutex
            $scope.lock_ui = function(){
                $scope.ajaxing = true
            };

            $scope.unlock_ui = function(){
                $scope.ajaxing = false
            }
        }
    }
})
//
.run(['$templateCache', function($templateCache){
    $templateCache.put("paginator.html",
        '<div>' +
        '    <div style="line-height: 25px; margin: 5px;" onselectstart="return false;">' +
        '        <button' +
        '            class="glyphicon glyphicon-backward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="prevPage();"></button>' +
        '        <input' +
        '            type="number"' +
        '            ng-model="current_page_no"' +
        '            style="font-size: 12pt; height: 29px; line-height: 25px; border-radius: 0px; width: 80px; text-align: center;"' +
        '            ng-blur="onblur()"' +
        '            max="100000"' +
        '            min="1"' +
        '            onmousewheel="return false;"' +
        '            ng-model-onblur />' +
        '        <button' +
        '            class="glyphicon glyphicon-forward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="nextPage();"></button>' +
        '        <span style="text-align: right; height: 0px; line-height: 25px; position: relative; color: #157ab5;">Total: {{total_count}} 筆, Page 共: {{total_page}} 頁</span>' +
        '        <span ng-show="showPageSizer" class="pull-right" style="height: 29px!important; top: 1px; margin-left: 10px;">' +
        '            <button' +
        '                class="btn btn-default"' +
        '                ng-repeat="item in pageSizeList"' +
        '                style="height: 25px!important; line-height: 25px!important; padding-top: 0px; padding-bottom: 0px;"' +
        '                ng-click="setPageSize(item)"' +
        '                ng-disabled="ajaxing">' +
        '                {{item}}' +
        '            </button>' +
        '        </span>' +
        '        <span class="ajaxing-min" style="margin-left: 20px; height: 10px; min-width: 200px; display: inline-block;" ng-show="ajaxing"></span>' +
        '    </div>' +
        '    <style type="text/css">' +
        '        .glyphicon.glyphicon-backward:hover, .glyphicon.glyphicon-forward:hover {' +
        '            color: #303030;' +
        '            font-weight: bold;' +
        '        }' +
        '        button:disabled, button:disabled:hover {' +
        '            color: silver!important;' +
        '        }' +
        '        input::-webkit-outer-spin-button,' +
        '        input::-webkit-inner-spin-button {' +
        '            -webkit-appearance: none;' +
        '            margin: 0;' +
        '        }' +
        '        @media (max-width: 991px){' +
        '            .page-selector .col-md-2 {' +
        '                float: right;' +
        '            }' +
        '            .page-selector .col-md-6 {' +
        '                float: left;' +
        '            }' +
        '            .pull-right[ng-show="showPageSizer"] {' +
        '                top: -2px!important;' +
        '                float: none!important;' +
        '            }' +
        '        }' +
        '    </style>' +
        '</div>');
}])


//
//
.directive('paginatorCustom', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: 'paginator-custom.html',
        link: function($scope, element, attrs, ngModelCtrl){
            // API variables
            // $scope.total_count: count items(*)
            // $scope.total_page: Math.ceil(data.meta.total_count / $scope.pageSize;
            // $scope.current_page_no: 1,2,3,4,5....total_page
            // $scope.onblur = function(){ ... }
            // $scope.ajaxing = true - can be invoked when init controller
            // $scope.lock_ui() - can not be invoked when init controller
            // $scope.unlock_ui() - can not be invoked when init controller
            // $scope.$parent.setPageSize - parent tpl can implement this method with <paginator page-size="...." />


            // API Description
            console.debug('\
                "<paginator-custom />" API Description:\n\
                    $scope.totalCount: count items(*)\n\
                    $scope.totalPage: Math.ceil(data.meta.total_count / $scope.pageSize;\n\
                    $scope.currentPageNo: 1,2,3,4,5....total_page\n\
                    $scope.next = function(){ ... }\n\
                    $scope.prev = function(){ ... }\n\
                    $scope.page = function(pageNo){ ... }\n\
                    $scope.setPageSize(size)\n\
                ');

            // add pageSize support
            attrs.pageSize = attrs.pageSize || '20';
            $scope.pageSizeList = attrs.pageSize.split(',');
            $scope.showPageSizer = $scope.pageSizeList.length > 1;
        }
    }
})
//
.run(['$templateCache', function($templateCache){
    $templateCache.put("paginator-custom.html",
        '<div>' +
        '    <div style="line-height: 25px; margin: 5px;" onselectstart="return false;">' +
        '        <button' +
        '            class="glyphicon glyphicon-backward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="prev();"></button>' +
        '        <input' +
        '            type="number"' +
        '            ng-model="currentPageNo"' +
        '            style="font-size: 12pt; height: 29px; line-height: 25px; border-radius: 0px; width: 80px; text-align: center;"' +
        '            ng-blur="page()"' +
        '            max="100000"' +
        '            min="1"' +
        '            onmousewheel="return false;"' +
        '            ng-model-onblur />' +
        '        <button' +
        '            class="glyphicon glyphicon-forward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="next();"></button>' +
        '        <span style="text-align: right; height: 0px; line-height: 25px; position: relative; color: #157ab5;">Total: {{totalCount}} 筆, Page 共: {{totalPage}} 頁</span>' +
        '        <span ng-show="showPageSizer" class="pull-right" style="height: 29px!important; top: 1px; margin-left: 10px;">' +
        '            <button' +
        '                class="btn btn-default"' +
        '                ng-repeat="item in pageSizeList"' +
        '                style="height: 25px!important; line-height: 25px!important; padding-top: 0px; padding-bottom: 0px;"' +
        '                ng-click="setPageSize(item)"' +
        '                ng-disabled="ajaxing">' +
        '                {{item}}' +
        '            </button>' +
        '        </span>' +
        '        <span class="ajaxing-min" style="margin-left: 20px; height: 10px; min-width: 200px; display: inline-block;" ng-show="ajaxing"></span>' +
        '    </div>' +
        '    <style type="text/css">' +
        '        .glyphicon.glyphicon-backward:hover, .glyphicon.glyphicon-forward:hover {' +
        '            color: #303030;' +
        '            font-weight: bold;' +
        '        }' +
        '        button:disabled, button:disabled:hover {' +
        '            color: silver!important;' +
        '        }' +
        '        input::-webkit-outer-spin-button,' +
        '        input::-webkit-inner-spin-button {' +
        '            -webkit-appearance: none;' +
        '            margin: 0;' +
        '        }' +
        '        @media (max-width: 991px){' +
        '            .page-selector .col-md-2 {' +
        '                float: right;' +
        '            }' +
        '            .page-selector .col-md-6 {' +
        '                float: left;' +
        '            }' +
        '            .pull-right[ng-show="showPageSizer"] {' +
        '                top: -2px!important;' +
        '                float: none!important;' +
        '            }' +
        '        }' +
        '    </style>' +
        '</div>');
}])
//


.directive('ajaxingBlockBy', function($compile. $rootScope) {
    return {
        restrict: 'A',
        scope: {
            ajaxing: '=ajaxingBlockBy'
        },
        link: function (scope, el, attrs) {
            console.debug('ajaxingBlockBy API: < ... ajaxing-block-by="ajaxing" ... >');
            console.debug('\tSet a $rootScope.ajaxingScope = $scope as a reference.');
            console.debug('\tYou must define CSS Classname:ajax_loading that include *.gif ajaxing animation.');
            console.debug(['\tSample:',
                '\t.ajax_loading {\n',
                '\t    min-height: 300px;\n',
                '\t    max-height: 300px;\n',
                '\t    overflow-x: hidden;\n',
                '\t    background: url("/images/ajaxing-text.gif") left no-repeat;\n',
                '\t    background-size: 100px 100px;\n',
                '\t    background-position: center 50%;\n',
                '\t    overflow-y: hidden;\n',
                '\t    opacity: 0.7;\n',
                '\t}'].join(''));

            // set Reference
            $rootScope = scope;

            //
            if(!el.attr('ajaxing-block-by')){
                throw new Error('No ngModel Value in < ... ajaxing-block-by=? ... />');
            };

            //
            if(el.css('position') === 'static')
                el.css('position', 'relative');

            var dom = angular.element([
                '<div ng-show="ajaxing" class="ajax_loading" style="',
                    'top: 0px;',
                    'height: 100%;',
                    'max-height: 100%;',
                    'width: 100%;',
                    'position: absolute;',
                    'background-color: white;',
                    'box-shadow: 1px 1px 3px #999999;',
                    'box-shadow: none;">',
                '</div>'].join(''));
            $compile(dom)(scope);
            el.append(dom);
        }
    };
})
;
