'use strict';
angular.module('sctPlugin')


//
.directive('fileModel', ['$parse', '$timeout',
    function($parse, $timeout) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
        console.debug('ex: <input class="input_file hidden" id="input_file" type="file" file-model="inputFile">');
        console.debug('ex: Fetch fileName to ngModel for formValidation:');
        console.debug(`ex: <input class="input_file hidden" ng-model="inputFile" ng-after-action="image = inputFile.name;">`);
        console.debug("\t" + '<input type="text" ng-model="addForm.$$importConfigurationScript.name" readonly />');
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                        $timeout(function() {
                            if(attrs.ngAfterAction) scope.$eval(attrs.ngAfterAction);
                        });
                        let data = {};
                        data[attrs.fileModel] = element[0].files[0];
                        scope.$emit('fileModel', data);
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
            console.debug('newMaxlength API: < ... new-maxlength="$int" truncate-ng-model placeholder... />');
            console.debug('To set newMaxlength before string-to-number directive, please');
            var maxlength = Number(attrs.newMaxlength);
            var truncateNgModel = attrs.truncateNgModel !== undefined;
            if(!attrs.placeholder && attrs.placeholder !== undefined)
                attrs.$set('placeholder', 'MaxLen: ' + maxlength);
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
                    // force remove no use class
                    if(angular.equals(ngModelCtrl.$error, {})){
                        scope.$evalAsync(function(){
                            setTimeout(function(){
                                element.removeClass(function(index, className){
                                    return className.split(' ').filter(function(row){
                                        return row.startsWith('ng-invalid');
                                    }).join(' ');
                                });
                            });
                        });
                    }
                };
            });
            if(!truncateNgModel)
                return;
            ngModelCtrl.$formatters.push(function(value) {
                if(angular.isString(value))
                    return value.slice(0, maxlength);
                return value;
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
            console.warn('Do not use maxlength for ngModel.');
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
        let getValue = function(emptyValue, value){
            let val = (function(){
                if(value === emptyValue || value === '' || value === undefined)
                    return emptyValue;
                return Number(value);
            })();
            if(isNaN(val)) return emptyValue;
            return val;
        };
        return {
            require: 'ngModel',
            priority: 1000,
            link: function(scope, element, attrs, ngModel) {
                var emptyValue = scope.$eval(attrs.stringToNumber);
                ngModel.$parsers.push(function(value) {
                    let val = getValue(emptyValue, value);
                    return val;
                });

                ngModel.$formatters.push(function(value) {
                    let val = getValue(emptyValue, value);
                    ngModel.$modelValue = val;  // 確保 $modelValue 同步
                    ngModel.$$writeModelToScope();  // 寫入當下的 ngModel of scope
                    return val;  // pipe to $viewValue
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
                    let val = (function(){
                        if(value === emptyValue || value === '' || value === undefined)
                            return emptyValue;
                        return '' + value;
                    })();
                    return val;
                });
                
                ngModel.$formatters.push(function(value) {
                    let val = (function(){
                        if(value === emptyValue || value === '' || value === undefined)
                            return emptyValue;
                        return String(Number(value));
                    })();
                    ngModel.$modelValue = val;  // 確保 $modelValue 同步
                    ngModel.$$writeModelToScope();  // 寫入當下的 ngModel of scope
                    return val;  // pipe to $viewValue
                });
            }
        };
    }
])
.directive('stringToString', [ 
    function() {
        let getValue = function(emptyValue, value){
            let val = (function(){
                if(value === emptyValue || value === '' || value === undefined)
                    return emptyValue;
                return '' + value;
            })();
            return val;
        };
        return {
            require: 'ngModel',
            priority: 1000,
            link: function(scope, element, attrs, ngModel) {
                var emptyValue = scope.$eval(attrs.stringToString);

                ngModel.$parsers.push(function(value) {
                    let val = getValue(emptyValue, value);
                    return val;
                });
                
                ngModel.$formatters.push(function(value) {
                    let val = getValue(emptyValue, value);
                    ngModel.$modelValue = val;  // 確保 $modelValue 同步
                    ngModel.$$writeModelToScope();  // 寫入當下的 ngModel of scope
                    return val;  // pipe to $viewValue
                });
            }
        };
    }
])
.directive('invalidatorFunc', [
    function() {
        return {
            scope: {
                invalidatorFunc: '&'
            },
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                console.log(`Usage - Return Error Message When Invalid Case:
                    <input
                        invalidator-func="invalidatorTest(form)"
                        ng-init="form.msisdn = ''"
                        ... />
                    P.S 亦可搭配 form[ngSubmit=func()] button[type=submit] 來設計.
                    P.S 直接使用沒問題, 已知 Issue: 搭配 $ngBootBox 重複 Hide/Display UI 會造成 $watch 註冊多個.
                        建議搭配 $scope.$new(false); 註冊新的 $scope.$$subScope 於重新顯示 ngBootBox 的時候調用 $$subScope.$destroy() 註銷所有 Watcher!

                    *搭配 ngBootBoox Template 使用注意事項:
                        $ngBootbox.customDialog({
                            templateUrl: 'masterIdModel-detail',
                            className: 'masterIdModel-detail ssd-platform',
                            title: 'Master ID Model Detail',
                            scope: $scope.$new(false),  // create new $subScope
                            onEscape: function(){
                                /* 
                                 * Force destroy all $subScope.$watchers which are created before
                                 * by ng-Directive & customDirective(ex: invalidatorFunc).
                                 */
                                this.find('.ng-scope:first').scope().$destroy();
                            }
                        });
                `);

                scope.$watch(function(){
                    return scope.invalidatorFunc();
                }, function(newValue, oldValue){
                    console.log(`Before ngModel.$setValidity`, newValue, oldValue);
                    ngModel.$setValidity(attrs.ngModel, !newValue)
                    console.log(`After ngModel.$setValidity`, newValue);
                    if(!!newValue)
                        element[0].setCustomValidity(newValue);
                    else
                        element[0].setCustomValidity('');
                }, true);
            }
        };
    }
])
;