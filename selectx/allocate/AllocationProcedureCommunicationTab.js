/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE:  criteria-allocation-procedure-wg
// #MODULE: AllocationProcedureCommunicationTab
$(function () {
  /**
   * @class iNet.ui.criteria.allocate.AllocationProcedureCommunicationTab
   * @extends iNet.ui.criteria.allocate.AllocationProcedureDirectTab
   */
  iNet.ns('iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.AllocationProcedureCommunicationTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'communication-tab';
    iNet.ui.criteria.allocate.AllocationProcedureCommunicationTab.superclass.constructor.call(this);

  };
  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureCommunicationTab, iNet.ui.criteria.allocate.AllocationProcedureBaseTab, {
    gridConfig: {
      gridId: 'allocation-communication-grid' ,
      basicSearchId: 'allocation-communication-basic-search',
      keywordId: 'allocation-communication-basic-search-txt-keyword',
      groupId: 'allocation-communication-basic-search-select-group'
    }
  });
});
