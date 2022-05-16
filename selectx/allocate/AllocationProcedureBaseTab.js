/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 16:14 09/12/2020
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: ProcedureBaseTab
$(function () {
  /**
   * @class iNet.ui.criteria.allocate.AllocationProcedureBaseTab
   * @extends iNet.Component
   */
  iNet.ns('iNet.ui.criteria', 'iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.AllocationProcedureBaseTab = function (options) {
    iNet.apply(this, options || {});
    iNet.ui.criteria.allocate.AllocationProcedureBaseTab.superclass.constructor.call(this);
    this.url = {
      list: iNet.getUrl('tthcc/proceduredrafts/fallocatedorg'),
      retake: iNet.getUrl('tthcc/proceduredrafts/retake')
    };
    this.gridConfig = this.gridConfig || {};
    var gridConfig = this.gridConfig;

    this.$btnSelectOrg = this.getEl().find('[data-action="select"]');
    this.$btnSync = this.getEl().find('[data-action="sync"]');

    this.$btnSelectOrg.on('click', function (e) {
      ProcedureCommonService.checkForAllocate({
        procedureId: this.getProcedureId(),
        receiveMode: this.getReceiveMode()
      }, function (result) {
        var __result = result || {};
        var dialog;
        if(__result['canAllocate']==="false" || __result.hasOwnProperty('error')) {
          dialog = this.createAllocateErrorDialog();
          var __message = '<p><b>TTHC có các vấn đề sau cần khắc phục trước khi cấp phát:</b></p>';
          __message +=this.getMessagesByResponse(__result).join('<br>');
          dialog.setContent(__message);
          dialog.show();
        } else {
          dialog = this.createOrganizationAllocateDialog();
          dialog.enableForGroups(__result['groups'] || []);
          dialog.setProcedureId(this.getProcedureId());
          dialog.setParams(this.getAllocateParams());
          dialog.show();
          dialog.load();
        }
      }.bind(this))

    }.createDelegate(this));

    this.$btnSync.on('click', function (e) {
      var __params = this.grid.getParams();
      __params['pageSize'] = -1;
      __params['pageNumber'] = 0;
      $.postJSON(this.url.list, __params, function (result) {
        result = result || {};
        var dialog = this.createSynAllocateDialog();
        dialog.setProcedureId(this.getProcedureId());
        dialog.setParams(this.getAllocateParams());
        dialog.setOrganizations(result.items || []);
        dialog.show();
        dialog.load();
      }.bind(this),  {mask: $('body'), msg: 'Đang kiểm tra...'})
    }.createDelegate(this));

    if(gridConfig.gridId) {
      var BasicSearch = function () {
        this.id = gridConfig.basicSearchId;
        BasicSearch.superclass.constructor.call(this);
      };
      iNet.extend(BasicSearch, iNet.ui.grid.AbstractSearchForm, {
        url: this.url.list,
        intComponent: function () {
          this.$group =$.getCmp(gridConfig.groupId);
          this.$keyword = $.getCmp(gridConfig.keywordId);
          this.$keyword.on('input', function () {
            var $control = $(this);
            var value = $control.val();
            var $btn = $control.next();
            if (iNet.isEmpty(value) || value !== $control.data('keyword')) {
              $btn.removeClass('icon-remove').addClass('icon-search');
            } else {
              $btn.removeClass('icon-search').addClass('icon-remove');
            }
          });
          this.$group.on('change', function () {
            this.search();
          }.bind(this));
        },
        setDisabled: function(disabled) {
          this.$group.prop('disabled', disabled);
          this.$keyword.prop('disabled', disabled);
          this.$keyword.next().attr('data-action-search', !disabled? 'search': '');
        },
        disable: function(){
          this.setDisabled(true);
        },
        enable: function(){
          this.setDisabled(false);
        },
        setParams: function(params) {
          this.params = params;
        },
        getParams: function(){
          return this.params || {};
        },
        getData: function () {
          var $btn = this.$keyword.next();
          if ($btn.hasClass('icon-remove')) {
            this.$keyword.val('');
          }
          var __keyword = this.$keyword.val();
          var __data = iNet.apply(this.getParams(),{
            key: __keyword,
            group: this.$group.val(),
            pageSize: 10,
            pageNumber: 0
          });
          if (!iNet.isEmpty(__keyword)) {
            $btn.removeClass('icon-search').addClass('icon-remove');
          } else {
            $btn.removeClass('icon-remove').addClass('icon-search');
          }
          this.$keyword.data('keyword', __keyword);
          return __data;
        }
      });

      var dataSource = new DataSource({
        columns: [{
          label: '#',
          type: 'rownumber',
          align: 'center',
          width: 50
        }, {
          property: this.getIdProperty(),
          label: 'Mã đơn vị',
          sortable: true,
          width: 150
        }, {
          property: this.getOrgNameProperty(),
          label: 'Tên đơn vị',
          sortable: true
        }, {
          property: 'group',
          label: 'Loại đơn vị',
          sortable: true,
          width: 250,
          renderer: function (v) {
            return ProcedureCommonService.getGroupNameByValue(v);
          }
        },     {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: [{
            text: 'Thu hồi',
            icon: 'icon-undo',
            labelCls: 'label label-important',
            fn: function (record) {
              var dialog = this.createConfirmRetakeDialog();
              var __params = this.getAllocateParams();
              __params = iNet.apply(__params, {
                organIds: record[this.getIdProperty()]
              });
              dialog.setData({scope: this, params: __params});
              dialog.setContent(String.format('Bạn có chắc chắn đồng ý muốn thu hồi TTHC của đơn vị "<b>{0}</b>" không ?', record[this.getOrgNameProperty()]));
              dialog.show();
            }.bind(this)
          },{
            text: "Đồng bộ dữ liệu",
            icon: 'icon-refresh',
            labelCls: 'label label-warning',
            fn: function (record) {
              var dialog = this.createSynAllocateDialog();
              dialog.setProcedureId(this.getProcedureId());
              dialog.setParams(this.getAllocateParams());
              dialog.setOrganizations([record]);
              dialog.show();
              dialog.load();
            }.bind(this)
          }]
        }]
      });
      this.grid = new iNet.ui.grid.Grid({
        id: gridConfig.gridId,
        url: this.url.list,
        dataSource: dataSource,
        basicSearch: BasicSearch,
        idProperty: this.getIdProperty(),
        remotePaging: true,
        firstLoad: false,
        hideHeader: false,
        pageSize: 10,
        autoHideWhenOutside: false,
        convertData: function (data) {
          var __data = data || {};
          this.setTotal(__data.total);
          return __data.items;
        }
      });
    }

    this.$btnSync.prop('disabled', true);
    FormUtils.showButton(this.$btnSelectOrg, true);
    FormUtils.showButton(this.$btnSync, true);
  };
  iNet.extend(iNet.ui.criteria.allocate.AllocationProcedureBaseTab, iNet.Component, {
    gridConfig: {
      gridId: 'allocation-direct-grid' ,
      basicSearchId: 'allocation-direct-basic-search',
      keywordId: 'allocation-direct-basic-search-txt-keyword',
      groupId: 'allocation-direct-basic-search-select-group'
    },
    getIdProperty: function(){
      return 'firmID';
    },
    getOrgNameProperty: function(){
      return 'firmName';
    },
    getGrid: function () {
      return this.grid;
    },
    showMessage: function (type, title, content) {
      if (!this.notify) {
        this.notify = new iNet.ui.form.Notify({
          delay: 5000
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
    getReceiveMode: function(){
      return this.getParams()['receiveMode'];
    },
    getMaterialId: function(){
      return this.getParams()['materialUuid'];
    },
    setProcedureId: function(procedureId) {
      this.procedureId = procedureId;
    },
    getProcedureId: function(){
      return this.procedureId;
    },
    getAllocateParams: function(){
      return {
        receiveMode: this.getReceiveMode(),
        materialUuid: this.getMaterialId()
      }
    },
    setParams: function(params) {
      this.params = params;
    },
    getParams: function(){
      return this.params || {};
    },
    setParentWidget: function(parent) {
      this.parentWidget = parent;
    },
    getParentWidget: function(){
      return this.parentWidget;
    },
    load: function(){
      this.grid.setParams(this.getParams());
      this.grid.getQuickSearch().setParams(this.getParams());
      var quickSearch =  this.grid.getQuickSearch();
      if(iNet.isEmpty(this.getMaterialId())) {
        quickSearch.disable();
        this.grid.setPageIndex(0);
        this.grid.setTotal(0);
        this.grid.loadData([]);
      } else {
        quickSearch.enable();
        quickSearch.search();
      }
    },
    updateMaterialId: function(grid, materialUuid){
      console.log('[updateMaterialId]');
      this.params['materialUuid'] = materialUuid;
      this.getParentWidget().setMaterialId(materialUuid);
      grid.setParams(iNet.apply( grid.getParams(), {materialUuid: materialUuid}));
      var quickSearch =  grid.getQuickSearch();
      quickSearch.setParams(iNet.apply( quickSearch.getParams(), {materialUuid: materialUuid}));
      quickSearch.enable();
    },
    createOrganizationAllocateDialog: function () {
      if (!iNet.orgAllocateDialog) {
        iNet.orgAllocateDialog = new iNet.ui.criteria.allocate.OrganizationAllocateDialog();
        iNet.orgAllocateDialog.on('allocated', function (orgs, result) {
          var grid= iNet.orgAllocateDialog.getOwnerGrid();
          result = result || {};
          if(iNet.isEmpty(this.getMaterialId())) {
            this.updateMaterialId(grid, result['materialUuid']);
          }
          grid.reload();//reload
        }.bind(this))
      }
      iNet.orgAllocateDialog.setOwnerGrid(this.grid);
      return iNet.orgAllocateDialog;
    },
    createSynAllocateDialog: function () {
      if (!iNet.syncAllocateDialog) {
        iNet.syncAllocateDialog = new iNet.ui.criteria.allocate.SynAllocateDialog();
        iNet.syncAllocateDialog.on('synced', function (orgs, result) {
          //result = result || {};
        }.bind(this))
      }
      return iNet.syncAllocateDialog;
    },

    getMessagesByResponse: function(response){
      response = response || {};
      var groups = response.groups || [];
      var messages= [];
      switch (response.error) {
        case 'no_graph_found':
          messages.push('Chưa cấu hình quy trình');
         break;
        case 'no_form_found':
          messages.push('Chưa cấu hình biểu mẫu tương tác');
          break;
        case 'no_form_found_for_expway':
          messages.push('Chưa cấu hình biểu mẫu tương tác cho "Dịch vụ công"');
          break;
        case 'no_graph_and_form_associate_for_onegate':
          messages.push('Chưa cấu hình quy trình phù hợp với hình thức tiếp nhận <br> hoặc chưa cấu hình biểu mẫu tương tác cho "Một cửa"');
          break;
      }
      if(iNet.isEmpty(response.error) && groups.length<1) {
        messages.push('Chưa cấu hình cấp cơ quan cho quy trình hoặc biểu mẫu tương tác');
      }

      messages = messages.map(function (msg) {
        return '- ' + msg;
      });

      return messages;
    },
    createAllocateErrorDialog: function () {
      if (!iNet.allocateErrorDialog) {
        iNet.allocateErrorDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-allocate-error-message-dialog',
          title: 'Kiểm tra cấp phát',
          buttons: [{
            text: iNet.resources.message.button.close,
            icon: 'icon-remove',
            fn: function () {
              this.hide();
            }
          }]
        });
      }
      return iNet.allocateErrorDialog;
    },
    createConfirmRetakeDialog: function () {
      if (!iNet.confirmRetakeDialog) {
        iNet.confirmRetakeDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-retake-procedure-dialog',
          title: 'Thu hồi cấp phát TTHC',
          buttons: [{
            text: 'Thu hồi',
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __params = __data.params || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.retake, __params, function (result) {
                this.hide();
                if (CommonService.isSuccess(result)) {
                  __scope.notifySuccess("Thu hồi", "TTHC đã được thu hồi");
                  __grid.reload();
                } else {
                  __scope.notifyError("Thu hồi", "Có lỗi khi thu hồi")
                }
              }.bind(this), {mask: this.getEl(), msg: 'Đang thu hồi...'})
            }
          }, {
            text: iNet.resources.message.button.cancel,
            icon: 'icon-remove',
            fn: function () {
              this.hide();
            }
          }]
        });
      }
      return iNet.confirmRetakeDialog;
    }
  });
});

