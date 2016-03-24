'use strict';


//
console.info('This Func need jQuery DatetimePicker or datetimePicker!');


//
angular.module('sctPlugin.Helpers', [])
//
.directive("tipTitle", function() {
    console.debug('dataToggle by: http://www.w3schools.com/bootstrap/bootstrap_tooltip.asp');
    console.debug('\t<a tip-title="your message" ></a>')
    return {
        restrict: "A",
        link: function(scope, elem, attrs, ngModelCtrl) {
            elem.attr('title', attrs.tipTitle);
            elem.tooltip();
        }
    }
})
//
.directive("datepicker", function() {
    console.debug('DatePicker by: https://jqueryui.com/');
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
//
.directive("datetimepicker", function() {
    console.debug('DateTimePicker by: http://trentrichardson.com/examples/timepicker/');
    console.debug('DateTimePicker CDN by: http://cdnjs.com/libraries/jquery-ui-timepicker-addon');
    console.debug('(Optional)TimePicker CDN by: https://cdnjs.com/libraries/jquery-timepicker');
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
;