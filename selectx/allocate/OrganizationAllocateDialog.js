/**
 * Copyright (c) 2020 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 15:07 10/12/2020
 *
 */
// #PACKAGE: criteria-allocation-procedure-wg
// #MODULE: OrganizationAllocateDialog
$(function () {
  iNet.ns('iNet.ui.criteria', 'iNet.ui.criteria.allocate');
  iNet.ui.criteria.allocate.OrganizationAllocateDialog = function (config) {
    config = config || {};
    iNet.apply(this, config);
    this.id = 'organization-allocate-procedure-dialog';

    iNet.ui.criteria.allocate.OrganizationAllocateDialog.superclass.constructor.call(this);
    //console.log('[OrganizationAllocateDialog]', this);

    this.$btnOk = $('#organization-allocate-procedure-dialog-btn-ok');
    this.$btnClose = $('#organization-allocate-procedure-dialog-btn-close');
    this.originalAllocateButtonHtml = this.$btnOk.html();
    this.selectedStore = new Hashtable();
    var me = this;
    this.url = {
      allocate: iNet.getUrl('tthcc/proceduredrafts/allocate'),
      search: iNet.getUrl('tthcc/proceduredrafts/funallocatedorg')
    };

    var SearchComponent = function () {
      this.id = 'organization-allocate-procedure-dialog-search-container';
      SearchComponent.superclass.constructor.call(this);
      //console.log('[SearchComponent]', this);
      this.intComponent();
    };
    iNet.extend(SearchComponent, iNet.Component, {
      intComponent: function () {
        this.$keyword = $.getCmp('organization-allocate-procedure-dialog-txt-keyword');
        this.$group = $.getCmp('organization-allocate-procedure-dialog-select-group');
        this.$searchBtn = $.getCmp('organization-allocate-procedure-dialog-btn-search');
        this.$selectAllBtn = $.getCmp('organization-allocate-procedure-dialog-btn-select-all');

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

        this.$keyword.on('keydown', function (e) {
          var code = (e.keyCode ? e.keyCode : e.which);
          if (code === 13) { //Enter keycode
            this.search(true);
            return false;
          }
        }.createDelegate(this));

        this.$group.on('change', function () {
          this.search(false);
        }.bind(this));

        this.$searchBtn.on('click', function () {
          if (this.$keyword.prop('disable')) {
            return;
          }
          this.search(true);
        }.bind(this));

        this.$selectAllBtn.on('click', function () {
          this.fireEvent('select_all_unit',  this.$selectAllBtn);
        }.bind(this));
      },
      enableForGroups: function(groups){
        groups  = groups || [];
        this.groups = groups;
        var $options = this.$group.find('option[value!=""]');
        //console.log(groups, $options);
        $options.each(function (i, element) {
          $(element).prop('disabled', groups.indexOf($(element).attr('value'))<0)
        })
      },
      getGroups: function(){
        return this.groups;
      },
      getGroupStr: function(){
        return this.$group.val() || this.getGroups().join(';');
      },
      setDisabled: function (v) {
        this.$keyword.prop('disabled', v);
        this.$group.prop('disabled', v);
      },
      disable: function () {
        this.setDisabled(true);
      },
      enable: function () {
        this.setDisabled(false);
      },
      search: function (toggleSearch) {
        if(toggleSearch) {
          if (this.$searchBtn.hasClass('icon-remove')) {
            this.$keyword.val('');
          }
        }
        var __params = this.getData();
        this.fireEvent('search', __params);

        if (!iNet.isEmpty(__params.key)) {
          this.$searchBtn.removeClass('icon-search').addClass('icon-remove');
        } else {
          this.$searchBtn.removeClass('icon-remove').addClass('icon-search');
        }
        this.$keyword.data('keyword', __params.key);
      },
      getData: function () {
        return {
          key: this.$keyword.val(),
          groups: this.getGroupStr(),
          pageSize: 10,
          pageNumber: 0
        };
      },
      clear: function () {
        this.$group.val('');
        this.$keyword.data('keyword', '').val('');
        this.$searchBtn.removeClass('icon-remove').addClass('icon-search');
      }
    });

    this.searchComponent = new SearchComponent();

    this.searchComponent.on('select_all_unit', function ($button) {
      $button.prop('disable', true);
      this.selectAll(function () {
        $button.removeAttr('disable');
      }.bind(this))
    }.bind(this));

    this.searchComponent.on('search', function (data) {
      me.gridSearch.setParams(iNet.apply(me.getSearchParams(), data));
      me.gridSearch.load();
    });

    this.gridSearch = new iNet.ui.grid.Grid({
      id: 'organization-allocate-procedure-dialog-search-grid',
      url: this.url.search,
      params: {
        pageSize: 10,
        pageNumber: 0
      },
      dataSource: new DataSource({
        columns: [{
          type: 'selection',
          align: 'center',
          width: 30,
          selectableOverride: function (rowIndex, dataContext) {
            return !iNet.isEmpty(dataContext.group);
          }
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
        }]
      }),
      idProperty: this.getIdProperty(),
      remotePaging: true,
      firstLoad: false,
      hideSearch: true,
      allowClickSelection: false,
      pageSize: 10,
      convertData: function (result) {
        result = result || {};
        this.setTotal(result.total);
        return result.items || [];
      }
    });

    this.gridAllocate = new iNet.ui.grid.Grid({
      id: 'organization-allocate-procedure-dialog-selected-grid',
      dataSource: new DataSource({
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
        }, {
          label: '',
          type: 'action',
          separate: '&nbsp;',
          align: 'center',
          buttons: [{
            text: iNet.resources.message.button.del,
            icon: 'icon-trash',
            labelCls: 'label label-important',
            fn: function (record) {
              this.gridSearch.unselectById(record[this.gridSearch.getIdProperty()]);
              this.updateSelectedItems([record], false);
              this.gridAllocate.remove(record[this.gridAllocate.getIdProperty()]);
            }.bind(this)
          }]
        }]
      }),
      idProperty: this.getIdProperty(),
      remotePaging: false,
      firstLoad: false,
      hideHeader: true,
      allowClickSelection: false,
      pageSize: 9999
    });

    this.getEl().find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var tabId = $(e.target).attr("href").replace('#', '');// activated tab
      this.searchComponent.setDisabled((tabId !== 'org-search-tab'));
    }.bind(this));

    this.$btnOk.on('click', function (e) {
      this.submit();
    }.createDelegate(this));

    this.$btnClose.on('click', function () {
      this.hide();
    }.createDelegate(this));

    this.gridSearch.getEl().on('change', 'input[type=checkbox]', function () {
      var checked = $(this).prop('checked');
      var data = $(this).parents('tr').data();
      //checks if is single select/unselect or select/unselect all
      var items = !iNet.isEmpty(data.id) ? [me.gridSearch.getById(data.id)] : me.gridSearch.getStore().values();

      //unselect if group is empty
      me.gridSearch.unselectById(items.filter(function (item) {
        item = item || {};
        return iNet.isEmpty(item.group);
      }).map(function (item) {
        return item[me.getIdProperty()];
      }));

      items = items.filter(function (item) {
        return !iNet.isEmpty(item.group);
      });

      me.updateSelectedItems(items, checked);
    });

    this.gridSearch.on('loaded', function () {
      me.gridSearch.selectById(me.getSelectedIds());
      //overwrite behaviour
      me.gridSearch.getEl().find('td[data-action=select]').off('click').on('click', function (e) {
        var tagName = e.target.tagName.toLowerCase();
        if (tagName === 'td') {
          $(this).find('input[type=checkbox]').prop('checked', !$(this).find('input[type=checkbox]').prop('checked')).trigger('change');
        }
      });
    });

  };

  iNet.extend(iNet.ui.criteria.allocate.OrganizationAllocateDialog, iNet.ui.criteria.BaseDialog, {
    setOwnerGrid: function(grid) {
      this.ownerGrid = grid;
    },
    getOwnerGrid: function() {
      return this.ownerGrid;
    },
    getIdProperty: function(){
      return 'firmID';
    },
    getOrgNameProperty: function(){
      return 'firmName';
    },
    setProcedureId: function(procedureId) {
      this.procedureId = procedureId;
    },
    getProcedureId: function(){
      return this.procedureId;
    },
    setParams: function(params){
      this.params = params;
    },
    getParams: function(){
      return this.params || {};
    },
    enableForGroups: function(groups){
      this.searchComponent.enableForGroups(groups);
    },
    getSearchParams: function(){
      return iNet.apply(iNet.clone(this.getParams()),{
        pageSize: 10,
        pageNumber: 0
      });
    },
    load: function () {
      this.gridSearch.setPageIndex(0);
      this.searchComponent.clear();
      this.selectedStore.clear();
      this.searchComponent.search();
      this._renderAllocateGrid();
      this._renderTitleButton();
      this.firstTab();
    },
    firstTab: function () {
      this.getEl().find('.nav-tabs').find('a[data-toggle="tab"]:first').trigger('click');
    },
    submit: function () {
      this.getEl().find('.nav-tabs').find('a[data-toggle="tab"]:eq(1)').trigger('click');
      var selectedOrgs = this.selectedStore.values().map(function (item) {
        return {organId: item[this.getIdProperty()], group: item.group || ''
        };
      }.bind(this));
      var __params = {
        receiveMode: this.getParams()['receiveMode'],
        procedureId: this.getProcedureId(),
        organizations: JSON.stringify(selectedOrgs)
      };
      //console.log('[submit]', __params);
      $.postJSON(this.url.allocate, __params, function (result) {
        var __result = result || {};
        var __errors = __result.errors || [];
        if (__errors.length>0) {
          this.showMessage('error', 'Cấp phát', 'Có lỗi xảy ra khi cấp phát thủ tục');
        } else {
          this.hide();
          this.fireEvent('allocated', selectedOrgs, __result);
          this.showMessage('success', 'Cấp phát', 'Thủ tục đã được cấp phát thành công');
        }
      }.bind(this), {mask: this.getEl(), msg: 'Đang cấp phát thủ tục...'})
    },
    _renderTitleButton: function () {
      if (this.selectedStore.size() > 0) {
        this.$btnOk.html(String.format(this.originalAllocateButtonHtml + '({0})', this.selectedStore.size())).removeAttr('disabled');
      } else {
        this.$btnOk.html(this.originalAllocateButtonHtml).prop('disabled', true);
      }
    },
    _renderAllocateGrid: function () {
      this.gridAllocate.loadData(iNet.clone(this.selectedStore.values()));
      this.getEl().find('[data-select-count]').text(this.selectedStore.size());
      var $tab = this.getEl().find('.nav-tabs').find('li[role="presentation"]:eq(1)');
      if (this.selectedStore.size() === 0) {
        this.firstTab();
        $tab.hide();
      } else if ($tab.is(':hidden')) {
        $tab.show();
      }
    },
    updateSelectedItems: function (items, checked) {
      items = items || [];
      items.forEach(function (item) {
        if (checked) {
          if (!this.selectedStore.containsKey(item[this.getIdProperty()])) {
            this.selectedStore.put(item[this.getIdProperty()], item);
          }
        } else {
          this.selectedStore.remove(item[this.getIdProperty()]);
        }
      }.bind(this));
      this._renderTitleButton();
      this._renderAllocateGrid();
    },
    getSelectedIds: function () {
      return this.selectedStore.values().map(function (item) {
        return item[this.getIdProperty()];
      }.bind(this))
    },
    selectAll: function (callback) {
      var __params = iNet.clone(this.gridSearch.getParams());
      __params.pageNumber= 0;
      __params.pageSize= -1;
      $.postJSON(this.url.search, __params, function (result) {
        result = result || {};
        this.gridSearch.getSelectionModel().checkAll();
        this.updateSelectedItems((result.items || []), true);
        this.getEl().find('.nav-tabs').find('a[data-toggle="tab"]:eq(1)').trigger('click');
      }.bind(this),{mask: this.getEl(), msg: 'Đang kiểm tra dữ liệu...'}).always(function () {
        if(typeof callback==='function') {
          callback()
        }
      })
    }
  });
});
