/**
 * Copyright (c) 2020 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 16:13 08/12/2020
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: AllocationProcedureWidget
/**
 * Assign procedures to organizations
 */
$(function () {
  iNet.ns('iNet.ui.criteria', 'iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.AllocationProcedureWidget = function (config) {
    this.id = 'allocation-procedure-widget';
    var __config = config || {};
    iNet.apply(this, __config);
    iNet.ui.criteria.allocate.AllocationProcedureWidget.superclass.constructor.call(this);
    console.log('[AllocationProcedureWidget]', this);

    this.$toolbar = {
      BACK: $('#allocation-procedure-btn-back')
    };

    this.getEl().find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      this.showTab(e);
    }.bind(this));

    this.$toolbar.BACK.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

  };

  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureWidget, iNet.ui.criteria.BaseWidget, {
    setData: function(data){
      this.setOwnerData(data);
    },
    getProcedureId: function(){
      return (this.getOwnerData() || {})['uuid'];
    },
    setMaterialId: function(materialId) {
      (this.getOwnerData() || {})['materialUUID'] = materialId;
    },
    getMaterialId: function(){
      return (this.getOwnerData() || {})['materialUUID']
    },
    showTab: function (e) {
      var tabId = $(e.target).attr("href").replace('#', '');// activated tab
      var activeTab = this.createTabById(tabId);
      if(activeTab) {
        activeTab.setParentWidget(this);
        activeTab.setProcedureId(this.getProcedureId());
        activeTab.setParams({
          receiveMode: tabId.split('-')[0],
          materialUuid: this.getMaterialId(),
          pageSize: 10,
          pageNumber: 0,
          key: '',
          group: ''
        });
        activeTab.load();
      }
      console.log('[show]--tab--', tabId, activeTab);
    },
    firstTab: function () {
      this.getEl().find('.nav-tabs').find('a[data-toggle="tab"]:first').trigger('click').trigger('shown.bs.tab');
    },
    createTabById: function(id) {
      switch (id) {
        case 'direct-tab':
          if (!this.directTab) {
            this.directTab = new iNet.ui.criteria.allocate.AllocationProcedureDirectTab({
              id: id
            });
          }
          return this.directTab;
        case 'communication-tab':
          if (!this.communicationTab) {
            this.communicationTab = new iNet.ui.criteria.allocate.AllocationProcedureCommunicationTab({
              id: id
            });
          }
          return this.communicationTab;
        case 'help-tab':
          if (!this.helpTab) {
            this.helpTab = new iNet.ui.criteria.allocate.AllocationProcedureHelpTab({
              id: id
            });
          }
          return this.helpTab;
        case 'azonal-tab':
          if (!this.azonalTab) {
            this.azonalTab = new iNet.ui.criteria.allocate.AllocationProcedureAzonalTab({
              id: id
            });
          }
          return this.azonalTab;
      }
      return null;
    }
  });
});
