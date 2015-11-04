'use strict';
angular.module('sctPlugin')


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
;
