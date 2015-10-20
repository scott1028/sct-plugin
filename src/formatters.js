'use strict';
angular.module('ssdWebClientApp.Directives')


//
.directive('fileModel', ['$parse',
    function($parse) {
        // refer to http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs
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


// max-value 並用
.directive('decimalTo', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg = new RegExp('\\d*\\.*\\d{0,' + (attrs.decimalTo || '2') + '}');

            var getDecimalValue = function(string) {
                var _val = string.match(reg)[0];

                if (parseFloat(_val) > parseFloat(attrs.maxValue || '99999.99')) {
                    // _val = attrs.maxValue || '99999.99';
                    _val = _val.slice(0, -1);
                }

                return _val;
            };

            elm.blur(elm.val(), function() {
                //noinspection JSPotentiallyInvalidUsageOfThis
                if (this.value != '') {
                    //noinspection JSPotentiallyInvalidUsageOfThis,JSPotentiallyInvalidUsageOfThis
                    this.value = parseFloat(getDecimalValue(this.value));
                }
            });

            ctrl.$parsers.push(function(val) {
                if (getDecimalValue(val) != val) {
                    ctrl.$setViewValue(getDecimalValue(val));
                    ctrl.$render();
                    return getDecimalValue(val);
                }

                return val;
            });
        }
    }
})

.directive('dynamicMaxLength', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var config = attrs.dynamicMaxLength || '{}';
            config = JSON.parse(config);

            ctrl.$parsers.push(function(val) {
                if (config[attrs.dynamicMaxLengthTarget]) {
                    attrs.$set('maxlength', parseInt(config[attrs.dynamicMaxLengthTarget]));
                }

                return val;
            });
        }
    }
})

.directive('spaceInputNotAllowed', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var config = attrs.spaceInputNotAllowed || false;
            config = JSON.parse(config);

            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
            });

            ctrl.$parsers.push(function(val) {
                if (config) {
                    if (val.replace(/ /g, '') != val) {
                        ctrl.$setViewValue(val.replace(/ /g, ''));
                        ctrl.$render();
                        return val.replace(/ /g, '');
                    }
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
.directive('pattern', function(){
    return {
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            console.debug('Pattern Directive API:');
            console.debug('\tex: <input pattern="([0-9]|\.)"');
            console.debug('\n');


            //
            if(!elm.attr('pattern')){
                throw new Error('No Value in < ... pattern=? ... />');
            }


            //
            elm.on('input', function(e) {
                if(e.target.value !== '' || e.target.value !== undefined || e.target.value !== null){
                    var newValue = '';
                    var skipWord = false;
                    var cursorPosition = null;
                    for(var i = 0; i < e.target.value.length;i++){
                        if(e.target.value[i].match(e.target.pattern) === null){
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
;
