/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 10:37 27/07/2019
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureResultDocumentTab
$(function () {
    /**
     * @class iNet.ui.criteria.ProcedureResultDocumentTab
     * @extends iNet.ui.criteria.ProcedureBaseTab
     */
    iNet.ns('iNet.ui.criteria');
    iNet.ui.criteria.ProcedureResultDocumentTab = function (options) {
        iNet.apply(this, options || {});
        this.id = this.id || 'doc-result-tab';
        iNet.ui.criteria.ProcedureResultDocumentTab.superclass.constructor.call(this);
        console.log('[ProcedureResultDocumentTab]', this);
        this.$btnAdd = $('#doc-result-btn-add');

        this.url = {
            list: iNet.getUrl('glbgate/docresult/list'),
            create: iNet.getUrl('glbgate/docresult/add'),
            update: iNet.getUrl('glbgate/docresult/update'),
            delete: iNet.getUrl('glbgate/docresult/remove')
        };

        var dataSource = new iNet.ui.grid.DataSource({
            columns: [{
                label: '#',
                type: 'rownumber',
                align: 'center',
                width: 50
            }, {
                property: 'docCode',
                label: 'Mã kết quả',
                sortable: true,
                type: 'text',
                width: 200
            }, {
                property: 'docName',
                label: 'Tên kết quả',
                sortable: true,
                type: 'text'
            }, {
                label: '',
                type: 'action',
                separate: '&nbsp;',
                align: 'center',
                buttons: [
                    {
                        text: iNet.resources.message.button.edit,
                        icon: 'icon-pencil',
                        labelCls: 'label label-info',
                        fn: function (record) {
                            this.grid.edit(record[this.grid.getIdProperty()])
                        }.bind(this)
                    },
                    {
                        text: iNet.resources.message.button.del,
                        icon: 'icon-trash',
                        labelCls: 'label label-important',
                        fn: function (record) {
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
            id: 'doc-result-grid',
            url: this.url.list,
            dataSource: dataSource,
            remotePaging: false,
            firstLoad: false,
            idProperty: 'uuid',
            convertData: function (data) {
                return data.items;
            },
            hideHeader: true,
            pageSize: 9999,
            autoHideWhenOutside: false
        });

        this.grid.on('save', function (data) {
            this.save(data);
        }.createDelegate(this));

        this.grid.on('update', function (newData, oldData) {
            var __data = iNet.apply(oldData, newData);
            this.save(__data);
        }.createDelegate(this));

        this.grid.on('loaded', function () {
            this.grid.cancel();
        }.bind(this));

        this.$btnAdd.on('click', function (e) {
            this.grid.newRecord();
        }.bind(this));

    };
    iNet.extend(iNet.ui.criteria.ProcedureResultDocumentTab, iNet.ui.criteria.ProcedureBaseTab, {
        setProcedure: function (v) {
            this.procedure = v;
        },
        getProcedure: function () {
            return this.procedure || {};
        },
        getGrid: function () {
            return this.grid;
        },
        load: function () {
            var __nationalProcedureID = this.getProcedure()['nationalProcedureID'] || '';
            FormUtils.showButton(this.$btnAdd, !iNet.isEmpty(__nationalProcedureID));
            this.getGrid().setParams({
                nationalProcedureID: __nationalProcedureID
            });
            this.getGrid().load()
        },
        save: function (data) {
            var __nationalProcedureID = this.getProcedure()['nationalProcedureID'] || '';
            var __data = iNet.apply(data || {}, {
                nationalProcedureID: __nationalProcedureID
            })
            $.postJSON(iNet.isEmpty(__data.uuid) ? this.url.create : this.url.update, __data, function (result) {
                var __result = result || {};
                if (CommonService.isSuccess(__result)) {
                    this.notifySuccess('Kết quả', 'Lưu thanh công');
                    this.load();
                } else {
                    this.notifyError('Kết quả', String.format('Có lỗi xảy ra khi lưu dữ liệu <b>{0}</b>', __result['errors'][0].message));
                }
            }.bind(this), {
                mask: this.getMask(),
                msg: iNet.resources.ajaxLoading.saving
            });
        },
        createConfirmDeleteDialog: function () {
            if (!this._confirmDeleteDialog) {
                this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
                    id: 'modal-confirm-delete-procedure-result-document',
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
                            $.postJSON(__scope.url.delete, {
                                uuid: __record.uuid
                            }, function (result) {
                                this.hide();
                                if (CommonService.isSuccess(result)) {
                                    __grid.remove(__record.uuid);
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

