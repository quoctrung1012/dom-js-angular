/**
 * Copyright (c) 2021 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 15:07 04/22/2021
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: SynAllocateDialog
$(function () {
  iNet.ns('iNet.ui.criteria', 'iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.SynAllocateDialog = function (config) {
    config = config || {};
    iNet.apply(this, config);
    this.id = 'sync-allocate-dialog';

    iNet.ui.criteria.allocate.SynAllocateDialog.superclass.constructor.call(this);
    console.log('[SynAllocateDialog]', this);

    this.url = {
      sync: iNet.getUrl('tthcc/proceduredrafts/synchallocate')
    };

    this.$btnOk = $('#sync-allocate-dialog-btn-ok');
    this.$btnClose = $('#sync-allocate-dialog-btn-close');
    this.$orgLbl = $('#sync-allocate-dialog-org-lbl');

    this.$input = {
      info: $('#sync-allocate-dialog-chk-info'),
      form: $('#sync-allocate-dialog-chk-form')
    };

    this.getEl().on('change', 'input[type="checkbox"]', function () {
      this.checkRole();
    }.bind(this));

    this.$btnOk.on('click', function (e) {
      this.submit();
    }.createDelegate(this));

    this.$btnClose.on('click', function () {
      this.hide();
    }.createDelegate(this));
  };

  iNet.extend(iNet.ui.criteria.allocate.SynAllocateDialog, iNet.ui.criteria.BaseDialog, {
    checkRole: function(){
      this.$btnOk.prop('disabled',  (!this.$input.info.prop('checked') && !this.$input.form.prop('checked') || !this.hasOrganization()));
    },
    setProcedureId: function (procedureId) {
      this.procedureId = procedureId;
    },
    getProcedureId: function () {
      return this.procedureId;
    },
    setParams: function (params) {
      this.params = params;
    },
    getParams: function () {
      return this.params || {};
    },
    setOrganizations: function (organizations) {
      this.organizations = organizations;
    },
    getOrganizations: function () {
      return this.organizations || [];
    },
    hasOrganization: function(){
      return this.getOrganizations().length>0;
    },
    load: function () {
      var __orgs = this.getOrganizations().map(function (org) {
        return org['firmName'] || org['firmID'];
      });

      if(__orgs.length<1) {
        this.$orgLbl.html('<span class="red">Không tìm thấy đơn vị cần đồng bộ dữ liệu</span>');
      } else {
        this.$orgLbl.text(__orgs.join(', '));
      }
      this.checkRole();
    },
    submit: function () {
      var synchType = 'info' ;
      if (this.$input.form.prop('checked')) {
        synchType = 'graph_form';
      }

      if (!this.hasOrganization()) {
        this.showMessage('error', 'Đồng bộ', 'Không tìm thấy đơn vị cần đồng bộ dữ liệu');
        return;
      }

      var __organizations = this.getOrganizations().map(function (org) {
        return {organId: org.firmID, group: org.group};
      });

      var __params = {
        receiveMode: this.getParams()['receiveMode'],
        procedureId: this.getProcedureId(),
        synchType: synchType,
        organizations: JSON.stringify(__organizations)
      };

      console.log('[submit]', __params);
      $.postJSON(this.url.sync, __params, function (result) {
        var __result = result || {};
        var __errors = __result.errors || [];
        if (__errors.length > 0) {
          this.showMessage('error', 'Đồng bộ', 'Có lỗi xảy ra khi đồng bộ dữ liệu');
        } else {
          this.hide();
          this.fireEvent('synced', __organizations, __result);
          this.showMessage('success', 'Đồng bộ', 'Thủ tục đã được đồng bộ dữ liệu');
        }
      }.bind(this), {mask: this.getEl(), msg: 'Đang đồng bộ dữ liệu...'})
    }
  });
});
