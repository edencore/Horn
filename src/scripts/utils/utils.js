/**
 * Service for common App's tasks
 */
;(function (angular) {
  'use strict';

  function Utils ($q, Settings, Db) {

    /**
     * Saves currently opened tabs to settings. Documents
     * stored in CFS will be saved in 'syncTabs' and
     * documents from local FS will be saved in 'localTabs'
     *
     * @param {Array.<Object>} tabs
     */
    function saveTabs(tabs) {
      var syncTabs = [],
          localTabs = [];

      for (var i = 0, l = tabs.length; i < l; i++) {
        var tab = tabs[i];
        if (tab.id)
          localTabs.push({id: tab.id});
        else
          syncTabs.push({cfs: tab.cfs});
      }

      Settings.set('syncTabs', syncTabs, false);
      Settings.set('localTabs', localTabs, true);
    }


    function loadTabs () {
      var syncTabs, localTabs, tabs,
          defer = $q.defer();

      Settings.get('syncTabs', false, function (storage) {
        syncTabs = storage.syncTabs;
        Settings.get('localTabs', true, function (storage) {
          localTabs = storage.localTabs;
          tabs = angular.extend([], syncTabs, localTabs);

          defer.resolve(tabs);
        })
      })

      return defer.promise;
    }

    /**
     * Loads saved tabs
     * @returns {Promise) - will be resolved
     * when all tabs are loaded
     */
 /*   function loadTabs() {
      var promises = [],
          defer = $q.defer();
      Settings.get('tabs', function (storage) {
        var tabs = storage.tabs;
        if (!tabs) {
          defer.reject();
          return;
        }
        for (var i = 0, l = tabs.length; i < l; i++) {
          var cfs = tabs[i].cfs;
          promises.push(openDocument(cfs));
        }
        defer.resolve($q.all(promises));
      })
      return defer.promise;
    }*/

    /**
     * Saves currently active tab in chrome
     * sync storage
     * @param {Object} tab - tab to save
     */
    function saveCurrentTab(tab) {
      if (!tab.cfs)
        return;

      Settings.set('current', {cfs: tab.cfs});
    }

    /**
     * Loads current tab from chrome sync storage
     */
    function loadCurrentTab(tabs) {
      var defer = $q.defer();
      Settings.get('current', function (storage) {
        var current = storage.current;
        defer.resolve(current);
      });

      return defer.promise;
    }

    /**
     * Opens document from cfs
     * @return {Promise<DbFile>}
     */
    function openDocument(cfs, mode) {
      var defer = $q.defer();
      Db.get({cfs: cfs}, true).then(function (dbFile) {
        dbFile.doc = new CodeMirror.Doc(dbFile.body, mode || 'gfm');
        dbFile.isSaved = true;
        delete dbFile.body;
        defer.resolve(dbFile);
      }, function onError (e) {
        defer.reject(e);
      });
      return defer.promise;
    }


    return {
      saveTabs: saveTabs,
      loadTabs: loadTabs,
      saveCurrentTab: saveCurrentTab,
      loadCurrentTab: loadCurrentTab,
      openDocument: openDocument
    }
  }

  angular
    .module('Horn')
    .factory('Utils', Utils);

})(angular);
