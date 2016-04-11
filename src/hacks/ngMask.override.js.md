#### ngMask Usage

```
angular
    .module('Taisys.KMS', ['ngRoute', 'sctPlugin', 'ngCookies', 'ngMask'])
    .config(function($routeProvider, $locationProvider, $provide, $httpProvider) {

        // Override MaskService of ngMask Plugin;
        $provide.decorator('MaskService', function ($q, OptionalService, UtilService) {
            return {
                create: OverrideNgMaskCreate($q, OptionalService, UtilService)
            }
        });

        // set Ajax $http Oject config
        $httpProvider.defaults.headers.common.Accept = '*/*';
        $httpProvider.defaults.headers.common.ContentType = 'application/json; charset=utf-8';
    })

```
