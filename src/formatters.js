'use strict';
angular.module('sctPlugin')


//
.directive('fileModel', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('ex: <input class="input_file hidden" id="input_file" type="file" file-model="inputFile">');
        console.debug('ex: Fetch fileName to ngModel for formValidation:');
        console.debug("\t" + '<input type="text" ng-model="addForm.$$importConfigurationScript.name" readonly />');
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
.directive('multiFileModel', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('ex: <input class="input_file hidden" id="input_file" type="file" file-model="inputFile">');
        console.debug('多檔的時候要重組 fileList 陣列改成只偶 fileName 的 String 再塞到 ngModel 做 Validation 否則會出現 Readonly Assign 的 AngularJS 錯誤！');
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.multiFileModel);
                var modelSetter = model.assign;
                element.bind('change', function() {
                    scope.$apply(function() {
                        var filelist = [];
                        for(var i=0; i<element[0].files.length; i++) filelist.push(element[0].files[i]);
                        modelSetter(scope, filelist);
                    });
                });
            }
        };
    }
])
//
.directive('newMaxlength', function() {
    return {
        priority: 900,
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            console.debug('newMaxlength API: < ... new-maxlength="$int"... />');
            console.debug('To set newMaxlength before string-to-number directive, please');
            var maxlength = Number(attrs.newMaxlength);
            element.on('input', function(e){
                var cp = doGetCaretPosition(e.target);
                var text = e.target.value;
                console.log(text);
                if(text === null || text === undefined) text = '';
                if (text.toString().length > maxlength) {
                    var transformedInput = text.toString().substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    setSelectionRange(e.target, cp, cp);
                };
            });
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
.directive('toNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, elem, attrs, ngModelCtrl) {
            elem.bind('change', function(e){
                var newValue = parseFloat(e.target.value);
                if(isNaN(newValue)) newValue = null;
                ngModelCtrl.$setViewValue(newValue);
                ngModelCtrl.$render();
                scope.$apply();
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
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('InputPattern Directive API(only work for input[type=text]):');
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

                // fix bug for ngModel != input[value]
                ctrl.$setViewValue(e.target.value);
                ctrl.$render();
            });
        }
    }
})
.directive('inputPatternAll', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('InputPattern Directive API(only work for input[type=text]):');
            // ex: ^(?:(\d+|\d+\.|(\d+\.\d\d)|(\d+\.\d)))$
            console.debug('\tex: <input input-pattern-all="^(?:(\\d+|\\d+\\.|(\\d+\\.\\d\\d)|(\\d+\\.\\d)))$" ...');
            console.debug('\n');
            console.debug('<input ' +
                            'new-maxlength="20" ' +
                            'type="text" ' +
                            'ng-model="item.displayOrder" ' +
                            'input-pattern-all="(?:[0-9\.])" />');
            console.debug('Sometime conflict with new-maxlength.');


            //
            if(!attrs.inputPatternAll){
                throw new Error('No Value in < ... input-pattern=? ... />');
            }

            var lastValue = elm.val();
            var pattern = new RegExp(attrs.inputPatternAll);

            // fix little bug when value existed.
            elm.on('focus', function(e){
                console.log(e);
                lastValue = elm.val();
            });

            //
            elm.on('input', function(e) {
                var cp = doGetCaretPosition(e.target);
                console.log(e.target.value, lastValue);
                if(e.target.value !== '' || e.target.value !== undefined || e.target.value !== null){
                    if(e.target.value.match(pattern) === null){
                        e.target.value = lastValue;
                    }
                }

                console.log(scope.$eval(attrs.ngModel));
                lastValue = e.target.value;
                ctrl.$setViewValue(e.target.value);
                ctrl.$render();
                setSelectionRange(e.target, cp, cp);
            });

            elm.on('blur', function(e) {
                if(e.target.value === '')
                    return;
                if(attrs.stringToNumber !== undefined){
                    e.target.value = parseFloat(e.target.value);
                };
            });
        }
    }
})
.directive('blurPattern', function($ngBootbox){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('BlurPattern Directive API:');
            console.debug('\tex: <input blur-pattern="([0-9]|\.)" ...');
            console.debug('\tex: <input blur-pattern="([0-9]|\.)" blur-error-message="test message" ...');
            console.debug('\n');


            //
            if(!elm.attr('blur-pattern')){
                throw new Error('No Value in < ... blur-pattern=? ... />');
            }


            //
            var message = '';
            if(elm.attr('blur-error-message')){
                message = elm.attr('blur-error-message');
            };


            //
            elm.blur(function(e) {
                if(e.target.value.match(new RegExp(e.target.getAttribute('blur-pattern'))) === null){
                    // if(message !== '') alert(message);
                    // else alert('當前輸入值為："' + e.target.value + '" 與格式不符！');
                    // angular.element(e.target).focus();
                    var target = e.target;
                    if(document.querySelector('.bootbox.modal.bootbox-alert') !== null){
                        if(document.activeElement === document.body)
                            target.focus();
                        return;
                    }
                    if(message !== ''){
                        $ngBootbox.alert(message).then(function(){
                            target.focus();
                        });
                    }
                    else{
                        $ngBootbox.alert('當前輸入值為："' + e.target.value + '" 與格式不符！').then(function(){
                            target.focus();
                        });
                    }
                };
            });
        }
    }
})
//
.directive('newMaxValue', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('newMaxValue Directive: work with input[text] well.');
        console.debug('\tex: <input class="input_file hidden" id="input_file" type="file" new-max-value="100">');
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModelCtrl) {

                //
                var targetValue = element.attr('new-max-value');
                if(!targetValue){
                    throw new Error('No Value in < ... new-max-value=? ... />');
                }

                element.bind('change', function(e){
                    if(parseFloat(e.target.value) >= parseFloat(targetValue)){
                        ngModelCtrl.$setViewValue(parseFloat(targetValue));
                    }
                    else{
                        ngModelCtrl.$setViewValue(parseFloat(e.target.value));
                    };
                    ngModelCtrl.$render();
                    scope.$apply();
                });
            }
        };
    }
])
//
.directive('newMinValue', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('newMinValue Directive: work with input[text] well.');
        console.debug('\tex: <input class="input_file hidden" id="input_file" type="file" new-min-value="100">');
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModelCtrl) {

                //
                var targetValue = element.attr('new-min-value');
                if(!targetValue){
                    throw new Error('No Value in < ... new-min-value=? ... />');
                }

                element.bind('change', function(e){
                    if(parseFloat(e.target.value) <= parseFloat(targetValue)){
                        ngModelCtrl.$setViewValue(parseFloat(targetValue));
                    }
                    else{
                        ngModelCtrl.$setViewValue(parseFloat(e.target.value));
                    };
                    ngModelCtrl.$render();
                    scope.$apply();
                });
            }
        };
    }
])
//
.directive('ngPlaceholder', ['$parse',
    function($parse) {
        // refer to https://segmentfault.com/q/1010000002677808
        console.debug('ngPlaceholder Directive: work with ngPlaceholder[placeholder] well.');
        console.debug('\tex: <input class="input_file hidden" id="input_file" type="file" ng-placeholder="3123\n3123\n3123">');
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModelCtrl) {

                //
                var targetValue = element.attr('ng-placeholder');
                targetValue = JSON.parse('{"val":"' + targetValue + '"}').val;
                if(!targetValue){
                    throw new Error('No Value in < ... ng-placeholder=? ... />');
                }
                element.attr('placeholder', targetValue);
            }
        };
    }
])
.directive('stringToNumber', [
    function() {
        return {
            require: 'ngModel',
            priority: 1000,
            link: function(scope, element, attrs, ngModel) {
                var emptyValue = scope.$eval(attrs.stringToNumber);

                ngModel.$parsers.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return parseFloat(value);
                });

                ngModel.$formatters.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return '' + value;
                });
            }
        };
    }
])
.directive('numberToString', [ 
    function() {
        return {
            require: 'ngModel',
            priority: 1000,
            link: function(scope, element, attrs, ngModel) {
                var emptyValue = scope.$eval(attrs.numberToString);

                ngModel.$parsers.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return '' + value;
                });
                
                ngModel.$formatters.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return parseFloat(value);
                });
            }
        };
    }
])
.directive('stringToString', [ 
    function() {
        return {
            require: 'ngModel',
            priority: 1000,
            link: function(scope, element, attrs, ngModel) {
                var emptyValue = scope.$eval(attrs.stringToString);

                ngModel.$parsers.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return '' + value;
                });
                
                ngModel.$formatters.push(function(value) {
                    if(value === emptyValue || value === '' || value === undefined)
                        return emptyValue;
                    return '' + value;
                });
            }
        };
    }
])
;