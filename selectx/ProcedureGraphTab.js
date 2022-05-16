/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 11:10 27/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureGraphTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureGraphTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureGraphTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'graph-tab';
    iNet.ui.criteria.ProcedureGraphTab.superclass.constructor.call(this);
    this.$btnAdd = $('#graph-tab-btn-add');
    this.$listContainer= $('#graph-list-wg');
    this.SELECT_ORG_GROUP = {id: '' , value: '', text: 'Tùy chọn đơn vị'};
    this.url = {
      list: iNet.getUrl('tthcc/proceduredraft/assgraphs/fbyproid'),
      create: iNet.getUrl('tthcc/proceduredraft/assgraphs/add'),
      update: iNet.getUrl('tthcc/proceduredraft/assgraphs/update'),
      delete: iNet.getUrl('tthcc/proceduredraft/assgraphs/delete')
    };

    var formatResult = function (item) {
      item = item || {};
      return item.name;
    };

    var dataSource = new DataSource({
      columns: [{
        label: '#',
        type: 'rownumber',
        align: 'center',
        width: 50
      },{
        property: 'graph',
        label: "Tên quy trình",
        sortable: true,
        type: 'selectx',
        valueField: 'uuid',
        displayField: 'name',
        objectData: true,
        original: true,
        cls: 'max-with',
        validate: function(v){
          if(iNet.isEmpty(v)) {
            return 'Chưa chọn quy trình';
          }
        },
        renderer: function (value, record) {
          return record.name || String.format('<span style="text-decoration: line-through;">{0}</span> <span class="red">(dữ liệu đã bị xóa)</span>', record.graphId );
        },
        config: {
          placeholder: "Tìm và chọn quy trình xử lý",
          formatNoMatches: 'Không tìm thấy dữ liệu',
          multiple: false,
          ajax: {
            placeholder: "Chọn quy trình",
            url: iNet.getUrl('onegate/workflow/defproc/list'),
            dataType: 'JSON',
            quietMillis: 500,
            data: function (term, page) {
              return {
                keyword: term || '',
                zone: iNet.zone,
                context: iNet.context,
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
          formatSelection: formatResult,
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
      },{
        width : 150,
        property : 'receiveMode',
        label : 'Hình thức tiếp nhận',
        type : 'select',
        original: true,
        editData: ProcedureCommonService.getReceiveMode(),
        valueField: 'value',
        displayField: 'text',
        renderer: function (v) {
          return ProcedureCommonService.getReceiveModeByValue(v);
        }
      }, {
        width : 200,
        property : 'group',
        label : 'Cấp cơ quan',
        type : 'select',
        original: true,
        editData: this.getGroups(),
        valueField: 'value',
        displayField: 'text',
        renderer: function (v, record) {
          record = record || {};
          if(iNet.isEmpty(v) && (record['organs'] || []).length===0) {
            return '<span class="red">Vui lòng cấu hình lại</span>';
          }
          return this.getGroupNameByValue(v);
        }.bind(this)
      },{
        width:300,
        property: 'organs',
        label: "Đơn vị",
        sortable: true,
        type: 'selectx',
        valueField: 'organId',
        displayField: 'organName',
        objectData: true,
        original: true,
        cls: 'max-with',
        renderer: function (value, record) {
          record = record || {};
          if(!iNet.isEmpty(record['group'])) {
            return  '';
          }
          var orgNames = (record['organs'] || []).map(function (item) {
            return item['organName'] || item['organId'];
          });

          return orgNames.join(', ');
        },
        config: {
          placeholder: "",
          formatNoMatches: 'Không tìm thấy dữ liệu',
          multiple: true,
          id: function (item) {
            return item.organId;
          },
          initSelection: function (element, callback) {
            var values =  $(element).data('data'); // giữ lại giá trị từ grid khi load grid(với dữ liệu có phân trang)
            if(values && iNet.isArray(values) && values.length>0) {
              callback(values);
              return;
            }
            ProcedureCommonService.loadUnits(function (items) {
              if (values) {
                var selectedItems = items.filter(function (firm) {
                  return values.indexOf(firm.organId)>-1;
                });
                callback(selectedItems);
              }
            });
          },
          query: function(query) {
            ProcedureCommonService.loadUnits(function (apps) {
              var term = (query.term || '').toLowerCase();
              query.callback({
                results: ProcedureCommonService.filterTermInArray(term, apps, function (item) {
                  return ((item['organName'] || '').toLowerCase()).indexOf(term) > -1;
                })
              });
            }.bind(this));
          }.bind(this),

          formatSearching: function () {
            return '<i class="icon-refresh icon-spin"></i> Đang tìm ...';
          },
          formatResult: function (item) {
            item = item || {};
            return String.format("<span class='label label-warning' style='min-width: 100px;text-align: left'>{0}</span>&nbsp; <b>{1}</b>", item['organId'].substring(0, 13), item['organName']);
          },
          formatSelection: function (item) {
            item = item || {};
            return item['organName'];
          },
          escapeMarkup: function (m) {
            return m;
          }
        }
      }, {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: [{
            text: 'Khai báo điều kiện',
            icon: 'icon-gear',
            labelCls: 'label label-success',
            fn: function (record) {
              this.caseWidget = this.createCaseWidget();
              this.setVisible(false);
              this.caseWidget.setGraph(record);
              this.caseWidget.setProcedure(this.getProcedure());
              this.caseWidget.show();
              this.caseWidget.load();
            }.bind(this)
          },{
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
              dialog.setContent('Bạn có chắc là đồng ý muốn xóa quy trình đã chọn ra khỏi TTHC này không ?');
              dialog.show();
            }.bind(this)
          }]
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'graph-grid',
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
          return iNet.apply(item, {graph: {uuid: item.graphId , name: item.name || item.graphId}})
        });
      }
    });


    this.grid.on('change',function(odata, data, colIndex, rowIndex){
      var __odata= odata || {};
      //var __data = data || {};
      //console.log('[change]', colIndex, __data);
      var cm = this.grid.getColumnModel();
      var isAdd = iNet.isEmpty(__odata[this.grid.getIdProperty()]);
      var orgEditor = cm.getColumnByName('organs').getCellEditor(rowIndex, isAdd);
      if(!iNet.isEmpty(data['group'])){
        orgEditor.setValue('');
      }
      orgEditor.setDisabled(!iNet.isEmpty(data['group']));
    }.bind(this));

    this.grid.on('beforeedit', function( data, rowIndex) {
      //var __data = data || {};
      //console.log('[beforeedit]', rowIndex, __data);
      var cm = this.grid.getColumnModel();
      var orgEditor = cm.getColumnByName('organs').getCellEditor(rowIndex, false);
      if(!iNet.isEmpty(data['group'])){
        orgEditor.setValue('')
      }
      orgEditor.setDisabled(!iNet.isEmpty(data['group']));
    }.bind(this));

    this.grid.on('save', function (data) {
      if(!iNet.isEmpty(data.graph)) {
        if (this.hasContextByData(data)) {
          this.notifyError('Quy trình', 'Cấp cơ quan và hình thức tiếp nhận của quy trình đã tồn tại');
        } else {
          if (iNet.isEmpty(data['group']) && (data['organs'] || []).length===0) {
            var control = this.grid.getAddControl().find(function (control) {
              return control.column.colIndex===4;
            });
            if(control) {
              control.setError('Chưa chọn đơn vị');
            }
            this.notifyError('Quy trình', 'Chưa chọn đơn vị');
            return ;
          }
          this.save(data);
        }
      } else {
        this.notifyError('Quy trình', 'Chưa chọn quy trình');
      }
    }.bind(this));

    this.grid.on('update', function (data, odata) {
      if(this.hasContextByData(data)) {
        this.notifyError('Quy trình', 'Cấp cơ quan và hình thức tiếp nhận của quy trình đã tồn tại');
      } else {
        if (iNet.isEmpty(data['group']) && (data['organs'] || []).length===0) {
          var control = this.grid.getRowItems().get(data['uuid']).controls.find(function (control) {
            return control.column.colIndex===4;
          });
          if(control) {
            control.setError('Chưa chọn đơn vị');
          }
          this.notifyError('Quy trình', 'Chưa chọn đơn vị');
          return ;
        }
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
  iNet.extend(iNet.ui.criteria.ProcedureGraphTab, iNet.ui.criteria.ProcedureBaseTab, {
    getGrid: function () {
      return this.grid;
    },
    getGroups: function(){
      //return ProcedureCommonService.getGroups();
      var __groups = ProcedureCommonService.getGroups().filter(function(group){
        return !!group.id;
      });
      __groups.splice(0,0 ,this.SELECT_ORG_GROUP);
      //__groups.push(this.SELECT_ORG_GROUP);
      return __groups
    },
    getGroupNameByValue: function(value) {
      //return ProcedureCommonService.getGroupNameByValue(value);
      return ((this.getGroups().find(function (group) {
        return group.value===value;
      }) || this.SELECT_ORG_GROUP)['text']);
    },
    hasContextByData: function(data){
      var __data = data || {};
      //var __graph = __data.graph || {};
      /*
      var items = this.getGrid().getStore().values();
      if(!iNet.isEmpty(__data.uuid)) { //for update
        items = items.filter(function (item) {
          return item.uuid !== __data.uuid;
        })
      }
      return items.some(function (item) {
        return ( __data.receiveMode===item.receiveMode) && (__data.group === item.group);
      });

       */
      return false; //not validate
    },
    load: function () {
      this.setVisible(true);
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__procedureId));
      this.grid.setParams({procedureId: __procedureId});
      if(!iNet.isEmpty(__procedureId)) {
        this.grid.load();
      } else {
        this.grid.loadData([]);
      }
    },
    save: function (data) {
      var __data = data || {};
      var __graph = __data.graph || {};
      var __params = {
        procedureId: this.getProcedureId(),
        graphId: __graph.uuid,
        group:  __data.group,
        receiveMode: __data.receiveMode
      };
      var __organs = __data['organs'] || [];
      if(iNet.isEmpty(__data.group)) {
        __organs = __organs.map(function (org) {
          return {
            organId: org.organId,
            organName: org.organName,
            group: org.group
          };
        });
        __params.organsStr = JSON.stringify(__organs);
      }
      $.postJSON(this.url.create, __params, function (result) {
        result = result || {};
        if (CommonService.isSuccess(result)) {
          this.grid.reload();
          this.notifySuccess('Quy trình', 'Quy trình đã được thêm');
        } else {
          this.notifyError('Quy trình', this.getMessageByResponse(result));
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    update: function (data, odata) {
      var __data = data || {};
      var __odata = odata || {};
      var __graph = __data.graph || {};
      var __params = {
        uuid: __odata.uuid,
        procedureId: this.getProcedureId(),
        graphId: __graph.uuid,
        group:  __data.group,
        receiveMode: __data.receiveMode
      };
      var __organs = __data['organs'] || [];

      if(iNet.isEmpty(__data.group)) {
        __organs = __organs.map(function (org) {
          return {
            organId: org.organId,
            organName: org.organName,
            group: org.group
          };
        });
        __params.organsStr = JSON.stringify(__organs);
      }
      $.postJSON(this.url.update, __params, function (result) {
        result = result || {};
        if (CommonService.isSuccess(result)) {
          this.grid.reload();
          this.notifySuccess('Quy trình', 'Quy trình đã được cập nhật');
        } else {
          this.notifyError('Quy trình', this.getMessageByResponse(result));
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.saving
      });
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'modal-confirm-delete-procedure-graph',
          title: 'Xóa quy trình ?',
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-primary',
            icon: 'icon-ok',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              var __grid = __scope.getGrid();
              $.postJSON(__scope.url.delete, {procedureId : __scope.getProcedureId() , uuid: __record.uuid}, function (result) {
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
    },
    /**
     * Sets the visibility of the Graph List
     * @param visible  - visible Whether the element is visible
     */
    setVisible: function(visible) {
      if(visible) {
        if(this.caseWidget) {
          this.caseWidget.hide();
        }
        this.$listContainer.show();
      } else {
        this.$listContainer.hide();
        if(this.caseWidget) {
          this.caseWidget.show();
        }
      }
    },
    createCaseWidget: function () {
      if (!this.caseWidget) {
        this.caseWidget = new iNet.ui.criteria.GraphCaseWidget();
        this.caseWidget.on('back', function () {
          this.setVisible(true);
        }.bind(this))
      }
      return this.caseWidget;
    },
    getMessageByResponse: function(response){
      response = response || {};
      if((response.errors || []).some(function (error) {
        return error.code==='existed';
      })) {
        return 'Hình thức tiếp nhận và cấp cơ quan (hoặc đơn vị) của quy trình đã tồn tại';
      }
      return 'Có lỗi xảy ra khi lưu dữ liệu';
    }
  });
});

