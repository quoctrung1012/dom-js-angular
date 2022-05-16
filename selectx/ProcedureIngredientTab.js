/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 12:02 30/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureIngredientTab
$(function () {
  iNet.ns('iNet.ui.criteria');
  /**
   * @class iNet.ui.criteria.ProcedureIngredientAddDialog
   * @extends iNet.ui.criteria.BaseDialog
   */
  iNet.ui.criteria.ProcedureIngredientAddDialog = function (config) {
    config = config || {};
    iNet.apply(this, config);// apply configuration
    this.id = this.id || 'procedure-ingredient-add-dialog';
    iNet.ui.criteria.ProcedureIngredientAddDialog.superclass.constructor.call(this);

    this.$fileUploadContainer= $('#ingredient-file-upload-container');
    this.$fileDownloadContainer= $('#ingredient-file-download-container');
    this.$form= $('#procedure-ingredient-dialog-form');

    var me = this;
    this.$input = {
      file: $('#ingredient-file'),
      fileLabel: $('#ingredient-file-label'),
      pos: $('#ingredient-txt-pos'),
      text: $('#ingredient-txt-text'),
      require: $('#ingredient-select-required'),
      main: $('#ingredient-txt-main'),
      copy: $('#ingredient-txt-copy'),
      note: $('#ingredient-txt-note'),
      type: $('#ingredient-select-type'),
      normal: $('#ingredient-select-normal'),
      displayOn: $('#ingredient-select-displayon'),
      templateId: $('#ingredient-txt-templateId'),
      caseProcedure: $('#ingredient-txt-case-procedure')
    };
    this.$btnEdit = $('#procedure-ingredient-add-dialog-btn-edit');
    this.$btnOk = $('#procedure-ingredient-add-dialog-btn-ok');
    this.$btnClose = $('#procedure-ingredient-add-dialog-btn-close');
    this.$btnCancel = $('#procedure-ingredient-add-dialog-btn-cancel');

    this.validate = new iNet.ui.form.Validate({
      id: this.$form.prop('id'),
      rules: [{
        id: this.$input.text.prop('id'),
        validate: function (v) {
          if (iNet.isEmpty(v))
            return 'Tên thành phần hồ sơ không được để rỗng';
        }
      },{
        id: this.$fileUploadContainer.prop('id'),
        validate: function (v) {
          if (this.$input.file.get(0).files.length<1) {
            return 'Tập tin chưa được đính kèm';
          }
        }.bind(this)
      }]
    });

    this.$input.file.change(function () {
      me.setFiles(this.files);
    });

    this.$btnEdit.on('click', function (e) {
      this.setEditableMode(true);
    }.createDelegate(this));

    this.$btnCancel.on('click', function () {
      this.setEditableMode(false);
    }.createDelegate(this));

    this.$btnOk.on('click', function (e) {
      this.save();
    }.createDelegate(this));

    this.$btnClose.on('click', function () {
      this.hide();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.ProcedureIngredientAddDialog, iNet.ui.criteria.BaseDialog, {
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
    setData: function (data) {
      this.resetData();
      this.setOwnerData(data);
      var __data = data || {};
      for (var key in this.$input) {
        if (key.indexOf('file') < 0) {
          this.$input[key].val(__data[key] || '');
        }
      }
      if(!iNet.isEmpty(__data.file)) {
        this.$fileDownloadContainer.html(String.format('<i class="fa fa-paperclip"></i> <a href="{0}" target="_blank">{1}</a>',
          iNet.getUrl('tthcc/proceduredraftfile/download') + '?' + $.param({procedure: __data.procedureId, contentID: __data.contentID}),
          __data.file.filename + '(' + iNet.FileFormat.getSize(__data.file.size) + ')'));
      }
      this.setEditableMode(false);
    },
    setEditableMode: function(editable){
      var __ownerData = this.getOwnerData() || {};
      this.$form.find('input,textarea,select').prop('disabled', !editable);
      FormUtils.showButton(this.$btnEdit, !editable);
      FormUtils.showButton(this.$btnOk, editable);
      FormUtils.showButton(this.$btnCancel,  !iNet.isEmpty(__ownerData.uuid) && editable);
      if(editable) {
        this.$fileUploadContainer.show();
        this.$fileDownloadContainer.hide();
      } else {
        this.$fileUploadContainer.hide();
        this.$fileDownloadContainer.show();
      }
    },
    setFiles: function (files) {
      var __files = files || [];
      if (__files.length < 1) {
        return;
      }
      var __fileNames = [];
      for (var i = 0; i < __files.length; i++) {
        __fileNames.push(__files[i].name);
      }
      this.$input.fileLabel.addClass('selected').attr('data-title', this.resource.procedure.clickHere);
      if (__files.length === 1) {
        this.$input.fileLabel.find('span[data-title]').attr('data-title', __fileNames[0]);
      } else {
        this.$input.fileLabel.find('span[data-title]').attr('data-title', String.format('{0} ' + this.resource.procedure.file + ': {1} ', __fileNames.length, __fileNames.join(', ')));
      }
    },
    resetData: function () {
      this.setOwnerData(null);
      this.setEditableMode(true);
      this.$form.find('input,textarea').val('');
      this.$input.fileLabel.removeClass('selected').data('title', this.resource.procedure.clickHere);
      this.$input.fileLabel.find('span[data-title]').attr('data-title', '...');
    },
    save: function () {
      if(this.validate.check()){
        var __ownerData = this.getOwnerData() || {};
        var __isExist = !iNet.isEmpty(__ownerData.uuid);
        var __data = {
          procedureId: this.getProcedureId()
        };
        var __url = __isExist ? iNet.getUrl('tthcc/ingredient/update') : iNet.getUrl('tthcc/ingredient/create');
        if(__isExist) {
          __url = iNet.getUrl('tthcc/ingredient/update');
          __data = iNet.apply(__data, {
            uuid: __ownerData.uuid,
            contentID: __ownerData.contentID
          })
        }
        var loading;
        this.$form.ajaxSubmit({
          url: __url,
          data: __data,
          beforeSubmit: function (arr, $formTemplate, options) {
            loading = new iNet.ui.form.LoadingItem({
              maskBody: this.getEl(),
              msg: iNet.resources.ajaxLoading.saving
            });
          }.bind(this),
          success: function (result) {
            result = result || {};
            if (loading) {
              loading.destroy();
            }
            if (result.type === 'ERROR') {
              this.notifyError('Thành phần hồ sơ', 'Có lỗi xảy ra khi lưu dữ liệu');
            } else {
              this.setData(result);
              this.hide();
              this.fireEvent('saved', __isExist);
            }
          }.bind(this),
          error: function () {
            if (loading) {
              loading.destroy();
            }
            this.notifyError('Thành phần hồ sơ', 'Có lỗi xảy ra khi lưu dữ liệu');
          }.bind(this)
        });
      }
    }
  });
  /**
   * @class iNet.ui.criteria.ProcedureIngredientTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ui.criteria.ProcedureIngredientTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'ingredient-tab';
    iNet.ui.criteria.ProcedureIngredientTab.superclass.constructor.call(this);
    this.$btnAdd = $('#ingredient-tab-btn-add');

    this.url = {
      list: iNet.getUrl('tthcc/ingredient/list'),
      create: iNet.getUrl('tthcc/ingredient/create'),
      update: iNet.getUrl('tthcc/ingredient/update'),
      delete: iNet.getUrl('tthcc/ingredient/remove')
    };

    var dataSource = new DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      },{
        property: 'text',
        label: 'Thành phần hồ sơ',
        sortable: true
      },{
        property: 'note',
        label: 'Ghi chú',
        sortable: true,
        width: 200
      },{
        property: 'file',
        label: 'Tên tệp tin',
        sortable: true,
        width: 300,
        renderer: function (file, record) {
          return file.filename;
        }
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
              $.download(iNet.getUrl('tthcc/proceduredraftfile/download'), {procedure: __record.procedureId, contentID: __record.contentID});
            }
          },{
            text: iNet.resources.message.button.edit,
            icon: 'icon-pencil',
            fn: function (record) {
              var dialog =  this.createIngredientAddDialog();
              dialog.setProcedure(this.getProcedure());
              dialog.setData(record);
              dialog.show();
            }.bind(this)
          }, {
            text: iNet.resources.message.button.del,
            icon: 'icon-trash',
            labelCls: 'label label-important',
            fn: function (record) {
              var dialog = this.createConfirmDeleteDialog();
              dialog.setData({scope: this, record: record});
              dialog.setContent(String.format('Bạn có chắc chắn là đồng ý muốn xóa thành phần <b>"{0}"</b> không ?', record['text']));
              dialog.show();
            }.bind(this)
          }
          ]
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'ingredient-grid',
      url: this.url.list,
      dataSource: dataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false,
      convertData: function (data) {
        var __data = data || {};
        this.setTotal(__data.total);
        return __data.items;
      }
    });

    this.grid.on('loaded', function () {
      this.grid.cancel();
    }.bind(this));

    this.$btnAdd.on('click', function (e) {
      var dialog =  this.createIngredientAddDialog();
      dialog.setProcedure(this.getProcedure());
      dialog.resetData();
      dialog.show();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.ProcedureIngredientTab, iNet.ui.criteria.ProcedureBaseTab, {
    getGrid: function () {
      return this.grid;
    },
    setDirty: function(v) {
      this.dirty = v;
    },
    isDirty: function(){
      return !!this.dirty;
    },
    clearDirty: function(){
      this.setDirty(false);
    },
    load: function () {
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__procedureId));
      this.grid.setParams({procedureId: __procedureId});
      if(!iNet.isEmpty(__procedureId)) {
        this.grid.load();
      } else {
        this.grid.loadData([]);
      }
    },
    createIngredientAddDialog: function() {
      if (!this._ingredientAddDialog) {
        this._ingredientAddDialog = new iNet.ui.criteria.ProcedureIngredientAddDialog({
          resource: this.resource
        });
        this._ingredientAddDialog.on('saved', function (isUpdate) {
          this.setDirty(true);
          this.notifySuccess('Thành phần hồ sơ', isUpdate ? 'Thành phần hồ sơ đã được cập nhật': 'Thành phần hồ sơ đã được lưu');
          this.load();
          this.fireEvent('change', isUpdate);
        }.bind(this))
      }
      return this._ingredientAddDialog;
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-ingredient',
          title: 'Xóa thành phần HS ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.delete, {ingredientId: __record.uuid}, function (result) {
                this.hide();
                if (CommonService.isSuccess(result)) {
                  __scope.notifySuccess("Xóa", "Dữ liệu đã được xóa");
                  __grid.reload();
                } else {
                  __scope.notifyError("Xóa", "Có lỗi khi xóa dữ liệu")
                }
              }.bind(this), {mask: this.getEl(), msg: 'Đang xóa dữ liệu...'})
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
      return this._confirmDeleteDialog;
    }
  });
});
