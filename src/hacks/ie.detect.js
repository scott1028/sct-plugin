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
