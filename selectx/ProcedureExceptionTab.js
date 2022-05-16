/**
 * Copyright (c) 2019 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 17:00 01/11/2020
 *
 */
// #PACKAGE:  criteria-procedure-draft-detail-wg
// #MODULE: ProcedureExceptionTab
$(function () {
  /**
   * @class iNet.ui.criteria.ProcedureExceptionTab
   * @extends iNet.ui.criteria.ProcedureBaseTab
   */
  iNet.ns('iNet.ui.criteria');
  iNet.ui.criteria.ProcedureExceptionTab = function (options) {
    iNet.apply(this, options || {});
    this.id = this.id || 'exception-tab';
    iNet.ui.criteria.ProcedureExceptionTab.superclass.constructor.call(this);
    this.$container = $('#exception-receive-mode-container');
    this.$btnReload = $('#exception-tab-btn-reload');
    this.$btnSave = $('#exception-tab-btn-save');
    this.url = {
      load: iNet.getUrl('tthcc/proceduredraft/exdatas/fbyproid'),
      save: iNet.getUrl('tthcc/proceduredraft/exdatas/save')
    };
    var me = this;
    this.$container.on('click', 'input[type="checkbox"]', function () {
      var mode = this.value;
      var checked = $(this).prop('checked');
      var $container = me.getContainerByMode(mode);
      var $content = $container.find('[data-exception-container="form"]');
      if ($content.find('[data-exception-container="row"]').length < 1) {
        me.addRowTo($container, true);
      }
      if (checked) {
        $container.show();
      } else {
        $container.hide();
      }
    });

    this.$container.on('click', '[data-exception-action]', function () {
      var $el = $(this);
      var action = $el.attr('data-exception-action');
      //console.log('[ProcedureExceptionTab]--action--', action);
      switch (action) {
        case 'remove':
          me.removeRow($el.parents('[data-exception-container="row"]'));
          break;
        case 'add':
          me.addRowTo($el.parents('[data-content-mode]'), true);
          break;
      }
    });

    this.$btnReload.on('click', function () {
      me.loadById(me.getProcedureId());
    });

    this.$btnSave.on('click', function () {
      me.save();
    });
  };
  iNet.extend(iNet.ui.criteria.ProcedureExceptionTab, iNet.ui.criteria.ProcedureBaseTab, {
    load: function () {
      var __procedureId = this.getProcedureId();
      FormUtils.showButton(this.$btnReload, !iNet.isEmpty(__procedureId));
      FormUtils.showButton(this.$btnSave, !iNet.isEmpty(__procedureId));
      if (!iNet.isEmpty(__procedureId)) {
        this.loadById(__procedureId);
      } else {
        this.resetData();
      }
    },
    loadById: function (procedureId) {
      this.resetData();
      $.getJSON(this.url.load, {procedureId: procedureId}, function (result) {
        result = result || {};
        if (CommonService.isSuccess(result)) {
          this.setData(result);
        } else {
          this.notifyError('Cấu hình ngoại lệ', 'Có lỗi xảy ra khi tải dữ liệu');
        }
      }.bind(this), {mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading})
    },
    save: function () {
      if(this.checkValid()) {
        var __data = this.getData();
        //console.log('[ProcedureExceptionTab]--getData--', __data);
        $.postJSON(this.url.save, __data, function (result) {
          result = result || {};
          this.clearError();
          if (CommonService.isSuccess(result)) {
            this.notifySuccess('Cấu hình ngoại lệ', 'Cấu hình đã được lưu');
          } else {
            this.notifyError('Cấu hình ngoại lệ', 'Có lỗi xảy ra khi lưu dữ liệu');
          }
        }.bind(this), {mask: this.getMask(), msg: iNet.resources.ajaxLoading.saving});
      }
    },
    addRowTo: function ($container, allowRemove) {
      //console.log('--addRowTo--', $container.length, allowRemove);
      if (!$container || $container.length < 1) {
        return;
      }
      var $content = $container.find('[data-exception-container="form"]');
      var mode = $container.attr('data-content-mode');

      var $row = $(iNet.Template.parse('exception-item-tmpl', {}));
      if (!allowRemove) {
        $row.find('button[data-exception-action="remove"]').remove();
      } else {
        $row.find('button[data-exception-action="remove"]').removeAttr('disabled');
      }
      var $select = $row.find('select[data-exception-field="group"]');
      if (['help', 'azonal'].indexOf(mode) > -1) {
        $select.find('option[value="SONGANH"],option[value="NGANHDOC"]').remove();
      } else if (['direct', 'communication'].indexOf(mode) > -1) {
        $select.find('option[value="NGANHDOC"]').remove();
      }
      $select.on('change', function (e) {
        var $el = $(this);
        var $parent = $el.parents('[data-exception-container="row"]');
        var $container = $parent.find('[data-exception-container="organization"]');
        if (iNet.isEmpty($el.val())) {
          $container.find('input[data-exception-field="organIds"]').select2({
            placeholder: "Chọn cơ quan/đơn vị",
            formatNoMatches: 'Không tìm thấy dữ liệu',
            multiple: true,
            id: function (item) {
              return item.organId;
            },
            initSelection: function (element, callback) {
              var values = ($(element).val() || '').split(',');
              //console.log('[values]', values);
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
          });
          $container.show();
        } else {
          $container.hide();
        }
      });
      $row.find('.process-time-type-label').text(ProcedureCommonService.getUnitTimeByType((this.getProcedure() || {}).processTimeType));
      $content.append($row);
      return $row;
    },
    addRow: function (mode, data) {
      data = data || {};
      //console.log('--addRow--', mode, data);
      var hoursFilters = data['hoursFilters'] || [];
      var $container = this.getContainerByMode(mode);

      hoursFilters.forEach(function (item) {
        this._setDataToRow(item, this.addRowTo($container, true));
      }.bind(this));

      if (hoursFilters.length > 0) {
        this.getCheckboxByMode(mode).prop('checked', true);
        $container.show();
      } else {
        $container.hide();
      }
    },
    getCheckboxByMode: function (mode) {
      return this.$container.find(String.format('input[type="checkbox"][value="{0}"]', mode));
    },
    getContainerByMode: function (mode) {
      return this.$container.find(String.format('[data-content-mode="{0}"]', mode));
    },
    removeRow: function ($row) {
      if (!$row || $row.length < 1) {
        return;
      }
      $row.remove();
    },
    _setDataToRow: function (data, $row) {
      data = data || {};
      //console.log('--setDataToRow--', data, $row);
      var $fields = $row.find('[data-exception-field]');
      var $control,__fieldName;
      for (var i = 0; i < $fields.length; i++) {
        $control = $($fields.get(i));
        __fieldName = $control.attr('data-exception-field');
        $control.val(data[__fieldName]);
        if(__fieldName==='group') {
          $control.trigger('change');
        }
        if(!!$control.data('select2')) {
          $control.select2('val', data[__fieldName]);
        }
      }
    },
    _getRowData: function ($row, dom) {
      var $fields = $row.find('[data-exception-field]');
      var $control;
      var item = {}, __fieldName;
      for (var i = 0; i < $fields.length; i++) {
        $control = $($fields.get(i));
        __fieldName = $control.attr('data-exception-field');
        if($control.data('select2')) {
          item[__fieldName] = $control.data('select2').getVal();
        } else {
          item[__fieldName] = $control.val();
        }
        if (__fieldName == "organIds" && iNet.isEmpty(item[__fieldName])){
          item[__fieldName] = [];
        }
        if(iNet.isEmpty(item['group'])){
          delete item['group'];
        } else {
          delete item['organIds'];
        }
      }
      if(dom) {
        item['$row'] = $row;
      }
      return item;
    },
    _getFormData: function ($content, dom) {
      var $form = $content.find('[data-exception-container="form"]');
      var $rows = $form.find('[data-exception-container="row"]');
      var items = [];
      for (var i = 0; i < $rows.length; i++) {
        items.push(this._getRowData($($rows.get(i)), dom))
      }
      return items;
    },
    getSelectedModes: function () {
      var $controls = this.$container.find('input[type="checkbox"]:checked');
      var values = [];
      for (var i = 0; i < $controls.length; i++) {
        values.push($($controls.get(i)).val());
      }
      return values;
    },
    getData: function () {
      var $elements = this.$container.find('[data-content-mode]');
      var $form, exceptionData = {}, mode;
      var selectedModes = this.getSelectedModes();
      for (var i = 0; i < $elements.length; i++) {
        $form = $($elements.get(i));
        mode = $form.attr('data-content-mode');
        if (!iNet.isEmpty($form.attr('data-content-mode'))) {
          if (selectedModes.indexOf(mode) > -1) {
            exceptionData[mode] = {hoursFilters: this._getFormData($form)};
          } else {
            exceptionData[mode] = {hoursFilters: []};
          }
        }
      }
      return {
        exceptionMap: JSON.stringify(exceptionData),
        procedureId: this.getProcedureId()
      };
    },
    resetData: function () {
      this.$container.find('[data-content-mode]').hide();
      this.$container.find('input[type="checkbox"]:checked').prop('checked', false);
      this.$container.find('[data-exception-container="row"]').remove();
    },
    setData: function (data) {
      this.resetData();
      data = data || {};
      for (var key in data) {
        this.addRow(key, data[key]);
      }
    },
    clearError: function(){
      this.$container.find('[data-exception-container="row"].error').removeClass('error');
    },
    validateForm: function($form){
      var values = this._getFormData($form, true);
      var uniqueItems = [], organIds = [];
      var duplicateItems = values.filter(function (value) {
        if(uniqueItems.find(function (item) {
          if(iNet.isEmpty(item.group)) {
            return (item.operator === value.operator)
              && ((item.organIds || []).some(function (orgId) {
                return (value.organIds || []).indexOf(orgId) > -1
            }));
          }
          return (item.group === value.group) && (item.operator === value.operator);
        })) {
          return true;
        }
        uniqueItems.push(value);
        return false;
      });
      duplicateItems.forEach(function (item, index) {
        item.$row.addClass('error');
        if(index===0) {
          this.notifyError('Cấu hình ngoại lệ', 'Cấp cơ quan hoặc đơn vị và toán tử đã bị trùng.<br>Vui lòng kiểm tra lại cấu hình.');
        }
      }.bind(this));
      return duplicateItems.length===0;
    },
    checkValid: function () {
      var selectedModes = this.getSelectedModes();
      var valid = true;
      selectedModes.forEach(function (mode) {
        valid = this.validateForm(this.getContainerByMode(mode)) && valid;
      }.bind(this));
      return valid;
    }
  });
});
