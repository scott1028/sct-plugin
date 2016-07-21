'use strict';

console.debug("doFormat API: <input class=\"form-control\" type=\"number\" ng-model=\"item.price\" ng-blur=\"doNumberFormat('(?:^[0-9]{1,5}\\.\\d{1,2})|(?:^[0-9]{1,5})', 'item.price')\" />");
var formaters = {
    doNumberFormat: function(regexString, nodeValue){
        var findModel = function(node){
            $$scope = $$scope[node];
        };

        var $scope = this;
        var regexp = new RegExp(regexString);
        var $$scope = $scope;
        var tailField = null;
        var tailNode = null;
        var nodeList = nodeValue.split('.');

        for(var i = 0; i < nodeList.length; i++){
            if(i == (nodeList.length - 1)){
                tailField = nodeList[i];
                tailNode = $$scope;
            }
            else{
                findModel(nodeList[i]);
            }
        };

        if(tailNode[tailField] == undefined)
            return tailNode[tailField] = 0;

        if(tailNode[tailField] == null)
            return tailNode[tailField] = 0;

        var stringValue = tailNode[tailField].toString();
        tailNode[tailField] = parseFloat(stringValue.match(regexp));
    }
};
