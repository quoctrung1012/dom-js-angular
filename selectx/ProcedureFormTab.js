/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 27/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureFormTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureFormTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureFormTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'eform-tab';
    iNet.ui.criteria.ProcedureFormTab.superclass.constructor.call(this);
    this.$btnAdd = $('#eform-tab-btn-add');

    this.url = {
      list: iNet.getUrl('tthcc/proceduredraft/assforms/fbyproid'),
      create: iNet.getUrl('tthcc/proceduredraft/assforms/add'),
      update: iNet.getUrl('tthcc/proceduredraft/assforms/update'),
      delete: iNet.getUrl('tthcc/proceduredraft/assforms/delete')
    };

    var formatSelection = function (item) {
      item = item || {};
      return item.name;
    };

    var formatResult = function (item) {
      item = item || {};
      return String.format('<span><label class="label label-info marg-b-0" style="font-size: 13px">{0}</label> {1}</span>', item['organName'], item.name);
    };

    var dataSource = new DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      },
        {
        property: 'eform',
        label: "Tên biểu mẫu",
        sortable: true,
        type: 'selectx',
        valueField: 'uuid',
        displayField: 'name',
        objectData: true,
        original: true,
        cls: 'max-with',
        renderer: function (value, record) {
          return record.name || String.format('<span style="text-decoration: line-through;">{0}</span> <span class="red">(dữ liệu đã bị xóa)</span>', record.formId );
        },
        validate: function(v){
          if(iNet.isEmpty(v)) {
            return 'Chưa chọn biểu mẫu';
          }
        },
        config: {
          placeholder: "Tìm và chọn biểu mẫu",
          formatNoMatches: 'Không tìm thấy dữ liệu',
          multiple: false,
          ajax: {
            placeholder: "Chọn biểu mẫu",
            url: iNet.getUrl('exgate/design/page/list'),
            dataType: 'JSON',
            quietMillis: 500,
            data: function (term, page) {
              return {
                keyword: term || '',
                own: 1,
                pageSize: 20,
                pageNumber: page - 1
              };
            },
            results: function (data, page) {
              var __data = data || {};
              var __more = (page * 20) < __data.total;
              return {results: __data.items || [], more: __more};
            }
          },
          initSelection: function (element, callback) {
            callback($(element).data('data'));
          },
          formatResult:formatResult,
          formatSelection: formatSelection,
          formatSearching: function () {
            return '<i class="icon-refresh icon-spin"></i> Đang tìm ...';
          },
          formatLoadMore: function () {
            return 'Đang tải nhiều hơn...';
          },
          escapeMarkup: function (m) {
            return m;
          }
        }
      },
        {
        width: 250,
        property: 'group',
        label: 'Cấp cơ quan',
        type: 'select',
        original: true,
        editData: ProcedureCommonService.getGroups(),
        valueField: 'value',
        displayField: 'text',
        renderer: function (v) {
          return ProcedureCommonService.getGroupNameByValue(v);
        }
      }, {
        width: 200,
        property: 'useFor',
        label: 'Nơi sử dụng',
        type: 'select',
        original: true,
        editData: ProcedureCommonService.getUserFor(),
        valueField: 'value',
        displayField: 'text',
        renderer: function (v) {
          return ProcedureCommonService.getUseForByValue(v);
        }
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            this.grid.edit(record.uuid);
          }.bind(this)
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = this.createConfirmDeleteDialog();
            dialog.setData({scope: this, record: record});
            dialog.setContent('Bạn có chắc là đồng ý muốn xóa biểu mẫu đã chọn ra khỏi TTHC này không ?');
            dialog.show();
          }.bind(this)
        }]
      }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'eform-grid',
      url: this.url.list,
      dataSource: dataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false,
      convertData: function (data) {
        data = data || {};
        return (data.elements || []).map(function (item) {
          return iNet.apply(item, {eform: {uuid: item.formId , name: item.name || item.formId}})
        });
      }
    });

    this.grid.on('save', function (data) {
      if(!iNet.isEmpty(data.eform)) {
        if(this.hasContextByData(data)) {
          this.notifyError('Biểu mẫu', 'Cấp cơ quan và nơi sử dụng biểu mẫu đã tồn tại');
        } else {
          this.save(data);
        }
      } else {
        this.notifyError('Biểu mẫu', 'Chưa chọn biểu mẫu');
      }
    }.bind(this));

    this.grid.on('update', function (data, odata) {
      if(this.hasContextByData(data)) {
        this.notifyError('Biểu mẫu', 'Cấp cơ quan và nơi sử dụng biểu mẫu đã tồn tại');
      } else {
        this.update(data, odata)
      }
    }.bind(this));

    this.grid.on('loaded', function () {
      this.grid.cancel();
    }.bind(this));

    this.$btnAdd.on('click', function (e) {
      this.grid.newRecord();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.ProcedureFormTab, iNet.ui.criteria.ProcedureBaseTab, {
    getGrid: function () {
      return this.grid;
    },
    hasContextByData: function(data){
      var __data = data || {};
      //var __eform = __data['eform'] || {};
      var items = this.getGrid().getStore().values();
      if(!iNet.isEmpty(__data.uuid)) { //for update
        items = items.filter(function (item) {
          return item.uuid !== __data.uuid;
        })
      }
      return items.some(function (item) {
        return (__data.group === item.group) && (__data.useFor === item.useFor);
      });
    },
    load: function () {
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__procedureId));
      this.grid.setParams({procedureId: __procedureId});
      if (!iNet.isEmpty(__procedureId)) {
        this.grid.load();
      } else {
        this.grid.loadData([]);
      }
    },
    save: function (data) {
      var __data = data || {};
      var __eform = __data['eform'] || {};
      var __params = {
        procedureId: this.getProcedureId(),
        formId: __eform.uuid,
        group: __data.group,
        useFor: __data.useFor
      };
      $.postJSON(this.url.create, __params, function (result) {
        var __result = result || {};
        if (CommonService.isSuccess(__result)) {
          this.grid.reload();
          this.notifySuccess('Biểu mẫu', 'Biểu mẫu đã được thêm');
        } else {
          this.notifyError('Biểu mẫu', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    update: function (data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var __eform = __data['eform'] || {};
      var __params = {
        uuid: __odata.uuid,
        procedureId: this.getProcedureId(),
        formId: __eform.uuid,
        group:  __data.group,
        useFor: __data.useFor
      };
      $.postJSON(this.url.update, __params, function (result) {
        var __result = result || {};
        if (CommonService.isSuccess(__result)) {
          this.grid.reload();
          this.notifySuccess('Biểu mẫu', 'Biểu mẫu đã được cập nhật');
        } else {
          this.notifyError('Biểu mẫu', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-form',
          title: 'Xóa biểu mẫu ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.delete, {
                procedureId: __scope.getProcedureId(),
                uuid: __record.uuid
              }, function (result) {
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

