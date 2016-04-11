#### PaginatorFuncPrototype Usage

```
PaginatorFuncPrototype 使用說明 & 範例：
    1. 利用 getter 取得所有 Interface 都一樣的 Ajax 封裝樣式，把 Ajax 執行中的技術器寫入 ajaxingCounter(由 +1 to -1 控制 Ajax 歸０ 表示完成控制 Ajax Loading 動畫)！
    2. 將 success Callback 封裝好，避免重複掉用並且紀錄上一次的 Query String 方便 Refresh & 翻頁 用途！ 
    3. 調用 .inquery 會紀錄 成功後的 successCallback 所以 .refresh & .page & .reloadBySort 翻頁等等功能將可以不用再度輸入 successCallback。
    4. 調用 .reset 重置當前紀錄的 successCallback & queryString。

    
    - Example：
    * In ngService Define： 
        var ajaxingCounter = {
            value: 0
        };
        var engineerCos = PaginatorFuncPrototype($root);
        engineerCos.inquiry = function(params, success){
            // 讓 ajax Loading Counter +1 控制顯示動畫。
            ajaxingCounter.value += 1;
            var self = this;
            $http({
                method: 'GET',
                url: '/api/EngineerCOSGeneration/query',
                params: params
            }).then(function(resp){
                // 紀錄 inquery 後的 successCallback & queryString。
                self.lastQuery.params = params;  // add orderByField
                self.lastQuery.success = success;
                // 讓 ajax Loading Counter -1 控制顯示動畫。
                ajaxingCounter.value -= 1;
                success(resp);
            }, function(resp){
                ajaxingCounter.value -= 1;
                $root.errorHandle(resp);
            });
        };
        return {
            ajaxingCounter: ajaxingCounter,
            engineerCos: engineerCos,  // 
                ...
        }

    * In ngController： 

        engineerCosGenService.engineerCos.inquiry({
            offset: 1,
            limit: $scope.queryConfig.pageSize,
            sort: null,
            orderByType: 'asc'
        }, function(resp){
            $scope.engineerCosGenerationList = resp.data.objectList
            var pageInfo = $scope.parseSearchBean(resp.data.searchBean, engineerCosGenService.engineerCos.lastQuery.params.limit);
            $scope.total_count = pageInfo.totalCount;
            $scope.total_page = pageInfo.totalPage;
        });
```