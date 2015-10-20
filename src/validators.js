'use strict';
angular.module('sctPlugin.Directives')


// yyyy-dd-mm
.directive('valueValidatorDate', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var msg = '僅能輸入：YYYY-MM-DD';
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if(e.target.value.length > 0){
                    if((new Date(e.target.value)).toJSON() != null && e.target.value.match(/\d+-\d+-\d+/) != null){
                        //
                    } else {
                        alert(msg);
                        elm.focus();
                        e.target.value = scope.getCurrentDatetime('YYYY-MM-DD');
                    }
                }
            });
        }
    }
})


// yyyy-dd-mm hh:mm:ss
.directive('valueValidatorDatetime', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var msg = '僅能輸入：YYYY-MM-DD hh:mm:ss';
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if(e.target.value.length > 0){
                    if((new Date(e.target.value)).toJSON() != null && e.target.value.match(/\d+-\d+-\d+ \d+:\d+:\d+/) != null){
                        //
                    } else {
                        alert(msg);
                        elm.focus();
                        e.target.value = scope.getCurrentDatetime('YYYY-MM-DD hh:mm:ss');
                    }
                }
            });
        }
    }
})


// issue #497
.directive('valueValidator', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            if (attrs.valueValidator) {
                var reg = new RegExp(attrs.valueValidator);
            } else {
                var reg = /^[A-z0-9_\- ]*$/;
            }

            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null) {

                } else {
                    if (attrs.valueValidatorWording) {
                        alert(attrs.valueValidatorWording);
                    } else if (attrs.valueValidator) {
                        alert('You only can input: "' + attrs.valueValidator + '"');
                    } else {
                        alert('You only can input: "A-z, 0-9 or -, _"');
                    }
                    elm.focus();
                }
            });
        }
    }
})


// 英數字, 逗號, 分號, 句號, 驚嘆號
.directive('valueValidatorA', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var flag = attrs.valueValidatorA;
            var reg, msg;
            if (flag == '1') {
                reg = /^[\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]*$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號';
            } else if (flag == '2') {
                reg = /^[\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]*$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號';
            } else {
                reg = /^[\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]+$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號';
            }
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null || e.target.value.length == 0) {
                    //
                } else {
                    alert(msg);
                    elm.focus();
                }
            });
        }
    }
})


// 中英數字, 逗號, 分號, 句號, 驚嘆號
.directive('valueValidatorB', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var flag = attrs.valueValidatorB;
            var reg, msg;
            if (flag == '1') {
                reg = /^[\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]*$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號';
            } else if (flag == '2') {
                reg = /^[\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]*$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號';
            } else if (flag == '3') {
                reg = /^[\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]+$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號';
            } else {
                reg = /^[\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]+$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號';
            }
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null || e.target.value.length == 0) {
                    //
                } else {
                    alert(msg);
                    elm.focus();
                }
            });
        }
    }
})


// 英數字, 逗號, 分號, 句號, 驚嘆號, "&"
.directive('valueValidatorD', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var flag = attrs.valueValidatorD;
            var reg, msg;
            if (flag == '1') {
                reg = /^[\u0026\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]*$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號, &';
            } else if (flag == '2') {
                reg = /^[\u0026\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]*$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號, &';
            } else {
                reg = /^[\u0026\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]+$/;
                msg = '僅能輸入：英數字, 逗號, 分號, 句號, 驚嘆號, &';
            }
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null || e.target.value.length == 0) {
                    //
                } else {
                    alert(msg);
                    elm.focus();
                }
            });
        }
    }
})


// 中英數字, 逗號, 分號, 句號, 驚嘆號, "&"
.directive('valueValidatorE', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var flag = attrs.valueValidatorE;
            var reg, msg;
            if (flag == '1') {
                reg = /^[\u0026\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]*$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號, &';
            } else if (flag == '2') {
                reg = /^[\u0026\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]*$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號, &';
            } else if (flag == '3') {
                reg = /^[\u0026\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021\u0020]+$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號, &';
            } else {
                reg = /^[\u0026\u3400-\u9FFF\u0030-\u0039\u003b\u0041-\u005a\u0061-\u007a\u002e\u0021]+$/;
                msg = '僅能輸入：中英數字, 逗號, 分號, 句號, 驚嘆號, &';
            }
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null || e.target.value.length == 0) {
                    //
                } else {
                    alert(msg);
                    elm.focus();
                }
            });
        }
    }
})


// 數字
.directive('valueValidatorNumber', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /^[\u0030-\u0039]*$/;
            msg = '僅能輸入：數字';
            elm.blur(function(e) {
                e.target.value = e.target.value.trim();
                if (e.target.value.match(reg) != null) {
                    //
                } else {
                    alert(msg);
                    elm.focus();
                }
            });
        }
    }
})


// 英數字
.directive('valueValidatorNumberAndAlphabet', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[0-9A-Za-z]*/;
            msg = '僅能輸入：英文、數字';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null & e.target.value[0] != '-' && e.target.value.match(reg)[0] == e.target.value) {
                        //
                    } else {
                        alert(msg);
                        elm.focus();
                    }
                }
            });
        }
    }
})


// 輸入時只能接受 英文、數字、、dash \'-\' ,且底線、dash 不可以在第一位
.directive('valueValidatorId', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[0-9A-Za-z\-]*/;
            msg = '輸入時只能接受 英文、數字、dash \'-\' ,且dash 不可以在第一位';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null & e.target.value[0] != '-' && e.target.value.match(reg)[0] == e.target.value) {
                        //
                    } else {
                        alert(msg);
                        elm.focus();
                    }
                }
            });
        }
    }
})


// 允許輸入英數字含空白, 但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorEName', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入英數字含空白, 但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        var reg2 = /[\u0020-\u007e]*/;
                        if(e.target.value.match(reg2) != null && e.target.value.match(reg2)[0] == e.target.value){

                        }
                        else{
                            alert(msg);
                            elm.focus();
                        }
                    }
                }
            });
        }
    }
})


// 允許輸入繁中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorTcName', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入繁中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        
                    }
                }
            });
        }
    }
})


// 允許輸入簡中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorScName', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入簡中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        
                    }
                }
            });
        }
    }
})


// 允許輸入繁中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorEDescription', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入英數字含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        var reg2 = /[\u0020-\u007e]*/;
                        if(e.target.value.match(reg2) != null && e.target.value.match(reg2)[0] == e.target.value){
                            
                        }
                        else{
                            alert(msg);
                            elm.focus();
                        }
                    }
                }
            });
        }
    }
})


// 允許輸入繁中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorTcDescription', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入繁中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        
                    }
                }
            });
        }
    }
})


// 允許輸入簡中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入
.directive('valueValidatorScDescription', function($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var reg, msg;
            reg = /[~$^@_]/;
            msg = '允許輸入簡中含空白,但符號 ‘~’, ‘$’, ‘^’, ‘@’, 底線共五種不得輸入';
            elm.blur(function(e) {
                if(e.target.value.length > 0){
                    e.target.value = e.target.value.trim();
                    if (e.target.value.match(reg) != null) {
                        alert(msg);
                        elm.focus();
                    } else {
                        
                    }
                }
            });
        }
    }
})
;
