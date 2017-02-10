function msieversion() {

    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
    {
        // alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
        return true;
    }
    else  // If another browser, return 0
    {
        // alert('otherbrowser');
        return false;
    }

    return false;
};

//
function stopFunctionForIE(){
    document.execCommand('Stop');
};

//
function blobDownload(blob, fileName){
    if(msieversion()){
        window.navigator.msSaveBlob(blob, fileName);
    }
    else {
        var downloadURL = window.URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.download = fileName;
        link.href = downloadURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

console.debug('\
\t// Detect IE then replace stop Function.\n\
\tif(msieversion()){\n\
\t    window.stop = stopFunctionForIE;\n\
\t}\n\
');


if(!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
};

// Ref: https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
    Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
};
