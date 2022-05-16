/**
 * Copyright (c) 2016 by Vy Nguyen (ntvy@inetcloud.vn)
 *
 * Created by ntvy on 09:26 05/05/2016
 *
 */
// #PACKAGE: idesk-paperwork-ed-lookup
// #MODULE: LookupWidget
/**
 * @class iNet.ui.idesk.ed.LookupWidget
 * @extends iNet.ui.idesk.PaperworkWidget
 */
$(function () {
  iNet.paperwork.ed.LookupWidget = function (config) {
    iNet.apply(this, config || {});
    this.id = this.id || 'lookup-widget';
    iNet.paperwork.ed.LookupWidget.superclass.constructor.call(this);
    var self = this;
    this.$treeWidgetBox = $('#lookup-tree-widget-box');
    this.$treeContainer = $('#tree-container');
    this.$treeContent = $('#tree-content');
    this.$tree = $('#lookup-tree');
    this.$gridContainer = $('#grid-container');
    this.$gridContent = $('#grid-content');
    this.$type = $('#lookup-type-menu');
    this.$lblType = $('#lookup-lbl-type');
    this.$lblDateStr = $('#lookup-lbl-date');
    this.$lookupGrid = $('#lookup-grid');
    this.doctype = 'in';
    this._initTree();

    this.unitTree = new iNet.paperwork.ed.lookup.UnitTree({
      id: 'lookup-select-unit',
      singleSelect: true
    });

    this.unitTree.setHeight(300);

    this.unitTree.on("change", function (node, select) {
      if (!!select) {
        node = node || {};
        self.search((node.group === "ALL") ? '': (node.type === 'unit' ? node.unitCode : node.id));
      }
    });

    this.$tree.on('click', 'a', function () {
      self.disableUpdateCategory = true;
      var $el = $($(this).parent().parent());
      if ($el.hasClass('tree-year-item')) {
        var data = $el.data('data');
        changeSelectTree(data.firstDay, data.lastDay, true);
      }
      else {
        if ($el.hasClass('has-children')) {
          $el.find('.thumb').trigger('click');
        }
        var isFolder = $el.hasClass('tree-folder-item');
        var isCategory = $el.hasClass('tree-category-item');
        if(isFolder) {
          self.disableUpdateCategory = false;
        }
        if (isFolder || isCategory) {
          if (isCategory && $el.hasClass('selected')) {
            return;
          }
          var $selected = self.getNodeTreeSelected();
          $selected.removeClass('selected');
          $el.addClass('selected');
          self.search();
        }
      }
    });

    var changeSelectTree = function (fromDate, toDate, isSearch) {
      var $elFolder = self.$tree.find('li.tree-folder-item.options');
      if (!$elFolder.hasClass('selected')) {
        $elFolder.addClass('selected');
        $elFolder.find('.selected').removeClass('selected');
        self.getNodeTreeSelected().not('.options').removeClass('selected');
      }
      var $el = $(self.getNodeTreeSelected());
      var textOption = 'Tất cả';
      if (fromDate && toDate) {
        textOption = fromDate + ' - ' + toDate;
      } else if (!fromDate && toDate) {
        textOption = 'Đến ngày ' + toDate;
      } else if (!toDate && fromDate) {
        textOption = 'Từ ngày ' + fromDate;
      }

      $el.find('[text-option]').text(textOption);
      $el.data('data', {
        firstDay: fromDate,
        lastDay: toDate
      });
      if (isSearch) {
        self.search();
      }
    };

    this.$type.on('click', 'li:not(.selected)', function () {
      var $el = $(this);
      self.$type.find('li.selected').removeClass('selected');
      $el.addClass('selected');
      self._initTree(function () {
        var quickSearch = self.grid.getQuickSearch();
        self.grid.setParams(quickSearch.getData());
        self.search();
      });
    });

    //================SIMPLE SEARCH ====================
    iNet.ui.idesk.ed.LookupBasicSearch = function () {
      this.id = 'lookup-basic-search';
      this.url = iNet.getUrl("document/edocs/qlookup");
      iNet.ui.idesk.ed.LookupBasicSearch.superclass.constructor.call(this);
    };
    iNet.extend(iNet.ui.idesk.ed.LookupBasicSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent: function () {
        this.$keyword = $('#lookup-basic-search-txt-keyword');
        this.$docFromDate = $('#lookup-basic-search-txt-from-date');
        this.$docToDate = $('#lookup-basic-search-txt-to-date');
        this.$btnRemoveFDate = $('#lookup-basic-search-btn-remove-from-date');
        this.$btnRemoveTDate = $('#lookup-basic-search-btn-remove-to-date');
        this.$selectDateRange = $('#lookup-basic-select-date-range');

        var __systemConfig = iNet.systemConfig || {};
        var __monthLimit = __systemConfig['default_month_limit_lookup'];
        if(!iNet.isEmpty(__monthLimit)) {
          this.$selectDateRange.append(String.format('<option value="{0}" selected>{0} tháng</option>', __monthLimit));
        }

        this.getEl().on('click', '[data-action="remove"]',  function () {
          $(this).siblings('input.date-picker').val('').focus()
        });

        var that = this;

        this.$selectDateRange.on('change', function () {
          var ranger = window.ConfigUtils.getDateRangeByKey(this.value);
          that.setDocDateFrom(ranger.fromDate.format('d/m/Y'));
          that.setDocDateTo(ranger.toDate.format('d/m/Y'));
        });

        this.$btnRemoveFDate.on('click', function () {
          that.$docFromDate.val('');
          changeSelectTree('', that.$docToDate.val(), true);
        });

        this.$btnRemoveTDate.on('click', function () {
          that.$docToDate.val('');
          changeSelectTree(that.$docFromDate.val(), '', true);
        });

        // DATE PICKER
        var docDateFrom = this.$docFromDate.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          changeSelectTree(ev.date.format('d/m/Y'), that.$docToDate.val(), true);
          docDateFrom.hide();
        }).data('datepicker');

        var toDate = this.$docToDate.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          changeSelectTree(that.$docFromDate.val(), ev.date.format('d/m/Y'), true);
          toDate.hide();
        }).data('datepicker');

        this.$docFromDate.on('change', function () {
          changeSelectTree($(this).val(), that.$docToDate.val());
        });

        this.$docToDate.on('change', function () {
          changeSelectTree(that.$docFromDate.val(), $(this).val());
        });

        this.$docFromDate.next().on('click', function () {
          $(this).prev().focus();
        });

        this.$docToDate.next().on('click', function () {
          $(this).prev().focus();
        });
      },
      showRemoveButton: function() {
        FormUtils.showButton(this.$btnRemoveFDate, !!this.$docFromDate.val());
        FormUtils.showButton(this.$btnRemoveTDate, !!this.$docToDate.val());
      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      setType: function (v) {
        this.type = v;
      },
      getType: function () {
        return this.type;
      },
      setSphere: function (v) {
        this.sphere = v;
      },
      getSphere: function () {
        return this.sphere;
      },
      setCategory: function (v) {
        this.category = v;
      },
      getCategory: function () {
        return this.category;
      },
      setDocDateFrom: function (v) {
        this.$docFromDate.val(v || '');
        if(this.$docFromDate.data('datepicker')) {
          this.$docFromDate.data('datepicker').update();
        }
      },
      getDocDateFrom: function () {
        return EDCommonService.convertDateToString(this.$docFromDate.val());
      },
      setDocDateTo: function (v) {
        this.$docToDate.val(v || '');
        if(this.$docToDate.data('datepicker')) {
          this.$docToDate.data('datepicker').update();
        }
      },
      getDocDateTo: function () {
        return EDCommonService.convertDateToString(this.$docToDate.val());
      },
      getData: function () {
        var __data = {
          pageSize: iNet.pageSize,
          pageNumber: 0,
          exeacode: SecurityUtils.getUserCode(),
          key: this.$keyword.val().trim(),
          docDateFrom: this.getDocDateFrom(),
          docDateTo: this.getDocDateTo(),
          type: this.getType(),
          category: this.getCategory(),
          sphere: this.getSphere() || ''
        };
        return iNet.apply(__data, self.getOrderByField());
      }
    });
    //================ADVANCE SEARCH====================
    iNet.ui.idesk.ed.LookupAdvanceSearch = function () {
      this.id = 'lookup-advance-search';
      this.url = iNet.getUrl("document/edocs/alookup");
      iNet.ui.idesk.ed.LookupAdvanceSearch.superclass.constructor.call(this);
      this.on('expand', function () {
        this.initComponent();
      }.createDelegate(this));
      this.composedUnitHash = new Hashtable();
      this.composedUnitCount = {};
    };
    iNet.extend(iNet.ui.idesk.ed.LookupAdvanceSearch, iNet.ui.grid.AbstractSearchForm, {
      intComponent: function () {
        this.getEl().on('click', '[data-action="remove"]',  function () {
          $(this).siblings('input.date-picker').val('').focus()
        });
        this.$subject = $('#lookup-advance-search-txt-subject');
        this.$signNumber = $('#lookup-advance-search-txt-sign-number');
        this.$docFromDate = $('#lookup-advance-search-txt-doc-from-date');
        this.$docToDate = $('#lookup-advance-search-txt-doc-to-date');
        this.$author = $('#lookup-advance-search-txt-author');
        this.$signer = $('#lookup-advance-search-txt-signer');
        this.$numberFrom = $('#lookup-advance-search-txt-number-from');
        this.$numberTo = $('#lookup-advance-search-txt-number-to');
        this.$composer = $('#lookup-advance-search-txt-composer');
        this.$composedUnit = $('#lookup-advance-search-txt-composed-unit');
        this.$steeringType = $('#lookup-advance-search-select-steering-type');
        this.$retrieveEd = $('#lookup-advance-search-chk-retrieve');
        this.$publisherUnit = $('#lookup-advance-search-txt-publisher-unit');
        this.$bizDocType = $('#lookup-advance-search-select-biz-doc-type');
        this.$category = $('#lookup-advance-search-txt-category');
        this.$book = $('#lookup-advance-search-txt-book');
        this.$bookDateFrom = $('#lookup-advance-search-txt-book-from-date');
        this.$bookDateTo = $('#lookup-advance-search-txt-book-to-date');
        this.$processStatus = $('#lookup-advance-search-select-process-status');

        this.$selectPriority = $('#lookup-advance-search-select-priority');
        this.$selectSecurity = $('#lookup-advance-search-select-security');

        this.$lblNumberFrom = this.getEl().find('[for="lookup-advance-search-txt-number-from"]');
        this.$lblBook = this.getEl().find('[for="lookup-advance-search-txt-book"]');

        this.$inDocContent = this.getEl().find('[in-doc-content]');
        this.$inOutDocContent = this.getEl().find('[in-out-doc-content]');
        this.$inOutInterDocContent = this.getEl().find('[in-out-inter-doc-content]');
        this.$outDraftContent = this.getEl().find('[out-draft-content]');
        this.$outDocContent = this.getEl().find('[out-doc-content]');
        this.$draftDocContent = this.getEl().find('[draft-doc-content]');

        this.$outComm = $('#lookup-advance-search-out-chk-communication');
        this.$inComm = $('#lookup-advance-search-in-chk-communication');
        this.$inPaper = $('#lookup-advance-search-chk-paper');

        this.$draftFinalHandle = $('#lookup-advance-search-draft-txt-final-handler');
        this.$inFinalHandle = $('#lookup-advance-search-in-txt-final-handler');
        this.$finalCheck = $('#lookup-advance-search-txt-final-check');

        this.$finalInContainer = this.getEl().find('[final-in-container]');
        this.$finalOutContainer = this.getEl().find('[final-out-container]');

        this.dataBook = new Hashtable();
        this.dataDicts = {};

        var that = this;

        this.$numberFrom.on('input', function () {
          if (iNet.isEmpty(this.$numberTo.val()) || Number(this.$numberFrom.val()) > Number(this.$numberTo.val())) {
            this.$numberTo.val(this.$numberFrom.val());
          }
        }.createDelegate(this));

        this.getEl().find('input.mask-interger').numeric({
          decimal: false,
          negative: false
        });

        this.selectReciever = new iNet.ui.form.SelectUserPopover({
          id: 'lookup-advance-search-select-receiver',
          placeholder: 'Chọn người xử lý',
          placement: 'top',
          singleSelect:true
        });

        // DATE PICKER
        var docFromDate = this.$docFromDate.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          changeSelectTree(ev.date.format('d/m/Y'), that.$docToDate.val(), true);
          docFromDate.hide();
        }).data('datepicker');

        var docToDate = this.$docToDate.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          changeSelectTree(that.$docFromDate.val(), ev.date.format('d/m/Y'), true);
          docToDate.hide();
        }).data('datepicker');

        var bookFromDate = this.$bookDateFrom.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          bookFromDate.hide();
        }).data('datepicker');

        var bookToDate = this.$bookDateTo.datepicker({
          format: 'dd/mm/yyyy'
        }).on('changeDate', function (ev) {
          bookToDate.hide();
        }).data('datepicker');

        this.$docFromDate.on('change', function () {
          changeSelectTree($(this).val(), that.$docToDate.val());
        });

        this.$docToDate.on('change', function () {
          changeSelectTree(that.$docFromDate.val(), $(this).val());
        });

        this.$bookDateFrom.next().on('click', function () {
          $(this).prev().focus();
        });

        this.$bookDateTo.next().on('click', function () {
          $(this).prev().focus();
        });

        this.$docFromDate.next().on('click', function () {
          $(this).prev().focus();
        });

        this.$docToDate.next().on('click', function () {
          $(this).prev().focus();
        });
      },
      getUrl: function () {
        return this.url;
      },
      getId: function () {
        return this.id;
      },
      setType: function (v) {
        this.type = v;
        this.initComponent();
      },
      getType: function () {
        return this.type || 'in';
      },
      setSphere: function (v) {
        this.sphere = v;
      },
      getSphere: function () {
        return this.sphere;
      },
      setCategory: function (v) {
        this.category = v;
        if (this.categorySelect) {
          if (iNet.isEmpty(v)) {
            this.categorySelect.clear();
          }
          else {
            this.categorySelect.setValue(v);
          }
        }
      },
      getCategory: function () {
        return this.category;
      },
      setBook: function (v) {
        if (this.bookSelect) {
          if (iNet.isEmpty(v)) {
            this.bookSelect.clear();
          }
          else {
            this.bookSelect.setValue(v);
          }
        }
      },
      setBookDateFrom: function(v) {
        this.$bookDateFrom.val(v || '');
      },
      getBookDateFrom: function() {
        return EDCommonService.convertDateToString(this.$bookDateFrom.val());
      },
      setBookDateTo: function(v) {
        this.$bookDateTo.val(v || '');
      },
      getBookDateTo: function() {
        return EDCommonService.convertDateToString(this.$bookDateTo.val());
      },
      setDocDateFrom: function (v) {
        this.$docFromDate.val(v || '');
      },
      getDocDateFrom: function () {
        return EDCommonService.convertDateToString(this.$docFromDate.val());
      },
      setDocDateTo: function (v) {
        this.$docToDate.val(v || '');
      },
      getDocDateTo: function () {
        return EDCommonService.convertDateToString(this.$docToDate.val());
      },
      isFinalCheckApprove: function(){
        return EDCommonService.isFinalCheckApprove();
      },
      checkRole: function() {
        var __type = this.getType();
        this._createCategorySelect();
        if(__type==='draft' && this.isFinalCheckApprove()) {
          this.$draftDocContent.show()
        } else {
          this.$draftDocContent.hide();
        }
        switch (__type) {
          case 'in':
            this.loadInDict();
            this.loadBookSelect();
            this.$lblNumberFrom.text('Số đến từ:');
            this.$lblBook.text('Sổ VB đến');
            this.$outDraftContent.hide();
            this.$inDocContent.show();
            this.$inOutDocContent.show();
            this.$inOutInterDocContent.show();
            this.$outDocContent.hide();
            if(this.isFinalCheckApprove()) {
              this.$finalInContainer.show();
            } else {
              this.$finalInContainer.hide();
            }
            break;
          case 'out':
            this.loadOutDict();
            this.loadBookSelect();
            this.loadComposedUnit();
            this.$lblNumberFrom.text('Số đi từ:');
            this.$lblBook.text('Sổ VB đi');
            this.$outDraftContent.show();
            this.$inDocContent.hide();
            this.$inOutDocContent.show();
            this.$inOutInterDocContent.show();
            this.$outDocContent.show();
            if(this.isFinalCheckApprove()) {
              this.$finalOutContainer.show();
            }  else {
              this.$finalOutContainer.hide();
            }
            break;
          case 'draft':
            this.loadOutDict();
            this.loadComposedUnit();
            this.$lblNumberFrom.text('Số từ:');
            this.$outDraftContent.show();
            this.$inDocContent.hide();
            this.$inOutDocContent.hide();
            this.$inOutInterDocContent.hide();
            this.$outDocContent.hide();
            break;
          case 'inter':
            this.loadBookSelect();
            this.$lblNumberFrom.text('Số từ:');
            this.$lblBook.text('Sổ VB nội bộ');
            this.$outDraftContent.hide();
            this.$inDocContent.hide();
            this.$inOutDocContent.hide();
            this.$inOutInterDocContent.show();
            this.$outDocContent.hide();
            break;
        }
      },
      initComponent: function () {
        var that = this;
        if (!iNet.isEmpty(this.dataDicts)) {
          this.checkRole();
          return;
        }
        EDCommonService.loadDicts("ed_out_doc_category;ed_in_doc_category;ed_in_field;ed_in_publish_parent_unit;ed_out_signer;ed_out_field", function (data) {
          that.dataDicts = data || {};
          that.checkRole();
        },{
          mask: this.id,
          msg: iNet.resources.ajaxLoading.loading
        });
      },
      _createFieldSelect: function (fields) {
        fields = fields || [];
        this.inFieldSelect = new iNet.ui.form.select.Select({
          id: 'lookup-advance-search-txt-field',
          placeholder: iNet.resources.idesk.paperwork.ed.select_field,
          allowClear: true,
          query: function (query) {
            var __data = {
              results: []
            };
            for (var i = 0; i < fields.length; i++) {
              var __item = fields[i] || {};
              if (query.term.length == 0 || __item.value.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ||
                __item.description.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
                __data.results.push(__item);
              }
            }
            query.callback(__data);
          },
          idValue: function (item) {
            return item.description;
          },
          initSelection: function (element, callback) {
          },
          formatResult: function (item) {
            return String.format('{0}', item.description);
          },
          formatSelection: function (item) {
            return String.format('{0}', item.description);
          }
        });
      },
      _createOutFieldSelect: function (fields) {
        fields = fields || [];
        this.outFieldSelect = new iNet.ui.form.select.Select({
          id: 'lookup-advance-search-select-out-field',
          placeholder: iNet.resources.idesk.paperwork.ed.select_field,
          allowClear: true,
          query: function (query) {
            var __data = {
              results: []
            };
            for (var i = 0; i < fields.length; i++) {
              var __item = fields[i] || {};
              if (query.term.length == 0 || __item.value.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ||
                __item.description.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
                __data.results.push(__item);
              }
            }
            query.callback(__data);
          },
          idValue: function (item) {
            return item.description;
          },
          initSelection: function (element, callback) {
          },
          formatResult: function (item) {
            return String.format('{0}', item.description);
          },
          formatSelection: function (item) {
            return String.format('{0}', item.description);
          }
        });
      },
      _createCategorySelect: function() {
        var __dataDicts = this.dataDicts || {};
        var __dataInCategories = __dataDicts.ed_in_doc_category || [];
        var __dataOutCategories = __dataDicts.ed_out_doc_category || [];
        var __datas = this.getType() === 'in' ? __dataInCategories : __dataOutCategories;
        this.categorySelect = new iNet.ui.form.select.Select({
          id: this.$category.prop('id'),
          placeholder: iNet.resources.idesk.paperwork.ed.select_category,
          allowClear: true,
          query: function (query) {
            var __data = {
              results: []
            };
            for (var i = 0; i < __datas.length; i++) {
              var __item = __datas[i] || {};
              if (query.term.length == 0 || __item.value.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ||
                __item.description.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
                __data.results.push(__item);
              }
            }
            query.callback(__data);
          },
          idValue: function (item) {
            return item.description;
          },
          initSelection: function(element, callback) {
            var __value = element.val() || '';
            var __data = {};
            if (!iNet.isEmpty(__value)) {
              for (var i = 0; i < __datas.length; i++) {
                if (__datas[i].description == __value) {
                  __data = __datas[i];
                  break;
                }
              }
            }
            callback(__data);
          },
          formatResult: function (item) {
            return String.format('{0}', item.description);
          },
          formatSelection: function (item) {
            return String.format('{0}', item.description);
          }
        });
      },
      _createBookSelect: function(books) {
        books = books || [];
        var me= this;
        this.bookSelect = new iNet.ui.form.select.Select({
          id: this.$book.prop('id'),
          placeholder: iNet.resources.idesk.paperwork.ed.select_category,
          allowClear: true,
          query: function(query) {
            var __data = {
              results: []
            };
            for (var i = 0; i < books.length; i++) {
              var __item = books[i] || {};
              if (query.term.length == 0 || __item.code.toUpperCase().indexOf(query.term.toUpperCase()) >= 0 ||
                __item.name.toUpperCase().indexOf(query.term.toUpperCase()) >= 0) {
                __data.results.push(__item);
              }
            }
            query.callback(__data);
          },
          idValue: function(item) {
            return item.code;
          },
          initSelection: function (element, callback) {
            var __value = me.getGrid().getParams()['book'] || '';
            var __data = {};
            if (!iNet.isEmpty(__value)) {
              for (var i = 0; i < books.length; i++) {
                var __item = books[i] || {};
                if (__item.code === __value) {
                  __data = __item;
                  break;
                }
              }
            }
            callback(__data);
          },
          formatResult: function(item) {
            return String.format('<strong style="color: #c09853; text-align: right; padding-right: 5px">{0}</strong> {1}', item.code, item.name);
          },
          formatSelection: function(item) {
            return String.format('{0}', item.name);
          }
        });
        //this.bookSelect.clear();
      },
      loadBookSelect: function() {
        var __type = this.getType();
        var that = this;
        if (!!this.dataBook.containsKey(__type)) {
          this._createBookSelect(this.dataBook.get(__type));
        }
        EDCommonService.loadBook(__type, function(books) {
          that.dataBook.put(__type, books);
          that._createBookSelect(books);
        });
      },
      loadInDict: function () {
        if (!this.inDictLoaded) {
          var __dataDicts = this.dataDicts || {};
          this._createFieldSelect(__dataDicts.ed_in_field);
          new iNet.ui.form.AutoComplete({
            id: this.$publisherUnit.prop('id'),
            source: EDCommonService.convertToSource(__dataDicts.ed_in_publish_parent_unit || [], 'description')
          });
        }
        if(this.getType()==='in' && this.isFinalCheckApprove()) {
          this.inFinalHandleAutoComplete = new iNet.ui.form.AutoComplete({
            id: this.$inFinalHandle.prop('id'),
            source: []
          });
          this.queryNode();
        }
        this.inDictLoaded = true;
      },
      loadOutDict: function () {
        if (!this.outDictLoaded) {
          var __dataDicts = this.dataDicts || {};
          this._createOutFieldSelect(__dataDicts.ed_out_field);
          this.signerAutoComplete = new iNet.ui.form.AutoComplete({
            id: this.$signer.prop('id'),
            source: EDCommonService.convertToSource(__dataDicts.ed_out_signer || [], 'description')
          });
        }
        if(this.isFinalCheckApprove()) {
          if(this.getType()==='draft') {
            this.draftFinalHandleAutoComplete = new iNet.ui.form.AutoComplete({
              id: this.$draftFinalHandle.prop('id'),
              source: []
            });
          } else if(this.getType()==='out') {
            this.finalCheckAutoComplete = new iNet.ui.form.AutoComplete({
              id: this.$finalCheck.prop('id'),
              source: []
            });
          }
        }
        this.queryNode();

        this.outDictLoaded = true;
      },
      loadComposedUnit: function () {
        if (!!this.unitLoaded) {
          return;
        }
        this.$composedUnit.select2({
          placeholder: iNet.resources.idesk.paperwork.ed.choose_unit_composer,
          allowClear: true,
          query: function (query) {
            this.queryNode(query, 'composedUnit');
          }.createDelegate(this),
          formatResult: function (result) {
            result = result || {};
            if (result.parent > 0) {
              var __parent = this.composedUnitHash.get(result.parent.toString()) || {};
              if (!iNet.isEmpty(__parent.name) && this.composedUnitCount[(result.name || '').toLowerCase()] > 1) {
                return String.format('{0}&nbsp;<i class="icon-caret-right"></i>&nbsp;{1}', result.name, __parent.name);
              }
            }
            return result.name;
          }.createDelegate(this),
          formatSelection: function (result) {
            return result.name;
          },
          formatSearching: function () {
            return String.format('<i class="icon-refresh icon-spin"></i> {0}', iNet.resources.ajaxLoading.loading);
          },
          escapeMarkup: function (m) {
            return m;
          }
        });
        this.$composer.select2({
          placeholder:iNet.resources.idesk.paperwork.ed['choose_composer'],
          allowClear: true,
          query: function (query) {
            this.queryNode(query, 'composer');
          }.createDelegate(this),
          formatResult: function (result) {
            return result.name;
          },
          formatSelection: function (result) {
            return result.name;
          },
          formatSearching: function () {
            return String.format('<i class="icon-refresh icon-spin"></i> {0}', iNet.resources.ajaxLoading.loading);
          },
          escapeMarkup: function (m) {
            return m;
          }
        });
        this.unitLoaded = true;
      },
      getAliasByParentId: function (parentId, keep) {
        var __users = (this.composedUnitData || []).concat(this.composerData || []);
        if (!this._composers || !keep) {
          this._composers = [];
        }
        for (var i = 0; i < __users.length; i++) {
          var __item = __users[i] || {};
          if (__item.parent == parentId) {
            if (__item.type == 'dept') {
              this.getAliasByParentId(__item.uuid, true);
            } else if (__item.type == 'alias') {
              this._composers.push(__item);
            }
          }
        }
        return this._composers;
      },
      findUserByQuery: function (query) {
        query = query || {};
        var __units = [];
        var __term = query.term || '';
        var __composedUnit = this.$composedUnit.select2('data') || {};
        var __items = (!iNet.isEmpty(__composedUnit.uuid) && __composedUnit.uuid > 0) ? this.getAliasByParentId(__composedUnit.uuid) : (this.composerData || []);
        var __tmpNames = [];
        var __names = [];
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i] || {};
          __names.push((__item.text || '').toLowerCase());
          if (__tmpNames.indexOf(__item.text) < 0 && ((__item.text || '').toLowerCase().indexOf(__term.toLowerCase()) >= 0)
            && (__item.type === 'alias')) {
            __tmpNames.push(__item.text);
            __units.push(__item);
          }
        }
        if (!iNet.isEmpty(__term) && (__names.indexOf(__term.toLowerCase()) < 1) && (__term.length < 128)) {
          __units.push({
            uuid: iNet.generateId(),
            id: iNet.generateId(),
            name: __term,
            text: __term,
            parent: 0,
            type: 'custom_alias'
          });
        }
        query.callback({
          results: __units
        });
      },
      findUnitByQuery: function (query) {
        query = query || {};
        var __units = [];
        var __term = query.term || '';
        var __items = this.composedUnitData || [];
        var __names = [];
        for (var i = 0; i < __items.length; i++) {
          var __item = __items[i] || {};
          __names.push((__item.text || '').toLowerCase());
          if (((__item.text || '').toLowerCase().indexOf(__term.toLowerCase()) >= 0)) {
            __units.push(__item);
          }
        }
        if (!iNet.isEmpty(__term) && (__names.indexOf(__term.toLowerCase()) < 1) && (__term.length < 128)) {
          __units.push({
            uuid: iNet.generateId(),
            id: iNet.generateId(),
            name: __term,
            text: __term,
            parent: 0,
            type: 'custom_unit'
          });
        }
        query.callback({
          results: __units
        });
      },
      queryNode: function (query, type) {
        type = type || 'composedUnit';
        var self = this;
        if (!self.nodeLoaded) { //first load
          $.postJSON(iNet.getUrl('comm/nodes/fall'), {
            treeType: 'alias'
          }, function (result) {
            result = result || {};
            var __items = result.elements || [];
            self.composedUnitData = [];
            self.composerData = [];
            var __unit, __groupTmp = [];
            var __signers = [];
            for (var i = 0; i < __items.length; i++) {
              var __item = __items[i] || {};
              var __name = (__item.type === 'alias') ? __item.refFullname : __item.name;
              if (__item.type === 'group') {
                __groupTmp.push(__item.id);//push vao list nay de khong lay node trong group
              }
              if ((__item.type === 'unit' || __item.type === 'dept') && ((__item.config & 1) == 0) && (__item.leaf === "N") && __groupTmp.indexOf(__item.parent) < 0) {
                __unit = {
                  uuid: __item.id,
                  id: (__item.type === 'unit') ? __item.refCode : __item.id, //su dung de focus
                  name: __name,
                  text: __name,
                  parent: __item.parent,
                  type: __item.type,
                  refCode: __item.refCode
                };
                self.composedUnitCount[__name.toLowerCase()] = (self.composedUnitCount[__name.toLowerCase()] || 0) + 1;
                self.composedUnitData.push(__unit);
                self.composedUnitHash.put(__item.id.toString(), __unit);
              }
              if (__item.type === 'alias') {
                self.composerData.push({
                  id: __item.refCode,
                  name: __name,
                  text: __name,
                  parent: __item.parent,
                  type: __item.type,
                  refCode: __item.refCode,
                  composerAname: __item.name
                });
                if(__signers.indexOf(__name)<0) {
                  __signers.push(__name);
                }
              }
            }
            self.signers = __signers;
            if(self.signerAutoComplete) {
              self.signerAutoComplete.setSource(__signers);
            }
            if(self.draftFinalHandleAutoComplete) {
              self.draftFinalHandleAutoComplete.setSource(__signers);
            }
            if(self.finalCheckAutoComplete) {
              self.finalCheckAutoComplete.setSource(__signers);
            }
            if(self.inFinalHandleAutoComplete) {
              self.inFinalHandleAutoComplete.setSource(__signers);
            }
            self.nodeLoaded = true;
            if(query) {
              if (type === 'composedUnit') {
                self.findUnitByQuery(query);
              } else {
                self.findUserByQuery(query);
              }
            }
          });
        } else {
          var __signers = self.signers || [];
          if(self.signerAutoComplete) {
            self.signerAutoComplete.setSource(__signers);
          }
          if(self.draftFinalHandleAutoComplete) {
            self.draftFinalHandleAutoComplete.setSource(__signers);
          }
          if(self.finalCheckAutoComplete) {
            self.finalCheckAutoComplete.setSource(__signers);
          }
          if(self.inFinalHandleAutoComplete) {
            self.inFinalHandleAutoComplete.setSource(__signers);
          }
          if(query) {
            if (type === 'composedUnit') {
              self.findUnitByQuery(query);
            } else {
              self.findUserByQuery(query);
            }
          }
        }
      },
      getData: function () {
        var __data = {
          pageSize: iNet.pageSize,
          pageNumber: 0,
          exeacode: SecurityUtils.getUserCode(),
          subject: this.$subject.val().trim(),
          signNumber: this.$signNumber.val().trim(),
          type: this.getType(),
          docDateFrom: this.getDocDateFrom(),
          docDateTo: this.getDocDateTo(),
          author: this.$author.val().trim(),
          bizDocType: this.$bizDocType.val(),
          sphere: this.getSphere() || '',
          steeringType: this.$steeringType.val(),
          category: this.categorySelect ? this.categorySelect.getValue() : ''
        };
        if (this.$outDraftContent.is(':visible')) {
          __data.signer = this.$signer.val().trim();
          var __composedUnit = this.$composedUnit.select2('data') || {};
          if (!iNet.isEmpty(__composedUnit.uuid)) {
            __data.composedUnit = __composedUnit.name || '';
            if (__composedUnit.type === 'dept') { //dept
              __data.composedUnitId = __composedUnit.uuid;
            } else if (__composedUnit.type === 'unit') { //unit
              __data.composedUnitId = __composedUnit.refCode || '';
            }
          }

          var __composer = this.$composer.select2('data') || {};
          __data.composer = __composer.name || '';
        }
        if (this.$inDocContent.is(':visible')) {
          __data.bookDateFrom = this.getBookDateFrom();
          __data.bookDateTo = this.getBookDateTo();
          __data.field = this.inFieldSelect ? this.inFieldSelect.getValue() : '';
          __data.publisherManagingUnit = this.$publisherUnit.val().trim();
          __data.retrieved = !!this.$retrieveEd.prop('checked');
          if(this.$inComm.prop('checked') === this.$inPaper.prop('checked')) {
            //__data.communication = ''; //remove
          } else {
            __data.communication  = this.$inComm.prop('checked') && !this.$inPaper.prop('checked');
          }
        }

        if (this.$inOutDocContent.is(':visible')) {
          __data.processStatus = this.$processStatus.val();
          if (this.selectReciever) {
            var __recievers = this.selectReciever.getData() || [];
            var __reciever = __recievers[0] || {};
            __data.receiverAcode = __reciever.acode || '';
          }
          __data.priority = this.$selectPriority.val();
          __data.security = this.$selectSecurity.val()
        }
        if (this.$inOutInterDocContent.is(':visible')) {
          __data.book = this.bookSelect ? this.bookSelect.getValue() : '';
          __data.serialNumberFrom = this.$numberFrom.val().trim();
          __data.serialNumberTo = this.$numberTo.val().trim();
        }
        if(this.$outDocContent.is(':visible')) {
          __data.field = this.outFieldSelect ? this.outFieldSelect.getValue() : '';
          __data.communication = this.$outComm.prop('checked');
        }

        if (this.$draftFinalHandle.is(':visible')) {
          __data.finalHandlerName = this.$draftFinalHandle.val().trim();
        }
        if(this.$finalCheck.is(':visible')) {
          __data.finalCheckName =  this.$finalCheck.val().trim()
        }
        if (this.$inFinalHandle.is(':visible')) {
          __data.finalHandlerName = this.$inFinalHandle.val().trim();
        }
        return iNet.apply(__data, self.getOrderByField());
      }
    });

    var __columns = [{
      property: 'serialNumber',
      label: 'Số đến',
      sortable: false,
      width: 75
    },{
      property: 'bookDateStr',
      renderer: function (v) {
        return EDCommonService.convertStringToDate(v);
      },
      label: this.getText("date_to"),
      sortable: false,
      width: 75
    }, {
      property: 'signNumber',
      label: self.getText("sign_number"),
      sortable: false,
      width: 120
    }, {
      property: 'docDate',
      renderer: function (v) {
        return EDCommonService.convertStringToDate(v);
      },
      label: self.getText("doc_date"),
      sortable: false,
      width: 110
    }, {
      property: 'subject',
      label: self.getText("subject"),
      sortable: false
    }, {
      property: 'author',
      label: self.getText("author"),
      sortable: false,
      width: 150
    }];
    if(EDCommonService.isSingleSelectProcessor() && EDCommonService.isFinalCheckApprove()) {
      __columns.push({
        property: 'finalHandlerName',
        label: 'Người đang giữ',
        sortable: false,
        width: 150
      });
    }
    __columns.push({
      label: '',
      type: 'action',
      separate: '&nbsp;',
      align: 'center',
      buttons: [{
        labelCls: '',
        text: 'Xem',
        icon: 'icon-paper-clip',
        visibled: function (record) {
          record = record || {};
          return (record.attachment === "Y");
        },
        fn: this.openFile.createDelegate(this)
      }]
    });

    var dataSource = new DataSource({
      columns: __columns
    });

    this.grid = new iNet.ui.grid.Grid({
      id: this.$lookupGrid.prop('id'),
      url: iNet.getUrl("document/edocs/qlookup"),
      params: {
        pageSize: iNet.pageSize,
        pageNumber: 0,
        exeacode: SecurityUtils.getUserCode()
      },
      dataSource: dataSource,
      idProperty: 'id',
      basicSearch: iNet.ui.idesk.ed.LookupBasicSearch,
      advanceSearch: iNet.ui.idesk.ed.LookupAdvanceSearch,
      autoHideAdv: true,
      firstLoad: false,
      remotePaging: true,
      allowDownload: true,
      displayMsg: '<b>{0}</b> - <b>{1}</b> / <b>{2}</b>',
      convertData: function (data) {
        data = data || {};
        self.getGrid().setTotal(data.total);
        return data.items || [];
      }
    });

    this.grid.on('click', function (record) {
      record = record || {};
      this.fireEvent('opendoc', record.id);
    }.createDelegate(this));

    this.grid.on('download', function (data) {
      self.download(self.getGrid().getParams());
    });

    this.grid.$thead.on('click', 'th[data-property]', function () {
      var $this = $(this);
      var __property = $this.data('property');
      if (!!__property) {
        var clsChevronUp = 'icon-chevron-up';
        var clsChevronDown = 'icon-chevron-down';
        if ($this.hasClass('sort')) {
          var $i = $this.find('i');
          if ($i.hasClass(clsChevronUp)) {
            $i.removeClass(clsChevronUp).addClass(clsChevronDown);
          }
          else {
            $i.removeClass(clsChevronDown).addClass(clsChevronUp);
          }
        }
        else {
          var __text = $(this).text();
          var $tr = $this.parent();
          $tr.find('i').remove();
          $tr.find('th').removeClass('sort');
          $this.addClass('sort');
          $this.html(String.format('{0} <i class="{1}"></i>', __text, clsChevronUp));
        }
        var __param = self.grid.getParams();
        self.grid.setParams(iNet.apply(__param, self.getOrderByField()));
        self.grid.reload();
      }
    });

    this.grid.on('loaded', function () {
      if(!!this.disableUpdateCategory) {
        this.disableUpdateCategory = false;
        return;
      }
      this.updateCategory();
    }.createDelegate(this));

    $(window).resize(function () {
      this.resize();
    }.createDelegate(this));

    this.$type.find('li:first').trigger('click');
    this.resize();
  };
  iNet.extend(iNet.paperwork.ed.LookupWidget, iNet.ui.idesk.PaperworkWidget, {
    updateCategory: function () {
      if(!!this.disableUpdateCategory) {
        return;
      }
      var $selected = this.getNodeTreeSelected();
      if ($selected.length > 0) {
        var isFolder = $selected.hasClass('tree-folder-item');
        var isCategory = $selected.hasClass('tree-category-item');
        var $el;
        if (isFolder) {
          $el = $selected;
          this.$tree.find('li.tree-folder-item').find('ol').remove();
          this.$tree.bonsai('update');
        } else if (isCategory) {
          $el = $selected.parents('.tree-folder-item'); //store to expand when category loaded
        }
        if ($el.length > 0) {
          this.disableUpdateCategory = true;
          this.loadCategoryToNode(function () {
            this.$tree.data('bonsai').expand($el);
            setTimeout(function () {
              this.disableUpdateCategory = false;
            }.bind(this), 250);
          }.createDelegate(this));
        }
      }
    },
    getText: function (v) {
      if (!iNet.isEmpty(v)) {
        return iNet.resources.idesk.paperwork.ed[v];
      }
      return '';
    },
    getGrid: function () {
      return this.grid;
    },
    resize: function () {
      var h = this.getWindow().height();
      var th = h - 395;
      this.$treeContainer.height(th);
      this.$treeContent.height(th);
      var gh = h - 90;
      this.$gridContainer.height(gh);
      this.$gridContent.height(gh);
      this.fireEvent('resize', {height: this.getEl().height(), width: this.getEl().width()}, this);
      setTimeout(function () {
        var $gridMain = $('#lookup-grid-table-main');
        $gridMain.parent().height(h - 136);
        $gridMain.parent().css('overflow', 'hidden scroll');
        $('#lookup-grid-grid-header').find('th').css('background-color', 'rgb(241, 241, 241)')
      }, 500);
    },
    getWindow: function () {
      return $(window);
    },
    getStartUp: function () {
      var systemConfig = iNet.systemConfig || {};
      var startupDate = systemConfig.system_startup_date || '';
      var __data = {};
      if (!iNet.isEmpty(startupDate)) {
        startupDate = startupDate.toDate();
        if (iNet.isDate(startupDate)) {
          __data.month = startupDate.getMonth() + 1;
          __data.year = startupDate.getFullYear();
        }
      }
      return __data;
    },
    _initTree: function (fn) {
      fn = fn || iNet.emptyFn;
      var date = new Date();
      var year = date.getFullYear();

      var __startup = this.getStartUp();
      var minYear = __startup.year || year;
      var beginMonth = __startup.month || 1;

      var month = 12;
      var $newItem;
      this.$tree.empty();

      for (var i = minYear; i <= year; i++) {
        var isCurrent = (i == year);
        var $li = $(String.format('<li class="tree-year-item {0}"><div class="item"><a href="javascript:;"><i class="icon-calendar"></i> Năm {1}</a></div><ol></ol></li>', isCurrent ? 'expanded' : 'collapsed', i));
        $li.data('data', {
          firstDay: new Date(i, 0, 1).format('d/m/Y'),
          lastDay: isCurrent ? new Date().format('d/m/Y') : new Date(i, 11, 31).format('d/m/Y')
        });
        var $ol = $li.find('ol:first');
        if (isCurrent) {
          month = date.getMonth() + 1;
        } else {
          month = 12;
        }
        var j = 0;
        if (minYear == i) {
          j = beginMonth - 1;
        }

        for (j; j < month; j++) {
          $newItem = $(String.format('<li class="tree-folder-item"><div class="item"><a href="javascript:;"><span class="folder"></span> Tháng {0}</a></div></li>', j + 1));
          $newItem.data('data', {
            year: i,
            month: j + 1,
            firstDay: new Date(i, j, 1).format('d/m/Y'),
            lastDay: new Date(i, j + 1, 0).format('d/m/Y')
          });
          $ol.prepend($newItem);
        }
        this.$tree.prepend($li);
      }

      //add latest month
      var __systemConfig = iNet.systemConfig || {};
      var __monthLimit = __systemConfig['default_month_limit_lookup'];
      if (!iNet.isEmpty(__monthLimit) && __monthLimit > 0) {
        var lastDate = new Date();
        var fristDateStr = new Date(new Date().setMonth(lastDate.getMonth() - Number(__monthLimit))).format('d/m/Y');
        $newItem = $(String.format('<li class="tree-folder-item selected options"><div class="item"><a href="javascript:;"><i class="icon-calendar"></i>&nbsp;<span text-option>{0} - {1}</span></a></div></li>', fristDateStr, lastDate.format('d/m/Y')));
        $newItem.data('data', {
          firstDay: fristDateStr,
          lastDay: lastDate.format('d/m/Y')
        });
        this.$tree.prepend($newItem);
      }

      if ($.fn.bonsai) {
        if (this.$tree.data().bonsai) {
          this.$tree.bonsai('update');
        } else {
          this.$tree.bonsai();
        }
      }
      fn();
    },
    buildDataSourceByType: function (type) {
      if (this.doctype === type) {
        return;
      }
      var __columns = [];
      var __actionColumn = {
        label: '',
        type: 'action',
        separate: '&nbsp;',
        align: 'center',
        buttons: [{
          labelCls: '',
          text: 'Xem',
          icon: 'icon-paper-clip',
          visibled: function (record) {
            record = record || {};
            return (record.attachment == "Y");
          },
          fn: this.openFile.createDelegate(this)
        }]
      };
      switch (type) {
        case 'in':
          __columns = [{
            property: 'serialNumber',
            label: 'Số đến',
            sortable: false,
            width: 75
          },{
            property: 'bookDateStr',
            renderer: function (v) {
              return EDCommonService.convertStringToDate(v);
            },
            label: this.getText("date_to"),
            sortable: false,
            width: 75
          }, {
            property: 'signNumber',
            label: this.getText("sign_number"),
            sortable: false,
            width: 120
          }, {
            property: 'docDate',
            renderer: function (v) {
              return EDCommonService.convertStringToDate(v);
            },
            label: this.getText("doc_date"),
            sortable: false,
            width: 110
          }, {
            property: 'subject',
            label: this.getText("subject"),
            sortable: false
          }, {
            property: 'author',
            label: this.getText("author"),
            sortable: false,
            width: 150
          }];
          if(EDCommonService.isSingleSelectProcessor() && EDCommonService.isFinalCheckApprove()) {
            __columns.push({
              property: 'finalHandlerName',
              label: 'Người đang giữ',
              sortable: false,
              width: 150
            });
          }
          break;
        case 'out':
          __columns = [{
            property: 'serialNumber',
            label: 'Số đi',
            sortable: false,
            width: 50
          }, {
            property: 'signNumber',
            label: this.getText("sign_number"),
            sortable: false,
            width: 120
          }, {
            property: 'docDate',
            renderer: function (v) {
              return EDCommonService.convertStringToDate(v);
            },
            label: this.getText("doc_date"),
            sortable: false,
            width: 110
          }, {
            property: 'subject',
            label: this.getText("subject"),
            sortable: false
          }, {
            property: 'composer',
            label: this.getText("composer"),
            sortable: false,
            width: 120
          }, {
            property: 'signer',
            label: this.getText("signer"),
            sortable: false,
            width: 100
          }, {
            property: 'receiver',
            label: 'Nơi nhận VB',
            sortable: false,
            width: 120,
            type: 'receiver'
          }];
          if(EDCommonService.isSingleSelectProcessor() && EDCommonService.isFinalCheckApprove()) {
            __columns.push({
              property: 'finalCheckName',
              label: 'Người kiểm tra',
              sortable: false,
              width: 150
            });
          }
          break;
        case 'draft':
          __columns = [{
            property: 'docDate',
            renderer: function (v) {
              return EDCommonService.convertStringToDate(v);
            },
            label: this.getText("doc_date"),
            sortable: false,
            width: 110
          }, {
            property: 'subject',
            label: this.getText("subject"),
            sortable: false
          }, {
            property: 'composer',
            label: 'Người soạn thảo',
            sortable: false,
            width: 150
          }];
          /*,{
            property: 'composedUnit',
            label: 'Đơn vị soạn thảo',
            sortable: false,
            width: 150
          }*/
          if(EDCommonService.isSingleSelectProcessor() && EDCommonService.isFinalCheckApprove()) {
            __columns.push({
              property: 'finalHandlerName',
              label: 'Người đang giữ',
              sortable: false,
              width: 150
            });
          }
          break;
        case 'inter':
          __columns = [{
            property: 'serialNumber',
            label: 'Số VB',
            sortable: false,
            width: 75
          }, {
            property: 'signNumber',
            label: this.getText("sign_number"),
            sortable: false,
            width: 120
          }, {
            property: 'docDate',
            renderer: function (v) {
              return EDCommonService.convertStringToDate(v);
            },
            label: this.getText("doc_date"),
            sortable: false,
            width: 110
          }, {
            property: 'subject',
            label: this.getText("subject"),
            sortable: false
          }, {
            property: 'composer',
            label: 'Người soạn thảo',
            sortable: false,
            width: 150
          }];
          break;
      }
      __columns.push(__actionColumn);
      var __dataSource = new DataSource({
        columns: __columns
      });
      this.getGrid().setDataSource(__dataSource);
      this.doctype = type;
    },
    getNodeTreeSelected: function () {
      return this.$tree.find('li.selected');
    },
    getDataNodeTree: function () {
      var $nodeTreeSelected = this.getNodeTreeSelected();
      var $type = this.$type.find('li.selected');
      var data = iNet.clone($nodeTreeSelected.data('data') || {});
      return iNet.apply(data, {
        docType: {
          value: $type.data('value') || 'in',
          text: $type.find('span').text()
        }
      });
    },
    search: function (sphere) {
      var __data = this.getDataNodeTree();
      var __docType = __data.docType || {};
      var __category = __data.category || {};
      this.buildDataSourceByType(__docType.value);
      //update description
      var __categoryText = (__category.key || 'Tất cả loại VB trong').capitalize();
      this.$lblDateStr.text((__data.month > 0) ? String.format('{0} tháng {1}/{2}', __categoryText, __data.month, __data.year) : 'Tất cả');
      this.$lblType.text(__docType.text);
      this.$treeWidgetBox.find('.widget-title').find('span:first').text(__docType.text);

      //update criteria for search
      var grid = this.getGrid();
      var __newParams = iNet.clone(grid.getParams());
      var __sphere = ((sphere===null || sphere===undefined) ? __newParams['sphere'] : sphere) || '';
      var __categoryCode = __category.key || '';

      var quickSearch = grid.getQuickSearch();
      if(quickSearch) {
        quickSearch.setType(__docType.value);
        quickSearch.setCategory(__categoryCode);
        quickSearch.setSphere(__sphere);
        quickSearch.setDocDateFrom(__data.firstDay);
        quickSearch.setDocDateTo(__data.lastDay);
        quickSearch.showRemoveButton();
      }

      var advanceSearch = grid.getAdvanceSearch();
      if(advanceSearch) {
        advanceSearch.setType(__docType.value);
        advanceSearch.setCategory(__categoryCode);
        advanceSearch.setSphere(__sphere);
        advanceSearch.setDocDateFrom(__data.firstDay);
        advanceSearch.setDocDateTo(__data.lastDay);
        advanceSearch.setBook(__newParams.book);
      }
      __newParams = iNet.apply(__newParams, {
        pageNumber: 0,
        type: __docType.value,
        category: __categoryCode,
        sphere: __sphere,
        docDateFrom: quickSearch ? quickSearch.getDocDateFrom() : '',
        docDateTo: quickSearch ? quickSearch.getDocDateTo() : ''
      });
      grid.setPageIndex(__newParams.pageNumber);
      grid.setParams(__newParams);
      grid.load();
    },
    isAdvSearchActive: function () {
      var grid = this.getGrid();
      return grid ? grid.getUrl().indexOf('document/edocs/alookup')>-1 : false;
    },
    loadCategoryToNode: function (callback) {
      var that = this;
      var __categorySelected = {};
      var $nodeTreeSelected = this.getNodeTreeSelected();
      if($nodeTreeSelected.hasClass('tree-category-item')) { //is select category
        __categorySelected = $nodeTreeSelected.data('data') || {};
        $nodeTreeSelected = $nodeTreeSelected.parents('.tree-folder-item');
      }
      var $ol = $nodeTreeSelected.find('ol:first');
      var __url = this.isAdvSearchActive() ? iNet.getUrl('document/edocs/alookupgbcategory') : iNet.getUrl('document/edocs/qlookupgbcategory');
      var __dataNode = this.getDataNodeTree();
      var __gridParams = iNet.clone(this.getGrid().getParams());
      var __newParams = iNet.apply(__gridParams, {
        docDateFrom: EDCommonService.convertDateToString(__dataNode.firstDay),
        docDateTo: EDCommonService.convertDateToString(__dataNode.lastDay),
        type: (__dataNode.docType || {}).value
      });

      $.postJSON(__url, __newParams, function (result) {
        result = result || {};
        if (!$ol || $ol.length < 1) { //if not exist
          $ol = $('<ol></ol>');
        } else {
          $ol.empty();
        }
        var __text='',__value='', __item={};
        var __currentCategory = __categorySelected.category || {};
        var __exists = false;
        (result.elements || []).forEach(function (item) {
          __item = item || {};
          if(iNet.isEmpty(__item.key)) {
            __item.key= 'empty';
          }
          if (!!item.key) {
            __text = (__item.key==='empty') ? 'Chưa xác đinh' : __item.key;
            __value =(__item.value > 0) ? __item.value : '';
            var $li = $(String.format('<li class="tree-category-item"><div class="item"><a href="javascript:;"><span class="category"></span> {0}</a> <span class="number">{1}</span></div></li>',__text, __value));
            $li.data('data', iNet.apply(iNet.clone(__dataNode), {category: __item}));
            if(!__exists) {
              __exists = (__item.key === __currentCategory.key);
              if(__exists) {
                $li.addClass('selected');
              }
            }
            $ol.append($li);
          }
        });
        if(!__exists && !iNet.isEmpty(__currentCategory)) {
          __text = (__currentCategory.key==='empty') ? 'Chưa xác đinh' : __currentCategory.key;
          var $li = $(String.format('<li class="tree-category-item"><div class="item"><a href="javascript:;"><span class="category"></span> {0}</a> <span class="number">{1}</span></div></li>',__text, 0));
          $li.data('data', iNet.apply(iNet.clone(__dataNode), {category: __currentCategory}));
          $li.addClass('selected');
          $ol.append($li);
        }
        $nodeTreeSelected.append($ol);
        if ($.fn.bonsai) {
          that.$tree.bonsai('update');
        }
        callback && callback(result);
      });
    },
    download: function (params) {
      params = params || {};
      var me = this;
      $.getJSON(iNet.getUrl('comm/report/ftemplate'), {
        application: 'idesk',
        module: 'edoc',
        type: this.isAdvSearchActive() ? 'RP_ED_LOOKUP_EXA' : 'RP_ED_LOOKUP_EXQ'
      }, function (result) {
        result = result || {};
        var __items = result.items || [];
        if (__items.length > 0) {
          var __templateId = (__items[0] || {}).uuid;
          if (!iNet.isEmpty(__templateId)) {
            iNet.apply(params, {
              templateID: __templateId,
              _name: me.$lblDateStr.text(),
              _from: !iNet.isEmpty(params.docDateFrom) ? new Date(params.docDateFrom).format('d/m/Y') : '',
              _to: !iNet.isEmpty(params.docDateFrom) ? new Date(params.docDateTo).format('d/m/Y') : ''
            });
            me.downloadLoading = new iNet.ui.form.LoadingItem({
              maskBody: me.getMask(),
              msg: 'Đang kiểm tra và tải về'
            });
            ReportCommonService.generate(params, function (result) {
              result = result || {};
              var __reportId = result.uuid;
              if (result.type == 'ERROR') {
                me.showMessage('error', 'Tải danh sách', 'Có lỗi khi kết xuất dữ liệu.');
              }
              me.checkReport.defer(1000, me, [__reportId]);
            });
          }
        } else {
          me.showMessage('warning', 'Tải danh sách', 'Hệ thống chưa có mẫu kết xuất.Vui lòng liên hệ với quản trị.')
        }
      }, {
        mask: this.getMask(),
        msg: iNet.resources.ajaxLoading.loading
      });
    },
    checkReport: function (reportId) {
      if (iNet.isEmpty(reportId)) {
        return;
      }
      ReportCommonService.chkstatus(reportId, function (result) {
        switch (result) {
          case 0:
            this.checkReport.defer(1000, this, [reportId]);
            break;
          case 2:
            if (this.downloadLoading) {
              this.downloadLoading.destroy();
            }
            ReportCommonService.download(reportId);
            break;
        }
      }.createDelegate(this));
    },
    getOrderByField: function() {
      var $th = this.getEl().find('th[data-property].sort');
      var field = $th.data('property');
      if ($th.length > 0) {
        return {
          orderByField: field,
          forwardDirection: $th.find('i').hasClass('icon-chevron-up')
        }
      }
      return {};
    },
    openFile: function (record) {
      var me = this;
      record = record || {};
      $.getJSON(iNet.getUrl('document/atts/fbyrefid'), {
        refId: record.id,
        refType: 'edoc'
      }, function (result) {
        result = result || {};
        var __items = result.elements || [];
        if (__items.length > 0) {
          var __item = __items[0] || {};
          var __contentUUID = __item.contentUid;
          if (!iNet.isEmpty(__contentUUID)) {
            me.fireEvent('openfile', __contentUUID, __items, {});
          }
        }
      });
    }
  });

});
