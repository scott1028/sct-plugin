'use strict';

var PaginatorWatchForAngularJS = function($scope, pageToFunCallback){
    return {
        disable: null,
        // 可以在 init Ajax 後再用 enable 啟動 Watch。監聽該 Ajax 的 current_page_no。
        enable: function(){
            $scope.current_page_no = 1;
            this.disable = $scope.$watch('current_page_no', function(newValue, oldValue){
                if(newValue === oldValue) return;
                console.log(newValue);
                if(!pageToFunCallback) throw new Error('Implement your Ajax Service pageToFunCallback(newValue) in your ngController!');
                pageToFunCallback(newValue);
                // pageToFunc.page(newValue);
                /*
                # In ngController:
                    var paginWathcer = PaginatorWatchForAngularJS($scope, function(pageNo){
                        userMgmService.getUsers.page( (pageNo - 1) * $scope.queryConfig.pageSize);
                    });
                    paginWathcer.enable();
                */
            });
        },
        reset: function(){
            this.disable();
            this.enable();
        }
    };
};

var PaginatorFuncParamsPrototype = function(defaultPageSize){
    return {
        totalCount: 0,
        currentPageNo: 1,
        pageSize: defaultPageSize || 20,
        $watcher: function(){},
    };
};

var PaginatorFuncPrototype = function($root){
    return {
        lastQuery: {
            params: {
                offset: 1,
                limit: $root.queryConfig.pageSize,
                sort: null,
                orderByType: 'asc' // 'desc'
            },
            success: null,
        },
        inquiry: function(params, success){
            throw new Error('Please Implement inquiry Func.');
            // TODO: Override & custom your query ajax func here, example:
            // var self = this;
            // $http({
            //     method: 'GET',
            //     url: '/api/ChipKencManagement/query',
            //     params: params
            // }).then(function(resp){
            //     self.lastQuery.params = params;
            //     self.lastQuery.success = success;
            //     success(resp);
            // }, $root.errorHandle);
        },
        reloadBySort: function(field){
            this.lastQuery.params.sort = field;
            if(this.lastQuery.params.orderByType === 'asc'){
                this.lastQuery.params.orderByType = 'desc';
            }
            else{
                this.lastQuery.params.orderByType = 'asc';
            };
            this.page(1);
        },
        refresh: function(){
            this.inquiry(this.lastQuery.params, this.lastQuery.success);
        },
        page: function(pageNo){
            this.lastQuery.params.offset = pageNo;
            this.inquiry(this.lastQuery.params, this.lastQuery.success);
        },
        reset: function(){
            this.lastQuery = {
                params: {
                    offset: 1,
                    limit: $root.queryConfig.pageSize,
                    sort: null,
                    orderByType: 'asc' // 'desc'
                },
                success: null,
            };
        }
    };
};


console.debug("\
        PaginatorFuncPrototype 使用說明 & 範例：\n\
        \t1. 利用 getter 取得所有 Interface 都一樣的 Ajax 封裝樣式，把 Ajax 執行中的技術器寫入 ajaxingCounter(由 +1 to -1 控制 Ajax 歸０ 表示完成控制 Ajax Loading 動畫)！\n\
        \t2. 將 success Callback 封裝好，避免重複掉用並且紀錄上一次的 Query String 方便 Refresh & 翻頁 用途！ \n\
        \t3. 調用 .inquery 會紀錄 成功後的 successCallback 所以 .refresh & .page & .reloadBySort 翻頁等等功能將可以不用再度輸入 successCallback。\n\
        \t4. 調用 .reset 重置當前紀錄的 successCallback & queryString。\n\
        \n\
        \t\n\
        \t- Example：\n\
        \t* In ngService Define： \n\
        \t\tvar ajaxingCounter = {\n\
            \t\tvalue: 0\n\
        \t\t};\n\
        \t\tvar engineerCos = PaginatorFuncPrototype($root);\n\
        \t\tengineerCos.inquiry = function(params, success){\n\
            \t\t// 讓 ajax Loading Counter +1 控制顯示動畫。\n\
            \t\tajaxingCounter.value += 1;\n\
            \t\tvar self = this;\n\
            \t\t$http({\n\
                \t\tmethod: 'GET',\n\
                \t\turl: '/api/EngineerCOSGeneration/query',\n\
                \t\tparams: params\n\
            \t\t}).then(function(resp){\n\
                \t\t// 紀錄 inquery 後的 successCallback & queryString。\n\
                \t\tself.lastQuery.params = params;  // add orderByField\n\
                \t\tself.lastQuery.success = success;\n\
                \t\t// 讓 ajax Loading Counter -1 控制顯示動畫。\n\
                \t\tajaxingCounter.value -= 1;\n\
                \t\tsuccess(resp);\n\
            \t\t}, function(resp){\n\
                \t\tajaxingCounter.value -= 1;\n\
                \t\t$root.errorHandle(resp);\n\
            \t\t});\n\
        \t\t};\n\
        \t\treturn {\n\
            \t\tajaxingCounter: ajaxingCounter,\n\
            \t\tengineerCos: engineerCos,  // \n\
                \t\t...\n\
        \t\t}\n\
        \n\
        \t* In ngController： \n\
        \n\
        \t\tengineerCosGenService.engineerCos.inquiry({\n\
            \t\toffset: 1,\n\
            \t\tlimit: $scope.queryConfig.pageSize,\n\
            \t\tsort: null,\n\
            \t\torderByType: 'asc'\n\
        \t\t}, function(resp){\n\
            \t\t$scope.engineerCosGenerationList = resp.data.objectList\n\
            \t\tvar pageInfo = $scope.parseSearchBean(resp.data.searchBean, engineerCosGenService.engineerCos.lastQuery.params.limit);\n\
            \t\t$scope.total_count = pageInfo.totalCount;\n\
            \t\t$scope.total_page = pageInfo.totalPage;\n\
        \t\t});\n\
");
