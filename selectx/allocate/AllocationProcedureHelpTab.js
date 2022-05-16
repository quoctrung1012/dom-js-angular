/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: AllocationProcedureHelpTab
$(function () {
  /**
   * @class iNet.ui.criteria.AllocationProcedureHelpTab
   * @extends iNet.ui.criteria.AllocationProcedureDirectTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.allocate.AllocationProcedureHelpTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'help-tab';
    iNet.ui.criteria.allocate.AllocationProcedureDirectTab.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureHelpTab, iNet.ui.criteria.allocate.AllocationProcedureBaseTab, {
    gridConfig: {
      gridId: 'allocation-help-grid' ,
      basicSearchId: 'allocation-help-basic-search',
      keywordId: 'allocation-help-basic-search-txt-keyword',
      groupId: 'allocation-help-basic-search-select-group'
    }
  });
});
