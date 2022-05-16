/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 10:00 30/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedurePrintTemplateTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedurePrintTemplateTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedurePrintTemplateTab = function (options) {
    iNet.apply(this, options || {});
    this.id =  this.id || 'print-template-tab';
    iNet.ui.criteria.ProcedurePrintTemplateTab.superclass.constructor.call(this);
    var me = this;
    this.$btnAdd = $('#print-template-tab-btn-add');

    this.url = {
      list: iNet.getUrl('glbgate/template/list'),
      create: iNet.getUrl('glbgate/template/create'),
      update: iNet.getUrl('glbgate/template/update'),
      delete: iNet.getUrl('glbgate/template/delete'),
      download: iNet.getUrl('glbgate/template/download')
    };

    this.$formUpload = $('#print-template-form');
    this.$fileUpload = $('#print-template-form-file');

    this.$btnAdd.off('click').on('click', function () {
      me.openUploader();
    }.createDelegate(this));

    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      }, {
        property: 'type',
        label: 'Mã biểu mẫu',
        sortable: true,
        width: 200
      }, {
        property: 'description',
        label: 'Mô tả biểu mẫu',
        sortable: true,
        type: 'text',
        validate: function (v) {
          if(iNet.isEmpty(v)) {
            return 'Thông tin mô tả không được để rỗng';
          }
        }
      }, {
        property: 'name',
        label: 'Tên tệp tin',
        sortable: true,
        width: 300
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: 'Tải về',
          icon: 'icon-download-alt',
          labelCls: 'label label-success',
          fn: function (record) {
            var __record = record || {};
            window.open(me.url.download + '?' + $.param({
              uuid: __record.uuid,
              type: __record.type,
              site: __record.site
            }), '_blank');
          }
        },{
          text: 'Tải mẫu lên',
          icon: 'icon-upload-alt',
          fn: function (record) {
            me.editData = record;
            me.openUploader(true);
          }
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var __record = record || {};
            var __dialog = me.createConfirmDeleteDialog();
            __dialog.setData({record: __record, scope: me});
            __dialog.show();
          }
        }]
      }]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'print-template-grid',
      url: this.url.list,
      dataSource: dataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false,
      convertData: function (data) {
        return data.items;
      }
    });

    this.grid.on('save', function (data) {
      var __data = data || {};
      __data = iNet.apply(__data, me.getDefaultParams());
      var loading;
      me.$formUpload.ajaxSubmit({
        data: __data,
        url: me.url.create,
        beforeSubmit: function (arr, $form, options) {
          loading = new iNet.ui.form.LoadingItem({
            maskBody: me.getGrid().getEl(),
            msg: iNet.resources.ajaxLoading.saving
          });
        },
        success: function (result) {
          if (loading) {
            loading.destroy();
          }
          var __result = result || {};
          if (__result.type === 'ERROR') {
            me.showMessage('error', 'Tạo mới', String.format('Có lỗi xảy ra khi tạo mẫu'));
          } else {
            me.showMessage('success', 'Tạo mới', String.format('Mẫu đã được tạo'));
          }
          me.$fileUpload.val('');
          me.getGrid().load();
        }
      });
    });

    this.grid.on('loaded', function () {
      this.grid.cancel();
    }.bind(this));

    this.$fileUpload.on('change', function () {
      var __files = me.$fileUpload[0].files || [];
      var __fileName = (__files.length > 0) ? (__files[0] || {}).name : '';
      if (__files.length < 1) {
        return;
      }
      if (!me.update) {
          me.grid.newRecord({name: __fileName});
      } else {
        var loading;
        var __ownerData = me.editData || {};
        var __data = {
          template: __ownerData.uuid,
          type: __ownerData.type,
          description: __ownerData.description
        };
        __data = iNet.apply(__data, me.getDefaultParams());
        this.$formUpload.ajaxSubmit({
          data: __data,
          url: me.url.update,
          beforeSubmit: function (arr, $form, options) {
            loading = new iNet.ui.form.LoadingItem({
              maskBody: me.grid.getEl(),
              msg: iNet.resources.ajaxLoading.saving
            });
          },
          success: function (result) {
            if (loading) {
              loading.destroy();
            }
            var __result = result || {};
            if (__result.type === 'ERROR') {
              me.showMessage('error', 'Cập nhật', String.format('Có lỗi xảy ra cập nhật'));
            } else {
              me.showMessage('success', 'Cập nhật', String.format('Mẫu đã được cập nhật'));
            }
            me.$fileUpload.val('');
            me.getGrid().load();
          }
        });
      }
    }.createDelegate(this));
  };
  iNet.extend(iNet.ui.criteria.ProcedurePrintTemplateTab, iNet.ui.criteria.ProcedureBaseTab, {
    getGrid: function () {
      return this.grid;
    },
    getDefaultParams: function(){
      return this.grid.getParams();
    },
    load: function () {
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__procedureId));
      this.grid.setParams({type: __procedureId});
      if(!iNet.isEmpty(__procedureId)) {
        this.grid.load();
      } else {
        this.grid.loadData([]);
      }
    },
    createConfirmDeleteDialog: function () {
      if (!this.confirmDeleteDialog) {
        this.confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-print-template',
          title: 'Xóa',
          content: 'Bạn có chắc là đồng ý muốn xóa mẫu đã chọn không ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok icon-white',
            fn: function () {
              this.hide();
              var __data = this.getData() || {};
              var __scope = __data.scope;
              var __record = __data.record || {};
              var __params = {
                template: __record.uuid,
                application: __record.application,
                module: __record.module
              };
              $.postJSON(__scope.url.delete, __params, function (result) {
                result = result || {};
                if (!!result.errors) {
                  __scope.showMessage('error', 'Xóa', 'Đã có lỗi xảy ra khi mẫu');
                } else {
                  __scope.showMessage('success', 'Xóa', 'Mẫu đã được xóa');
                  __scope.grid.remove(__params.template);
                }
              }, {
                mask: this.getMask(),
                msg: iNet.resources.ajaxLoading.deleting
              });
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
      return this.confirmDeleteDialog;
    },
    openUploader: function (update) {
      this.update = !!update;
      this.$fileUpload.val('');
      this.$fileUpload.trigger('click');
    }
  });
});

