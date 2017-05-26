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
    // if(this.toString().match(/^\d{4}-\d{2}-\d{2}/) === null)
    //     throw new Error('date format must be started with yyyy-mm-dd.');
    return new Date(this.toString());
};


//
Date.prototype.isValid = function(){
    if(typeof moment !== typeof Function)
        throw new Error('please install moment.js plugin.');
    return moment(this).isValid();
};

//
var stringToArrayBuffer = function(str){
    if(/[\u0080-\uffff]/.test(str)){
        var arr = new Array(str.length);
        for(var i=0, j=0, len=str.length; i<len; ++i){
            var cc = str.charCodeAt(i);
            if(cc < 128){
                //single byte
                arr[j++] = cc;
            }else{
                //UTF-8 multibyte
                if(cc < 2048){
                    arr[j++] = (cc >> 6) | 192;
                }else{
                    arr[j++] = (cc >> 12) | 224;
                    arr[j++] = ((cc >> 6) & 63) | 128;
                }
                arr[j++] = (cc & 63) | 128;
            }
        }
        var byteArray = new Uint8Array(arr);
    }else{
        var byteArray = new Uint8Array(str.length);
        for(var i = str.length; i--; )
            byteArray[i] = str.charCodeAt(i);
    }
    return byteArray.buffer;
};
var arrayBufferToString = function(buffer){
    var byteArray = new Uint8Array(buffer);
    var str = "", cc = 0, numBytes = 0;
    for(var i=0, len = byteArray.length; i<len; ++i){
        var v = byteArray[i];
        if(numBytes > 0){
            //2 bit determining that this is a tailing byte + 6 bit of payload
            if((cc&192) === 192){
                //processing tailing-bytes
                cc = (cc << 6) | (v & 63);
            }else{
                throw new Error("this is no tailing-byte");
            }
        }else if(v < 128){
            //single-byte
            numBytes = 1;
            cc = v;
        }else if(v < 192){
            //these are tailing-bytes
            throw new Error("invalid byte, this is a tailing-byte")
        }else if(v < 224){
            //3 bits of header + 5bits of payload
            numBytes = 2;
            cc = v & 31;
        }else if(v < 240){
            //4 bits of header + 4bit of payload
            numBytes = 3;
            cc = v & 15;
        }else{
            //UTF-8 theoretically supports up to 8 bytes containing up to 42bit of payload
            //but JS can only handle 16bit.
            throw new Error("invalid encoding, value out of range")
        }

        if(--numBytes === 0){
            str += String.fromCharCode(cc);
        }
    }
    if(numBytes){
        throw new Error("the bytes don't sum up");
    }
    return str;
};
var arrayBufferToBase64DataURL = function(buffer, type){
    if(type === undefined) type = 'image/jpg';
    var str = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return 'data:' + type + ';base64,' + btoa(str);
};

console.debug('Import JSON filter util.');
if(JSON){
    JSON.filter = function(item, func){
        return JSON.parse(JSON.stringify(item, func));
    }
};

console.log('Node string parse')
var fromPathToObj = function(path){
    // ex: var aaa = {id:{pk:{$id:7}}}
    // path: 'aaa.id.pk.$id'
    try{
        return (path.split('.').join('"]["') + '"]').replace(/\"]/, '');
    }
    catch(e){
        console.log(e);
        return '';
    }
};

// ref: http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

// ref: http://stackoverflow.com/questions/2897155/get-cursor-position-in-characters-within-a-text-input-field
function doGetCaretPosition(input) {

    // Initialize
    var iCaretPos = 0;

    // IE Support
    if (document.selection) {

        // Set focus on the element
        input.focus();

        // To get cursor position, get empty selection range
        var oSel = document.selection.createRange();

        // Move selection start to 0 position
        oSel.moveStart('character', -input.value.length);

        // The caret position is selection length
        iCaretPos = oSel.text.length;
    }

    // Firefox support
    else if (input.selectionStart || input.selectionStart == '0')
        iCaretPos = input.selectionStart;

    // Return results
    return iCaretPos;
}

// 
function createWorker(script, isURL){
    if(isURL)
        return new Worker(script);
    if(typeof script === 'function')
        script = `(${script.toString()})()`;
    // $origin` is for IE, due to no location.origin in web worker.
    var worker = new Worker(window.URL.createObjectURL(new Blob([`var $origin = '${location.origin}';${script};`], {type: 'text/javascript'})))
    // Usage
    // worker.postMessage( ... );
    // worker.onmessage = function(e){ ... };
    // >> Invoke worker.terminate() when it is no use.
    return worker;
}
