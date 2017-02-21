'use strict';


var genAjaxAnimateCtrl = function(self){
    self.ajaxing = true;
    var ajaxCounter = 0;
    self.ajaxCounter = {
        add: function(){
            ajaxCounter += 1;
        },
        sub: function(){
            ajaxCounter -= 1;  
        }
    };
    if(self.$watch){
        self.$watch(function(){
            return ajaxCounter;
        }, function(newValue, oldValue){
            console.log(newValue, oldValue);
            if(newValue === 0)
                self.ajaxing = false;
            else
                self.ajaxing = true;
        });
    }
    return self;
};
