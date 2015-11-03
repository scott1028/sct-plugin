'use strict';
angular.module('sctPlugin.Directives', [])


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
//
.directive('maxlength', function() {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            console.debug('Please use new-maxlength instead of native maxlength.');
            throw new Error('Do not use maxlength for ngModel.');
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
;
