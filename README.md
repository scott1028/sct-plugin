# sct-plugin

- 手刻 UI 常用的 Helper Func 集合。

## Installation

~~~
$ bower install https://github.com/scott1028/sct-plugin.git
~~~

~~~
<script src="/components/sctPlugin/src/utils.js"></script>
<script src="/components/sctPlugin/src/directives.js"></script>
<script src="/components/sctPlugin/src/formatters.js"></script>
<script src="/components/sctPlugin/src/validators.js"></script>
~~~

~~~
angular.module('yourApp', [
           ...
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngAnimate',
           ...
        'sctPlugin'
    ])
~~~

## Directives of Helper

* shadowDom
  * ShadowDom Replace Directive;
    ex: < shadow-dom >test< /shandow-dom >

* draggable
  * 拖曳附加 Directive
  * ex: < div draggable >< /div >

* ngModelOnblur
  * 將 ngModel's ChangeValue 程序改為 onblur 觸發。
 
* newMaxlength
  * 取代 HTML 原生 maxlength 因為在讀取資料的時候，會讓 AngularJS 的 ngModel 運作不正常。

* staticInclude
  * 以不產生 New Scope 的條件下 include Template。
  * ex: < …  static-include="/xxx/test.html" … >

* ngIncludeReplace
  * 將原生的 ngInclude 附加 replace Mode
  * ex: < div ng-include="..." ng-include-replace >< /div >

* paginator
  * 產生分頁 Toolbar，會自動在 Console 產生 API 說明。(需要 Boostrap CSS 圖示)
  * ex: < paginator page-size="20,30,50" >< /paginator >

* fileModel
  * 提供 input file 的 ngModel 支援。
  * ex: < input class="input_file hidden" id="input_file" type="file" file-model="inputFile" >

* inputPattern
  * 輸入的字元限制器。ex: < ... input-pattern="(?:[0-9\.])" ... />
  * 會自動在 Console 產生 API 說明。

* blurPattern
  * 輸入完畢的時候要 blur 時的檢查字元限制器。ex: < ... blur-pattern="^(?:[0-9]*)(?:[0-9]+?\.)*(?:[0-9]+)$|^\d$|^$" ... />
  * 會自動在 Console 產生 API 說明。

* ajaxingBlockBy
  * 自動產生 Ajaxing Animation 動畫並且 Block 該區塊。
  * Target DOM 必須要可以包含一個 Div 的節點，例如 Table 就不行。

* sortable
  * sortBy.handler($field, $arrayPointer): 搭配 ngClick 做 sorting Action。
  * sortBy.displayIcon($field): 透過 sorting Action 得到目前排序 Desc/ASC Flag。
  * 實際使用部份看 tests/test01.html。

# Testing

~~~
$ bower install
$ http-server
  ( open http://127.0.0.1:8081/tests/test01.html )
~~~

# Note

* jQuery-UI provide DatePicker
* jQuery-UI-Timepicker Addone provider TimePicker integration.
