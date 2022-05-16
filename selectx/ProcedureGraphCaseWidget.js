/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:10 26/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: GraphCaseWidget
$(function () {
  /**
   * @class iNet.ui.criteria.GraphCaseWidget
   * @extends iNet.ui.criteria.BaseWidget
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.GraphCaseWidget = function (options) {
    iNet.apply(this, options || {});
    this.id = 'graph-case-wg';
    iNet.ui.criteria.GraphCaseWidget.superclass.constructor.call(this);
    //console.log('[GraphCaseWidget]', this);
    this.$btnAdd = $('#graph-case-wg-btn-add');
    this.$btnBack = $('#graph-case-wg-btn-back');
    this.$name = $('#graph-case-name');
    this.resource = {
      procedure: iNet.resources.criteria.procedure,
      errors: iNet.resources.criteria.errors,
      constant: iNet.resources.criteria.constant,
      validate: iNet.resources.criteria.validate
    };

    this.url = {
      list: iNet.getUrl('tthcc/caseprocedure/load'),
      create: iNet.getUrl('tthcc/caseprocedure/create'),
      update: iNet.getUrl('tthcc/caseprocedure/update'),
      delete: iNet.getUrl('tthcc/caseprocedure/delete')
    };

    var PROCESS_TIME_TYPE_DATA = [
      {id: 'working_day', value: 'working_day', text: 'Ngày làm việc'},
      {id: 'day', value: 'day', text: 'Ngày (kể cả thứ 7, CN và ngày lễ)'},
      {id: 'in_day', value: 'in_day', text: 'Trong ngày'},
      {id: 'require_in_day', value: 'require_in_day', text: 'Bắt buộc trong ngày'},
      {id: 'indefinite', value: 'indefinite', text: 'Không thời hạn'}
    ];

    var dataSource = new DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      }, {
        width : 150,
        property : 'type',
        label : 'Loại điều kiện',
        type : 'select',
        original: true,
        editData: ProcedureCommonService.getCaseType(),
        valueField: 'value',
        displayField: 'text',
        renderer: function (v) {
          return ProcedureCommonService.getCaseTypeByValue(v);
        }.bind(this)
      },{
        property: 'caseName',
        label: 'Tên điều kiện',
        sortable: true,
        type: 'text',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      },{
        property: 'condition',
        label: this.resource.procedure["condition"],
        sortable: true,
        width: 175,
        type: 'text',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      },{
        width : 165,
        property: 'processTimeType',
        label: 'Loại thời gian',
        type : 'select',
        original: true,
        editData: PROCESS_TIME_TYPE_DATA,
        valueField: 'value',
        displayField: 'text',
        renderer: function (v) {
          v = v || PROCESS_TIME_TYPE_DATA[0].value;
          return PROCESS_TIME_TYPE_DATA.find(function (type) {
            return type.value===v;
          })['text'];
        }.bind(this)
      },{
        property: 'hours',
        label: 'Thời gian xử lý (ngày/giờ)',
        sortable: true,
        width: 120,
        type: 'text',
        align: 'right',
        original: true,
        validate: function (v) {
          if (!iNet.isEmpty(v) && !iNet.isNumber(Number(v))) {
            return 'Dữ liệu phải là kiểu số (ngày hoặc giờ)';
          }
        }.bind(this),
        renderer: function (v, record) {
          if(v===0) {
            return '';
          }
          return String.format('{0} {1}' ,v , ((record || {}).processTimeType==='day' ? '(ngày)': '(giờ)'));
        }
      }, {
        property: 'hoursTax',
        label: 'Thời gian hẹn trả thông báo thuế (giờ)',
        sortable: true,
        width: 150,
        type: 'number',
        align: 'right',
        validate: function (v) {
          if (iNet.isEmpty(v)) {
            return 'Dữ liệu không được để rỗng';
          }
        }.bind(this)
      },
        {
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
              dialog.setContent(String.format(this.resource.constant.del_content, record['caseName']));
              dialog.show();
            }.bind(this)
          }
          ]
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'graph-case-grid',
      url: this.url.list,
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: false,
      firstLoad: false,
      hideHeader: true,
      pageSize: 9999,
      autoHideWhenOutside: false,
      convertData: function (data) {
        var __data = data || {};
        this.setTotal(__data.total);
        return __data.elements;
      }
    });

    this.grid.on('beforeedit', function( data, rowIndex) {
      var __data = data || {};
      //console.log('[beforeedit]', rowIndex, __data);
      var cm = this.grid.getColumnModel();
      var typeEditor = cm.getColumnByName('type').getCellEditor(rowIndex, false);
      typeEditor.setDisabled(true);

      var __processTimeType = __data['processTimeType'] || 'working_day';
      var hourEditor = cm.getColumnByName('hours').getCellEditor(rowIndex, false);
      hourEditor.setDisabled((__processTimeType!=='working_day' &&  __processTimeType!=='day'));
    }.bind(this));

    this.grid.on('change',function(odata, data, colIndex, rowIndex){
      var __odata= odata || {};
      var __data = data || {};
      var __processTimeType = __data['processTimeType'] || 'working_day';
      var cm = this.grid.getColumnModel();
      var isAdd = iNet.isEmpty(__odata[this.grid.getIdProperty()]);
      //console.log(isAdd, __data);
      var hourEditor = cm.getColumnByName('hours').getCellEditor(rowIndex, isAdd);
      var __isDisabled = (__processTimeType!=='working_day' &&  __processTimeType!=='day');
      /*
      if(__isDisabled){
        hourEditor.setValue('');
      }
       */
      hourEditor.setDisabled(__isDisabled);
    }.bind(this));

    this.grid.on('save', function (data) {
      if(this.getReceiveMode()!=='communication' && data.type==='input') {
        this.notifyError('Thêm điều kiện', 'Loại điều kiện "đầu vào" chỉ áp dụng đối với hình thức tiếp nhận là "Liên thông"');
        return;
      }
      if (this.hasContextByData(data)) {
        this.notifyError('Thêm điều kiện', 'Có lỗi khi lưu.Loại điều kiện "đầu vào" đã tồn tại');
      } else {
        this.save(data);
      }
    }.bind(this));

    this.grid.on('update', function (data, odata) {
      if (this.hasContextByData(data)) {
        this.notifyError('Sửa điều kiện', 'Có lỗi khi cập nhật.Loại điều kiện "đầu vào" đã tồn tại');
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

    this.$btnBack.on('click', function () {
      this.hide();
      this.fireEvent('back', this);
    }.createDelegate(this));

  };
  iNet.extend(iNet.ui.criteria.GraphCaseWidget, iNet.ui.criteria.BaseWidget, {
    hasContextByData: function(data){
      var __data = data || {};
      if(data.type!=='input') {
        return;
      }
      var items = this.getGrid().getStore().values();
      if(!iNet.isEmpty(__data.uuid)) { //for update
        items = items.filter(function (item) {
          return item.uuid !== __data.uuid;
        })
      }
      return items.some(function (item) {
        return (item.type==='input');
      });
    },
    setGraph: function(v){
      this.graph = v;
    },
    getGraph: function(){
      return this.graph || {};
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
    getGraphId: function(){
      var __graph = this.getGraph();
      return __graph.graphId;
    },
    getGrid: function () {
      return this.grid;
    },
    getReceiveMode: function(){
      var __graph = this.getGraph();
      return __graph['receiveMode'];
    },
    load: function () {
      var __graph = this.getGraph();
      var __receiveModeHtml='';
      if(!iNet.isEmpty(__graph['receiveMode'])) {
        __receiveModeHtml = String.format(' <span class="label label-info">{0}</span>', ProcedureCommonService.getReceiveModeByValue(__graph['receiveMode']));
      }
      this.$name.html(String.format('{0} {1}', (__graph['name'] || '').escapeHtml(), __receiveModeHtml));
      var isValid = !iNet.isEmpty(this.getProcedureId() && !iNet.isEmpty(this.getGraphId()));
      FormUtils.showButton(this.$btnAdd, isValid);
      this.grid.setParams({procedureID: this.getProcedureId(), graphId: this.getGraphId()});
      if(isValid) {
        this.grid.load();
      } else {
        this.grid.loadData([]);
      }

      //disable option to type select
      var cm = this.grid.getColumnModel();
      var typeEditor = cm.getColumnByName('type').getCellEditor(0, true);
      typeEditor.getEl().find('option[value="input"]').prop('disabled', __graph['receiveMode']!=='communication');
    },
    save: function (data) {
      var __data = iNet.apply(iNet.clone(this.grid.getParams() || {}), data || {});
      $.postJSON(this.url.create, __data, function (result) {
        var __result = result || {};
        if (CommonService.isSuccess(__result)) {
          this.grid.insert(__result);
          this.notifySuccess('Thêm điều kiện', 'Dữ liệu đã được thêm');
        } else {
          this.notifyError('Thêm điều kiện', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    update: function (data, odata) {
      var __data = iNet.apply(iNet.clone(this.grid.getParams() || {}), data || {}, {caseProcID: data.uuid});
      $.postJSON(this.url.update, __data, function (result) {
        var __result = result || {};
        if (CommonService.isSuccess(__result)) {
          this.grid.update(__result);
          this.grid.commit();
          this.notifySuccess('Điều kiện', 'Dữ liệu đã được cập nhật');
        } else {
          this.notifyError('Điều kiện', 'Có lỗi xảy ra khi lưu dữ liệu');
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-case',
          title: 'Xóa điều kiện ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.delete, {uuid: __record.uuid}, function (result) {
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
