'use strict';


//
angular.module('sctPlugin.Directives', [])
    .controller('SortingHelper', ['$rootScope', '$scope',
        function($rootScope, $scope) {

            //
            console.log('Loading SortingHelper Controller!');

            //
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
    ])
;