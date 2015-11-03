'use strict';
angular.module('sctPlugin.Directives')


//
.directive('fileModel', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('ex: <input class="input_file hidden" id="input_file" type="file" file-model="inputFile">');
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }
])
//
.directive('toNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            ctrl.$parsers.push(function(value) {
                if (value === 0)
                    return 0;

                return parseFloat(value || '');
            });
        }
    };
})
//
.directive('unicodeMaxLength', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {

            ctrl.$parsers.push(function(val) {

                var getUTF8Length = function(string) {
                    var utf8length = 0;
                    for (var n = 0; n < string.length; n++) {
                        var c = string.charCodeAt(n);
                        if (c < 128) {
                            utf8length++;
                        } else if ((c > 127) && (c < 2048)) {
                            utf8length = utf8length + 2;
                        } else {
                            utf8length = utf8length + 3;
                        }
                    }
                    return utf8length;
                };

                if (getUTF8Length(val) > parseInt(attrs.unicodeMaxLength)) {
                    ctrl.$setViewValue(val.slice(0, -1));
                    ctrl.$render();
                    return val.slice(0, -1)
                }

                return val;
            });
        }
    }
})
// not allow wrap
.directive('notAllowWrap', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            elm.keypress(function(event) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                }
            });
        }
    }
})
// input Mask by native pattern attributes
.directive('inputPattern', function(){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('InputPattern Directive API:');
            console.debug('\tex: <input input-pattern="([0-9]|\.)"');
            console.debug('\n');
            console.debug('<input ' +
                            'new-maxlength="20" ' +
                            'type="text" ' +
                            'ng-model="item.displayOrder" ' +
                            'input-pattern="(?:[0-9\.])" ' +
                            'blur-pattern="^(?:[0-9]*)(?:[0-9]+?\.)*(?:[0-9]+)$|^\d$|^$" />');


            //
            if(!elm.attr('input-pattern')){
                throw new Error('No Value in < ... input-pattern=? ... />');
            }


            //
            elm.on('input', function(e) {
                if(e.target.value !== '' || e.target.value !== undefined || e.target.value !== null){
                    var newValue = '';
                    var skipWord = false;
                    var cursorPosition = null;
                    for(var i = 0; i < e.target.value.length;i++){
                        if(e.target.value[i].match(e.target.getAttribute('input-pattern')) === null){
                            console.log('Skip word:', e.target.value[i]);
                            skipWord = true;
                            cursorPosition = e.target.selectionStart;
                        }else{
                            newValue += e.target.value[i];
                        }
                    }

                    var charOffset = e.target.value.length - newValue.length;
                    if(newValue !== e.target.value) e.target.value = newValue;
                    if(cursorPosition !== null) e.target.setSelectionRange(cursorPosition - charOffset, cursorPosition - charOffset);
                }
            });
        }
    }
})
.directive('blurPattern', function(){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('BlurPattern Directive API:');
            console.debug('\tex: <input blur-pattern="([0-9]|\.)"');
            console.debug('\n');


            //
            if(!elm.attr('blur-pattern')){
                throw new Error('No Value in < ... blur-pattern=? ... />');
            }


            //
            elm.blur(function(e) {
                if(e.target.value.match(new RegExp(e.target.getAttribute('blur-pattern'))) === null){
                    alert('當前輸入：' + e.target.value + '格式不符！');
                    angular.element(e.target).focus();
                };
            });
        }
    }
})
;
