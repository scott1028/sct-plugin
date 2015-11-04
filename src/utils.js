'use strict';


//
angular.module('sctPlugin', [])
    .directive("sortable", function() {

        console.debug('sortable API: <th ng-click="sortBy.handler(\'id\', dataList)">ID</th>');
        console.debug('\tMaybe you will need a reset status method to reset:');
        console.debug('\t\t$(\'[sortable]\').scope().flag = null');
        console.debug('\t\t$(\'[sortable]\').scope().lastTargetField = null');

        return {
            restrict: "A",
            replace: true,
            link: function($scope, elem, attrs, ngModelCtrl) {
                $scope.sortBy = {
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