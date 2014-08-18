;(function (angular) {
  'use strict';

  function BaseCtrl ($rootScope, $scope, $q, $timeout, Db, Settings, Utils, ngDialog, Editor) {
    var vm = this,
        changingTabs = false;

    vm.tabs = [];
    vm.loading = true;
    vm.current = 0;
    vm.mode = 'md';

    function activate() {
      Utils.loadTabs().then(function (tabs) {
        vm.tabs = tabs;
        Utils.loadCurrentTab().then(function (current) {
          var index = _.findIndex(vm.tabs, {cfs: current.cfs});
          vm.setTab(index);
        });
      }).finally(function () {
        vm.loading = false;
      });
    };

    activate();


    /**
     * Show dialog for renaming tab
     */
    vm.renameTab = function () {
      var tab = vm.tabs[vm.current];
      $scope.tabSettings = {current: tab};

      ngDialog.open({
        template: 'templates/fileSettings.html',
        controller: 'TabSettingsCtrl',
        scope: $scope
      }).closePromise.then(function () {
        Db.update(tab.cfs, tab);
      });
    };


    /**
     * Change current tab
     * @param {Number} id - number of new tab
     * Also will save new current tab to chrome sync storage
     */
    vm.setTab = function (id) {
      var tab = vm.tabs[id],
          doc = tab.doc,
          mode = tab.mode || 'md';
      vm.current = id;
      vm.mode = mode;
      Editor.setDoc(doc);
      Editor.render();
      Utils.saveCurrentTab(tab);
    }

    /*
     * Events
     */

    /*
     * When tab has been switched
     */
    $scope.$on('tabs:changed', function (ev, id) {
      vm.setTab(id);
    });

    /**
     * Shows dialog when tab is going to close
     */
    //TODO: Don't ask if doc is in saved state
    $scope.$on('tabs:closing', function (ev, defer) {
      ngDialog.open({
        template: 'templates/prompt.html',
        controller: 'PromptCtrl'
      }).closePromise.then(function (result) {
        if (result.value) {
          var length = vm.tabs.length - 2;
          defer.resolve();
          vm.setTab(length);
        } else {
          defer.reject();
        };
      });
    });

    /*
     * Toolbar actions
     */

    /**
     * New file button
     */
    vm.newFile = function () {
      var tab = {
        doc: Editor.createDoc(),
        isSaved: false,
        name: 'untitled',
        mode: 'md'
      };
      Db.create(tab).then(function (tab) {
        vm.tabs.push(tab);
        Utils.saveCurrentTab(tab);
        Utils.saveTabs(vm.tabs);
      });
    }

    /**
     * Save file button
     */
    vm.saveFile = function () {
      var tab = vm.tabs[vm.current];

      tab.body = Editor.getText();
      Db.updateBody(tab).then(function () {
        delete tab.isNew;
        tab.isSaved = true;
        Utils.saveTabs(vm.tabs);
      });
    }


    /**
     * Open file button
     */
    vm.openFile = function () {
      ngDialog.open({
        template: 'templates/openFile.html',
        controller: 'OpenFileCtrl'
      }).closePromise.then(function (data) {
        Utils.openDocument(data.value).then(function (tab) {
          var length = vm.tabs.push(tab);
          vm.setTab(length - 1);
        });
      });
    }


    /**
     * Change current mode of Editor
     * @param {'md'|'html'|'preview'} name - name of new mode
     */
    vm.setMode = function (name) {
      vm.mode = vm.tabs[vm.current].mode = name;
      Editor.render();
      Editor.setDoc(vm.tabs[vm.current].doc);
    }

    vm.isMode = function (name) {
      return vm.mode == name;
    }

    window.dbg = {};
    window.dbg.tabs = vm.tabs;
    window.dbg.root = $rootScope;
    window.dbg.editor = Editor;
    window.dbg.clear = Db.removeAll;
    window.dbg.activate = activate;
    window.dbg.info = function () {
      Db.getDb().then(function (db) {
        console.info('database file', db);
      });
      Settings.get('tabs', function (storage) {
        console.info('storage:opened tabs', storage.tabs);
      });
      Settings.get('current', function (storage) {
        console.info('storage:current', storage.current);
      });
    };
  };


  /**
   * Controller for Prompt dialog window
   */
  function PromptCtrl ($scope) {
    //TODO: Remove
  }

  /**
   * Controller for TabSettings popup window
   */
  function TabSettingsCtrl ($scope) {
    //TODO: Remove
  }


  /**
   * Controller for OpenFile dialog
   */
  function OpenFileCtrl ($scope, Db, Utils) {
    Db.getDb().then(function (db) {
      $scope.db = db;
    });
  }

  angular
    .module('Horn', ['ngSanitize', 'ngRoute', 'ngDialog'])
    .controller('BaseCtrl', BaseCtrl)
    .controller('PromptCtrl', PromptCtrl)
    .controller('TabSettingsCtrl', TabSettingsCtrl)
    .controller('OpenFileCtrl', OpenFileCtrl)

})(angular);
