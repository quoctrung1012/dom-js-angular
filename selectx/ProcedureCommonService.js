/**
 * Copyright (c) 2020 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 10:41 30/11/2020
 *
 */
// #PACKAGE: criteria-procedure-common-service
// #MODULE: ProcedureCommonService
$(function () {
  var GROUPS_DATA = [
    {id: '' , value: '', text: 'Tất cả'},
    {id: 'SONGANH' , value: 'SONGANH', text: 'Sở ngành'},
    {id: 'NGANHDOC', value: 'NGANHDOC', text: 'Ngành dọc'},
    {id: 'UB_H_TX_TP', value: 'UB_H_TX_TP', text: 'UBND Huyện, Thị Xã, Thành Phố'},
    {id: 'UB_X_P_TT', value: 'UB_X_P_TT', text: 'UBND Xã, Phường, Thị Trấn'}
  ];

  var USE_FOR_DATA = [
    {id: '' , value: '', text: 'Tất cả'},
    {id: 'expway', value: 'expway', text: 'Dịch vụ công'},
    {id: 'onegate', value: 'onegate', text: 'Một cửa'}
  ];

  var RECEIVE_MODE_DATA = [
    {id: '' , value: '', text: 'Tất cả'},
    {id: 'direct', value: 'direct', text: 'Trực tiếp tại đơn vị'},
    {id: 'help', value: 'help', text: 'Nhận giúp'},
    {id: 'azonal', value: 'azonal', text: 'Phi địa giới'},
    {id: 'communication', value: 'communication', text: 'Liên thông'}
  ];

  var COST_TYPE_DATA = [
    {id: '1', value: '1', text: 'Phí'},
    {id: '2', value: '2', text: 'Lệ phí'}
  ];

  var CASE_TYPE_DATA = [
    {id: 'internal', value: 'internal', text: 'Bên trong'},
    {id: 'input', value: 'input', text: 'Đầu vào'}
  ];

  window.ProcedureCommonService = {
    getGroups: function () {
      return GROUPS_DATA;
    },
    getUserFor: function () {
      return USE_FOR_DATA;
    },
    getReceiveMode: function () {
      return RECEIVE_MODE_DATA;
    },
    getCostType: function(){
      return COST_TYPE_DATA;
    },
    getCaseType: function(){
      return CASE_TYPE_DATA;
    },
    filterTermInArray: function (term, array, filterFn) {
      term = (term || '').toLowerCase();
      if (iNet.isEmpty(term)) {
        return array;
      }
      filterFn = filterFn || function (item) {
        return ((item.name || '').toLowerCase()).indexOf(term) > -1;
      };
      return array.filter(filterFn);
    },
    loadExternalApps: function (callback) {
      callback = callback || iNet.emptyFn;
      if (this._externalApps) {
        callback(this._externalApps)
      } else {
        this._externalApps = [];
        $.getJSON(iNet.getUrl('cloudapp/dictionary/list'), {
          parent: 'EXTERNAL_APP',
          pageSize: -1
        }, function (result) {
          var __result = result || {};
          this._externalApps= __result.items || [];
          callback(this._externalApps);
        }.bind(this));
      }
    },
    loadResultTemplates: function (callback) {
      callback = callback || iNet.emptyFn;
      if (this._resultTemplates) {
        callback(this._resultTemplates)
      } else {
        this._resultTemplates = [];
        $.getJSON(iNet.getUrl('exgate/design/page/list'), {
          type: 'KQTH'
        }, function (result) {
          var __result = result || {};
          this._resultTemplates= __result.items || [];
          callback(this._resultTemplates);
        }.bind(this), {mask: $('body'), msg: iNet.resources.ajaxLoading.loading});
      }
    },
    getGroupNameByValue: function (v) {
      return (ProcedureCommonService.getGroups().find(function (group) {
        return group.value===v;
      }) || GROUPS_DATA[0])['text'];
    },
    getReceiveModeByValue: function (v) {
      return (ProcedureCommonService.getReceiveMode().find(function (mode) {
        return mode.value===v;
      }) || RECEIVE_MODE_DATA[0])['text'];
    },
    getUseForByValue: function (v) {
      return (ProcedureCommonService.getUserFor().find(function (useFor) {
        return useFor.value===v;
      }) || USE_FOR_DATA[0])['text'];
    },
    getCaseTypeByValue: function (v) {
      return (ProcedureCommonService.getCaseType().find(function (type) {
        return type.value===v;
      }) || CASE_TYPE_DATA[0])['text'];
    },
    checkForAllocate: function (params, callback) {
      params = params || {};
      callback = callback || iNet.emptyFn;
      $.getJSON(iNet.getUrl('tthcc/proceduredrafts/chkforallocate'), params, function (result) {
        callback( result || {});
      }.bind(this), {mask: $('body'), msg: 'Đang kiểm tra...'});
    },
    loadUnits: function (callback) {
      callback = callback || iNet.emptyFn;
      if (this._units) {
        callback(this._units)
      } else {
        this._units = [];
        $.getJSON(iNet.getUrl('glbgate/deptgroup/list'), {
          types: 'UNIT'
        }, function (result) {
          var __result = result || {};
          this._units= __result.items || [];
          callback(this._units);
        }.bind(this));
      }
    },
    getUnitTimeByType: function (type) {
      type = type || 'working_day';
      if(type==='day') {
        return '(ngày)';
      }
      return '(giờ)'
    }
  }
});
