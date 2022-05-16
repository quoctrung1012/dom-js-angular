/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: AllocationProcedureDirectTab
$(function () {
  /**
   * @class iNet.ui.criteria.allocate.AllocationProcedureDirectTab
   * @extends iNet.ui.criteria.allocate.AllocationProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.AllocationProcedureDirectTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'case-tab';
    iNet.ui.criteria.allocate.AllocationProcedureDirectTab.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureDirectTab, iNet.ui.criteria.allocate.AllocationProcedureBaseTab, {
    gridConfig: {
      gridId: 'allocation-direct-grid' ,
      basicSearchId: 'allocation-direct-basic-search',
      keywordId: 'allocation-direct-basic-search-txt-keyword',
      groupId: 'allocation-direct-basic-search-select-group'
    }
  });
});
