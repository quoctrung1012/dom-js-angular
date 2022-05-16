/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE:  criteria-allocation-procedure-wg
// #MODULE: AllocationProcedureAzonalTab
$(function () {
  /**
   * @class iNet.ui.criteria.allocate.AllocationProcedureAzonalTab
   * @extends iNet.ui.criteria.allocate.AllocationProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.AllocationProcedureAzonalTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'azonal-tab';
    iNet.ui.criteria.allocate.AllocationProcedureAzonalTab.superclass.constructor.call(this);
  };
  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureAzonalTab, iNet.ui.criteria.allocate.AllocationProcedureBaseTab, {
    gridConfig: {
      gridId: 'allocation-azonal-grid' ,
      basicSearchId: 'allocation-azonal-basic-search',
      keywordId: 'allocation-azonal-basic-search-txt-keyword',
      groupId: 'allocation-azonal-basic-search-select-group'
    }
  });
});
