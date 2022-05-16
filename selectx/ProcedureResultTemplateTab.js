/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 10:37 27/07/2019
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureResultTemplateTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureResultTemplateTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureResultTemplateTab = function (options) {
    iNet.apply(this, options || {});
    this.id =  this.id || 'result-template-tab';
    iNet.ui.criteria.ProcedureResultTemplateTab.superclass.constructor.call(this);
    console.log('[ProcedureResultTemplateTab]', this);
    this.$btnAdd = $('#result-template-tab-btn-add');

    this.url = {
      list: iNet.getUrl('design/page/list'),
      create: iNet.getUrl('tthcc/proceduredraft/results/add'),
      delete: iNet.getUrl('tthcc/proceduredraft/results/delete')
    };

    var bindTemplateSelected = function(value, items, callback) {
      callback(items.find(function (item) {
        return item.uuid===value;
      }));
    };

    var formatResult = function (item) {
      item = item || {};
      return item.name;
    };

    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      },{
          property: 'result',
          label: "Kết quả thực hiện",
          sortable: true,
          type: 'selectx',
          valueField: 'uuid',
          displayField: 'name',
          objectData: true,
          original: true,
          cls: 'max-with',
          renderer: function (value, record) {
            return record.name;
          },
        validate: function(v){
          if(iNet.isEmpty(v)) {
            return 'Chưa chọn kết quả thực hiện';
          }
        },
          config: {
            placeholder: "Chọn kết quả",
            formatNoMatches: 'Không tìm thấy dữ liệu',
            multiple: false,
            initSelection: function (element, callback) {
              var value = $(element).val();
              ProcedureCommonService.loadResultTemplates(function (items) {
                if (value) {
                  bindTemplateSelected(value, items, callback);
                }
              });
            },
            query: function(query) {
              ProcedureCommonService.loadResultTemplates(function (items) {
                query.callback({results: ProcedureCommonService.filterTermInArray(query.term, items)});
              }.bind(this));
            }.bind(this),
            formatResult: formatResult,
            formatSelection: formatResult,
            escapeMarkup: function (m) {
              return m;
            }
          }
        },
        {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: [
            {
              text: iNet.resources.message.button.del,
              icon: 'icon-trash',
              labelCls: 'label label-important',
              fn: function (record) {
                var __record = record || {};
                var dialog = this.createConfirmDeleteDialog();
                dialog.setData({scope: this, record: record});
                dialog.setContent('Bạn có chắc là đồng ý muốn xóa kết quả đã chọn ra khỏi TTHC này không ?');
                dialog.show();
              }.createDelegate(this)
            }
          ]
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'result-template-grid',
      url: this.url.list,
      dataSource: dataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false
    });

    this.grid.on('save', function (data) {
      this.save(data);
    }.createDelegate(this));

    this.grid.on('loaded', function () {
      this.grid.cancel();
    }.bind(this));

    this.$btnAdd.on('click', function(e){
      this.grid.newRecord();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.ProcedureResultTemplateTab, iNet.ui.criteria.ProcedureBaseTab, {
    getGrid: function () {
      return this.grid;
    },
    hasItem: function(data){
      var __data = data || {};
      var items = this.getGrid().getStore().values();
      return items.some(function (item) {
        return (__data.uuid===item.uuid);
      });
    },
    getResultIds: function(){
      var __procedure = this.getProcedure();
      return __procedure['resultIDs'] || [];
    },
    pushResultId: function(resultId) {
      var __procedure = this.getProcedure();
      var __resultIds = __procedure['resultIDs'] || [];
      if(__resultIds.indexOf(resultId)<0){
        __resultIds.push(resultId);
      }
      __procedure['resultIDs'] = __resultIds;
    },
    removeResultId: function(resultId){
      var __procedure = this.getProcedure();
      __procedure['resultIDs'] =  (__procedure['resultIDs'] || []).filter(function (id) {
          return (id!==resultId);
      });
    },
    load: function(){
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__procedureId));
      this.grid.setParams({
        type: __procedureId
      });
      if(!iNet.isEmpty(__procedureId)) {
        this.findResultIds( function (items) {
          this.grid.loadData(items);
        }.bind(this))

      } else {
        this.grid.loadData([]);
      }
    },
    findResultIds: function(callback){
      callback = callback || iNet.emptyFn;
      var __resultIds = this.getResultIds();
      ProcedureCommonService.loadResultTemplates(function (items) {
        var selectedItems = items.filter(function (item) {
           return __resultIds.indexOf(item.uuid)>-1;
        });
        callback(selectedItems);
      });
    },
    save: function (data) {
      var __data = data || {};
      var __result = __data['result'] || {};
      if(this.hasItem(__result)) {
        this.notifyError('Kết quả', 'Kết quả đã tồn tại');
        return;
      }
      var __params = {
        procedureId: this.getProcedureId(),
        resultId: __result.uuid
      };
      $.postJSON(this.url.create, __params, function (result) {
        var __result = result || {};
        if (CommonService.isSuccess(__result)) {
          this.pushResultId(__params.resultId);
          this.notifySuccess('Kết quả', 'Kết quả đã được thêm');
          this.load();
        } else {
          this.notifyError('Kết quả', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-result',
          title: 'Xóa kết quả ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.delete, {resultId: __record.uuid, procedureId: __scope.getProcedureId()}, function (result) {
                this.hide();
                if (CommonService.isSuccess(result)) {
                  __grid.remove( __record.uuid);
                  __scope.removeResultId(__record.uuid);
                  __scope.notifySuccess("Xóa", "Dữ liệu đã được xóa");
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

