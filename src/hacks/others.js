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
