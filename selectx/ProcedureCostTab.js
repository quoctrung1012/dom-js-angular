/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 15:00 3/12/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureCostTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureCostTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureCostTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'cost-tab';
    iNet.ui.criteria.ProcedureCostTab.superclass.constructor.call(this);
    this.$content = $('#cost-tab-content');

    this.$btnAddFee = $('#cost-tab-btn-add-fee');
    this.$btnAddUnitPrice = $('#cost-tab-btn-add-cost');
    this.$btnAddRatio = $('#cost-tab-btn-add-ratio');
    this.$btnAddRecord = $('#cost-tab-btn-add-record');

    var me = this;

    this.url = {
      list: iNet.getUrl('tthcc/costproduredrafts/fbyproid'),
      create: iNet.getUrl('tthcc/costproduredrafts/add'),
      update: iNet.getUrl('tthcc/costproduredrafts/update'),
      delete: iNet.getUrl('tthcc/costproduredrafts/delete')
    };

    this.$content.on('change', 'input[type="checkbox"][value]', function () {
      var checked = $(this).prop('checked');
      //console.log(this.value, checked);
      var $container = me.getContainerByValue(this.value);
      if (checked) {
        $container.show();
      } else {
        $container.hide();
      }
    });

    var rowNumberColumn = {
      label: '#',
      type: 'rownumber',
      align: 'center',
      width: 50
    };

    var keyEFormColumn = {
      property: "keyEForm",
      type: 'text',
      label: 'Giá trị biểu mẫu',
      width: 120
    };

    var subColumn = {
      property: "subsection",
      type: 'text',
      label: 'Tiểu mục',
      width: 250
    };

    var briefColumn = {
      property: 'brief',
      label: 'Tên phí',
      sortable: true,
      type: 'text',
      validate: function (v) {
        if (iNet.isEmpty(v)) {
          return 'Tên phí không được để rỗng';
        }
      }
    };

    var costColumn = {
      property: 'cost',
      label: 'Mã phí',
      sortable: true,
      type: 'label',
      width: 120
    };

    //=================Fee========================
    var feeDataSource = new DataSource({
      columns: [rowNumberColumn, costColumn, {
        property: 'brief',
        label: 'Tên lệ phí',
        sortable: true,
        type: 'text',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Tên lệ phí không được để rỗng';
          }
        }.bind(this)
      }, {
        property: 'amount',
        label: 'Số tiền (VNĐ)',
        sortable: true,
        width: 150,
        type: 'number',
        align: 'right',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      }, keyEFormColumn, subColumn,{
        property: 'computeMode',
        label: "Tính theo số lượng",
        width: 85,
        sortable: false,
        type: 'switches',
        typeCls: 'switch-6',
        cls: 'text-center',
        renderer: function (v) {
          return (v==="unit_price");
        },
        onChange: function (record, v) {
          var __record = record || {};
          var __grid = this.getFeeGrid();
          var __id = __record[__grid.getIdProperty()];
          if (iNet.isEmpty(__id) || __grid.getBody().find(String.format('tr[data-id="{0}"]>td', __id)).hasClass('editable')) {
            return;
          } else if (!iNet.isEmpty(__id)){
            this.updateFee({computeMode: v}, __record);
            return;
          }
          __grid.update(__record);
          __grid.commit();
        }.bind(this)
      }, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            this.getFeeGrid().edit(record.uuid);
          }.bind(this)
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = this.createConfirmDeleteDialog();
            dialog.setData({scope: this, record: record, grid: this.getFeeGrid()});
            dialog.setContent(String.format('Bạn có chắc là đồng ý muốn xóa <b>"{0}"</b> không ?', record['brief']));
            dialog.show();
          }.bind(this)
        }]
      }]
    });
    this.feeGrid = new iNet.ui.grid.Grid({
      id: 'fee-grid',
      url: this.url.list,
      dataSource: feeDataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false
    });
    this.feeGrid.on('save', function (data) {
      this.saveFee(data);
    }.bind(this));
    this.feeGrid.on('update', function (data, odata) {
      this.updateFee(data, odata)
    }.bind(this));
    this.feeGrid.on('loaded', function () {
      this.getFeeGrid().cancel();
    }.bind(this));
    this.$btnAddFee.on('click', function (e) {
      this.getFeeGrid().newRecord();
    }.createDelegate(this));

    //=================Unit Price========================
    var unitPriceDataSource = new DataSource({
      columns: [rowNumberColumn, costColumn, briefColumn, {
        property: 'amount',
        label: 'Đơn giá (VNĐ)',
        sortable: true,
        width: 150,
        type: 'number',
        align: 'right',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      }, keyEFormColumn, subColumn, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            this.getUnitPriceGrid().edit(record.uuid);
          }.bind(this)
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = this.createConfirmDeleteDialog();
            dialog.setData({scope: this, record: record, grid: this.getUnitPriceGrid()});
            dialog.setContent(String.format('Bạn có chắc là đồng ý muốn xóa <b>"{0}"</b> không ?', record['brief']));
            dialog.show();
          }.bind(this)
        }]
      }]
    });
    this.unitPriceGrid = new iNet.ui.grid.Grid({
      id: 'cost-grid',
      url: this.url.list,
      dataSource: unitPriceDataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false
    });
    this.unitPriceGrid.on('save', function (data) {
      this.saveUnitPrice(data);
    }.bind(this));
    this.unitPriceGrid.on('update', function (data, odata) {
      this.updateUnitPrice(data, odata)
    }.bind(this));
    this.unitPriceGrid.on('loaded', function () {
      this.getUnitPriceGrid().cancel();
    }.bind(this));
    this.$btnAddUnitPrice.on('click', function (e) {
      this.getUnitPriceGrid().newRecord();
    }.createDelegate(this));

    //=================Ratio========================
    var ratioDataSource = new DataSource({
      columns: [rowNumberColumn, costColumn, briefColumn, {
        property: 'ratio',
        label: 'Tỷ lệ (%)',
        sortable: true,
        width: 150,
        type: 'text',
        align: 'right',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          } else if (!iNet.isNumber(Number(v))) {
            return 'Dữ liệu phải là kiểu số';
          } else if(Number(v)<0 || Number(v)>100) {
            return 'Tỷ lệ phải nằm trong khoảng từ 0 đến 100%';
          }
        }.bind(this)
      }, keyEFormColumn, subColumn, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            this.getRatioGrid().edit(record.uuid);
          }.bind(this)
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = this.createConfirmDeleteDialog();
            dialog.setData({scope: this, record: record, grid: this.getRatioGrid()});
            dialog.setContent(String.format('Bạn có chắc là đồng ý muốn xóa <b>"{0}"</b> không ?', record['brief']));
            dialog.show();
          }.bind(this)
        }
        ]
      }
      ]
    });
    this.ratioGrid = new iNet.ui.grid.Grid({
      id: 'ratio-grid',
      url: this.url.list,
      dataSource: ratioDataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false
    });
    this.ratioGrid.on('save', function (data) {
      this.saveRatio(data);
    }.bind(this));
    this.ratioGrid.on('update', function (data, odata) {
      this.updateRatio(data, odata)
    }.bind(this));
    this.ratioGrid.on('loaded', function () {
      this.getRatioGrid().cancel();
    }.bind(this));
    this.$btnAddRatio.on('click', function (e) {
      this.getRatioGrid().newRecord();
    }.createDelegate(this));

    //================Record========================
    var recordDataSource = new DataSource({
      columns: [rowNumberColumn, costColumn, briefColumn, {
        property: 'amount',
        label: 'Số tiền (VNĐ)',
        sortable: true,
        width: 150,
        type: 'number',
        align: 'right',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      }, keyEFormColumn, subColumn, {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          text: iNet.resources.message.button.edit,
          icon: 'icon-pencil',
          fn: function (record) {
            this.getRecordGrid().edit(record.uuid);
          }.bind(this)
        }, {
          text: iNet.resources.message.button.del,
          icon: 'icon-trash',
          labelCls: 'label label-important',
          fn: function (record) {
            var dialog = this.createConfirmDeleteDialog();
            dialog.setData({scope: this, record: record, grid: this.getRecordGrid()});
            dialog.setContent(String.format('Bạn có chắc là đồng ý muốn xóa <b>"{0}"</b> không ?', record['brief']));
            dialog.show();
          }.bind(this)
        }]
      }]
    });
    this.recordGrid = new iNet.ui.grid.Grid({
      id: 'record-grid',
      url: this.url.list,
      dataSource: recordDataSource,
      remotePaging: false,
      firstLoad: false,
      idProperty: 'uuid',
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false
    });
    this.recordGrid.on('save', function (data) {
      this.saveRecordItem(data);
    }.bind(this));
    this.recordGrid.on('update', function (data, odata) {
      this.updateRecordItem(data, odata)
    }.bind(this));
    this.recordGrid.on('loaded', function () {
      this.getRecordGrid().cancel();
    }.bind(this));
    this.$btnAddRecord.on('click', function (e) {
      this.getRecordGrid().newRecord();
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.ProcedureCostTab, iNet.ui.criteria.ProcedureBaseTab, {
    getContainerByValue: function (type) {
      return this.$content.find(String.format('[data-cost-tab-content="{0}"]', type));
    },
    getFeeGrid: function () {
      return this.feeGrid;
    },
    getUnitPriceGrid: function () {
      return this.unitPriceGrid;
    },
    getRatioGrid: function () {
      return this.ratioGrid;
    },
    getRecordGrid: function () {
      return this.recordGrid;
    },
    getParams: function () {
      return {
        procedureID: this.getProcedureId()
      }
    },
    checkRole: function () {
      var __isExist = !iNet.isEmpty(this.getProcedureId());
      FormUtils.showButton(this.$btnAddFee, __isExist);
      FormUtils.showButton(this.$btnAddUnitPrice, __isExist);
      FormUtils.showButton(this.$btnAddRatio, __isExist);
      FormUtils.showButton(this.$btnAddRecord, __isExist);
    },
    load: function () {
      this.checkRole();
      $.getJSON(this.url.list, {procedureId: this.getProcedureId()}, function (result) {
        result = result || {};
        //console.log('[result]', result);
        var items = result['elements'] || [];
        var fees = [], prices = [], ratios = [], records= [];
        //console.log(items);
        items.forEach(function (item) {
          item = item || {};
          if(item.type===2) {
            fees.push(item);
          } else {
            switch (item.computeMode) {
              case 'unit_price':
                prices.push(item);
                break;
              case 'ratio':
                ratios.push(item);
                break;
              case 'record':
                records.push(item);
                break;
            }
          }
        });
        this.getFeeGrid().loadData(fees);
        this.getUnitPriceGrid().loadData(prices);
        this.getRatioGrid().loadData(ratios);
        this.getRecordGrid().loadData(records);

        //console.log(fees.length>0, prices.length>0,ratios.length>0, records.length>0);

        //this.$content.find('input[type="checkbox"][value="fee"]').prop('checked', fees.length).trigger('change');
        this.$content.find('input[type="checkbox"][value="cost"]').prop('checked', prices.length>0).trigger('change');
        this.$content.find('input[type="checkbox"][value="ratio"]').prop('checked', ratios.length>0).trigger('change');
        this.$content.find('input[type="checkbox"][value="record"]').prop('checked', records.length>0).trigger('change');

      }.bind(this), {mask: this.getEl(), msg: iNet.resources.ajaxLoading.loading});
    },
    saveDataByType: function (data, type, callback) {
      callback = callback || iNet.emptyFn;
      data = iNet.apply(data || {}, {
        type: type
      });
      $.postJSON(this.url.create, data, function (result) {
        result = result || {};
        if (CommonService.isSuccess(result)) {
          callback(result);
          this.notifySuccess('Phí/Lệ phí', 'Dữ liệu đã được thêm');
        } else {
          this.notifyError('Phí/Lệ phí', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    updateData: function (data, callback) {
      callback = callback || iNet.emptyFn;
      $.postJSON(this.url.update, data || {}, function (result) {
        result = result || {};
        if (CommonService.isSuccess(result)) {
          callback(result);
          this.getFeeGrid().update(result);
          this.getFeeGrid().commit();
          this.notifySuccess('Phí/Lệ phí', 'Dữ liệu đã được cập nhật');
        } else {
          this.notifyError('Phí/Lệ phí', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    saveFee: function (data) {
      var __data = iNet.apply(this.getParams(), data || {});
      __data.computeMode = (!!__data.computeMode) ? 'unit_price': '';
      this.saveDataByType(__data, 2, function (result) {
        this.getFeeGrid().insert(result);
      }.bind(this));
    },
    updateFee: function (data, odata) {
      var __data = iNet.apply(odata, data || {});
      //console.log(odata, data);
      __data.computeMode = (!!__data.computeMode) ? 'unit_price': '';
      this.updateData(__data, function (result) {
        this.getFeeGrid().update(result);
        this.getFeeGrid().commit();
      }.bind(this));
    },
    saveUnitPrice: function (data) {
      var __data = iNet.apply(this.getParams(), data || {}, {computeMode: 'unit_price'});
      this.saveDataByType(__data, 1, function (result) {
        this.getUnitPriceGrid().insert(result);
      }.bind(this));
    },
    updateUnitPrice: function (data, odata) {
      var __data = iNet.apply(odata,  data || {});
      this.updateData(__data, function (result) {
        this.getUnitPriceGrid().update(result);
        this.getUnitPriceGrid().commit();
      }.bind(this));
    },
    saveRatio: function (data) {
      var __data = iNet.apply(this.getParams(), data || {}, {computeMode: 'ratio'});
      this.saveDataByType(__data, 1, function (result) {
        this.getRatioGrid().insert(result);
      }.bind(this));
    },
    updateRatio: function (data, odata) {
      var __data = iNet.apply( odata,  data || {});
      this.updateData(__data, function (result) {
        this.getRatioGrid().update(result);
        this.getRatioGrid().commit();
      }.bind(this));
    },
    saveRecordItem: function (data) {
      var __data = iNet.apply(this.getParams(), data || {}, {computeMode: 'record'});
      this.saveDataByType(__data, 1, function (result) {
        this.getRecordGrid().insert(result);
      }.bind(this));
    },
    updateRecordItem: function (data, odata) {
      var __data = iNet.apply( odata,  data || {});
      this.updateData(__data, function (result) {
        this.getRecordGrid().update(result);
        this.getRecordGrid().commit();
      }.bind(this));
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-cost',
          title: 'Xóa ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __data.grid;
              $.postJSON(__scope.url.delete, {uuid: __record.uuid}, function (result) {
                this.hide();
                if (CommonService.isSuccess(result)) {
                  __scope.notifySuccess("Xóa", "Dữ liệu đã được xóa");
                  __grid.remove(__record.uuid);
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
