'use strict';


//
angular.module('sctPlugin', [])
    .run(['$rootScope', function($rootScope){
        // ref: https://css-tricks.com/snippets/jquery/get-query-params-object/
        angular.element.extend({
            getQueryStringFromURL : function(key) {
                var result = document.location.search.replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
                if(key != undefined)
                    return (angular.equals(result, {'': undefined}) ? {} : result)[key];
                else
                    return angular.equals(result, {'': undefined}) ? {} : result;
            }
        });

        $rootScope.debugger = function (params) {
            debugger;
        };

        console.log('This need moment.js plugin');
        console.log('<script src="/components/moment/moment.js"></script>');
        console.log('<script src="/components/moment-timezone/builds/moment-timezone-with-data.js"></script>');
        $rootScope.getCurrentDatetime = function (format, timezone) {
            if (!timezone) timezone = 'Asia/Taipei';
            return moment().tz(timezone).format(format);
        };
    }])
    .directive("sortable", function() {

        console.debug('sortable API: <th ng-click="sortBy.handler(\'id\', dataList)">ID</th>');
        console.debug('\tMaybe you will need a reset status method to reset:');
        console.debug('\t\t$(\'[sortable]\').scope().sortBy.flag = null');
        console.debug('\t\t$(\'[sortable]\').scope().sortBy.lastTargetField = null');
        console.debug('\t\t$(\'[sortable]\').scope().sortBy.resetSortedFlag();  // To invoke it when you want to initialize component.');
        console.debug('\tSample:');
        console.debug([
            '\t\tvar resetSortable = function(){\n',
            '\t\t    var scope = $(\'[sortable]\').scope();\n',
            '\t\t    scope.sortBy.flag = null;\n',
            '\t\t    scope.sortBy.lastTargetField = null;\n',
            '\t\t};'].join(''));

        return {
            restrict: "A",
            replace: true,
            link: function($scope, elem, attrs, ngModelCtrl) {
                $scope.sortBy = {
                    resetSortedFlag: function(){
                        this.flag = null;
                        this.lastTargetField = null;
                    },
                    handler: function(targetField, store){
                        if(this.flag === null) this.flag = 1;
                        if(this.lastTargetField === null) this.lastTargetField = targetField;
                        if(this.lastTargetField !== targetField) this.flag = 1;
                        this.lastTargetField = targetField;

                        var self = this;
                        store.sort(function(curr, next){
                            var currValue = curr[targetField];
                            var nextValue = next[targetField];
                            if(currValue === null || currValue === undefined) currValue = '';
                            if(nextValue === null || nextValue === undefined) nextValue = '';
                            currValue = String(currValue);
                            nextValue = String(nextValue);
                            if(currValue.localeCompare(nextValue) === 0) return curr.$$hashKey.localeCompare(next.$$hashKey) * self.flag;
                            else return currValue.localeCompare(nextValue) * self.flag;
                        });
                        this.flag *= -1;
                    },
                    displayIcon: function(targetField){
                        if(targetField === this.lastTargetField){
                            switch(this.flag){
                                case 1:
                                    return '-';
                                case -1:
                                    return '+';
                                default:
                                    return '';
                            }
                        };
                        return '';
                    },
                    flag: null,
                    lastTargetField: null,
                };
            }
        };
    })
;