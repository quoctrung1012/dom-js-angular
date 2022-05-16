/**
 * Copyright (c) 2020 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 15:04 24/11/2020
 *
 */
// #PACKAGE: criteria-procedure-draft-main
// #MODULE: ProcedureDraftMain
$(function () {
  var layout = iNet.getLayout();

  var $breadcrumbs = $();
  if (layout && layout.breadcrumbs) {
    $breadcrumbs = layout.breadcrumbs.getEl().find('ul');
  }
  var restoreBreadCrumb = function () {
    if ($breadcrumbs.length > 0) {
      $breadcrumbs.find('li:gt(1)').remove();
    }
  };
  window.addEventListener('beforeunload', restoreBreadCrumb);

  var procedureWidget = null, allocateProcedureWidget = null;
  var mainWidget = new iNet.ui.criteria.ProcedureDraftSearchWidget();

  if(!mainWidget.isSmartCloud()) {
    $('body').html('<h5 style="padding:10px;color:red">Bạn không có quyền thực hiện chức năng này</h5>');
    return;
  }
  var iHistory = new iNet.ui.form.History();
  iHistory.setRoot(mainWidget);
  iHistory.on('back', function (widget) {
    if (widget) {
      widget.show();
    }
  });
  var historyBack = function () {
    iHistory.back();
    breadCrumbBack();
  };

  var breadCrumbBack= function(){
    if ($breadcrumbs.length > 0 && $breadcrumbs.find('li').length > 2
      && iHistory.store.length===1 && iHistory.store[0].getId()===mainWidget.getId()) {
      $breadcrumbs.find('li:last').remove();
    }
  };

  var appendToBreadCrumb= function(name) {
    if($breadcrumbs.length>0) {
      $breadcrumbs.append(String.format('<li class="active"><span class="divider"><i class="icon-angle-right"></i></span> {0}</li>', name));
    }
  };

  var createProcedureWidget = function (parent) {
    if (!procedureWidget) {
      procedureWidget = new iNet.ui.criteria.ProcedureDraftDetailWidget();
      procedureWidget.on('back', historyBack);
      procedureWidget.on('saved', function () {
        mainWidget.reload();
      });
      procedureWidget.on('allocate', function (data) {
        allocateProcedureWidget = createAllocateProcedureWidget(this);
        allocateProcedureWidget.setData(data);
        allocateProcedureWidget.firstTab();
        allocateProcedureWidget.show();
      });
    }
    if (parent) {
      procedureWidget.setParent(parent);
      parent.hide();
    }
    if (iHistory) {
      iHistory.push(procedureWidget);
    }
    return procedureWidget;
  };

  var createAllocateProcedureWidget = function (parent) {
    if (!allocateProcedureWidget) {
      allocateProcedureWidget = new iNet.ui.criteria.allocate.AllocationProcedureWidget();
      allocateProcedureWidget.on('back', historyBack);
    }
    if (parent) {
      allocateProcedureWidget.setParent(parent);
      parent.hide();
    }
    if (iHistory) {
      iHistory.push(allocateProcedureWidget);
    }
    return allocateProcedureWidget;
  };

  mainWidget.on('create', function (industry) {
    procedureWidget = createProcedureWidget(this);
    procedureWidget.resetData();
    procedureWidget.setIndustry(industry);
    procedureWidget.show();
  });
  mainWidget.on('edit', function (data) {
    data = data || {};
    procedureWidget = createProcedureWidget(this);
    procedureWidget.firstTab();
    procedureWidget.show();
    appendToBreadCrumb(data.subject);
    procedureWidget.loadById(data.uuid);
  });

  mainWidget.on('allocate', function (data) {
    data = data || {};
    allocateProcedureWidget = createAllocateProcedureWidget(this);
    allocateProcedureWidget.setData(data);
    allocateProcedureWidget.firstTab();
    allocateProcedureWidget.show();
  });
});
