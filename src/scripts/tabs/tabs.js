/**
 * Directive for controlling tabs
 */
;(function () {
  angular
    .module('Horn')
    .directive('tabs', function () {

      function Controller ($scope, $q) {

        var vm = this,
            tabs = $scope.items;

        /*
         * On tabs count change
         */
        $scope.$watch('items.length', function (newValue, oldValue) {
          if (oldValue < newValue)
            vm.set(newValue - 1);
        });

        /**
         * Change currently active tab. Produces two events:
         * tabs:beforeChanged()
         * tabs:changed(id) where
         * @param {Number} id - number of new tab
         */
        vm.set = function (id) {
          $scope.$emit('tabs:beforeChanged');
          $scope.current = id;
          $scope.$emit('tabs:changed', id);
        }

        /**
         * Check if tab is selected
         * @param {Number} id - number of tested tab
         */
        vm.isActive = function (id) {
          return id === $scope.current;
        }

        vm.close = function (id) {
          var defer = $q.defer();
          $scope.$emit('tabs:closing', defer);

          defer.promise.then(function () {
            console.log('we are closing');
          });
        }
      }

      return {
        restrict: 'E',
        require: '?ngDblclick',
        scope: {
          items: '=',
          current: '='
        },
        templateUrl: 'scripts/tabs/tabs.html',
        controller: Controller,
        controllerAs: 'tabs'
      }
    })
})();
