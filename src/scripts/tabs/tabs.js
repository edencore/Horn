angular
.module('Horn')
.directive('tabs', function () {
  return {
    restrict: 'E',
    templateUrl: 'scripts/tabs/tabs.html',
    scope: {
      tabs: '=items',
      current: '=',
      onChangeTab: '='
    },
    link: function (scope) {
      scope.setTab = function (id) {
        scope.onChangeTab(id);
      };

      scope.isCurrent = function (obj) {
        return scope.current.cfs === obj.cfs;
      }
    }
  }
});
