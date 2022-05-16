// #PACKAGE: criteria-procedure-draft-search-wg
// #MODULE: ProcedureDraftSearchWidget
$(function () {
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureDraftSearchWidget = function (config) {
    this.id = 'procedure-draft-search-widget';
    var __config = config || {};
    iNet.apply(this, __config);
    iNet.ui.criteria.ProcedureDraftSearchWidget.superclass.constructor.call(this);
    console.log('[ProcedureDraftSearchWidget]', this);
    var me = this;
    this.$form = $('#procedure-draft-search-info-frm');
    this.url = {
      list: iNet.getUrl('tthcc/proceduredraft/list'),
      sync: iNet.getUrl('tthcc/proceduredraft/reupdate'),
      del: iNet.getUrl('tthcc/proceduredraft/delete'),//procedure
      released: iNet.getUrl('tthcc/proceduredraft/released'),//procedures : 1;2;3
      regain: iNet.getUrl('tthcc/proceduredraft/regain')//procedures : 1;2;3
    };

    this.$toolbar = {
      CREATE: $('#procedure-draft-search-btn-create'),
      PUBLISH: $('#procedure-draft-search-btn-publish'),
      RELEASED: $('#procedure-draft-search-btn-released'),
      REGAIN: $('#procedure-draft-search-btn-regain')
    };

    this.$input = {
      industry: $('#procedure-draft-search-select-industry'),
      group: $('#procedure-draft-search-select-group'),
      keyword: $('#procedure-draft-search-txt-keyword'),
      expired: $('#procedure-draft-search-select-expires')
    };

    this.$searchIcon = this.$input.keyword.siblings('[data-action="submit"]');

    this.industrySelect = new iNet.ui.form.select.Select({
      id: this.$input.industry.prop('id'),
      formatNoMatches: 'Không tìm thấy dữ liệu',
      formatResult: function (item) {
        var __item = item || {};
        var __children = __item.children || [];
        var $option = $(__item.element);
        var __sign = $option.data('sign') || '__';
        if (__children.length > 0) {
          return String.format('<span class="badge badge-warning"><i class="icon-book"></i></span> [{0}] - {1}', __sign, __item.text)
        }
        return String.format('<span class="label label-info">[{0}]</span> {1}', __sign, __item.text);
      },
      formatSelection: function (item) {
        var __item = item || {};
        var $option = $(__item.element);
        var __sign = $option.data('sign') || '__';
        return String.format('<span class="label label-info" style="height: auto !important;">[{0}]</span> {1}', __sign, __item.text);
      },
      templateResult: function (data) {
        if (!data.element) {
          return data.text;
        }
        var $element = $(data.element);
        var $wrapper = $('<span></span>');
        $wrapper.addClass($element[0].className);
        $wrapper.text(data.text);
        return $wrapper;
      }
    });

    this.$form.on('change', 'select', function () {
      this.search();
    }.bind(this));


    this.$form.on('click', '[data-action="submit"]', function () {
      if ($(this).hasClass('icon-remove')) {
        me.$input.keyword.val('');
      }
      me.search();
    });

    this.$input.keyword.on('input', function () {
      var $el = $(this);
      if (iNet.isEmpty($el.val()) || $el.val() !== me.getGrid().getParams().keyword) {
        me.$searchIcon.removeClass('icon-remove').addClass('icon-search');
      } else {
        me.$searchIcon.removeClass('icon-search').addClass('icon-remove');
      }
    });

    this.$input.keyword.on('keydown', function (e) {
      var $input = $(this);
      var code = e.keyCode ? e.keyCode : e.which;
      if (code === 13) {
        me.search();
      } else if (code === 27) {
        $input.val(me.getGrid().getParams().keyword || '');
      }
    });

    this.resource = {
      procedure: iNet.resources.criteria.procedure,
      errors: iNet.resources.criteria.errors,
      constant: iNet.resources.criteria.constant,
      validate: iNet.resources.criteria.validate
    };

    var __actionButtons = [{
      text: iNet.resources.message.button.edit,
      icon: 'icon-pencil',
      fn: function (record) {
        me.fireEvent("edit", record);
      },
      visibled: function (record) {
        return !!record.edit;
      }
    }/*, {
      text: "Đồng bộ thông tin thủ tục",
      icon: 'icon-refresh',
      labelCls: 'label label-warning',
      fn: function (record) {
        me.syncInfo(record);
      },
      visibled: function (record) {
        return !iNet.isEmpty(record['materialUUID'])
      }
    }*/];
    if (!this.hasPattern()) {
      __actionButtons.push({
        text: iNet.resources.message.button.del,
        icon: 'icon-trash',
        labelCls: 'label label-important',
        fn: function (record) {
          record = record || {};
          var dialog = this.createConfirmDeleteDialog();
          dialog.setData({scope: this, record: record});
          dialog.setContent(String.format('Bạn có chắc chắn là đồng ý muốn xóa thủ tục <b>"{0}"</b> không ?', record.subject));
          dialog.show();
        }.bind(this),
        visibled: function (record) {
          return iNet.isEmpty(record.materialUUID) && record.edit
        }
      });
    }

    var dataSource = new iNet.ui.grid.DataSource({
      columns: [{
        type: 'selection',
        align: 'center',
        width: 30
      },
        {
          property: 'nationalProcedureID',
          label: this.resource.procedure.procedureId,
          sortable: true,
          type: 'label',
          width: 110
        },
        {
          property: 'subject',
          label: this.resource.procedure.subject,
          sortable: true,
          type: 'label'
        },
        {
          property: 'industry',
          label: this.resource.procedure.industry,
          sortable: true,
          type: 'label',
          width: 240
        },
        {
          property: 'materialUUID',
          label: this.resource.procedure.status,
          sortable: true,
          type: 'label',
          width: 120,
          renderer: function (v) {
            return iNet.isEmpty(v) ? me.resource.procedure.status2 : me.resource.procedure.status1;
          }
        }, {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: __actionButtons
        }
      ]
    });

    this.grid = new iNet.ui.grid.Grid({
      id: 'procedure-draft-search-grid',
      url: this.url.list,
      dataSource: dataSource,
      idProperty: 'uuid',
      remotePaging: true,
      hideSearch: true,
      allowDownload : true,
      convertData: function (data) {
        data = data || {};
        this.setTotal(data.total);
        return data.items;
      }
    });

    this.grid.on('click', function (record) {
      this.fireEvent("edit", record);
    }.bind(this));

    this.grid.on('loaded', function () {
      this.checkSearchIcon();
    }.bind(this));

    this.grid.on('selectionchange', function (sm, data) {
      var records = sm.getSelection();
      var isExist = records.length>0;
    }.bind(this));

    this.grid.on('download', function (params, control) {
      var loading = new iNet.ui.form.LoadingItem({
        maskBody: $('body'),
        msg: 'Đang xử lý...'
      });
      var __params = params || {};
      __params.pageSize = 0;
      __params.excelType = 'DSTTHC-TTKS';
      this.exportReport(__params, function (success) {
        loading.destroy();
      })
    }.bind(this));

    this.$toolbar.CREATE.click(function () {
      me.fireEvent('create', me.getIndustry());
    });

    /*
    this.$toolbar.PUBLISH.click(function () {
      me.fireEvent('allocate', me.getGrid().getSelectionModel().getSelection());
    });

     */

    //First load
    this.search();
  };

  iNet.extend(iNet.ui.criteria.ProcedureDraftSearchWidget, iNet.ui.criteria.BaseWidget, {
    reload: function(){
      this.grid.reload()
    },
    checkSearchIcon: function(){
      if (iNet.isEmpty(this.getGrid().getParams().keyword)) {
        this.$searchIcon.removeClass('icon-remove').addClass('icon-search');
      } else {
        this.$searchIcon.removeClass('icon-search').addClass('icon-remove');
      }
    },
    getGrid: function () {
      return this.grid;
    },
    createConfirmDeleteDialog: function () {
      if (!this._confirmDeleteDialog) {
        this._confirmDeleteDialog = new iNet.ui.dialog.ModalDialog({
          id: 'procedure-search-modal-confirm-delete',
          title: this.resource.constant.del_title,
          buttons: [{
            text: iNet.resources.message.button.ok,
            cls: 'btn-danger',
            icon: 'icon-ok icon-white',
            fn: function () {
              var __data = this.getData();
              var __record = __data.record || {};
              var __scope = __data.scope;
              if (!iNet.isEmpty(__record.uuid)) {
                this.hide();
                $.postJSON(__scope.url.del, {
                  procedure: __record.uuid
                }, function (result) {
                  if (result.type === "ERROR") {
                    __scope.showError('Thủ tục hành chính', 'Thủ tục đang sử dụng không thể xóa');
                  } else {
                    __scope.getGrid().load();
                  }
                }, {
                  mask: this.getMask(),
                  msg: iNet.resources.ajaxLoading.deleting
                });
              }
            }
          },
            {
              text: iNet.resources.message.button.cancel,
              icon: 'icon-remove',
              fn: function () {
                this.hide();
              }
            }
          ]
        });
      }
      return this._confirmDeleteDialog;
    },
    syncInfo: function (record) {
      record = record || {};
      $.postJSON(this.url.sync,  {draftID: record.uuid, syncIngredient: true}, function (result) {
        if (result.type !== 'ERROR') {
          this.notifySuccess("Đồng bộ", String.format('Thủ tục <b>"{0}"</b> đã được đồng bộ thông tin', record.subject || ''));
        } else {
          this.notifyError("Đồng bộ", String.format("Có lỗi xảy ra : {0}", result.errors[0].message));
        }
      }.bind(this), {
        mask: this.getMask(),
        msg: 'Đang đồng bộ dữ liệu...'
      })
    },
    getIndustry: function(){
      return this.industrySelect.getData() || {};
    },
    search: function () {
      var __params = {
        keyword: this.$input.keyword.val().trim() || '',
        group: this.$input.group.val(),
        expires: this.$input.expired.val(),
        industry: this.getIndustry().id || '',
        pageSize: 10,
        pageNumber: 0
      };
      this.grid.setPageIndex(0);
      this.grid.setParams(__params);
      this.grid.load();
    },
    exportReport: function (params, callback) {
      var that = this;
      $.postJSON(iNet.getPUrl('glbgate/excel/generator'), params, function (result) {
        if (result && result.uuid) {
          that._ensureReportGenerated(result.uuid, function (generated, error) {
            if (generated) {
              that.downloadReport(result.uuid);
              callback && callback(true)
            } else {
              callback && callback(false, error);
            }
          });
        } else {
          callback && callback(false, result);
        }
      });
    },
    _ensureReportGenerated: function (reportID, callback, count) {
      var that = this;
      this.checkReportStatus(reportID, function (generated) {
        if (generated) {
          callback(true);
        } else {
          count = count || 0;
          setTimeout(function () {
            count += 1;
            that._ensureReportGenerated(reportID, callback, count);
          }, 1500);
        }
      });
    },
    checkReportStatus: function (reportID, callback) {
      $.getJSON(iNet.getPUrl('report/file/chkstatus') + '?reportID=' + reportID, function (status) {
        callback(status === 2);
      });
    },
    downloadReport: function (reportID) {
      location.href = iNet.getPUrl('report/file/download') + '?reportID=' + reportID;
    }
  });
});
