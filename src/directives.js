'use strict';
angular.module('sctPlugin.Directives', [])
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
.directive("tipBox", function($parse) {
    return {
        restrict: "A",
        require: 'ngModel',
        scope: {
            tipBox: '='
        },
        link: function(scope, elem, attrs, modelCtl) {

            //            
            if(!(attrs.ngBlur && attrs.ngFocus))
                throw new Error('Miss ngBlur & ngFocus handler!');

            //
            elem.attr('title', scope.tipBox);
            $(elem).tooltip({
                placement: 'bottom'
            });
        }
    }
})
.directive("tipInfo", function() {
    return {
        scope: {
            onstoreLangdata: '=onstoreLangdata',
            langdata: '=langdata',
            field: '=field'
        },
        restrict: 'E',
        templateUrl: '/views/__directives__/tool_info.html',
        link: function(scope, elem, attrs, modelCtl) {
            
            //
            console.debug('<tip-info></tip-info> API:');
            console.debug('\tYou must set onstore-langdata="..."');
            console.debug('\tYou must set langdata="..."');
            console.debug('\tYou must set field="..."');
            console.debug('\tTipInfo Element must next origin Element');


            //
            scope.equals = angular.equals;
        }
    }
})
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
.directive('ssdNavbar', function() {
    return {
        restrict: 'E',
        templateUrl: '/views/__directives__/navbar.html'
    };
})
.directive('ssdFooter', function() {
    return {
        restrict: 'E',
        templateUrl: '/views/__directives__/footer.html'
    };
})
.directive('ssdPagination', function() {
    return {
        restrict: 'E',
        scope: {
            pagination: '='
        },
        templateUrl: '/views/pagination.html'
    };
})
.directive("datepicker", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModelCtrl) {
            var updateModel = function(dateText) {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(dateText);
                });
            };
            var options = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText) {
                    updateModel(dateText);
                }
            };
            elem.datepicker(options);
        }
    }
})
.directive("datetimepicker", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elem, attrs, ngModelCtrl) {
            var updateModel = function(dateText) {
                scope.$apply(function() {
                    ngModelCtrl.$setViewValue(dateText);
                });
            };
            var options = {
                timeFormat: 'HH:mm:ss',
                dateFormat: "yy-mm-dd",
                // stepHour: 2,
                // stepMinute: 10,
                // stepSecond: 10,
                onSelect: function(dateText) {
                    updateModel(dateText);
                }
            };
            elem.datetimepicker(options);
        }
    }
})
.directive('ssdAlert', function() {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: '/views/__directives__/alert.html',
        controller: ['$scope', '$element',
            function($scope, $element) {
                $scope.close = function() {
                    $('#alert').modal('toggle');
                }
            }
        ]
    };
})

// product approve
.directive('productApprove', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/onstore_management/__directives__/product_approve.html'
    }
})

// product preview
.directive('productPreview', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/product_preview.html'
    }
})

// package approve
.directive('packageApprove', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/onstore_management/__directives__/package_approve.html'
    }
})

// package preview
.directive('packagePreview', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/package_preview.html'
    }
})

// topup approve
.directive('topupApprove', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/onstore_management/__directives__/topup_approve.html'
    }
})

// topup preview
.directive('topupPreview', function() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/topup_preview.html'
    }
})

// product, package, topup approve list control panel
.directive('baseControlPanel', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/product/onstore_management/__directives__/base_control_panel.html'
    }
})

// packageManage
.directive('controlPanelForPackageManage', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/package_control_panel.html'
    }
})

// productManage
.directive('controlPanelForProductManage', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/product_control_panel.html'
    }
})

// topupManage
.directive('controlPanelForTopupManage', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/product/__directives__/topup_control_panel.html'
    }
})

// paginator
.directive('paginator', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/__directives__/paginator_component.html',
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
                    \n\
                    $scope.current_page_no: 1,2,3,4,5....total_page\n\
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

// topupManage
.directive('horizonLine', function() {
    return {
        replace: false,
        restrict: 'E',
        templateUrl: '/views/__directives__/horizonLine_component.html'
    }
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
.directive('includeReplace', function () {
    return {
        require: 'ngInclude',
        restrict: 'A',
        link: function (scope, el, attrs) {
            el.replaceWith(el.children());
        }
    };
})
.directive('lightbox', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs, controllers){
            var dom=angular.element('<a></a>');
            dom.attr('href', '#');
            dom.addClass('swipebox');
            dom.insertAfter(element);
            element.appendTo(dom);
            angular.element('a.swipebox').swipebox({
                afterOpen: function(){
                    angular.element('#swipebox-bottom-bar').remove();
                    angular.element('.slide.current').click(function(){
                        angular.element('#swipebox-close').click();
                        console.log('Close lightbox.');
                    });
                }
            });

            element.click(function(e){
                e.preventDefault();
                console.log('Show lightbox.');
                dom.attr('href', element.attr('src'));
            });
        }
    }
})
.directive('newMaxlength', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            console.debug('newMaxlength API: < ... new-maxlength="$int"... />');
            var maxlength = Number(attrs.newMaxlength);
            function fromUser(text) {
                if (text.length > maxlength) {
                    var transformedInput = text.substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                }
                return text;
            };
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
})
.directive('maxlength', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            console.debug('Please use new-maxlength instead of native maxlength.');
            throw new Error('Do not use maxlength for ngModel.');
        }
    };
})
;
