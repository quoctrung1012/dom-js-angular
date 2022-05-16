/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureBaseTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureBaseTab
   * @extends iNet.Component
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureBaseTab = function (options) {
    iNet.apply(this, options || {});
    iNet.ui.criteria.ProcedureBaseTab.superclass.constructor.call(this);
    this.resource = {
      procedure: iNet.resources.criteria.procedure,
      errors: iNet.resources.criteria.errors,
      constant: iNet.resources.criteria.constant,
      validate: iNet.resources.criteria.validate
    };
  };
  iNet.extend(iNet.ui.criteria.ProcedureBaseTab, iNet.Component, {
    showMessage: function (type, title, content) {
      if (!this.notify) {
        this.notify = new iNet.ui.form.Notify({
          delay: 4000
        });
      }
      this.notify.setType(type || 'error');
      this.notify.setTitle(title || '');
      this.notify.setContent(content || '');
      this.notify.show();
    },
    getNotify: function () {
      return this.notify;
    },
    notifyError: function (title, message) {
      this.showMessage('error', title, message);
    },
    notifySuccess: function(title, message) {
      this.showMessage('success', title, message);
    },
    getEl: function(){
      return $.getCmp(this.id);
    },
    getMask: function(){
      return this.getEl();
    },
    setProcedure: function(v){
      this.procedure = v;
    },
    getProcedure: function(){
      return this.procedure || {};
    },
    getProcedureId: function(){
      var __procedure = this.getProcedure();
      return __procedure.uuid;
    },
    load: function(){

    }
  });
});

