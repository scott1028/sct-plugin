'use strict';


//
angular.module('sctPlugin', ['sctPlugin.Helpers'])
    .run(['$rootScope', '$location', function($rootScope, $location){
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

        // stop all ajax and go new URL Path
        $rootScope.stopAndGo = function (uri) {
            console.log('TargetURI:', uri);
            //
            if (uri !== null || uri !== undefined) {
                console.log('Replace Before:', uri);
                // noinspection SillyAssignmentJS
                uri.toString()[0] === '#' ? uri = uri.toString().substring(1) : uri = uri;
                console.log('Replace After:', uri);
            }

            // $location.url() has bug.....
            // $location.url(uri);
            // set a history URI
            $rootScope.lastHashBag = location.hash;
            $rootScope.lastURI = location.href;

            // to new URI
            // location.href = '#' + uri;
            if(uri != 'login'){
                //
                console.log('Stop all ajax Request!');
                stop();
                console.log('Start to another URL:' + uri);
            }
            $location.url(uri);
        };

        console.log('This need moment.js plugin');
        console.log('<script src="/components/moment/moment.js"></script>');
        console.log('<script src="/components/moment-timezone/builds/moment-timezone-with-data.js"></script>');
        console.log('CDN: https://cdnjs.com/libraries/moment.js/');
        console.log('CDN: https://cdnjs.com/libraries/moment-timezone/');
        console.log('Example#1: getCurrentDatetime(\'YYYY-MM-DD HH:mm:ss\')');
        console.log('Example#2: getCurrentDatetime(\'YYYY-MM-DD HH:mm:ss\', \'Asia/Taipei\')');
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
        console.debug('\tSample for .resetSortedFlag():');
        console.debug([
            '\t\tvar resetSortable = function(){\n',
            '\t\t    var scope = $(\'[sortable]\').scope();\n',
            '\t\t    scope.sortBy.flag = null;\n',
            '\t\t    scope.sortBy.lastTargetField = null;\n',
            '\t\t};'].join(''));
        console.debug([
            '\t(*)Sorted Flag Display API Sample:\n',
            '\t\t<span>{{ sortBy.displayIcon(\'master_id\') }}</span>'
        ].join(''));

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