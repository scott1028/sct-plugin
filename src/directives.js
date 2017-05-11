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
            console.debug('Please use ngIncludeReplace instead of this.');
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
.directive('cssInclude', function($http, $templateCache, $compile) {
    return function(scope, element, attrs) {
        var templatePath = attrs.cssInclude;
        $.ajax({
            url: templatePath,
            success: function (response) {
                element.html(response).contents();
                scope.$applyAsync();
            },
            async: false
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
.directive('ajaxingBlockBy', function($compile, $rootScope) {
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
            $rootScope.ajaxingScope = scope;

            //
            if(!el.attr('ajaxing-block-by')){
                throw new Error('No ngModel Value in < ... ajaxing-block-by=? ... />');
            };

            //
            if(el.css('position') === 'static')
                el.css('position', 'relative');

            var dom = angular.element([
                '<div ng-show="ajaxing" class="ajax_loading" style="',
                    'left: 0px;',
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
//
.directive("tipInfo", function() {
    return {
        scope: {
            onstoreData: '=onstoreData',
            editingData: '=editingData',
            field: '=field',
            style: '=?setStyle',
        },
        restrict: 'E',
        template: (function(){
            return [
                '<div>',
                '    <div ng-if="displayTip()"',
                '        class="tooltip fade bottom in"',
                '        ng-style="style">',
                '        <div class="tooltip-arrow"></div>',
                '        <div class="tooltip-inner">',
                '            {{ onstoreData[field] }}',
                '        </div>',
                '    </div>',
                '    <div ng-if="equals(onstoreData, {})"',
                '        class="tooltip fade bottom in"',
                '        ng-style="style">',
                '        <div class="tooltip-arrow"></div>',
                '        <div class="tooltip-inner">',
                '            (This is new data)',
                '        </div>',
                '    </div>',
                '</div>'
            ].join('');
        })(),
        link: function(scope, elem, attrs, modelCtl) {
            
            //
            console.debug('<input class="tip-container" />><tip-info></tip-info> API:');
            console.debug('\tBase on bootstrap .tooltip CSS.');
            console.debug('\tYou must set onstore-data="..."');
            console.debug('\tYou must set editing-data="..."');
            console.debug('\tYou must set field="..."');
            console.debug('\tSet CSS => ".tip-container + tip-info" for display.');
            console.debug('\tTipInfo Element must next origin Element');


            //
            scope.equals = angular.equals;
            scope.style = scope.style || { display: 'block', top: '80px', left: '15px', position: 'absolute' };


            // determine if display tipbox.
            if(!angular.isFunction(scope.$parent.displayTip)){
                console.debug('Example');
                console.debug('    $scope.displayTip = function(scope){');
                console.debug('        return function(){');
                console.debug('            if(scope.onstoreData === undefined || scope.editingData === undefined)');
                console.debug('                return false;');
                console.debug('            return scope.onstoreData !== null && !scope.equals(scope.onstoreData, {})');
                console.debug('                && scope.onstoreData[scope.field] !== undefined');
                console.debug('                && scope.onstoreData[scope.field] !== scope.editingData[scope.field];');
                console.debug('        }');
                console.debug('    };');
                throw new Error('Please implement what condifiton tipbox should be display.');
            }
            else{
                scope.displayTip = scope.$parent.displayTip(scope);
            };


            // add Style, from View move to Here, due to a non-executed JS in view bug.
            (function(){
                // Here must be jQuery/Angualr ready.
                // for preview not in editing page
                var tipInfoStyle = angular.element('\
                    <style id="tip-info">\
                        .tip-container + tip-info {\
                            display: none!important;\
                        }\
                        [disabled] .tip-container:hover + tip-info {\
                            display: block!important;\
                        }\
                        *:not([disabled]) .tip-container:focus + tip-info {\
                            display: block!important;\
                        }\
                    </style>');

                angular.element('style#tip-info').remove();
                angular.element('[ng-view]').append(tipInfoStyle);
            })();
        }
    }
})
//
.directive('newPaginator', function() {
    return {
        replace: false,
        scope: {
            data: '=ngModel'
        },
        restrict: 'E',
        templateUrl: 'new-paginator.html',
        link: function($scope, element, attrs, ngModelCtrl){
            // API variables using these
            // ngModel = {
            //     currentPageNo: 1,
            //     pageSize: 20
            // }
            console.debug('<new-paginator ng-model="data"></new-paginator> API:');
            console.debug('\tdata structure:');
            console.debug('\t\tdata.currentPageNo: number, ex: 1');
            console.debug('\t\tdata.pageSize: number, ex: 20');
            console.debug('\t\tdata.totalCount: number, ex: 105');
            console.debug('\t*In Parent Scope watch data.currentPageNo is okay.');

            // by getterSetter to avoid ceil & floor value
            $scope.data.$$currentPageNo = function(val){
                if(val === undefined)
                    return $scope.data.currentPageNo;
                if(val > $scope.data.totalPage - 1){
                    return $scope.data.currentPageNo = $scope.data.totalPage;
                }
                if(val < 0)
                    return $scope.data.currentPageNo = 1;
                return $scope.data.currentPageNo = val;
            };

            $scope.next = function(){
                if($scope.data.totalPage === 0)
                    return $scope.data.currentPageNo = 1;
                if($scope.data.currentPageNo > $scope.data.totalPage - 1)
                    return $scope.data.currentPageNo = $scope.data.totalPage;
                $scope.data.currentPageNo += 1;
            };

            $scope.prev = function(){
                if($scope.data.currentPageNo === 1)
                    return;
                $scope.data.currentPageNo -= 1;
            };

            // fix no update parent scope bug
            $scope.$watch(function(){
                return [$scope.data.totalCount, $scope.data.pageSize];
            }, function(){
                $scope.data.totalPage = Math.ceil($scope.data.totalCount / $scope.data.pageSize);
                $scope.data.currentPageNo = $scope.data.currentPageNo;
            }, true);

            $scope.$watch(function(){
                return $scope.data.currentPageNo;
            }, function(newValue, oldValue){
                if(newValue === undefined){
                    return $scope.data.currentPageNo = 1;
                }
                if($scope.data.currentPageNo > $scope.data.totalPage -1){
                    if($scope.data.totalPage === 0)
                        return $scope.data.currentPageNo = $scope.data.currentPageNo;
                    return $scope.data.currentPageNo = $scope.data.totalPage;
                }
                if($scope.data.currentPageNo <= 1){
                    return $scope.data.currentPageNo = 1;
                }
                $scope.data.currentPageNo = newValue;
            }, true);
        }
    }
})
.directive('svgWorldMap', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'world.svg',
    }
})
//
.run(['$templateCache', function($templateCache){
    $templateCache.put("new-paginator.html",
        '<div>' +
        '    <div style="line-height: 25px; margin: 5px;" onselectstart="return false;">' +
        '        <button' +
        '            class="glyphicon glyphicon-backward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="prev();"></button>' +
        '        <input' +
        '            ng-model-options="{ updateOn: \'blur\', getterSetter: true }"' +
        '            type="number"' +
        '            ng-model="data.$$currentPageNo"' +
        '            style="font-size: 12pt; height: 29px; line-height: 25px; border-radius: 0px; width: 80px; text-align: center;"' +
        '            ng-blur="page()"' +
        '            max="100000"' +
        '            onmousewheel="return false;"' +
        '            ng-model-onblur />' +
        '        <button' +
        '            class="glyphicon glyphicon-forward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="next();"></button>' +
        '        <span style="text-align: right; height: 0px; line-height: 25px; position: relative; color: #157ab5;">Total: {{data.totalCount}} 筆, Page 共: {{data.totalPage}} 頁</span>' +
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
.run(['$templateCache', function($templateCache){
    $templateCache.put("new-paginator.html",
        '<div>' +
        '    <div style="line-height: 25px; margin: 5px;" onselectstart="return false;">' +
        '        <button' +
        '            class="glyphicon glyphicon-backward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="prev();"></button>' +
        '        <input' +
        '            ng-model-options="{ updateOn: \'blur\', getterSetter: true }"' +
        '            type="number"' +
        '            ng-model="data.$$currentPageNo"' +
        '            style="font-size: 12pt; height: 29px; line-height: 25px; border-radius: 0px; width: 80px; text-align: center;"' +
        '            ng-blur="page()"' +
        '            max="100000"' +
        '            onmousewheel="return false;"' +
        '            ng-model-onblur />' +
        '        <button' +
        '            class="glyphicon glyphicon-forward"' +
        '            style="top: 0px; line-height: 25px; cursor: pointer; background-color: Transparent; border: none;"' +
        '            ng-disabled="ajaxing"' +
        '            ng-click="next();"></button>' +
        '        <span style="text-align: right; height: 0px; line-height: 25px; position: relative; color: #157ab5;">Total: {{data.totalCount}} 筆, Page 共: {{data.totalPage}} 頁</span>' +
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
.run(['$templateCache', function($templateCache){
    $templateCache.put('world.svg',
        '<svg version=\"1.1\"\
              xmlns=\"http:\/\/www.w3.org\/2000\/svg\"\
              xmlns:xlink=\"http:\/\/www.w3.org\/1999\/xlink\"\
              x=\"0px\"\
              y=\"0px\"\
              width=\"100%\"\
              height=\"100%\"\
              viewBox=\"30.767 241.591 784.077 458.627\"\
              id=\"world-map\">\
            <title>Simple World Map<\/title>\
            <desc>\
                Author: Al MacDonald\
                Editor: Fritz Lekschas\
                License: CC BY-SA 3.0\
                ID: ISO 3166-1 or \"_[a-zA-Z]\" if an ISO code is not available\
            <\/desc>\
            <defs>\
                <linearGradient id=\"grad\" x1=\"0%\" y1=\"0%\" x2=\"0%\" y2=\"100%\">\
                    <stop offset=\"0%\" stop-color=\"#111\" \/>\
                    <stop offset=\"100%\" stop-color=\"#333\" \/>\
                <\/linearGradient>\
            <\/defs>\
            <g fill=\"url(#grad)\">\
                <path id=\"mx\" d=\"M133.847,433.982l4.175,13.146l-1.945,1.089l0.216,2.61l3.674,2.827v5.229l4.538,4.356l-1.945-12.847l-2.593-8.497l0.648-5.877l2.161,0.217l0.865,1.962l-0.865,5.005l11.237,21.99v7.841l9.077,10.666l9.94,4.573l4.106-2.396l5.835,4.789l3.458-3.483l-1.513-3.925l4.97-1.521l1.513,0.873l1.513-1.521h2.377l4.322-7.624l-2.161-1.962l-8.428,1.962l-1.945,5.662L182.106,480l-5.834-2.396l-2.593-8.271l1.962-10.434l-4.011-2.498l-1.91-10.02l-1.599-0.683l-2.922,2.965l-3.354-1.789l-1.313-6.682l-13.286-1.393l-6.863-5.16L133.847,433.982L133.847,433.982z\"\/>\
                <path id=\"dz\" d=\"M424.625,435.764l-3.526-1.186l-14.677,2.758l-3.198,2.429l1.953,10.088l-5.835,0.233l-3.509,5.646l-8.359,2.005l0.025,4.105l27.532,21.048l4.692,0.398l15.654-12.231l-1.565-1.971l-2.938-0.398l-1.764-2.955V453.5l-1.177-1.184l0.199-3.155l-3.13-3.155l-0.389-3.354l1.366-0.986l-0.59-3.553L424.625,435.764L424.625,435.764z\"\/>\
                <path id=\"ma\" d=\"M402.505,439.903h-9.982l-1.954,4.339l-4.504,2.17l-3.719,10.062l-7.243,4.341l-10.174,16.761l9.983-0.199l0.389-4.927h2.541v-6.708h8.81l0.196-8.679l8.42-1.972l3.526-5.723l5.48-0.198L402.505,439.903L402.505,439.903z\"\/>\
                <path id=\"mr\" d=\"M364.998,478.266l1.885,2.463l-0.389,10.65l2.74-1.972l1.952-0.397l2.741,0.985l3.128,4.34l2.939-1.971l14.288-0.199l-3.526-23.866l3.786-0.018l-7.054-5.402l0.009,3.51l-8.93,0.01l-0.043,6.698l-2.567-0.009l-0.328,4.944L364.998,478.266L364.998,478.266z\"\/>\
                <path id=\"gm\" d=\"M366.719,497.006l-0.111,0.959l5.98-0.086l0.304-0.891l-0.13-0.898l-1.721,0.7L366.719,497.006L366.719,497.006z\"\/>\
                <path id=\"sn\" d=\"M372.424,498.771l-5.792-0.141l0,0l1.072,2.603l0.596-1.607l7.271,0.761l0.806-0.028l3.405,0.12l0.121-1.504l-3.111-3.733l-3.467-4.693l-2.152-0.898l-1.661,0.424l0,0l-3.405,2.472l-0.776,1.384l-0.242,1.383l1.253,0.899l4.185-0.061l2.688-0.728l0.303,1.322l-0.241,1.746L372.424,498.771z\"\/>\
                <path id=\"gw\" d=\"M368.196,502.356l1.211,2.395l3.396-2.922l0.035-0.899l-4.003-0.579L368.196,502.356L368.196,502.356z\"\/>\
                <path id=\"gn\" d=\"M369.77,505.304l2.629,4.046l3.423-2.974l3.511-0.155l2.922,3.881l2.48,1.635l0.933-1.816l0.83-0.466l-0.061-3.993l-1.65-4.737l-5.065,0.562l-6.267-0.501l-0.034,1.606L369.77,505.304L369.77,505.304z\"\/>\
                <path id=\"sl\" d=\"M372.804,509.79l4.884,4.72l3.483-4.227l-2.179-3.415l-3,0.303L372.804,509.79L372.804,509.79z\"\/>\
                <path id=\"lr\" d=\"M378.198,515.027l9.491,6.345l-0.227-4.805l-2.869-3.38l-2.801-2.481L378.198,515.027L378.198,515.027z\"\/>\
                <path id=\"ci\" d=\"M388.484,521.562l3.697-2.617l4.6-0.806l4.693,1.013l-2.395-3.622l-0.701-2.213l0.701-6.544l-4.192,0.198l-1.9-1.814l-3.994,0.104l-1.901,0.304l0.198,4.425l-1.002,0.406l-1.203,2.215l3.095,3.62L388.484,521.562L388.484,521.562z\"\/>\
                <path id=\"ml\" d=\"M377.584,494.845l2.662-1.823l14.799-0.087l-3.423-23.806l3.907-0.112l18.903,14.428l2.541,0.362l-0.959,8.021l-11.886,1.08l-9.171,6.847l-1.669,4.686l-6.37,0.269l-1.625-4.677l-4.884,0.346l0.189-1.53L377.584,494.845L377.584,494.845z\"\/>\
                <path id=\"bf\" d=\"M404.493,493.496l3.146-0.25l5.16,7.295l-4.789,3.613l-3.466-0.892l-4.66,0.062l-0.752,2.73l-3.907,0.19l-1.071-1.461l1.385-4.442L404.493,493.496L404.493,493.496z\"\/>\
                <path id=\"ne\" d=\"M413.396,500.17l2.204-0.053l1.988-2.981l3.336-0.597l3.553,2.17l7.58,0.216l5.861-2.386l2.204-1.894l0.164-2.489l4.088-4.123l1.08-9.104l-2.688-5.636l-6.88-1.677l-15.923,12.413l-2.256-0.217l-0.969,8.617l-8.124,0.813L413.396,500.17L413.396,500.17z\"\/>\
                <path id=\"gh\" d=\"M399.091,513.179l0.968,2.273l2.524,3.959l1.4-0.052l3.819-2.171l-0.268-12.354l-2.957-0.864l-4.141,0.112L399.091,513.179L399.091,513.179z\"\/>\
                <path id=\"tg\" d=\"M408.495,516.81l2.316-1.356l-0.053-8.946l-1.504-2.438l-0.967,0.812L408.495,516.81L408.495,516.81z\"\/>\
                <path id=\"bj\" d=\"M411.512,515.288h1.833l0.104-5.204l2.315-3.363l-0.104-5.852l-2.102-0.052l-3.604,2.816l1.504,2.87L411.512,515.288L411.512,515.288z\"\/>\
                <path id=\"ng\" d=\"M413.984,515.185l3.389,0.164l4.088,4.557l1.987,0.544l1.558-0.761l2.367-0.328l0.805-3.303l3.225-2.117l3.492-0.163l6.396-11.766l-0.104-2.653l-2.955-2.273l-5.913,2.603l-7.909-0.111l-3.77-2.386l-2.688,0.596l-1.4,2.438l-0.104,6.88l-2.256,3.198L413.984,515.185L413.984,515.185z\"\/>\
                <path id=\"tn\" d=\"M425.516,435.624l4.78-1.927l1.572,1.02l0.061,1.244l-0.734,0.959l0.111,1.703l0.735,0.396v3.061l-0.847,1.418l0.111,0.908l3.207,1.132l-2.584,4.02l-1.012-0.061l-0.173,3.232l-1.124,0.174l-0.959-0.849l0.225-3.284l-3.146-3.061l-0.397-2.662l1.521-1.192L425.516,435.624L425.516,435.624z\"\/>\
                <path id=\"ly\" d=\"M429.958,453.518l1.35-0.225l0.397-3.112h0.674l2.758-4.528l6.804,1.979l1.856,2.887l6.69,3.062l3.482-1.47l-0.338-1.471l-1.521-1.469l0.173-1.021l2.473-2.093h4.894l1.856,2.489l3.934,0.57l0.511,31.889l-2.922-0.112l-17.651-9.181l-1.91,1.081l-7.253-1.814l-1.971-2.603l-2.87-0.397l-1.458-2.603L429.958,453.518L429.958,453.518z\"\/>\
                <path id=\"eg\" d=\"M466.16,449.222l2.308,0.062l4.495,1.244l2.135,0.061l2.646-2.213h1.234l2.249,1.245h2.845l0.51-0.035l1.798,5.17l0.51,1.668l0.477,2.498l-0.85,0.622l-1.461-0.734l-1.686-5.498l-1.521-0.111l-0.111,1.867l1.012,3.232l8.1,10.027l0.173,4.305l-2.359,2.723l-22.163-0.251L466.16,449.222L466.16,449.222z\"\/>\
                <path id=\"td\" d=\"M440.971,494.983l0.112-2.552l4.098-3.983l1.099-9.785l-2.731-5.221l1.911-0.979l18.498,9.639l-0.113,9.456l-3.259,2.775v4.875l2.136,4.132h-3.77l-6.24,6.173l-0.165,1.867l-4.605-0.061l-0.061,0.846l-2.628-0.345l-1.798-3.397l-1.351-0.666l0.174-1.037l1.693-1.297v-6.066l-2.343-0.363l-2.826-2.102L440.971,494.983L440.971,494.983L440.971,494.983z\"\/>\
                <path id=\"ss\" d=\"M489.336,508.019l-2.04,0.898l0.647,3.553h2.542l3.448,5.004l-2.767,0.354l-0.709,1.288l-0.069,1.857l-8.298-0.146l-0.848-1.288l-5.8-0.328l-10.649-10.962l1.063-0.64l4.517-1.364l9.897,0.754l3.366-0.754l2.235-2.996L489.336,508.019z\"\/>\
                <path id=\"sd\" d=\"M466.144,505.035l-2.55-1.504l-2.325-4.59l0.13-4.271l3.224-2.772l0,0l0.155-10.228l2.127,0.062l-0.242-5.68l22.302,0.198l3.189-3.215l6.881,11.004l-3.77,4.442v6.785l-4.599,9.891l-1.04,2.3l-3.709-5.316l-2.708,3.441l-3.059,0.834l-9.941-1l-4.333,1.541L466.144,505.035z\"\/>\
                <path id=\"cm\" d=\"M428.031,519.428l2.783,2.561l-0.199,3.959l15.266-0.354l1.245-1.399l-4.375-4.711l-0.648-1.703l2.784-5.212l-1.893-3.458l-1.591-0.855v-1.755l1.841-1.202l0.104-5.463l-1.46-0.164l-0.024,2.87l-6.414,11.972l-3.925,0.199l-2.688,1.85L428.031,519.428L428.031,519.428z\"\/>\
                <path id=\"er\" d=\"M496.224,493.859l-0.216-5.093l3.423-3.992l0.926,0.709l1.686,5.637l8.091,6.023l-1.47,1.808l-5.922-5.091L496.224,493.859L496.224,493.859z\"\/>\
                <path id=\"dj\" d=\"M508.991,499.771l-0.493,2.903l3.424-0.052l0.052-4.271l-1.253-0.77L508.991,499.771L508.991,499.771z\"\/>\
                <path id=\"et\" d=\"M489.982,508.606l6.292-14.005l6.25,0.035l5.541,4.814l-0.39,3.968h4.296l0.44,2.386l6.95,4.157l4.286,0.217l-8.15,8.756l-11.194,3.449h-2.773l-4.944-4.219l-1.953-0.82l-3.786-5.576l-2.499,0.035l-0.294-2.559L489.982,508.606L489.982,508.606z\"\/>\
                <path id=\"_somaliland\" d=\"M512.674,502.797l3.526,2.403l1.046-0.052l8.757-3.008l0.994,3.206l-0.701,2.706l-1.893,1.503l-4.729-0.302l-6.769-4.158L512.674,502.797L512.674,502.797z\"\/>\
                <path id=\"so\" d=\"M526.703,501.941l3.777-1.452l1.34,0.804l-0.147,3.354l-3.482,9.923l-18.854,20.19l-2.187-1.503l-0.147-8.521l2.835-3.26l6.018-1.857l8.824-9.318l2.31-2.058l0.647-3.008L526.703,501.941L526.703,501.941z\"\/>\
                <path id=\"cf\" d=\"M443.452,519.229l4.028,4.356l1.59-2.057l2.532,0.104l0.544-2.006l2.49-1.556l5.169,3.562l2.982-2.956l11.574,0.51l-10.736-11.082l1.443-0.897l0.198-1.954l-2.438-1.149h-3.58l-5.766,5.715l-0.197,2.351l-4.573-0.146l-0.146,1.003l-2.982-0.305l-2.688,5.108L443.452,519.229L443.452,519.229z\"\/>\
                <g id=\"st\">\
                    <path d=\"M421.911,530.554l0.993-0.502l0.743,0.604l-0.743,1.148l-0.899-0.354L421.911,530.554L421.911,530.554z\"\/>\
                    <path d=\"M423.907,527.398l1.496-0.251l0.501,0.951l-0.743,0.805l-0.743-0.104L423.907,527.398L423.907,527.398z\"\/>\
                <\/g>\
                <path id=\"ga\" d=\"M435.438,526.646l-0.104,2.151l-4.875-0.104l-2.982,5.766l7.012,7.667l1.736-1.453l-0.052-1.503l-1.192-0.554v-1.057l2.688-1.701l2.387,1.807l2.638,0.052l-0.054-9.067l-4.176-0.196l-0.052-1.903L435.438,526.646L435.438,526.646z\"\/>\
                <g id=\"gq\">\
                    <path d=\"M427.184,522.134l-0.396,1.703l1.191,0.648l1.143-0.855l-0.397-1.755L427.184,522.134L427.184,522.134z\"\/>\
                    <path d=\"M430.771,526.697l-0.054,1.202l3.924,0.198l-0.052-1.356L430.771,526.697L430.771,526.697z\"\/>\
                <\/g>\
                <path id=\"cg\" d=\"M439.424,526.551l-0.052,1.255l4.131,0.104l0.146,10.728l-3.777-0.104l-2.187-1.703l-1.693,0.951l-0.078,0.476l0.873,0.423l0.251,2.204l-2.334,2.006l0.501,1.057l2.585-2.006h1.244l0.396,1.2l1.644,0.7l5.271-4.46l-0.104-3.259l1.099-2.653l3.38-2.507l0.907-8.479l-2.402,0.009l-2.783,3.812L439.424,526.551L439.424,526.551z\"\/>\
                <path id=\"cd\" d=\"M438.023,546.597l8.912-0.155l1.808,2.567l-0.069,1.893l0.665,0.605h4.426l1.271-2.499h1.808l0.734,0.742l2.479-0.069l0.735,8.714l4.287,0.139v0.675l11.521,5.195l0.536,1.012h2.411l-0.268-3.648l-4.356-2.092l0.269-2.766l1.876-4.392l4.287-0.139l-3.683-12.224l0.068-5.195l5.826-9.11l0.068-1.278l-0.874-0.477l0.035-2.472l-1.062-0.095l-1.072-1.366l-17.59-0.795l-3.226,3.138l-5.28-3.475l-1.858,1.141l-1.348,11.35l-3.337,2.575l-1.003,2.283l0.179,3.381l-6.017,4.918l-1.6-0.726l0.216,0.94L438.023,546.597L438.023,546.597z\"\/>\
                <path id=\"rw\" d=\"M479.896,532.931l2.429,2.238l-0.104,2.396l-3.769,0.077v-2.646L479.896,532.931L479.896,532.931z\"\/>\
                <path id=\"bi\" d=\"M478.504,538.385l3.691-0.078l-0.959,3.232l-0.935,0.812h-1.142l-0.812-2.187L478.504,538.385L478.504,538.385z\"\/>\
                <path id=\"ug\" d=\"M480.311,532.23l2.619,2.454l1.643-1.045l4.442-0.728l0.762,0.079l0.284-1.688l2.508-5.272l-2.109-4.392l-6.837,0.044l-0.043,1.808l0.917,0.882l-0.139,1.807L480.311,532.23L480.311,532.23z\"\/>\
                <path id=\"ke\" d=\"M491.142,521.365l2.3,4.484l-2.759,5.783l-0.361,1.754l13.77,8.516l4.271-6.708l-2.161-1.754l-0.043-8.835l2.705-2.956l-4.313,1.435l-3.259,0.044l-5.1-4.305l-1.608-0.692l-2.98,0.276l-0.526,0.883L491.142,521.365L491.142,521.365z\"\/>\
                <path id=\"tz\" d=\"M490.916,560.177l15.102-1.851l-3.396-6.569l-0.182-6.292l1.099-3.009l-14.367-9.023l-4.503,0.743l-1.564,1.158l-0.139,2.637l-1.012,3.656l-1.054,1.253l-1.514,0.14l2.896,10.033l4.729,2.223l3.259,0.095L490.916,560.177L490.916,560.177z\"\/>\
                <path id=\"zm\" d=\"M459.78,571.656l2.739,3.802l4.244,0.261l1.504,0.829l4.443,0.053l3.829-5.367l10.702-4.789l0.934-4.219l-1.244-6.043l-5.584-3.181l-3.727,0.26l-1.857,4.114l0.053,1.876l4.391,2.136l0.26,4.642l-3.775,0.208l-0.935-1.564l-10.495-4.479l-0.311,3.44l-4.962,0.155L459.78,571.656L459.78,571.656z\"\/>\
                <g id=\"ao\">\
                    <path d=\"M435.577,544.453l1.504,1.953l1.945-1.842l-0.571-1.909l-0.483-0.035L435.577,544.453L435.577,544.453z\"\/>\
                    <path d=\"M437.366,547.461l2.948,11.003l-0.069,3.478l-4.313,4.633l-0.647,7.527l16.597,0.147l5.395,1.954l4.45-0.58l-2.594-3.251l0.01-9.282l5.101-0.217v-3.621l-4.142-0.172l-0.829-8.575l-1.746,0.024l-0.943-0.848l-1.027,0.054l-1.365,2.646h-5.255l-1.22-1.227l0.363-1.738l-1.436-2.101L437.366,547.461L437.366,547.461z\"\/>\
                <\/g>\
                <path id=\"mw\" d=\"M487.969,567.074l2.688,2.81l-0.052,3.597l0.519,1.513l3.57-3.855l-0.414-4.9l-1.911-1.46l-1.702-8.602l-2.948-0.104l1.34,6.197L487.969,567.074L487.969,567.074z\"\/>\
                <path id=\"mz\" d=\"M482.791,596.359l2.325,1.928l5.479-3.335l0.882-4.953v-8.178l8.791-7.191l1.505,0.053l5.323-5.108l-0.829-10.529l-14.115,1.781l0.415,3.181l2.429,1.876l0.57,5.731l-4.755,4.642l-1.141-2.603l0.207-3.44l-2.74-2.973l-6.725,3.13l6.258,3.182l0.208,9.274l-4.141,6.146L482.791,596.359L482.791,596.359z\"\/>\
                <path id=\"zw\" d=\"M468.52,578.226l7.755,8.757l5.946,1.513l3.984-6.248l-0.312-8.281l-6.465-3.337l-2.431,1.098l-3.62,5.524l-5.014-0.053L468.52,578.226L468.52,578.226z\"\/>\
                <path id=\"na\" d=\"M444.221,603.863l2.897,0.208l1.702,1.72l4.037,0.052l0.984-11.462v-7.503l2.585-0.52l0.986-7.867l6.569-0.206l2.323-1.927l-3.933-0.156l-5.325,0.726l-5.739-2.082h-16.13l0.415,4.58l5.376,7.918l-0.934,4.062l0.053,2.136L444.221,603.863L444.221,603.863z\"\/>\
                <path id=\"bw\" d=\"M454.56,594.589l1.858,0.57l-0.26,5.314l1.911,0.26l4.391-3.959l5.273,0.57l1.399-3.545l6.673-6.095l-8.013-9.223l-0.104-1.514l-0.883-0.26l-2.43,2.24l-6.31,0.154l-0.884,7.866l-2.479,0.57L454.56,594.589L454.56,594.589z\"\/>\
                <path id=\"sz\" d=\"M482.531,596.983l-2.169,0.361l-0.935,2.552l1.659,1.513h2.015l1.702-2.446L482.531,596.983L482.531,596.983z\"\/>\
                <path id=\"ls\" d=\"M470.896,606.829l2.637-2.032l1.245,0.053l1.503,1.875l-0.155,1.877l-2.533,0.934v0.728l-2.792-0.156l-0.674-2.031L470.896,606.829L470.896,606.829z\"\/>\
                <path id=\"za\" d=\"M476.731,588.02l-6.829,6.311l-1.625,3.898l-5.411-0.674l-4.503,4.002l-2.991-0.294l0.241-5.531l-1.062-0.372l-0.743,11.314l-5.308-0.052l-1.6-1.886l-2.344-0.024l2.137,6.129l3.812,3.604l-2.723,3.172l1.764,3.977l4.08,1.558l3.25-2.767l9.311,0.053l0.667-0.83l4.132-0.728l13.978-13.917l-0.053-4.382l-1.495,1.937h-2.238l-2.723-2.282l1.383-3.44l2.378-0.482l-0.217-7.071L476.731,588.02L476.731,588.02z M473.455,604.011l1.306-0.052l2.118,2.299l-0.061,2.662l-2.481,1.253l-0.155,0.883l-3.785,0.043l-1.186-2.853l1.081-2.092L473.455,604.011L473.455,604.011z\"\/>\
                <g id=\"gl\">\
                    <path d=\"M292.587,282.398l-1.176,1.877l2.118,2.117l-0.942,2.118l3.06,3.994l3.761-1.176l4.936-0.466l5.644,6.111l3.761,10.104l-3.051,6.345l4.227-0.708l2.354,1.409l0.232,3.06l-5.168,0.233l2.818,2.817l3.526,0.709l-7.754,10.339l-0.942,6.345l1.643,5.169l-1.176,3.06l2.118,6.578l3.993,4.469l1.176-0.232l2.584-0.709l0.233,3.76l1.642,2.352l3.052-0.234l2.353-8.695l7.053-8.697l10.581-4.227l6.578-8.229l3.05,1.408h6.345l5.17-5.168l6.346-2.584l0.708-3.994l-3.993-3.527l-3.526-1.175l-1.885-4.937l4.469-2.584l7.054,3.76l2.353-2.584l-3.761-2.117l7.996-10.813l-1.409-4.702l-3.761-0.232l1.408-4.228l4.703-2.118l9.637-8.461l-2.816-3.053l-10.814,0.941l-5.645,5.646l3.295-7.287l-3.762-0.942l-2.117,3.761l-3.051-2.585l-8.464,0.941l2.353-3.76l13.865-0.467l-3.527-4.702l-15.04-2.817l-6.11,0.941l0.233,3.061l-6.345-2.118l0.232-2.118l-4.47,0.941l-0.942,2.353l4.703,1.642l-4.936,3.527l-3.527-3.994l-4.936-1.408l-0.709,3.76h-4.937l-1.885-3.994l-7.754-1.176l-4.228,2.117l-0.233,2.818l-5.402-0.709l-3.294,1.409l0.234,3.293v1.644l-6.111,1.176l-2.818-1.877l-1.885,3.052l2.819,3.06l5.878-0.709l0.467,1.885l-4.469,2.118L292.587,282.398L292.587,282.398z\"\/>\
                    <path d=\"M311.396,319.066l1.409,2.119l-0.708,2.584h-1.409l-1.885-2.119l0.467-1.643L311.396,319.066L311.396,319.066z\"\/>\
                    <path d=\"M370.159,313.189l3.993,1.176l-0.234,3.293l-4.227-2.118l-0.942-1.176L370.159,313.189L370.159,313.189z\"\/>\
                <\/g>\
                <g id=\"au\">\
                    <path d=\"M672.961,609.067l-0.303,21.938l-3.371,2.472l-0.303,2.161l4.598,3.086l11.35-2.161h5.826l2.145-3.095l12.879-2.472l9.198,2.784l-0.614,3.708l1.228,3.708l7.055-1.236l0.303,1.851l-4.599,3.396l1.53,1.236l3.37-1.236l-0.917,10.2l6.44,4.944l3.683-1.236l1.841,1.852l10.735-1.548l10.123-16.381l3.682-0.925l7.357-13.596l1.841-11.739l-4.599-5.869l1.842-1.236l-3.684-11.436l-3.984-2.783l0.614-15.448l-3.684-2.782l-0.916-8.652h-1.842l-6.138,20.392l-3.37,0.312l-7.668-7.728l4.297-11.437l-7.971-1.547l-8.896,2.472l-2.454,7.104l-3.984,0.925l-0.304-4.944l-16.252,9.889l0.304,3.708l-2.454,3.397h-6.139l-13.19,5.56L672.961,609.067L672.961,609.067z\"\/>\
                    <path d=\"M728.775,668.089l-1.531,6.181l0.304,4.322l4.599-0.312l5.213-8.03L728.775,668.089L728.775,668.089z\"\/>\
                <\/g>\
                <g id=\"nz\">\
                    <path d=\"M804.221,655.729l0.917,10.199l-1.228,4.634l-4.6,3.396l0.305,4.02v4.322l1.228,1.548l12.577-10.814v-2.472h-3.068l-4.298-14.521L804.221,655.729L804.221,655.729z\"\/>\
                    <path d=\"M795.023,677.979l2.455,4.633l-6.752,6.492l-0.613,3.396l-4.6,0.613l-7.667,7.104l-7.054-3.396l-0.613-2.474l12.879-5.558L795.023,677.979L795.023,677.979z\"\/>\
                <\/g>\
                <path id=\"nc\" d=\"M798.706,602.576l-0.303,1.547l3.983,5.559l2.145,0.926l0.303-2.161L798.706,602.576L798.706,602.576z\"\/>\
                <path id=\"bn\" d=\"M689.038,515.08l-2.489,3.018l2.04,0.641l1.149-1.608L689.038,515.08L689.038,515.08z\"\/>\
                <g id=\"pg\">\
                    <path d=\"M776.093,540.797l-0.762,1.08l4.159,3.683l0.569,2.161l1.133-0.13l0.13-2.221l-1.263-1.14L776.093,540.797L776.093,540.797z\"\/>\
                    <path d=\"M752.132,540.183l-0.319,21.126l3.044-0.164l4.002-4.676l3.361,0.164l2.161,1.937l0.718,5.964l6.882,3.631l1.763-0.648v-2.179l-5.523-4.599l-2.723-6.293l2.161-1.047l-1.601-3.466l-3.197-0.078l-0.805-3.709l-8.479-5.722L752.132,540.183L752.132,540.183z\"\/>\
                    <path d=\"M778.176,546.008l-0.819,0.191l-0.501,2.222l-1.573,1.021l-4.729,0.83l0.19,1.779l4.979-0.249l3.155-1.972l-0.188-3.432L778.176,546.008L778.176,546.008z\"\/>\
                <\/g>\
                <g id=\"sb\">\
                    <path d=\"M783.786,549.882l1.072,2.981l1.892,1.842l0.57-0.51l-0.189-1.972l-2.145-2.603L783.786,549.882L783.786,549.882z\"\/>\
                    <path d=\"M789.016,554.324l0.131,1.971l1.2,1.141l1.134-0.7l-1.012-2.102L789.016,554.324L789.016,554.324z\"\/>\
                    <path d=\"M790.528,559.218l-1.012,1.081l1.071,1.97l1.262,0.381l-0.06-1.331L790.528,559.218L790.528,559.218z\"\/>\
                    <path d=\"M792.992,558.076l0.882,2.161l1.702,2.03l0.943-1.521l-1.263-2.161L792.992,558.076L792.992,558.076z\"\/>\
                    <path d=\"M797.409,561.317l0.501,2.671l1.203,1.65l1.011-2.092L797.409,561.317L797.409,561.317z\"\/>\
                    <path d=\"M798.792,567.291l-0.44,0.76l1.452,1.911l1.012,0.062l-0.632-2.482L798.792,567.291L798.792,567.291z\"\/>\
                    <path d=\"M795.576,571.094l-1.514,0.7l1.323,1.843l1.133-0.64L795.576,571.094L795.576,571.094z\"\/>\
                <\/g>\
                <g id=\"vu\">\
                    <path d=\"M811.006,582.479l-1.071,1.435l0.45,1.616l0.535,0.362l0.979-1.262L811.006,582.479L811.006,582.479z\"\/>\
                    <path d=\"M811.542,586.879l0.087,1.167l1.158,0.363l0.805-0.449l-0.805-1.264L811.542,586.879L811.542,586.879z\"\/>\
                    <path d=\"M813.236,597.303l-0.536,0.812l0.804,0.897l1.34-0.448L813.236,597.303L813.236,597.303z\"\/>\
                <\/g>\
                <g id=\"ph\">\
                    <path d=\"M697.337,496.306l-0.743,1.418l-0.414,1.746l-4.132,5.246l0.25,1.081l1.737-0.251l5.368-5.999L697.337,496.306L697.337,496.306z\"\/>\
                    <path d=\"M704.027,494.309l-0.088,4.331l1.573,1.582l0.578,3.077l1.574,0.337l0.742-1.919l-1.236-0.916l-0.328-5.411L704.027,494.309L704.027,494.309z\"\/>\
                    <path d=\"M708.496,495.978l-0.087,3.829l0.908,1.495l1.571-1.832l-0.414-3.328L708.496,495.978L708.496,495.978z\"\/>\
                    <path d=\"M709.481,492.641l1.572,2.083l0.743,1.997h1.409l-0.25-3.415l-1.573-1.08L709.481,492.641L709.481,492.641z\"\/>\
                    <path d=\"M712.542,500.472l0.328,2.498l-2.896,2.334l-2.396,0.251l-2.56,2.749l0.087,1.252l2.396-0.751l1.651-1.08l1.408,3.578l2.48,1.747l0.994-0.338l0.907-1.08l-1.979-1.997l1.159-0.916l1.322,1.08l0.906-1.495l-0.906-1.833l-0.164-4.08L712.542,500.472L712.542,500.472z\"\/>\
                    <path d=\"M699.074,475.076l-2.23,1.581l-0.25,4.997l3.477,6.742l1.158,0.915l1.485-1.003l2.56,0.415l0.492,2.248l1.901,0.164l0.908-1.245l-1.158-1.582l-1.409-1.331l-2.974-0.327l-1.573-2.585l1.816-2.749l0.163-2.411l-1.236-3.077L699.074,475.076L699.074,475.076z\"\/>\
                    <path d=\"M700.232,489.979l0.657,2.335l1.158,0.752l0.83-1.081l-1.323-1.832L700.232,489.979L700.232,489.979z\"\/>\
                <\/g>\
                <path id=\"tw\" d=\"M695.686,453.76l-3.06,2.334l-0.163,4.494l2.646,3.078l0.656-0.58L695.686,453.76L695.686,453.76z\"\/>\
                <g id=\"jp\">\
                    <path d=\"M709.317,426.193l-1.41,1.418l0.579,1.996l1.236,0.086l0.83,4.332l0.993,1.08l1.738-1.582l0.151-4.773l-2-2.125L709.317,426.193L709.317,426.193z\"\/>\
                    <path d=\"M716.688,422.188l-2.659,2.156l-0.591,2.719l1.812,1.25l2.625-2.75l0.37-3.062L716.688,422.188z\"\/>\
                    <path d=\"M713.613,418.033l-4.219,4.832v2.322l2.604-0.312l4.085-3.592l2.731-0.502l0.663,0.779l0.015,2.377l0.688,1.25h1.255l1.763-2.158l0.743-2.836l3.552-0.086l3.476-4.166l-1.814-6.916l-0.83-3.664l1.815-1.496l-4.133-6.241l-0.944-0.744l-1.875,0.744l-0.481,2.584v2.083l0.994,1.167l0.328,5.498l-2.56,3.164l-1.485-0.917l-1.159,2.584l-0.251,2.412l0.909,1.418l-0.579,1.08l-1.902-1.582h-1.322l-1.157,0.666L713.613,418.033L713.613,418.033z\"\/>\
                    <path d=\"M720.729,380.396l-1.321,1.168l0.665,2.498l1.158,1.166l-0.086,3.83l-1.487,0.578l-1.158,2.584l3.388,4.659l2.23-0.752l0.415-1.167l-2.396-2.161l1.487-1.919l1.572,0.25l3.43,2.305l0.37-2.584l1.63-2.979l2.281-2.312l-2.469-1.125l-0.944-1.801l-1.236,0.83l-1.071,1.331l-2.316-0.501l-2.396-1.582L720.729,380.396L720.729,380.396z\"\/>\
                    <path d=\"M733.201,377.812l-2.317,3.25l0.164,1.582l1.158-0.502l2.723-3.414L733.201,377.812L733.201,377.812z\"\/>\
                    <path d=\"M736.261,373.066l-0.829,2.248l0.086,1.496l1.409-0.918l1.322-2.662v-0.994L736.261,373.066L736.261,373.066z\"\/>\
                <\/g>\
                <path id=\"mu\" d=\"M544.89,584.008l-1.312,1.721l0.259,1.857l2.768-2.256L544.89,584.008L544.89,584.008z\"\/>\
                <path id=\"mg\" d=\"M526.988,561.474l-1.842,4.374l-3.154,5.566l-5.523,0.396l-2.369,2.783l0.397,8.488l-3.423,3.977l0.396,6.761l2.897,3.311l3.423-0.396l3.423-2.524l-0.787-3.977l7.894-13.657l-1.582-1.72l1.582-3.312l1.711,0.526l0.526-1.322l-1.582-6.76l-0.924-2.784L526.988,561.474L526.988,561.474z\"\/>\
                <path id=\"km\" d=\"M514.359,560.013l0.396,1.321l1.711,0.269l0.656-1.72L514.359,560.013L514.359,560.013z\"\/>\
                <g id=\"sc\">\
                    <path d=\"M535.676,548.87l-0.525,1.062l1.442,1.192l1.056-1.192L535.676,548.87L535.676,548.87z\"\/>\
                    <path d=\"M543.049,540.919l-1.582,1.062l1.186,1.857h1.582L543.049,540.919L543.049,540.919z\"\/>\
                    <path d=\"M543.706,545.56l-1.055,1.193l0.786,1.192l1.442,0.269l0.13-2.522L543.706,545.56L543.706,545.56z\"\/>\
                <\/g>\
                <g id=\"mv\">\
                    <path d=\"M582.396,516.386l0.26,2.256l1.442,0.527l0.26-1.989L582.396,516.386L582.396,516.386z\"\/>\
                    <path d=\"M584.238,521.156l-0.13,2.784l1.055,0.525l0.925-1.856L584.238,521.156L584.238,521.156z\"\/>\
                    <path d=\"M584.506,526.595l-0.925,0.925l1.056,0.925l1.313-0.925L584.506,526.595L584.506,526.595z\"\/>\
                <\/g>\
                <g id=\"cv\">\
                    <path d=\"M350.01,490.264l-1.642,0.942l1.175,0.941l1.409-0.708L350.01,490.264L350.01,490.264z\"\/>\
                    <path d=\"M354.046,492.165l-1.071,0.951l0.762,1.409l1.832-0.821L354.046,492.165L354.046,492.165z\"\/>\
                    <path d=\"M351.704,494.836l-1.375,0.821l1.479,1.979l1.168-0.612L351.704,494.836L351.704,494.836z\"\/>\
                <\/g>\
                <path id=\"dm\" d=\"M256.23,485.371l-0.761,1.616l0.917,1.228l1.141-0.994L256.23,485.371L256.23,485.371z\"\/>\
                <path id=\"lc\" d=\"M258.746,493.28l-0.614,1.306l0.994,1.071l1.296-0.691L258.746,493.28L258.746,493.28z\"\/>\
                <g id=\"vc\">\
                    <path d=\"M258.823,496.582l-1.063,0.77l0.839,1.539l1.374-0.77L258.823,496.582L258.823,496.582z\"\/>\
                    <path d=\"M257.526,499.573l-0.994,0.994l0.38,0.612h1.219l0.38-1.003L257.526,499.573L257.526,499.573z\"\/>\
                <\/g>\
                <path id=\"tt\" d=\"M258.97,502.572l-0.917,0.847l-0.994,0.155v1.228l1.833,1.687l0.76-1.229l0.458-1.383l-0.156-1.149L258.97,502.572L258.97,502.572z\"\/>\
                <path id=\"pr\" d=\"M249.297,482.068l-2.282-0.77l-1.833,1.149l0.917,1.071l3.121,0.458L249.297,482.068L249.297,482.068z\"\/>\
                <path id=\"do\" d=\"M242.434,481.533l-4.573-2.991l-2.887-1.021l-0.578,5.521l0.578-0.047l0.761,1.461l0.994-1.15l2.896-0.77l2.516,0.536L242.434,481.533L242.434,481.533z\"\/>\
                <path id=\"ht\" d=\"M231.845,477.159l2.974,0.311l-0.354,3.648l-0.294,1.919l-3.466-0.19l-0.614,0.926l-1.063-0.077l-0.38-1.997l3.656-0.304l-0.225-2.073l-1.677-0.691L231.845,477.159L231.845,477.159z\"\/>\
                <g id=\"fk\">\
                    <path d=\"M281.194,678.393l-2.273-0.25l-2.265,1.521l1.642,1.781L281.194,678.393L281.194,678.393z\"\/>\
                    <path d=\"M283.459,677.252l-0.752,2.411l-2.144,1.901l0.13,0.631l3.655-1.4l1.513-1.901L283.459,677.252L283.459,677.252z\"\/>\
                <\/g>\
                <path id=\"is\" d=\"M366.261,340.521l-1.693-0.959l-2.283,1.443l-1.962,1.814l0.052,1.013l2.541,0.319l-0.156,1.815l-0.898,0.908l0.217,0.588l2.541,0.164v2.938l3.656,0.641l2.17,1.229l2.437,0.104l4.186-2.083l3.231-4.271l0.053-2.887l-1.963-1.66l-1.642-1.392l-0.743,0.536l-1.115,1.443l-1.271-0.164l-1.271-1.393l-1.642,0.156l-2.386,1.979l-1.437,1.547l-0.795-0.69l-0.053-1.712l0.795-0.536L366.261,340.521L366.261,340.521z\"\/>\
                <path id=\"lk\" d=\"M603.264,505.399l0.217,2.351l0.216,1.712l-1.271,0.216l0.64,3.848l1.909,1.07l2.966-1.711l-0.847-4.054l0.216-1.495l-2.756-2.559L603.264,505.399L603.264,505.399z\"\/>\
                <path id=\"cu\" d=\"M205.904,469.846v1.1l4.599,0.086l2.169-1.263l0.337,0.926l4.512,1.098l4.011,3.622l-0.917,1.262l0.165,1.436l3.345,0.839l3.345-1.514l1.504-1.513l-2.169-1.098l-11.194-6.569l-3.924-0.424L205.904,469.846L205.904,469.846z\"\/>\
                <g id=\"bs\">\
                    <path d=\"M222.121,463.112l-1.089-0.337l-0.086,2.101l1.34,1.349l0.917-1.349L222.121,463.112L222.121,463.112z\"\/>\
                    <path d=\"M224.29,466.397l-1.504,0.838l1.417,2.021l0.752-1.011L224.29,466.397L224.29,466.397z\"\/>\
                    <path d=\"M229.14,467.91l-1.591-0.087l0.165,1.012l1.167,1.687l1.002-1.099L229.14,467.91L229.14,467.91z\"\/>\
                    <path d=\"M228.388,465.896l-2.593-1.099l-0.501-2.609l1.002-0.425l1.003,2.023l1.002,0.76L228.388,465.896L228.388,465.896z\"\/>\
                    <path d=\"M225.881,460.588l-1.34-0.337l-0.251-1.686l-1.417-0.501l0.917-0.926l1.668,0.588l1.253,0.762L225.881,460.588L225.881,460.588z\"\/>\
                <\/g>\
                <path id=\"jm\" d=\"M221.533,480.798l-3.008,0.761v0.84l1.755,1.011h1.841l1.167-1.349L221.533,480.798L221.533,480.798z\"\/>\
                <g id=\"id\">\
                    <path d=\"M639.517,513.628l-0.241,1.971l5.869,9.862h1.711l12.23,20.461l4.894,0.492l2.445-7.148l-3.916-2.464l-0.734-3.941L639.517,513.628L639.517,513.628z\"\/>\
                    <path d=\"M697.475,540.891l1.954,2.396l-1.271,3.596v0.684h2.887l1.021-8.989l0.934,0.26l1.694,8.212l1.615,0.434l1.53-3.512l-1.53-5.308l-1.271-2.31l3.993-2.911l-0.935-1.288l-3.819,2.48h-1.021l-1.866-2.74l0.597-1.201l3.146-1.539l4.754,1.453l1.444-0.089l3.568-3.335l-1.442-1.451l-3.312,2.565h-2.127l-3.224-1.538l-2.29,0.086l-2.55,4.106l-1.616,7.105L697.475,540.891L697.475,540.891z\"\/>\
                    <path d=\"M718.791,524.805l-1.616,3.935l2.549,3.337h0.849l1.105-2.223l0.597-0.77l-1.105-1.201l-1.617-0.597L718.791,524.805L718.791,524.805z\"\/>\
                    <path d=\"M723.805,537.729l-3.482,0.77l-1.021,1.115l0.847,1.453l2.291-0.855l1.442-0.855l2.126,1.712l0.935-0.771l-1.693-2.057L723.805,537.729L723.805,537.729z\"\/>\
                    <path d=\"M666.045,548.854l-2.377,1.625l0.51,1.364l7.564,1.712l3.82,0.684l1.615,1.712l4.331,0.345l2.04,1.711l1.867-0.432l1.702-1.539l-3.146-1.452l-2.715-2.308l-7.053-1.713L666.045,548.854L666.045,548.854z\"\/>\
                    <path d=\"M690.768,556.295l-1.865,1.029l1.104,1.201l2.715-1.027L690.768,556.295L690.768,556.295z\"\/>\
                    <path d=\"M693.991,555.526l0.338,1.625l1.954,0.51l0.761-0.942l-0.848-1.288L693.991,555.526L693.991,555.526z\"\/>\
                    <path d=\"M698.668,559.805l-2.377,0.347l2.126,1.798h1.694L698.668,559.805L698.668,559.805z\"\/>\
                    <path d=\"M699.342,556.979l-0.511,1.027l3.821,0.596l2.974-1.711l-1.694-0.511l-2.715,0.771l-1.021-0.856L699.342,556.979L699.342,556.979z\"\/>\
                    <path d=\"M711.833,557.583l-4.416,3.683l0.423,0.942l1.866-0.345l2.205-2.059l4.331-0.597l-0.848-1.452L711.833,557.583L711.833,557.583z\"\/>\
                    <path d=\"M734.126,532.446l-3.604,0.406l-2.315,1.693l0.959,1.938l3.925,0.726v0.727l-2.48,2.015l1.201,4.192l1.201,0.078l1.037-4.115h1.919l0.806,4.027l9.361,7.746l0.241,6.051l3.198,3.467l1.442-0.077l0.319-21.369l-5.438-3.785l-5.125,3.467l-1.843,1.132l-3.043-1.937l-0.078-6.128L734.126,532.446L734.126,532.446z\"\/>\
                    <path d=\"M690.689,519.532l-1.997,7.503l-10.831,3.656l-3.241-3.804l-1.573,0.433l2.939,11.34l4.398,0.493l5.869,2.222v2.222l2.688-0.493l3.916-5.42v-4.435l2.204-4.435l2.445,0.491l-2.938-6.163l-0.449-3.968L690.689,519.532L690.689,519.532z\"\/>\
                <\/g>\
                <g id=\"us\">\
                    <path d=\"M74.791,285.234l2.991,5.594l1.919-0.432v-1.938L74.791,285.234L74.791,285.234z\"\/>\
                    <path d=\"M57.926,334.428l-0.147,2.602l1.867-0.432v-1.158L57.926,334.428L57.926,334.428z\"\/>\
                    <path d=\"M55.057,335.586l-3.734,1.885l0.579,2.022l1.435-1.158l2.87-1.306L55.057,335.586L55.057,335.586z\"\/>\
                    <path d=\"M39.541,338.042l-2.584-0.579l-0.432,1.158l0.285,2.169L39.541,338.042L39.541,338.042z\"\/>\
                    <path d=\"M34.078,337.902l-2.446-1.01l-0.865,1.59l1.582,1.591L34.078,337.902L34.078,337.902z\"\/>\
                    <path d=\"M95.485,277.922l-7.252,1.721l1.496,8.168l7.892,2.151l0.423,1.72l-11.73,3.657l-6.613,10.96l2.343,11.609l3.838,2.576l2.991-2.793l0.856,1.721l-3.63,4.296l-14.082,6.449l-8.964,2.151l-0.216,3.225l20.694-6.016l8.532-2.369l7.892-9.674l8.748-5.8l-4.478,7.521l4.91,0.647l8.324-3.656l1.496,6.017l5.757,1.288l5.973,5.8l0.423,4.296l-0.855,1.072l1.063,4.08h1.496l0.216-6.881h1.703l0.423,16.977l4.271-3.657l-2.991-17.625h-4.478l-4.91-6.231l24.108-40.844l-23.892-18.696l-26.667,5.161l-1.063,8.168l5.757,3.439l-2.135,5.594L95.485,277.922L95.485,277.922z\"\/>\
                    <path d=\"M143.589,375.989l-0.865,3.475l-3.017-1.954h-1.504l-0.865,3.691l-10.554,23.65l2.801,20.606l3.449,1.737l0.648,5.645h7.105l6.889,5.204l13.562,1.305l1.504,6.941l2.152,1.521l3.017-3.033l2.369,1.08l2.152,9.976l3.656,2.386l3.017-5.645l9.258-6.726l6.025,2.817l5.169,0.433l0.216-3.25l10.762,0.217l2.152,2.386l0.432,5.42l-1.288,3.034l1.504,5.203h3.233l3.232-4.987l-1.288-2.386l-1.288-5.204l1.936-5.86l8.826-7.59l6.673-1.953l-0.864-6.293l9.258-9.983l9.258-1.521l-1.504-5.193l9.042-5.205v-6.94l-0.865-0.433l-3.233,1.082l-0.432,4.252l-10.745,0.129l-8.419,5.594l-13.217,4.322l-2.109-2.586l5.999-9.076l-2.965-2.826l-2.014-3.838l-4.175-3.354l-4.538-0.38l-8.575-5.852L143.589,375.989L143.589,375.989z\"\/>\
                <\/g>\
                <g id=\"ca\">\
                    <path d=\"M191.105,270.143l0.19,3.475l-6.898,7.148l1.729,5.791l4.979-1.348l2.878-4.253l7.278-2.706l5.938-0.389l-4.599-5.022l-2.299,1.737l-1.729-0.579l-0.959-2.126l-2.109-2.126L191.105,270.143L191.105,270.143z\"\/>\
                    <path d=\"M200.113,259.908l-1.53,2.706l7.477,2.706l2.68-4.055l1.15,2.707h1.919l3.639-4.055l-4.409-1.158l-1.729-1.348l-2.299,2.316L200.113,259.908L200.113,259.908z\"\/>\
                    <path d=\"M213.148,265.318l-5.938,2.508v1.928l7.667,2.896l-1.729,1.928l1.15,2.507l4.789-2.126h4.028l1.919,3.086l3.259-3.285l-0.77-3.095l-2.68,0.968l-0.38-3.863l1.34-2.316h-1.34l-2.109,1.349l-0.959,0.769l0.579,2.707l-1.53,1.158l-2.299-0.19l-0.579-3.476L213.148,265.318L213.148,265.318z\"\/>\
                    <path d=\"M221.005,259.329l-0.579,1.927l3.639,1.738l2.68-1.547l-0.19-1.158L221.005,259.329L221.005,259.329z\"\/>\
                    <path d=\"M223.875,256.044l-2.679,0.968l0.19,1.35l5.938-0.389l-0.19-1.349L223.875,256.044L223.875,256.044z\"\/>\
                    <path d=\"M236.72,259.329l-0.38,1.348l-0.959,1.349v1.929l3.639-0.579l3.83,3.285h1.34v-3.285l-3.83-4.253L236.72,259.329L236.72,259.329z\"\/>\
                    <path d=\"M246.497,263.191l1.53,1.738l-1.34,2.316l0.959,2.507l4.218-2.317v-1.736l-2.49-2.896L246.497,263.191L246.497,263.191z\"\/>\
                    <path d=\"M252.055,258.75l0.19,3.086h5.178l1.34,1.158l-0.19,1.348l-4.599,0.58l3.259,4.443l4.409,0.77l6.128-2.705l-8.817-13.33l-2.68,1.738l0.19,2.316l-3.069-1.158L252.055,258.75L252.055,258.75z\"\/>\
                    <path d=\"M207.399,280.576l-7.278,1.928l-4.219,3.673l0.38,4.054l7.667,2.317l-1.729,3.864l-5.558-3.477l-1.53,2.896l3.639,2.507l-0.19,4.054l5.558,1.547l6.708-0.389l1.149-2.126l4.979,5.601l3.449-1.157l0.579-3.864l2.49,1.737l0.38-3.864l-3.068-1.928l0.19-12.162l-2.68-2.126l-2.87,3.864L207.399,280.576L207.399,280.576z\"\/>\
                    <path d=\"M230.782,289.073l-2.489-1.158l-1.34,1.737l2.68,4.253l0.19,4.054l5.749-3.475v-5.022l2.109-2.126l-2.109-1.547h-3.449L230.782,289.073L230.782,289.073z\"\/>\
                    <path d=\"M243.048,287.335l-4.028,3.285l0.959,4.054h2.49l1.149-2.126l1.729,1.737l1.729-0.19l4.599-3.864L243.048,287.335L243.048,287.335z\"\/>\
                    <path d=\"M242.659,280.956l-0.959,1.928l4.218,1.548l1.15-1.738L242.659,280.956L242.659,280.956z\"\/>\
                    <path d=\"M240.169,273.617l-4.218,0.579l-2.49,2.315l4.599,0.19l-1.34,3.475l0.959,1.548l1.34-0.19l3.259-5.212L240.169,273.617L240.169,273.617z\"\/>\
                    <path d=\"M247.456,272.27l-2.299,0.77l0.38,3.086l3.83,2.507l0.19,1.927l-1.149,1.159l0.579,3.864l14.755,4.823l4.028,1.349l4.028-3.475l-4.789-3.864l-4.409,1.158l-6.128-0.579l-2.299-2.316l-0.579-6.371l-3.83-1.928L247.456,272.27L247.456,272.27z\"\/>\
                    <path d=\"M259.523,292.357l-4.218-0.39l-4.979,1.927l-2.68,3.666l0.769,10.043l8.238,0.39l7.857,3.864l5.559,6.371l4.218-0.19l-1.15,5.981l-3.829,6.371l-4.218,1.926l-3.069-0.578l-1.53-1.348l-2.299,3.086l0.959,3.086l3.259,0.189l4.028-1.928l3.449,8.886l8.626,5.603l5.938-7.529l-4.979-8.108l2.878-3.284l4.028,6.758l7.278-6.371l-1.339-2.896l-4.98,1.548l-3.448-9.466l3.259-5.403l-6.518-6.949l-3.639,2.507l-3.449-7.529l-7.277,0.968l-1.919-9.076l-5.938,4.055l-0.579,5.021h-3.259l0.38-4.443L259.523,292.357L259.523,292.357z\"\/>\
                    <path d=\"M262.021,274.006v1.738l-4.218,0.968l1.149,1.927l4.789,1.928l5.368,0.58l3.831,2.705l3.829-2.127l-2.681-2.705h3.449l2.109-2.316l5.178-0.77v-1.158l-2.878-1.928l0.379-2.127l8.048,1.348l11.886-4.633l-4.41-1.348l1.15-1.547h9.197l1.531-1.547l-18.593-6.569l-4.41-1.547l-4.789,3.476l-5.368-4.443l-2.878-0.19l-0.579,3.675l-3.638-3.285l-4.218,1.349l0.769,2.126l6.328,1.35l-0.38,3.086l3.449,2.125l8.438-2.125l0.19,2.896l-6.898,3.285l-4.218-3.285l-3.83,0.389l3.83,5.411l-1.919,0.969l-2.878-2.508l-2.109,1.348l1.919,3.666h3.259l-0.769,3.475l-2.68-0.389l-3.449-3.674L262.021,274.006L262.021,274.006z\"\/>\
                    <path d=\"M244.941,327.159l-3.657,4.599l-0.225,5.065l3.198-1.841h3.881l2.74,2.533l2.515-2.076L244.941,327.159L244.941,327.159z\"\/>\
                    <path d=\"M289.466,386.977l-9.136,8.748l0.916,2.074l11.186,4.141l1.599-2.758l-0.916-4.599l-3.657,0.458l-2.057-2.299l3.423-3.449L289.466,386.977L289.466,386.977z\"\/>\
                    <path d=\"M151.767,281.182l1.72,2.602l0.864,3.475l4.305,1.081l3.017-3.25l2.585,1.306l7.321,0.647l5.169-2.17l0.864,7.157h3.017v-3.034l3.017,0.216l7.538,8.895l4.953,3.035l-2.584,4.123l1.081,1.081l9.673,1.953l0.216,4.34l2.585,0.433l0.648-6.51l4.089-1.08l3.017,4.556l6.457,3.034l3.233,0.647l2.152-2.602l0.216-4.124l3.873-2.387l1.288,3.476l-3.449,6.077l0.432,3.033l1.937-3.033l3.873-3.475l0.216-4.556l-2.152-3.476l0.648-2.817l5.169-2.603l2.369,1.738l0.432,15.188l3.657-3.25l2.152,1.305l-3.017,5.204l3.873,0.865l5.602-8.679l4.737,4.986l-1.936,8.895l-4.737,2.603l-4.521-2.169l-8.177,1.736l0.864,2.818l-2.152,3.476l-6.673,1.521l-7.538,5.86l-6.673,8.896l-0.864,2.817l4.521,1.737l1.72,4.339l6.241,6.293l9.906,4.339l-2.152,9.975l-0.216,2.818l2.585,1.736l3.449-4.555l0.432-8.679l5.385-0.216l2.584-4.988l0.433-7.589l6.889-13.45l8.609,3.034l4.521,6.293l-1.937,6.292l3.449,1.954l8.394-5.646l2.368,15.404l7.754,9.327l0.216,4.771l-8.609,2.17l-4.088,4.338l-8.609-1.953l-4.305-0.217l-7.538,5.86l4.521-1.081l5.601-1.08l1.081,1.305l-1.504,4.771l0.216,4.34l2.585,1.736l2.584-0.648l1.296-1.953h1.72l-2.801,5.205l-5.385,0.215l-2.368,3.476h-3.017l-0.864-2.603l4.305-4.338l-5.169,1.737l-0.233-7.374l-1.487-0.863l-4.521,1.953l-0.432,3.691h-10.338l-8.832,6.08l-11.842,3.908l-1.288-1.738l5.964-8.902l-3.388-3.261l-2.152-4.132l-4.383-3.346l-4.702-0.389l-8.428-5.904l-61.122-10.043l-1.011-4.142l-5.602-5.204v-4.339l0.865-3.907l-0.433-2.168l-2.152-2.171l-0.432-3.475l5.602-3.908l-3.449-18.653l-4.737-0.217l-4.305-5.645L151.767,281.182L151.767,281.182z\"\/>\
                    <path d=\"M130.684,350.117l-1.47,2.818l0.51,1.996l0.959,0.598l-0.225,0.812l-1.029,0.294l0.294,2.965l1.106,1.115l0.882-0.959l-1.106-2.887l0.657-2.299l1.616-2.152l-1.175-1.997L130.684,350.117L130.684,350.117z\"\/>\
                    <path d=\"M135.542,367.008l-1.323,0.52l2.429,2.818l0.588,3.336l2.429,2.592l2.058-0.371v-3.406l-2.498-1.557L135.542,367.008L135.542,367.008z\"\/>\
                    <path d=\"M268.15,295.833l-1.53,1.547l1.34,2.126l6.328,0.77l-4.028-4.252L268.15,295.833L268.15,295.833z\"\/>\
                <\/g>\
                <path id=\"gt\" d=\"M183.456,491.11l5.126,3.752l5.169-6.423l-0.881-1.331l-1.764-0.062v-3.761l-1.322-0.804l-4.002,1.192l1.53,3.526L183.456,491.11L183.456,491.11z\"\/>\
                <path id=\"hn\" d=\"M194.408,488.742l7.987-0.303l2.369,2.817l-1.478-0.338l-2.844,0.121l-3.717,3.492l-1.59,3.536l-1.046-0.555l-0.009-3.872l-2.299-1.539L194.408,488.742L194.408,488.742z\"\/>\
                <path id=\"sv\" d=\"M189.308,495.217l4.062,2.022l-0.061-3.207l-2.083-1.271L189.308,495.217L189.308,495.217z\"\/>\
                <path id=\"ni\" d=\"M203.216,491.62l1.893,0.381l0.061,3.881l-2.204,6.293l-5.938-0.588l-1.323-3.034l1.764-3.682l3.345-3.112L203.216,491.62L203.216,491.62z\"\/>\
                <path id=\"cr\" d=\"M202.905,502.745l1.202,2.352l0.977,1.297l-1.314,3.898l-2.507-1.764l-4.097-3.752v-2.48L202.905,502.745L202.905,502.745z\"\/>\
                <path id=\"pa\" d=\"M205.68,506.748l-1.262,3.941l4.167,1.079l2.584,0.512l0.441-3.052l2.775-1.4l2.463,1.271l0.968,1.547l1.175-0.138l0.925-2.81l-3.078-1.271l-2.334-1.271l-2.333,1.59l-2.775,1.4l-2.835-1.141L205.68,506.748L205.68,506.748z\"\/>\
                <path id=\"co\" d=\"M234.326,498.251l-1.781-0.182l-11.773,9.707l-1.245,3.414l-1.608,0.182l0.717,7.546l-4.105,10.07l4.46,3.776l5.714,0.363l3.924,5.757l5.705,0.183l-0.182,4.312h2.135l2.316-7.909l-2.144-2.694l0.536-5.031l4.46-0.363l-0.536-11.688l-9.993-3.232l-2.316-6.293L234.326,498.251L234.326,498.251z\"\/>\
                <path id=\"ve\" d=\"M231.5,503.558l0.38,2.239l2.809,0.892l0.64-4.124l2.965-3.068l2.965,3.475l6.82,1.859l5.774-1.211l3.933,4.849l2.965,1.858l-3.25,4.953l1.089,3.752l-1.858,2.299l-1.928,1.616l-4.175-2.102l-0.959,0.969v2.99l3.052,1.452l-2.248,2.43l-2.248,2.43l-2.965-0.242l-2.982-3.275l-0.631-12.326l-10.183-3.476l-1.85-5.42L231.5,503.558L231.5,503.558z\"\/>\
                <path id=\"gy\" d=\"M261.399,510.654l6.241,5.652l-2.481,2.87l-0.199,1.703l3.259,3.362l-0.078,3.232l-5.67,2.16l-3.397-4.59l0.726-5.515l-1.452-4.105L261.399,510.654L261.399,510.654z\"\/>\
                <path id=\"sr\" d=\"M268.384,516.715l1.763,1.616l2.731-1.694l2.49,0.078l-0.32,0.968l-1.046,2.179l-0.164,5.421l-4.97,2.022l0.242-3.476l-3.207-2.991l0.164-1.538L268.384,516.715L268.384,516.715z\"\/>\
                <g id=\"ec\">\
                    <path d=\"M183.533,531.443l-0.536,2.378l-0.994,1.002l0.683,1.228l1.754-0.69l0.838-1.461l-0.536-1.537L183.533,531.443L183.533,531.443z\"\/>\
                    <path d=\"M213.986,529.43l-4.088,2.541l-0.294,3.771l-0.821,1.234l2.576,2.473l-1.115,1.219l0.259,3.113l4.607,1.098l6.976-8.256l-0.017-2.878l-3.345-0.216L213.986,529.43L213.986,529.43z\"\/>\
                <\/g>\
                <path id=\"pe\" d=\"M209.518,541.246l-1.677,1.695l0.113,2.703l14.643,26.694l15.205,9.802l2.351-3.941l0.562-8.669l-1.228-5.402l-4.141-6.984l-2.463,0.786l-1.115,1.236l-4.918-5.636l1.228-6.647l5.705-3.717l-0.449-3.492l-5.809-0.226l-3.017-5.064l-1.677-0.562l0.113,3.044l-7.486,8.895l-5.593-1.349L209.518,541.246L209.518,541.246z\"\/>\
                <path id=\"bo\" d=\"M238.631,561.361l7.114-3.104l2.351,0.226l1.565,6.534l10.839,3.604l1.79,5.523l4.469,0.562l1.902,4.729l-1.34,4.278l-7.27,0.562l-2.68,6.872l-5.705-0.112l-1.79-0.337l-3.293,3.197l-1.625-0.156l-5.593-12.957l1.547-2.316l0.545-9.163l-1.383-5.455L238.631,561.361L238.631,561.361z\"\/>\
                <path id=\"py\" d=\"M267.199,584.458l1.902,2.074l-0.225,4.392l5.48-0.338l4.141,5.299l-0.337,4.729l-2.681,4.054L270,604.893l-0.225-2.256l1.564-3.718l-5.368-3.38h-4.469l-3.354-3.604l2.438-6.968L267.199,584.458L267.199,584.458z\"\/>\
                <path id=\"uy\" d=\"M274.633,612.481l-1.773,1.894l0.735,10.183l5.566,1.615l7.08-7.097L274.633,612.481L274.633,612.481z\"\/>\
                <g id=\"ar\">\
                    <path d=\"M279.05,600.613l1.677,1.571l-6.371,9.467l-2.239,2.479l0.777,10.813l4.918,5.974l-4.132,7.209l-3.129,1.35h-3.579l1.003,5.627l-5.593,1.92l1.34,4.729l-3.354,10.701l4.141,3.38l-2.239,5.515l-3.804,5.975l2.014,4.165l-4.918,0.786l-4.028-4.951l-0.674-15.432l-6.258-26.209l1.893-9.163l-4.028-11.713l2.68-15.204l2.463-2.931l-0.605-2.222l3.164-2.888l7.054,0.483l3.942,4.21l4.555,0.078l4.668,2.853l-1.375,3.217l0.329,3.25l6.612-0.312L279.05,600.613L279.05,600.613z\"\/>\
                    <path d=\"M264.745,687.564l0.225,4.951l3.803-0.337l3.242-2.144l-5.48-1.124L264.745,687.564L264.745,687.564z\"\/>\
                <\/g>\
                <g id=\"cl\">\
                    <path d=\"M261.391,683.51l-3.691,8.109l6.371,0.674l0.112-5.403L261.391,683.51L261.391,683.51z\"\/>\
                    <path d=\"M260.137,682.239l-2.775,3.068l-0.337,3.604l-5.368-3.043l-5.705-8.221l-1.677-2.932l2.351-3.043l-0.225-3.83l-2.68-1.124l-2.126-1.572l0.449-2.144l2.792-0.787l0.562-12.387l-4.356-2.48l-2.844-64.477l0.735-1.278l5.567,12.836l1.781,0.035l0.579,2.049l-2.369,2.868l-2.723,15.448l3.873,11.895l-1.79,9.007l6.31,26.485l0.666,15.49l4.521,5.229L260.137,682.239L260.137,682.239z\"\/>\
                    <path d=\"M241.717,649.833l-1.115,1.686l0.562,2.932l1.115,0.112l0.562-3.718L241.717,649.833L241.717,649.833z\"\/>\
                <\/g>\
                <path id=\"br\" d=\"M286.631,618.464l5.402-10.391l0.198-8.73l10.079-6.501h5.645l4.435-7.512l0.804-14.418l-1.815-3.855l10.684-9.751l0.406-10.761l-14.514-7.105l-17.53-5.48l-8.264-0.812l2.221-4.669l-0.604-7.104l-1.808-0.596l-2.671,5.308l-1.4,1.754l-3.595-1.59l-12.093,4.261l-4.028-5.073l0.648-5.299l-3.804,3.872l-4.201-2.265l-0.424,0.597l0.009,1.841l3.622,1.945l-5.437,5.73l-3.432-0.034l-3.475-3.535l-3.933,0.121l-0.484,4.2l2.256,2.739l-2.663,8.532l-3.112,0.241l-4.953,3.13l-1.21,6.146l4.296,4.599l0.787-0.89l3.017-0.812l2.576,4.34l7.374-3.164l2.861,0.165l1.971,6.976l10.52,3.337l1.815,5.564l4.478,0.537l2.135,5.314l-1.443,4.729l1.884,2.474l-0.276,3.683l5.048-0.477l4.625,5.844l-0.363,4.105l2.74,2.316l-6.57,9.95L286.631,618.464L286.631,618.464z\"\/>\
                <path id=\"bz\" d=\"M191.823,483.228l-0.043,3.154h0.726l2.472-4.615h-1.677L191.823,483.228L191.823,483.228z\"\/>\
                <g id=\"cn\">\
                    <path d=\"M671.802,472.655l-2.064,0.579l-1.487,1.833l1.236,2.411l1.814,0.163l2.066-1.832l0.492-2.411L671.802,472.655L671.802,472.655z\"\/>\
                    <path d=\"M594.498,386.128l-2.99,7.521l-4.124-0.217l-4.349,9.518l3.691,4.701l-7.606,10.504l-3.907-0.658l-2.611,3.285l0.648,1.971l3.043,0.217l1.521,3.5l3.044,0.658l9.344,12.04v6.129l4.563,2.844l4.996-0.873l6.303,3.719l7.605,2.187l3.691-0.439l4.132-0.441l8.687-5.688l2.828,0.44l1.08,2.567l2.396,0.718l3.26,4.813l-2.17,4.814l1.306,3.285l3.69,1.312l0.647,3.942l4.35,0.439l0.647-1.971l6.302-3.285l3.907,0.217l4.563,5.03l3.043-1.312l1.954,0.216l0.873,2.412l1.521,0.216l2.169-3.06l8.688-3.285l7.823-9.413l2.61-8.974l-0.217-5.912l-3.259-0.656l1.953-2.188l-0.434-3.501l-8.255-8.314v-4.157l2.386-3.062l2.388-1.098l0.216-2.412h-6.085l-1.089,3.285l-2.828-0.656l-3.475-3.718l2.17-5.688l3.043-3.285l2.827,0.217l-0.434,5.031l1.521,1.313l3.691-3.717l1.306-0.216l-0.433-2.844l3.476-4.158l2.61,0.216l1.521-4.813l1.781-0.942l0.182-3l-1.729-1.815l-0.147-4.736l3.329-0.217l-0.216-12.214l-2.334,1.4L694.267,377l-3.897-0.009l-11.298-6.354l-8.16-9.837l-8.281-0.086l-2.107,1.833l2.68,6.137l-0.935,5.758l-3.335,1.383l-1.876-0.147l-0.139,5.696l1.954,0.441l3.476-1.53l4.563,2.187v2.188l-3.26,0.216l-2.611,5.688l-2.386,0.215l-8.472,11.16l-8.902,3.941l-6.086,0.441l-4.124-2.844l-5.869,3.068l-6.302-1.971l-1.521-4.158l-10.642-0.657l-5.646-9.188h-2.386l-1.92-4.262L594.498,386.128z\"\/>\
                <\/g>\
                <path id=\"mn\" d=\"M597.438,386.215l5.03-6.673l6.043,2.792l4.105,1.098l5.03-4.615l-3.414-2.517l2.248-3.172l6.707,2.369l2.325,3.812l4.199,0.112l2.196-1.634l4.521-0.182l0.985,1.678l7.512,0.38l4.754-4.849l6.578,0.69l-0.38,6.604l2.879,0.656l3.535-1.606l3.743,1.85l-0.088,0.935l-2.714,0.078l-2.827,5.93l-2.195,0.216l-8.54,11.16l-8.723,3.847l-5.455,0.424l-4.529-2.923l-5.791,3.095l-5.705-1.771l-1.617-4.141l-10.805-0.762l-5.532-9.377l-2.688-0.174L597.438,386.215L597.438,386.215z\"\/>\
                <path id=\"kp\" d=\"M687.751,407.047l1.59,0.666l0.484,5.566l3.155,0.183l2.974-3.483l-1.029-0.916l0.121-3.734l2.731-3.303l-1.392-2.506l0.908-1.039l0.501-2.592l-1.582-0.719l-1.35,0.684l-1.668,5.064l-2.697-0.232l-3.12,3.682L687.751,407.047L687.751,407.047z\"\/>\
                <path id=\"kr\" d=\"M696.446,410.443l5.342,4.356l0.909,4.22l-0.183,2.264l-2.61,2.939l-2.248,0.12l-2.551-5.506l-0.968-2.629l1.028-0.795l-0.242-1.099l-1.271-0.569L696.446,410.443L696.446,410.443z\"\/>\
                <path id=\"kz\" d=\"M513.495,402.163l3.544-1.513l3.959-0.139l0.276,6.051h-2.317l-1.772,2.888l2.317,3.847l3.414,1.928l0.311,2.205l1.255-0.416l1.157-1.375l1.91,0.416l0.96,1.928h2.455v-2.473l-1.504-4.4l-0.684-3.569l4.364-1.929l5.869,0.959l3.684,3.709l8.323-0.821l4.644,6.597l5.455,0.274l1.504-2.472l1.91-0.416l0.274-2.748l2.862-0.139l1.503,1.789l1.505-3.57l12.957,1.789l2.179-2.887l-3.683-4.537l4.91-10.719l3.958,0.275l2.731-6.594l-5.455-0.554l-3.138-3.024l-8.644,1.002l-11.134-10.762l-3.926,3.482l-11.902-5.402l-14.601,7.148l-0.405,5.083l3.413,3.985l-6.655,3.76l-8.636-0.19l-1.807-2.653l-6.769-0.373l-6.414,4.123l-0.14,5.638L513.495,402.163L513.495,402.163z\"\/>\
                <path id=\"tm\" d=\"M528.328,418.561l-0.535,2.273h-3.588v3.078l3.854,2.541l-1.191,3.482v1.608l1.599,0.269l2.127-2.811l4.789-1.07l10.234,3.881l0.129,2.809l5.714,0.536l6.38-6.698l-0.796-2.145l-4.253-0.935l-11.964-7.771l-0.535-2.81h-4.521l-1.997,3.753h-1.997L528.328,418.561L528.328,418.561z\"\/>\
                <path id=\"uz\" d=\"M558.643,428.477l2.662,0.138v-4.556l-2.522-1.47l4.253-5.358h1.729l1.729,2.015l4.521-1.738l-6.25-2.144l-0.242-1.297l-1.485,0.363l-1.461,2.541l-6.302-0.207l-4.625-6.543l-8.125,0.803l-3.872-3.838l-5.358-0.906l-3.891,1.582l2.257,7.502l0.024,2.524l1.643,0.035l2.014-3.839l5.359,0.068l0.796,2.947l11.487,7.625l4.442,1.021L558.643,428.477L558.643,428.477z\"\/>\
                <path id=\"tj\" d=\"M559.74,422.234l3.552-4.408h1.34l0.467,0.984l-1.642,1.192v0.985l1.081,0.777l5.195,0.312l1.693-0.727l0.77,0.154l0.52,1.66l3.085,0.312l1.548,3.267l-0.467,0.985l-0.614,0.053l-0.612-1.245l-1.341-0.104l-2.315,0.312l-0.156,2.18l-2.316-0.155l0.104-2.75l-1.694-1.658l-2.575,2.125l0.053,1.4l-2.265,0.778h-1.341l0.104-4.824L559.74,422.234L559.74,422.234z\"\/>\
                <path id=\"kg\" d=\"M565.463,411.316l-0.268,2.188l0.216,1.35l7.521,2.523l-6.604,2.662l-0.751-0.623l-1.427,0.917l0.068,0.501l0.761,0.346l4.635,0.121l2.351-0.709l3.018-3.803l3.776,0.656l4.557-6.311l-12.188-1.66l-1.686,4.088l-2.127-2.281L565.463,411.316L565.463,411.316z\"\/>\
                <path id=\"af\" d=\"M545.85,435.383l1.374,10.771l3.423,0.752l0.32,1.937l-2.455,2.049l4.573,3.691l8.885-3.198l0.709-3.786l5.593-3.491l2.145-8.091l1.599-1.722l-1.659-2.887l5.412-3.347l-0.691-0.968l-2.498,0.155l-0.226,2.299l-3.354-0.033l-0.062-3.068l-1.079-1.288l-1.815,1.649l0.052,1.515l-2.739,1.036l-5.059-0.319l-6.568,6.881L545.85,435.383L545.85,435.383z\"\/>\
                <path id=\"pk\" d=\"M553.638,455.082l2.248,3.337l-0.216,1.72l-2.991,1.186l-0.217,2.801h3.424l1.175-0.969h6.519l5.878,5.17l0.752-2.481h4.383l0.104-3.12l-4.486-4.305l0.96-2.369l4.598-0.318l6.199-12.924l-3.425-2.688l-1.278-4.521l8.333-0.752l-4.917-7l-2.62-0.709l-1.07,1.297l-0.805,0.061l-4.919,3.12l1.608,2.696l-1.815,1.937l-2.249,8.29l-5.558,3.553l-0.752,3.882L553.638,455.082L553.638,455.082z\"\/>\
                <path id=\"in\" d=\"M595,509.688l3.958-1.938l2.352-8.505l-0.104-10.441l13.468-14.54v-3.447l2.774-1.081l-0.104-3.984l-2.991-5.817l1.712-3.121l3.742,3.449l4.808,0.216v1.938l-1.495,1.616l0.318,0.863l2.567,0.104l0.536,2.904h0.752l1.928-3.449l0.958-9.042l3.207-2.265l0.104-3.12l-1.279-2.481l-2.031-0.104l-7.951,5.256l0.5,3.38l-5.584-0.019l-1.97-2.41l-1.072,0.138l0.363,3.354l-12.075-0.863l-7.485-3.337l-0.397-4.106l-4.988-3.094l-0.06-6.371l-3.423-3.916l-7.867,0.752l0.855,3.424l3.854,3.12l-6.665,13.641l-4.46,0.337l-0.734,1.644l4.392,4.062l-0.216,4.105l-4.486-0.069l-0.484,2.04l3.727-0.164l0.104,1.616l-2.671,1.4l1.711,3.232l3.312,1.08l2.031-1.504l0.959-2.688l1.177-0.535l1.392,1.398l-0.424,3.449l-0.96,1.617l0.217,2.8L595,509.688L595,509.688z\"\/>\
                <path id=\"np\" d=\"M595.182,448.789l0.397,3.691l6.983,3.162l11.193,0.83l-0.423-2.705l-7.478-2.058l-6.346-3.777L595.182,448.789L595.182,448.789z\"\/>\
                <path id=\"bt\" d=\"M616.108,453.561l1.34,1.833l4.528,0.034l-0.458-2.507L616.108,453.561L616.108,453.561z\"\/>\
                <path id=\"bd\" d=\"M616.256,457.908l-1.134,2.049l2.938,5.584l0.087,4.357l0.535,1.166l3.449,0.061l1.953-1.875l1.418,0.855l0.285,2.652l1.133-0.708l0.069-3.389l-0.951-0.112l-0.596-2.879l-2.403-0.086l-0.596-1.6l1.469-1.962l0.024-0.97h-4.269L616.256,457.908L616.256,457.908z\"\/>\
                <path id=\"mm\" d=\"M645.533,501.596l-2.396-3.838l1.737-2.438l-1.642-3.018l-1.548-0.294l-0.294-5.064l-2.316-4.486l-0.675,1.071l-1.547,2.628l-1.937,0.294l-0.968-1.271l-0.484-3.414l-1.453-2.73l-5.913-5.576l1.453-0.959l0.27-4.037l2.16-3.631l0.935-9.032l3.129-2.136l0.103-3.293l1.877,0.622l2.956,4.279l-2.194,4.701l1.479,3.691l3.655,1.435l0.666,4.021l4.91,0.761l-1.357,2.343l-6.188,2.438l-0.674,3.993l4.547,5.844l0.189,3.12l-1.062,1.072l0.094,0.977l3.389,4.971l0.096,5.16L645.533,501.596L645.533,501.596z\"\/>\
                <path id=\"th\" d=\"M646.043,472.915l2.8,3.604v4.384l0.968,0.482l4.452-2.144l0.873,0.294l5.316,6.138l-0.19,4.192l-1.737-0.294l-1.548-0.979l-1.158,0.097l-2.031,3.404l0.39,1.851l1.642,0.873l-0.095,2.049l-1.157,0.588l-3.97-2.731v-2.438l-1.642-0.095l-0.674,1.07l-0.347,10.909l2.567,4.686l4.547,4.383l-0.188,1.271l-2.423-0.094l-2.221-3.311h-2.325l-2.902-2.345l-0.874-2.437l1.254-2.049l0.432-1.851l1.366-2.421l-0.061-5.565l-3.337-4.823l-0.139-0.588l1.081-1.089l-0.251-3.83l-4.441-5.627l0.519-3.241L646.043,472.915L646.043,472.915z\"\/>\
                <path id=\"sg\" d=\"M658.314,527.705l0.686,0.389l1.548-0.126l-0.13-1.167L659.156,527L658.314,527.705z\"\/>\
                <g id=\"my\">\
                    <path d=\"M675.527,526.896l2.61,3.018l10.012-3.467l1.979-7.643l4.46-0.319l4.08-2.956l-5.29-3.854l-1.211-2.119l-2.61,4.815l0.959,2.766l-1.591,2.31l-2.999-0.771l-7.27,5.333l0.188,3.086L675.527,526.896L675.527,526.896z\"\/>\
                    <path d=\"M648.359,511.796l1.736,3.898l0.391,5.064l2.324,3.604l5.096,3.083l1-0.791l1.464-0.288l-0.212-1.91l-1.841-4.478l-2.697-5.731l-0.227,1.003l-3.25-0.146l-2.334-3.354L648.359,511.796L648.359,511.796z\"\/>\
                <\/g>\
                <path id=\"kh\" d=\"M655.076,497.982l3.535,3.776l6.576-4.875l0.579-7.692l-3.396,2.343l-1.764-0.985l-2.396-0.32l-1.341-0.941l-0.648,0.035l-1.754,2.878l0.285,1.332l1.781,0.994l-0.216,2.705L655.076,497.982L655.076,497.982z\"\/>\
                <path id=\"la\" d=\"M650.745,466.397l-2.092,1.062l-1.737,5.065l2.904,3.699l-0.485,4.09l0.485,0.196l4.832-2.342l6.482,7.243l-0.157,4.563l1.41,0.762l3.482-2.827l-0.285-2.238l-10.053-9.552l0.095-1.461l1.254-0.873l-0.874-2.438l-4.158-0.684L650.745,466.397L650.745,466.397z\"\/>\
                <path id=\"vn\" d=\"M659.035,502.287l1.027,1.616l0.19,1.851l2.705,0.294l3.286-4.383l3.095-0.873l1.643-4.478l-0.771-7.209l-3.189-4.384l-3.362-2.688l-4.278-7.349l3.068-5.135l-4.393-5.039l-3.517-0.154l-3.164,1.702l0.942,4.071l4.219,0.743l1.133,3.138l-1.487,0.969l0.096,0.777l9.896,9.683l0.388,2.844l-0.595,8.989L659.035,502.287L659.035,502.287z\"\/>\
                <path id=\"ge\" d=\"M495.144,415.596l2.827,3.691l3.527,1.625l2.169-0.01l3.726-1.01l0.935-1.461l-11.021-4.123L495.144,415.596L495.144,415.596z\"\/>\
                <path id=\"am\" d=\"M507.47,420.549l4.149,5.411l-1.218,1.427l-2.939-0.51l-3.646-3.268l0.196-2.146L507.47,420.549L507.47,420.549z\"\/>\
                <path id=\"az\" d=\"M508.931,418.674l-0.873,1.486l4.071,5.342l1.418-0.458l2.334,2.446l1.011-4.287l2.533,0.406l-0.104-1.229l-4.165-3.646l-0.795,2.143L508.931,418.674L508.931,418.674z\"\/>\
                <path id=\"ir\" d=\"M507.409,427.516l-1.057,1.098l0.104,1.738l1.314,1.842l4.658,5.101l-0.709,2.04h-0.812l-0.406,2.04l2.637,3.371l2.43,0.207l4.865,6.732l2.732,0.208l2.126,1.529l0.104,3.062l8.411,4.9h3.139l1.927-1.634l2.43-0.104l1.418,3.268l9.085,1.262l0.27-3.337l3.007-1.089l0.139-1.193l-2.395-3.268l-5.334-4.287l2.801-2.55l-0.198-1.124l-3.511-0.544l-1.486-11.843l-0.173-2.723l-9.518-3.641l-4.218,0.951l-2.36,2.896l-2.092-0.139l-0.604,0.511l-4.66-0.303l-5.878-4.288l-2.188-2.394l-1.003,0.24l-1.808,2.066L507.409,427.516L507.409,427.516z\"\/>\
                <g id=\"ye\">\
                    <path d=\"M533.315,498.138l1.842,2.059l2.489-1.504l0.897-0.304l-1.141-1.105l-2.188,0.647L533.315,498.138L533.315,498.138z\"\/>\
                    <path d=\"M509.432,489.131l1.244,3.7v3.613l2.991,2.714l21.074-8.584l0.198-2.359l-3.381-6.067l-8.479,2.706l-4.866,4.787l-5.645-3.336L509.432,489.131L509.432,489.131z\"\/>\
                <\/g>\
                <path id=\"om\" d=\"M532.244,481.879l6.388-3.683l1.133-5.402l-1.399-0.804l0.579-5.792l1.219-0.709l1.306,2.049l7.771,4.062v2.258l-9.413,13.854l-4.331,0.147L532.244,481.879L532.244,481.879z\"\/>\
                <path id=\"ae\" d=\"M528.466,468.135l0.753,3.008l8.522,0.752l0.596-6.172l1.644-0.897l0.448-2.257l-2.688,0.753l-2.99,4.521L528.466,468.135L528.466,468.135z\"\/>\
                <path id=\"qa\" d=\"M527.273,463.018l-0.449,3.467l1.331,1.012l1.209-0.112l0.45-4.365l-1.047-0.752L527.273,463.018L527.273,463.018z\"\/>\
                <path id=\"kw\" d=\"M519.2,452.774l-1.945-1.056l-1.349,1.356l0.146,2.715l3.139,1.201L519.2,452.774L519.2,452.774z\"\/>\
                <path id=\"sa\" d=\"M519.812,458.021l6.061,8.443l1.953,1.558l0.874,3.785l9.327,0.734l1.055,0.554l-1.046,4.667l-6.129,3.613l-8.964,2.715l-4.78,4.668l-5.679-3.312l-3.439,3.009l-4.791-7.823l-3.284-1.504l-1.192-1.807v-3.916l-11.954-14.452l-0.451-2.561h3.44l4.184-3.611l0.146-1.808l-1.192-1.201l2.395-1.953l5.084,0.303l8.669,7.226l5.117-0.232l0.329,1.263L519.812,458.021L519.812,458.021z\"\/>\
                <path id=\"sy\" d=\"M487.545,437.18l-0.302,2.196l2.437,1.021l-0.104,6.086l2.438-0.053l2.438-1.842l0.916-0.155l5.532-4.398l1.114-6.39l-11.056,1.125l-1.167,2.559L487.545,437.18L487.545,437.18z\"\/>\
                <path id=\"iq\" d=\"M502.793,433.637l-1.348,6.664l-5.585,4.65l0.354,2.195l5.455,0.371l8.688,7.07l4.857-0.138l0.13-1.634l1.78-1.91l2.49,1.409l0.329-0.312l-4.815-6.405l-2.282-0.139l-3.033-3.898l0.604-2.868l0.926-0.121l0.319-1.271l-4.132-4.348L502.793,433.637L502.793,433.637z\"\/>\
                <path id=\"jo\" d=\"M489.473,447.251l-2.126,7.416l-0.096,1.133h3.346l3.743-3.303l0.094-1.253l-1.529-1.564l2.739-2.272l-0.396-2.109l-0.752,0.173l-2.282,1.635L489.473,447.251L489.473,447.251z\"\/>\
                <path id=\"lb\" d=\"M487.139,440.041l0.053,1.686l-0.708,2.56l2.438,0.208l0.156-3.631L487.139,440.041L487.139,440.041z\"\/>\
                <path id=\"il\" d=\"M486.378,444.899l-1.365,4.348l1.771,5.213l2.031-7.616v-1.633L486.378,444.899L486.378,444.899z\"\/>\
                <path id=\"cy\" d=\"M484.555,437.794l1.062,0.771l-3.294,3.119l-1.573-0.052l-1.167-0.821l0.156-1.529l2.386-0.155L484.555,437.794L484.555,437.794z\"\/>\
                <g id=\"no\">\
                    <path d=\"M437.056,285.762l-1.426-1.435l-3.164,1.539h-5.809l-0.917,3.389l3.26,2.878l1.425-0.208l2.04-3.491l1.729,1.235l-1.229,2.464l-0.614,3.596l1.427,2.256l3.06-5.135l3.979-4.832l-1.531-1.33L437.056,285.762L437.056,285.762z\"\/>\
                    <path d=\"M438.784,279.6l-2.55,2.359l1.529,2.359h2.749l1.124,1.539l3.363,1.746l3.871-2.256l2.654-2.256l-0.916-1.85l-2.654-1.539l-1.938,1.746l-1.321-1.644l-1.021,0.104l-1.322,2.878l-1.936-1.954l-0.208-1.331L438.784,279.6L438.784,279.6z\"\/>\
                    <path d=\"M444.593,290.179l-2.04,1.851l-1.729,1.332l0.812,1.435l1.636,0.511l2.652-1.236l1.229-1.539l-1.124-1.85L444.593,290.179L444.593,290.179z\"\/>\
                    <path d=\"M460.567,327.409l1.747-1.279l-0.157-1.435l-1.106-0.641l0.157-1.754h0.95v-0.96l-4.123-1.114l-6.181,0.64l-0.631,2.714l-1.428-0.477l-0.951-1.599l-3.017,0.155l-0.32,3.033l-1.426,0.641l-0.795-1.6l-6.345,5.109l1.271,1.436l-2.378,1.115l-5.393,10.701l-1.901,1.279l0.155,0.959l1.9,0.959l-0.475,2.074l-3.173-0.164l-0.952-1.115l-2.057,2.395l-1.271,0.959l-0.32,2.24l-1.105,0.64l-2.854,0.64l-1.426,4.479l0.951,7.348l1.106,3.354l1.271,1.279l2.853-0.156l4.124-3.994l1.581-2.713l0.478,3.992l2.697-4.789l0.154-13.424l2.195-1.383l0.657-7.408l6.655-9.586l3.173-1.115l1.427-1.755l4.754,1.115l2.377,1.435l0.796-3.992l3.968-2.396L460.567,327.409L460.567,327.409z\"\/>\
                <\/g>\
                <g id=\"gb\">\
                    <path d=\"M400.629,367.984l-1.582,2.395l0.631,0.959h3.648v1.6l-0.952,1.278l0.632,3.354l2.058,3.994l1.581,3.672l2.533,0.959l1.105,1.92l-0.155,1.755l-1.582,0.959l-0.156,0.795l1.106,0.64l-0.951,1.279l-2.221,0.959l-4.279-0.477l-6.664,3.035l-2.221-1.115l6.345-3.674l-0.796-0.477l-3.328-0.32l2.058-3.033l0.319-2.56l2.696-0.319l-0.475-4.953l-3.174-0.155l-0.95-1.115l0.155-3.674l-1.901,0.156l1.901-6.388l3.492-2.56L400.629,367.984L400.629,367.984z\"\/>\
                    <path d=\"M393.974,378.693l-2.853,0.32l-0.156,2.56l1.901,1.278l2.058-0.475l0.796-1.436L393.974,378.693L393.974,378.693z\"\/>\
                <\/g>\
                <path id=\"ie\" d=\"M394.915,383.085l-0.786,5.187l-6.975,2.56h-2.223l-1.582-1.115v-0.96l3.492-2.238l-0.951-1.92l0.156-2.714l3.018,0.155l1.383-3.25l-0.183,2.887l2.344,1.858L394.915,383.085L394.915,383.085z\"\/>\
                <path id=\"fi\" d=\"M453.072,340.202l1.79,0.786l1.104,2.074l-1.104,1.436l-5.55,6.068l-0.952,3.199l1.271,4.633l4.278,3.199l5.706-2.715l4.598-0.64l4.279-6.872l-3.173-7.512l-3.018-7.192l0.477-4.633l-1.901-0.32l-0.492-3.38l-2.559-4.175l-2.836,1.962l-1.114,4.556l-3.008-1.807l-4.185-1.021l-0.934,1.09l1.607,1.453l2.931-0.053l2.359,3.812L453.072,340.202L453.072,340.202z\"\/>\
                <g id=\"ru\">\
                    <path d=\"M741.137,353.246l-1.071,1.332l0.087,2.083l0.992-0.086l1.651-2.913L741.137,353.246L741.137,353.246z\"\/>\
                    <path d=\"M776.793,272.303l-2.04,1.331l-0.483,1.694l0.96,1.089l2.16-0.726l2.161,0.726l1.201,0.363l-0.121-3.994L776.793,272.303L776.793,272.303z\"\/>\
                    <path d=\"M488.539,272.648l1.487,0.598l-1.046,1.798v2.55l-2.23,1.35h-2.377l-1.34-1.651l0.146-1.798l1.046-1.35h2.084L488.539,272.648L488.539,272.648z\"\/>\
                    <path d=\"M494.192,270.998v1.798l1.486,1.202l2.083-0.146l1.788-1.651v-1.202h-1.634l-1.34,0.449l-1.046-1.201L494.192,270.998L494.192,270.998z\"\/>\
                    <path d=\"M502.681,271.152l1.046,2.248l2.084,0.147l1.486-0.596l-0.742-2.101l-1.937-0.451L502.681,271.152L502.681,271.152z\"\/>\
                    <path d=\"M511.161,268.154l-1.635-0.303l-1.487,1.504l0.744,1.349l0.449,2.101l1.937-1.496l0.449-1.65L511.161,268.154L511.161,268.154z\"\/>\
                    <path d=\"M520.237,284.051l-0.45,2.1l-3.424,3l-7.294,1.651l-5.957,9.897l-1.046,2.853l5.957,1.505l0.889-3.597l1.79-5.549l4.615-2.403l3.872-3l2.826-1.201h1.487v-4.046L520.237,284.051L520.237,284.051z\"\/>\
                    <path d=\"M501.039,305.946l4.019,0.45l1.342,4.649l3.423,3.597l-1.193,2.402h-2.083l-1.937-2.248l-4.313-0.146l-1.789-2.403v-1.651l2.682-0.752L501.039,305.946L501.039,305.946z\"\/>\
                    <path d=\"M563.855,254.809l-1.938-1.203h-2.23l-0.448,1.35l-2.377,1.35l-1.79,0.596l-0.294,1.798l4.167,0.303L563.855,254.809L563.855,254.809z\"\/>\
                    <path d=\"M568.463,255.257l-1.047,2.247l-2.083-0.146l-3.276,2.402l-0.89,3h2.083l1.193-1.953l2.826,2.101l2.681-1.202l1.937-1.65l-0.744-2.551l-1.046-1.798L568.463,255.257L568.463,255.257z\"\/>\
                    <path d=\"M572.784,256.908l1.046,4.201l1.634,3.897l1.79-3.146l3.423-0.752v-2.248l-2.229-1.651L572.784,256.908L572.784,256.908z\"\/>\
                    <path d=\"M654.453,250.184l2.326,1.953l1.649-0.683l0.484-2.74l-3.389-2.342l-2.23,1.469l-5.428,0.493v2.445l-5.724,0.096v4.002l6.69,4.979l1.747-1.271l-0.39-3.519l4.27-1.071l-0.873-1.66l-1.547-1.563L654.453,250.184L654.453,250.184z\"\/>\
                    <path d=\"M660.66,247.84l1.547,2.932l6.017-0.684l1.65-2.152l-0.389-1.857l-1.65-0.684l-1.548,1.176l-4.46,0.978L660.66,247.84L660.66,247.84z\"\/>\
                    <path d=\"M660.271,259.268l-3.01-0.777l-1.736,1.857l-0.778,2.541l4.071-0.389l3.104-1.564L660.271,259.268L660.271,259.268z\"\/>\
                    <path d=\"M738.231,242.369l-2.523-0.778l-2.904,1.072l-1.453,2.151l1.842,2.446l4.85-2.151l0.968-1.072L738.231,242.369L738.231,242.369z\"\/>\
                    <path d=\"M739.156,358.329v3.665l1.159,0.415l0.828-1.332v-2.827L739.156,358.329L739.156,358.329z\"\/>\
                    <path d=\"M705.35,345.086l-0.076,5.333l6.689,10.33l2.396,8.989l4.219,7.996l1.649,0.58l1.409-1.168l0.657-1.918l-6.033-6.578l0.164-3.416l1.322-0.578l0.329-1.997l-11.816-16.735L705.35,345.086L705.35,345.086z\"\/>\
                    <path d=\"M751.967,328.516l-1.649,0.164l0.993,1.418l2.065,1.418l0.579-0.666L751.967,328.516L751.967,328.516z\"\/>\
                    <path d=\"M755.183,329.52l0.251,1.416l2.56,0.752l0.251-1.002L755.183,329.52L755.183,329.52z\"\/>\
                    <path d=\"M769.229,334.956l1.08,1.937l1.8-0.121l0.361-1.332L769.229,334.956L769.229,334.956z\"\/>\
                    <path d=\"M787.356,337.98l1.442,2.662l1.08-1.209v-1.815L787.356,337.98L787.356,337.98z\"\/>\
                    <path d=\"M722.059,302.16l1.522,5.256l3.043,0.873l3.042-4.814l-1.737-3.285l0.648-2.845h4.563l-1.09,2.188l0.434,7.883l-6.519,16.199l0.648,3.501l-0.216,5.912l12.161,17.729l2.387,0.657l0.216-14.443l2.386-2.188l-2.61-5.688l2.171-2.412l-4.78-6.346l-2.611,0.217l-0.865-10.503l6.734-1.755l0.432-3.068l3.478-0.873l1.953,1.756l2.386-9.631l4.124-7l3.259-1.756l2.827,0.217v-3.285l-4.563-0.873l-6.302-5.256l3.044-3.5l-2.61-5.913l2.169-2.187l2.61,3.5l6.519,2.411l7.166,0.657l0.873-3.061l-3.69-3.717l4.123-5.688l-9.345-3.285l-2.386,4.814l-3.043-3.941l-17.158-5.913l-16.295,2.844l-2.387,1.314v1.313l3.476,1.756l-0.434,4.157l-6.301-2.628l-13.898,5.473l-2.388-5.031h-9.561l-4.349,4.599l-15.421-3.501l-14.115,2.844l-1.737,4.375l2.17,0.656l-0.216,3.285l-13.685,1.529l0.873,4.375l-12.604-2.188l3.044-5.688l-12.819-0.657l1.089,5.913l-4.123,1.971l-3.476-3.285l-14.116,2.412l-5.428,5.031l-0.217,3.06l-3.476,0.216l-0.433-3.5l11.082-9.629v-6.57l-7.166-1.971l-9.345,3.061l-3.907-3.942h-1.737l-2.171,4.374l1.738,1.971l-12.388,6.787l-10.642,8.1l-6.519,8.972v3.717l6.949,2.845l-3.475,2.627l-7.382-2.627l-3.044,2.627l-4.563-5.256l-0.873,1.972l4.996,15.758l1.305,0.44l3.478-1.754l1.736,1.313v2.844l-3.259-1.313l-1.955,1.529l1.308,2.844l-1.09,7.443l-6.734,0.657l-0.432-2.412l3.907-2.411l0.873-6.57l-4.349-5.688l-1.521-9.846l-6.948-1.098l-0.648,3.5l1.305,1.754l-2.825,2.412l1.089,6.57l4.124,1.755l0.873,4.814l-4.133-2.627l-10.641-1.972l-1.306,3.502l-8.473,3.06l-1.305-2.187l-11.082,6.127l-0.216,4.158l-4.348,0.657l1.306-3.06v-3.061l-4.349-1.529l-2.826,1.098l2.386,4.599l1.737,3.06v2.412l-3.26-0.656l-0.647-0.657l-3.26,3.501l1.737,3.061l-7.383-0.217l2.387,3.069l-0.647,1.313h-3.907l-2.827-1.971l-0.647-5.472l-4.563-1.755v-2.187l9.561,1.972l5.213,0.44l2.17-3.285l-1.954-3.501l-13.899-5.472l-4.798,1.192l-1.642,1.41l0.511,3.24l2.039,0.354l-0.476,5.101l6.293,14.781l-4.548,7.209l-0.312,1.625l2.309,1.625l-2.084,1.375l-1.383,0.026l0.26,6.353l1.91,2.706l0.026,2.627l2.446,0.225l3.741,1.426l3.959,5.446l0.045,1.435l-1.288,2.205l2.956-0.164l2.878,0.83l3.891,5.506l9.577,0.873l-0.415,6.552l-3.301,2.827l0.683,1.105l-3.26,3.502l-0.864,3.284l1.954,2.845l6.301,2.187l2.611-1.53l16.727,6.346l0.648-1.756l-3.476-3.283v-4.158l-2.171-0.657l0.434-3.5l3.476-4.158l-6.231-4.667l0.432-6.492l6.665-4.383l7.822,0.441l1.306,2.412l8.04,0.44l5.869-3.284l-3.044-3.285l0.647-6.129l15.205-7.442l11.695,5.272l3.907-3.5l11.514,10.942l8.688-0.873l3.044,3.06l8.255,0.873l5.429-7.441l6.949,3.068l3.69,0.658l3.692-3.285l-3.26-2.188l2.827-4.374l8.039,2.628l1.736,3.501l3.477,0.216l2.17-1.529l5.869-0.217l0.647,1.53l6.733,0.44l4.562-4.814l9.345,1.098l2.827-1.098l0.864-5.256l-2.826-6.346l2.826-2.411h8.904l8.471,10.069l10.857,6.129h3.26l0.432-2.627l3.907-2.412l0.433,14.228l-3.475,0.216v3.5l1.953,2.412l-0.363,3.129l1.443,0.598l0.874-2.188l1.306,0.441l0.864,0.873l3.907-0.873l3.906-11.385l0.434-14.229l-4.996-11.385l-6.301-7.657l-3.044,0.44v2.412l-7.382-2.845l2.826-6.128l2.387-16.199l9.992-3.06l4.779-3.06h5.213l-1.312,1.754l1.306,2.188l4.563-4.814l2.609,0.215l-0.432-2.844l-4.132-0.873l2.827-10.287L722.059,302.16L722.059,302.16z\"\/>\
                    <path d=\"M450.108,378.288l-1.296,2.396l4.665,0.043h0.95l-0.179-1.352l-0.728-0.854L450.108,378.288z\"\/>\
                <\/g>\
                <path id=\"lt\" d=\"M452.14,375.236l-2.146,0.363l0.173,2.025l3.355,0.25l1.27,1.042l0.333,1.81l1.034,1.443l3.069-0.13l2.938-3.743l-0.172-2.222l-5.533-0.867L452.14,375.236z\"\/>\
                <path id=\"lv\" d=\"M462.823,369.964l-6.362-1.037l-1.086,2.823l-1.833,0.548l-0.959-1.173l-0.962-1.811l-1.038,0.762l-0.589,3.132v1.708l2.242-0.375l4.665,0.083l5.617,1.044l2.249-0.657l-0.13-2.524L462.823,369.964L462.823,369.964z\"\/>\
                <g id=\"ee\">\
                    <path d=\"M462.562,363.299l-4.84-0.173l-3.068,1.875l-0.043,1.392l1.987,1.875l6.182,1.047L462.562,363.299L462.562,363.299z\"\/>\
                    <path d=\"M452.236,364.042l-1.308,0.44l1.308,0.226l0.595,0.69l0.711-0.852l-0.709-1.215L452.236,364.042z\"\/>\
                    <path d=\"M452.792,365.792l-1.862,0.833l-0.643,1.111l0.643,0.722l2.362-0.875l1.137-0.752L452.792,365.792z\"\/>\
                <\/g>\
                <path id=\"by\" d=\"M456.418,382.861l1.297,2.135l-0.519,1.703l0.086,1.349l0.476,1.616l2.68-1.521l3.329,0.086l2.334,0.959h5.922l1.729-4.141l1.037-1.564v-1.045l-3.717-5.23l-3.285-1.305l-2.68-0.303l-2.335,0.743l0.088,2.351l-3.241,4.098L456.418,382.861L456.418,382.861z\"\/>\
                <path id=\"pl\" d=\"M457.109,390.184l0.733,1.348l0.174,1.435l-0.604,1.392l-1.383,2.664l-1.167,0.526l-1.514-0.657l-0.908,0.043l-2.204,0.83l-2.506-0.742l-4.062-2.879l-3.978-2.135l-1.6-2.438l-0.303-5.75l3.112-2.705l4.062-1.35l1.328-0.138l0.315,1.007l1.725,0.692l4.766,0.09l1.47-0.043l2.421,3.708l-0.604,1.521l0.259,1.789L457.109,390.184L457.109,390.184z\"\/>\
                <g id=\"es\">\
                    <path d=\"M374.265,458.444l-1.513,0.873l0.7,0.709L374.265,458.444L374.265,458.444z\"\/>\
                    <path d=\"M369.009,458.608l-1.875,0.476l0.935,1.418h1.407L369.009,458.608L369.009,458.608z\"\/>\
                    <path d=\"M364.549,457.191l-1.176,1.184l1.643,1.418l0.935-2.126L364.549,457.191L364.549,457.191z\"\/>\
                    <path d=\"M413.578,426.877l-1.375,0.467l0.304,1.235h1.988l0.839-0.925L413.578,426.877L413.578,426.877z\"\/>\
                    <path d=\"M402.565,416.322h-11.014l-2.222-1.004l-1.071,0.078l-1.297,2.696l0.458,2.775l4.21,0.389l0.536,1.771l-1.833,10.33l0.078,1.851l2.981,1.617l3.439,0.232l6.881-1.694l3.363-4.233l0.077-4.313l5.965-5.395l0.302-2.386l-5.428-0.078L402.565,416.322L402.565,416.322z\"\/>\
                <\/g>\
                <g id=\"pt\">\
                    <path d=\"M367.834,443.481l-0.934,1.185l0.934,1.185l1.408-0.709L367.834,443.481L367.834,443.481z\"\/>\
                    <path d=\"M337.112,426.713l-1.175,1.184l2.107,1.185l0.234-1.649L337.112,426.713L337.112,426.713z\"\/>\
                    <path d=\"M343.448,426.004l-1.408,0.941l1.175,0.941l1.876-0.476L343.448,426.004L343.448,426.004z\"\/>\
                    <path d=\"M344.382,429.314l-0.7,1.892l0.935,1.185l1.175-0.941L344.382,429.314L344.382,429.314z\"\/>\
                    <path d=\"M350.01,433.092l-0.467,1.184l0.701,0.709l1.875-1.184L350.01,433.092L350.01,433.092z\"\/>\
                    <path d=\"M387.499,421.716l-0.536,7.478l-1.53,1.384l0.156,0.846l1.071,1.772l-0.691,2.16l1.149,0.39l2.68-0.312l-0.155-2.16l1.756-10.02l-0.382-1.383L387.499,421.716L387.499,421.716z\"\/>\
                <\/g>\
                <g id=\"fr\">\
                    <path d=\"M428.039,418.016l-1.687,1.695l-0.154,1.538l1.374,0.847l0.536-0.076l0.303-2.24L428.039,418.016L428.039,418.016z\"\/>\
                    <path d=\"M254.095,484.065l-1.296,0.535l0.458,1.149l1.521-0.994l-0.303-0.311L254.095,484.065L254.095,484.065z\"\/>\
                    <path d=\"M412.973,393.588l-1.91,0.467l-3.82,4.158l-1.149,0.078l-1.53-1.081l-0.993,0.233l-0.762,2.386l-5.584,0.155l0.156,1.236l3.82,2.543l4.435,3.543l-0.077,4.236l-2.368,4.157l5.126,2.464l5.204,0.154l1.606-1.85l3.286,0.078l0.916,0.848l3.285-0.233l1.686-2.162l-2.145-2.541l-0.155-1.616l0.458-1.771l-1.071-1.539l-1.833,0.535l-0.232-1.383l4.054-4.469v-2.697l-2.348-0.767l-1.432-0.987L412.973,393.588L412.973,393.588z\"\/>\
                    <path d=\"M276.163,517.285l5.058,3.154l-2.646,5.255l-0.959,1.21l-2.809-1.615l0.079-5.663L276.163,517.285L276.163,517.285z\"\/>\
                    <path d=\"M540.023,586.93l-1.972,0.129l-0.129,1.722l1.313,0.269l1.972-0.925L540.023,586.93L540.023,586.93z\"\/>\
                    <path d=\"M516.857,562.666l0.656,1.461h1.055l0.526-1.857L516.857,562.666L516.857,562.666z\"\/>\
                    <path d=\"M258.823,489.822l-0.917,0.847l0.683,1.383l1.296-0.38L258.823,489.822L258.823,489.822z\"\/>\
                <\/g>\
                <path id=\"nl\" d=\"M421.349,384.572l-3.915,1.928l0.829,0.752l0.088,1.928l-0.829-0.164l-0.917-1.426l-2.188,3.467l3.363,0.699l1.253,1.323l0.666,0.017l0.44-2.99l2.117-0.891L421.349,384.572L421.349,384.572z\"\/>\
                <path id=\"be\" d=\"M414.019,391.704l-0.554,1.383l5.947,3.925l0.4,0.051l0.375-1.094l0.837-0.588l-1.336-1.499h-0.916l-1.255-1.426L414.019,391.704L414.019,391.704z\"\/>\
                <path id=\"lu\" d=\"M420.424,397.582l0.76,0.679l0.88,0.083l0.194-1.734l-0.253-0.974l-1.224,0.583L420.424,397.582z\"\/>\
                <path id=\"de\" d=\"M422.257,384.234l3.086-0.5v-2.178l2.584-0.425l1.418,1.427l1.495,0.164l2.334-1.012l2.083,0.588l1.832,1.592l0.251,5.955l1.832,2.438l-2.411,0.337l-4.003,2.515l0.338,0.839l3.579,3.354l-0.251,1.677l-3.328,1.677l-3.085,0.086l-0.753,1.59h-1.581l-0.752-1.676l-2.749-0.675l-0.088-2.767l-1.39-0.77l0.114-1.861l-0.406-1.328l-1.982-1.824l0.414-2.854l2.161-1.011L422.257,384.234L422.257,384.234z\"\/>\
                <g id=\"dk\">\
                    <path d=\"M427.123,370.076l-3.586,3.968l-0.13,2.584l1.635,4.263l2.559-0.484l-0.319-3.483l1.764-1.971l-0.034-1.548l-1.245-3.223L427.123,370.076L427.123,370.076z\"\/>\
                    <path d=\"M428.979,377.354l-1.062,0.229v1.583l1.128,0.875l0.997-0.25l-0.243-1.503L428.979,377.354z\"\/>\
                    <path d=\"M432.306,375.848l-0.949,0.23l-1.056,0.968l0.448,1.954l1.292,0.507l-1.334,0.535l-0.255,0.685h2.005l0.602-1.099l-0.768-0.378l0.25-0.962l0.916-1.205l-0.25-1.042L432.306,375.848z\"\/>\
                <\/g>\
                <g id=\"se\">\
                    <path d=\"M445.232,329.52l1.693,1.563h3.173l1.746,3.354l0.477,5.748l-4.278,3.035v3.033l-3.017,4.158l-1.746,0.154l-2.378,3.994l0.155,3.838l4.124,3.035l-0.319,1.754l-1.582,2.396l-2.377,2.074l0.155,6.872l-3.647,1.279l-1.271,2.713h-1.747l-0.949-4.789l-3.969-6.084l3.26-5.455l0.225-13.477l2.248-1.236l0.545-7.709l6.405-9.172L445.232,329.52L445.232,329.52z\"\/>\
                    <path d=\"M445.898,368.927l-1.824,1.443l0.917,2.118l1.616-1.573L445.898,368.927L445.898,368.927z\"\/>\
                <\/g>\
                <path id=\"ch\" d=\"M423.787,402.82l-3.771,4.011l0.078,0.405l1.547-0.483l1.393,1.937l2.352-0.83l1.625,1.263l0.667-0.38l2.005-3.146l-0.511-0.484l-1.979-0.051l-0.959-1.963L423.787,402.82L423.787,402.82z\"\/>\
                <path id=\"cz\" d=\"M437.202,398.921h2.567h1.263l2.049,1.461l3.795-3.155l-3.683-2.627l-3.648-1.765l-2.498,0.45l-3.389,2.178L437.202,398.921L437.202,398.921z\"\/>\
                <path id=\"sk\" d=\"M443.607,400.875l0.597,0.527l0.077,0.898l6.596-0.146l4.875-2.102l-0.077-2.135l-0.934,0.415l-1.34-0.718l-0.821-0.035l-2.161,0.865l-2.938-0.709L443.607,400.875L443.607,400.875z\"\/>\
                <path id=\"at\" d=\"M430.46,403.459l-0.562,1.167l0.483,0.83l2.015-0.415h1.711l1.857,1.572l3.95-0.717l2.904-1.729l0.743-1.167l-0.112-1.504l-2.611-1.954l-3.501,0.035l-0.294,1.988l-3.683,1.797L430.46,403.459L430.46,403.459z\"\/>\
                <path id=\"hu\" d=\"M444.386,403.01l-1.003,1.573l0.078,2.403l1.599,0.82l4.919,0.147l6.854-5.774l0.034-1.279l-0.742-0.371l-4.953,2.248L444.386,403.01L444.386,403.01z\"\/>\
                <path id=\"si\" d=\"M442.708,405.076l-2.195,1.314l-4.097,0.898l0.82,2.368l2.87,0.034l2.646-2.213L442.708,405.076L442.708,405.076z\"\/>\
                <path id=\"hr\" d=\"M443.417,407.816l-3.051,2.515h-3.095l-0.372,2.178l1.418,0.372l0.709-1.055l1.114,0.977l0.891,3.112l6.109,2.853l0.605-0.691l-6.197-6.396l0.631-1.166l5.888-0.226l0.596-1.876l-3.838,0.111L443.417,407.816L443.417,407.816z\"\/>\
                <path id=\"ba\" d=\"M442.708,411.084l-0.319,0.527l5.801,5.981l2.127-3.13l-0.078-1.234l-1.857-2.256L442.708,411.084L442.708,411.084z\"\/>\
                <g id=\"it\">\
                    <path d=\"M427.806,423.566l-2.289,1.158l0.303,4.469l1.833,0.311l1.374-1.312v-4.235L427.806,423.566L427.806,423.566z\"\/>\
                    <path d=\"M423.233,409.391l-0.535,1.356l0.146,1.478l2.065,2.412l3.25-0.113l7.175,8.334l4.479,1.297l2.646,2.498l0.631,5.695l1.417-0.828l1.229-3.104l-0.303-2.229l2.101-0.19l0.304-1.263l-5.922-2.834l-5.619-5.523l-2.238-3.303l-0.545-3.137l2.861-0.684l-0.734-2.066l-1.755-1.478l-1.513-0.069l-2.108,0.58l-1.99,2.781l-1.201,0.795l-1.858-1.141L423.233,409.391L423.233,409.391z\"\/>\
                    <path d=\"M440.668,431.898l-1.253-0.674l-4.278,0.674l0.146,1.158l3.847,1.937l0.579,0.631l1.012,0.147L440.668,431.898L440.668,431.898z\"\/>\
                <\/g>\
                <path id=\"mt\" d=\"M440.815,438.339l-1.443,0.294l0.052,1.6l1.297,0.433l0.579-0.484L440.815,438.339L440.815,438.339z\"\/>\
                <path id=\"ua\" d=\"M460.662,388.791l-2.507,1.409l0.622,2.663l-2.316,4.884l0.02,2.151l1.089,0.691l6.983,0.346l1.954-1.615l2.092,0.699l2.999,4.002l-2.194,3.942l2.61,0.761l3.414-3.933l1.954,0.354l1.815,1.262l-1.601,2.109l2.161,3.371h2.299l1.185-2.248l2.438-0.494l0.069-1.823l-4.529-0.7l0.14-1.963h4.391l4.737-3.794l2.092-1.824l0.345-5.757l-9.336-0.838l-3.829-5.402l-2.646-0.908l-3.207,0.139l-1.443,3.569l-6.57,0.087l-2.135-0.986L460.662,388.791L460.662,388.791z\"\/>\
                <path id=\"md\" d=\"M465.14,401.376l2.681,4.123l-0.226,2.334l0.96,0.043l2.272-3.847l-2.731-3.389L466.549,400L465.14,401.376L465.14,401.376z\"\/>\
                <path id=\"ro\" d=\"M457.731,401.281l-0.226,1.279l-5.005,4.166l4.184,6.137l2.682,1.877h4.823l1.591-1.331l2.135-0.276l1.591,0.959l2.818-3.207l-0.545-1.607l-2.861-0.734l-1.953-0.095l0.094-2.749l-2.593-4.08L457.731,401.281L457.731,401.281z\"\/>\
                <path id=\"me\" d=\"M449.68,416.677l-1.266,1.789l0.362,1.099l1.504,0.275l1.184-1.607L449.68,416.677z\"\/>\
                <path id=\"rs\" d=\"M452.001,407.279l-1.772,1.332h-0.863l-0.588,1.832l2.092,2.43l0.139,1.928l-0.882,1.246l3.068,3.197l3.317-1.012l-0.274-4.721L452.001,407.279L452.001,407.279z\"\/>\
                <path id=\"bg\" d=\"M457.092,414.066l0.139,4.305l1.452,3.025l5.454,0.095l2.455-1.737l2.412-0.959l-0.588-2.75l0.545-1.469l-1.228-0.641l-1.687,0.139l-1.323,1.332l-5.549,0.043L457.092,414.066L457.092,414.066z\"\/>\
                <path id=\"al\" d=\"M450.679,420.438v3.984l1.142,2.152l0.82-0.096l1.409-2.566l-0.821-1.15l-0.319-2.844l-1.089-1.012L450.679,420.438L450.679,420.438z\"\/>\
                <path id=\"mk\" d=\"M456.643,418.924l-2.912,0.959l0.139,2.473l0.683,0.873l3.458-1.606L456.643,418.924L456.643,418.924z\"\/>\
                <path id=\"tr\" d=\"M472.812,421.906l-2.305-1.426l-1.271-1.013l-2.138,0.916l0,0l-1.477,3.74l2.219-0.5l1.562-1.188l3.438,0.938l-1.946,1.877L465.719,425l-1.91,2.093v1.021l1.22,1.021v1.123l-0.511,1.332l0.511,1.123l1.625-0.812l1.625,1.737l-0.406,1.228l-0.604,0.82l0.907,1.021l4.461,0.916l3.139-1.331v-1.937l1.521,0.303l3.648,2.144l3.948-0.614l1.721-1.633l1.114,0.406v1.841h1.521l1.313-2.55l11.549-1.229l5.04-0.613l-1.331-1.746l-0.025-2.359l1.011-1.21l-3.682-2.956l0.197-2.551h-2.022l-3.354-1.643l0,0l-1.929,2.041l-7.088-0.209l-4.253-2.549l-4.082,0.366l-4.544,2.729L472.812,421.906z\"\/>\
                <g id=\"gr\">\
                    <path d=\"M453.004,427.213l-0.096,1.15l4.003,2.014l1.911,0.734l-1.003,1.055l-2.23,0.227l-0.319,1.01l0.771,1.738l2.498,1.33l1.09,0.096l0.138-2.981l1.635-1.972l-4.46-5.272l0.589-1.789l1.046-0.043l1.591,1.279l1.002-0.501l0.319-1.79l3.732,0.534l1.134-3.239l-1.953,1.375l-5.731-0.14l-3.726,1.929L453.004,427.213L453.004,427.213z\"\/>\
                    <path d=\"M461.69,438.442l1.408,0.043l0.589,0.873h2.05l1.363-0.501l0.459,0.553l-0.907,1.192l-4.002,0.139l-0.728-0.959l-0.77-0.458L461.69,438.442L461.69,438.442z\"\/>\
                <\/g>\
            <\/g>\
        <\/svg>');
}])
;
