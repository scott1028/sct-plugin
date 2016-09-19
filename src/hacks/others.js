var toggleSelectionGen = function(){
    return function toggleSelection(pk, form_has_many_data_ref) {
        var idx = form_has_many_data_ref.indexOf(pk);

        // is currently selected
        if (idx > -1) {
            form_has_many_data_ref.splice(idx, 1);
        }

        // is newly selected
        else {
            form_has_many_data_ref.push(pk);
        }
    };
};

console.debug('toggleSelectionGen Usage:');
console.debug('<div\n\
    ng-repeat="item in functionList" class="checkbox">\n\
    <label>\n\
        <input\n\
            type="checkbox"\n\
            value="{{ item.id }}"\n\
            ng-checked="addForm.funcList.indexOf(item.id) > -1"\n\
            ng-click="toggleSelection(item.id, addForm.funcList)">\n\
            {{ item.function_id }}\n\
    </label>\n\
</div>');
console.debug('* addForm.funcList is List<PK-Integer> Type!');


var LeakArray = function(size){
    var size = size;
    var store = new Array(size);
    this.push = function(val){
        store = store.slice(1, size);
        store.push(val);
    };
    this.pop = function(){
        store.pop();
    };
    this.debug = function(){
        return store;
    };
    this.get = function(index){
        return store[index];
    };
    this.set = function(index, val){
        store[index] = val;
    };
};
console.debug('new LeakArray(2); // 隨著推進新的元素會拋棄舊的元素.');


console.debug('Safari JSON.stringify issue patch.');
Number.prototype.startsWith = function(v){
    var val;
    if(this === null || this === undefined)
        val = '';
    else
        val = String(this);
    return val.startsWith(String(v));
};


// String.format('{0}, {1}, {2}', 1, 2, 3);
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {       
        var reg = new RegExp("\\{" + i + "\\}", "gm");             
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};


// String as Date object
String.prototype.asDate = function(){
    if(this.toString().match(/^\d{4}-\d{2}-\d{2}/) === null)
        throw new Error('date format must be started with yyyy-mm-dd.');;
    return new Date(this.toString());
};


//
Date.prototype.isValid = function(){
    if(typeof moment !== typeof Function)
        throw new Error('please install moment.js plugin.');
    return moment(this).isValid();
};
