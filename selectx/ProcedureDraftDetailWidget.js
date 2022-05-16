// #PACKAGE: criteria-procedure-draft-detail-wg
// #MODULE: ProcedureDraftDetailWidget
$(function () {
    iNet.ns('iNet.ui.criteria');
    iNet.ui.criteria.ProcedureDraftDetailWidget = function (config) {
        var __config = config || {};
        iNet.apply(this, __config);// apply configuration
        this.id = this.id || 'procedure-draft-detail-widget';
        iNet.ui.criteria.ProcedureDraftDetailWidget.superclass.constructor.call(this);
        console.log('[ProcedureDraftDetailWidget]', this);
        var me = this;
        this.resource = {
            procedure: iNet.resources.criteria.procedure,
            errors: iNet.resources.criteria.errors,
            constant: iNet.resources.criteria.constant,
            validate: iNet.resources.criteria.validate
        };
        this.url = {
            save: iNet.getUrl('tthcc/proceduredraft/create'),
            update: iNet.getUrl('tthcc/proceduredraft/update')
        };

        this.$toolbar = {
            CREATE: $('#procedure-btn-create'),
            SAVE: $('#procedure-btn-save'),
            BACK: $('#procedure-btn-back'),
            ALLOCATE: $('#procedure-btn-allocate')
        };

        this.$filesContainer = $('#procedure-files-container');
        this.$form = $('#procedure-frm-detail');
        this.$file = $('#procedure-files');
        this.$fileLabel = $('#procedure-files-label');
        this.$serviceContainer = $('#procedure-service-container');

        this.$input = {
            industry: $('#procedure-select-industry'),
            prodType: $('#procedure-select-type'),
            group: $('#procedure-select-group'),
            subject: $('#procedure-txt-subject'),
            code: $('#procedure-txt-code'),
            content: $('#procedure-txt-content'),
            hours: $('#procedure-txt-hours'),
            serviceLevel1: $('#procedure-chk-servicel1'),
            serviceLevel2: $('#procedure-chk-servicel2'),
            serviceLevel3: $('#procedure-chk-servicel3'),
            serviceLevel4: $('#procedure-chk-servicel4'),
            submitToExternalSysTem: $('#procedure-chk-submitExternalSystem'),
            urlMinistry: $('#procedure-txt-urlMinistry'),
            issuedInfo: $('#procedure-txt-issuedInfo'),
            publishedOnDVCQG: $('#procedure-chk-published-on-dvcqg'),
            expirationDate: $('#procedure-txt-expirationDate'),
            nationalId: $('#procedure-txt-nationalID'),
            procedureNationalId: $('#procedure-txt-procedurenationalID'),
            localID: $('#procedure-txt-localID'),
            numberOfRecord: $('#procedure-txt-numberOfRecord'),
            app: $('#procedure-select-app'),
            appSearchField: $('#procedure-txt-app-search-field'),
            showCapcha: $('#procedure-chk-showCapcha'),
            processTimeType: $('#procedure-select-process-time-type'),
            lblProcessTimeType: $('#procedure-lbl-process-time-type')
        };

        this.$input.processTimeType.on('change', function () {
            this.onChangeProcessTimeType(this.$input.processTimeType.val());
        }.bind(this));

        var bindAppSelected = function (value, items, callback) {
            var selectedItem = items.find(function (app) {
                return app.code === value;
            });
            callback(selectedItem);
        };

        var formatResult = function (item) {
            var __item = item || {};
            return String.format("<span class='label label-warning' style='min-width: 100px;text-align: left'>{0}</span>&nbsp; <b>{1}</b>", __item.code.substring(0, 13), __item.name);
        };

        this.$input.app.select2({
            placeholder: "Tìm và chọn ứng dụng",
            formatNoMatches: 'Không tìm thấy dữ liệu',
            allowClear: true,
            id: function (item) {
                return item.code;
            },
            initSelection: function (element, callback) {
                var value = $(element).val();
                ProcedureCommonService.loadExternalApps(function (apps) {
                    if (value) {
                        bindAppSelected(value, apps, callback);
                    }
                });
            },
            query: function (query) {
                ProcedureCommonService.loadExternalApps(function (apps) {
                    query.callback({results: ProcedureCommonService.filterTermInArray(query.term, apps)});
                }.bind(this));
            }.bind(this),
            formatResult: formatResult,
            formatSelection: function (item) {
                var __item = item || {};
                return __item.name || __item.code;
            },
            escapeMarkup: function (m) {
                return m;
            }
        });

        this.$input.group.select2({
            multiple: true,
            placeholder: "Chọn cấp...",
            formatNoMatches: 'Không tìm thấy dữ liệu',
            data: ProcedureCommonService.getGroups().filter(function (group) {
                return !!group.id;
            }),
            formatResult: function (item) {
                return item.text;
            },
            formatSelection: function (item) {
                return item.text;
            },
            escapeMarkup: function (m) {
                return m;
            }
        });

        this.getEl().find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            me.showTab(e);
        });

        this.$serviceContainer.on('change', 'input[type="checkbox"]', function () {
            var level = Number(this.value);
            var checked = $(this).prop('checked');
            if (checked) {
                me.$serviceContainer.find(String.format('input[type="checkbox"]:lt({0})', level - 1)).prop('checked', true).prop('disabled', true);
                me.$serviceContainer.find(String.format('input[type="checkbox"]:gt({0})', level - 1)).prop('disabled', false);
            } else {
                me.$serviceContainer.find(String.format('input[type="checkbox"]:eq({0})', level - 2)).prop('disabled', false);
            }
        });

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
                return String.format('<span class="label label-info">{0}</span> {1}', __sign, __item.text);
            },
            formatSelection: function (item) {
                var __item = item || {};
                var $option = $(__item.element);
                var __sign = $option.data('sign') || '__';
                return String.format('<span class="label label-info" style="height: auto !important;">[{0}]</span> {1}', __sign, __item.text);
            }
        });

        this.industrySelect.on('change', function () {
            var __industry = me.industrySelect.getData();
            me.$input.code.val($(__industry.element).data('pattern'));
        });

        /*
        var insertFile = function (obj) {
          console.log('[insertFile]', obj, arguments);
          var html = String.format("<pre class='brush:'>{0}</pre>", new Date());
          obj.execCommand('inserthtml', html);
        };
         */
        this.redactorContent = this.$input.content.redactor({
            autoresize: false,
            mobile: true,
            lang: 'vi',
            source: true,
            allowedTags: [
                "style", "code", "span", "div", "label", "a", "br", "p", "b", "i", "del", "strike", "u", "img",
                "video", "audio", "iframe", "object", "embed", "param", "blockquote", "mark", "cite", "small",
                "ul", "ol", "li", "hr", "dl", "dt", "dd", "sup", "sub", "big", "pre", "code", "figure", "figcaption", "strong", "em",
                "table", "tr", "td", "th", "tbody", "thead", "tfoot", "h1", "h2", "h3", "h4", "h5", "h6"
            ],
            focus: true
            /*
            buttonsAdd: ['|', 'insert_file'],
            buttonsCustom: {
              insert_file: {
                title: 'Chèn tệp',
                dropdown: {
                  file1: {title: 'Tệp 1', callback: insertFile}
                }
              }
            }
             */
        });

        this.expirationDate = this.$input.expirationDate.datepicker({
            language: "vi",
            clearBtn: true,
            format: "dd/mm/yyyy"
        }).on("changeDate", function () {
            me.expirationDate.hide();
        }).data("datepicker");

        this.$input.expirationDate.next().on('click', function () {
            $(this).prev().focus();
        });

        this.validate = new iNet.ui.form.Validate({
            id: this.id,
            rules: [{
                id: this.$input.subject.prop('id'),
                validate: function (v) {
                    if (iNet.isEmpty(v))
                        return 'Tên thủ tục không được để rỗng';
                }
            }, {
                id: 'procedure-select-industry-container',
                validate: function () {
                    if (me.industrySelect) {
                        var __item = me.industrySelect.getData() || {};
                        if (iNet.isEmpty(__item.id)) {
                            return 'Lĩnh vực chưa được chọn';
                        }
                    }
                }
            }]
        });

        this.$filesContainer.on('click', 'a[data-file-action]', function () {
            var $el = $(this);
            var $fileElement = $($el.parent());
            var __action = $el.attr('data-file-action');
            var __ownerData = me.getOwnerData() || {};
            var __contentId = $fileElement.attr('data-id');
            var __dialog;
            if (iNet.isEmpty(__contentId)) {
                return;
            }
            switch (__action) {
                case 'delete':
                    __dialog = me.createFileDeleteDialog();
                    var __file = (__ownerData.attachments || []).find(function (file) {
                        return (file.contentID === __contentId);
                    });
                    __dialog.setContent(String.format('Bạn có chắc chắn là đồng ý muốn xóa tệp <b>"{0}"</b> không ?', __file.filename));
                    __dialog.setData({element: $fileElement, procedure: __ownerData.uuid, scope: me});
                    __dialog.show();
                    break;
                case 'download':
                    $.download(iNet.getUrl('tthcc/proceduredraftfile/download'), {
                        procedure: __ownerData.uuid,
                        contentID: __contentId
                    });
                    break;
                /*
                case 'used':
                case 'notused':
                  __dialog = me.createConfirmExportUsedDialog();
                  __dialog.setData({
                    procedure: __ownerData.uuid,
                    contentID: __contentId,
                    exportUsed: (__action === 'used'),
                    fn: function (result) {
                      var __result = result || [];
                      me.fillFiles(__result.attachments || []);
                    }
                  });
                  __dialog.setContent((__action === 'used') ? me.resource.procedure.exportUsedContent : me.resource.procedure.exportNoUsedContent);
                  __dialog.show();
                  break;

                 */
            }
        });

        this.$toolbar.BACK.on('click', function () {
            this.hide();
            this.fireEvent('back', this);
        }.createDelegate(this));

        this.$toolbar.CREATE.on('click', function () {
            this.newRecord();
        }.createDelegate(this));

        this.$toolbar.SAVE.on('click', function () {
            this.save();
        }.createDelegate(this));

        this.$toolbar.ALLOCATE.on('click', function () {
            me.fireEvent('allocate', me.getOwnerData());
        });

        $(window).on('resize', function () {
            me.resize();
        });
    };
    iNet.extend(iNet.ui.criteria.ProcedureDraftDetailWidget, iNet.ui.criteria.BaseWidget, {
        createTabById: function (id) {
            switch (id) {
                case 'graph-tab':
                    if (!this.graphTab) {
                        this.graphTab = new iNet.ui.criteria.ProcedureGraphTab({
                            id: id
                        });
                    }
                    return this.graphTab;
                case 'eform-tab':
                    if (!this.formTab) {
                        this.formTab = new iNet.ui.criteria.ProcedureFormTab({
                            id: id
                        });
                    }
                    return this.formTab;
                case 'result-template-tab':
                    if (!this.resultTemplateTab) {
                        this.resultTemplateTab = new iNet.ui.criteria.ProcedureResultTemplateTab({
                            id: id
                        });
                    }
                    return this.resultTemplateTab;
                case 'doc-result-tab':
                    if (!this.resultDocumentTab) {
                        this.resultDocumentTab = new iNet.ui.criteria.ProcedureResultDocumentTab({
                            id: id
                        });
                    }
                    return this.resultDocumentTab;
                case 'print-template-tab' :
                    if (!this.printTemplateTab) {
                        this.printTemplateTab = new iNet.ui.criteria.ProcedurePrintTemplateTab({
                            id: id
                        });
                    }
                    return this.printTemplateTab;
                case 'ingredient-tab':
                    if (!this.ingredientTab) {
                        this.ingredientTab = new iNet.ui.criteria.ProcedureIngredientTab({
                            id: id
                        });
                        this.ingredientTab.on('change', function () {

                        });
                    }
                    return this.ingredientTab;
                case 'exception-tab':
                    if (!this.exceptionTab) {
                        this.exceptionTab = new iNet.ui.criteria.ProcedureExceptionTab({
                            id: id
                        });
                    }
                    return this.exceptionTab;
                case 'cost-tab':
                    if (!this.costTab) {
                        this.costTab = new iNet.ui.criteria.ProcedureCostTab({
                            id: id
                        });
                    }
                    return this.costTab;
            }
            return null;
        },
        showTab: function (e) {
            var tabId = $(e.target).attr("href").replace('#', '');// activated tab
            var activeTab = this.createTabById(tabId);
            FormUtils.showButton(this.$toolbar.SAVE, !activeTab);

            if (activeTab) {
                activeTab.setProcedure(this.getOwnerData());
                activeTab.load();
            }
            console.log('[show]--tab--', tabId, activeTab);
        },
        firstTab: function () {
            this.$form.find('.nav-tabs').find('a[data-toggle="tab"]:first').trigger('click');
        },
        resize: function () {
            this.$input.content.prev().height($(window).height() - 165);
            this.getEl().find('#procedure-info-container').height($(window).height() - 75);
        },
        check: function () {
            return this.validate.check();
        },
        setIndustry: function (industry) {
            this.industrySelect.setData(industry);
            var option = $(industry.element);
            this.$input.code.val(option.data('pattern'));
        },
        convertStringToBoolean: function (v) {
            if (iNet.isString(v)) {
                return v === 'true';
            }
            return !!v;
        },
        checkRole: function () {
            FormUtils.showButton(this.$toolbar.SAVE, true);
            FormUtils.showButton(this.$toolbar.CREATE, true);
            var $tabs = this.getEl().find('.nav-tabs').find('a[data-toggle="tab"]:gt(1)');
            var __ownerData = this.getOwnerData() || {};
            if (!iNet.isEmpty(__ownerData.uuid)) {
                $tabs.show();
            } else {
                $tabs.hide();
            }
            FormUtils.showButton(this.$toolbar.ALLOCATE, !iNet.isEmpty(__ownerData.uuid));
        },
        getGroups: function () {
            return this.$input.group.select2('val') || [];
        },
        newRecord: function () {
            this.resetData();
        },
        resetData: function () {
            this.setOwnerData(null);
            this.firstTab();
            this.redactorContent.setCode('');

            this.$input.serviceLevel1.prop('checked', false).prop('disabled', false);
            this.$input.serviceLevel2.prop('checked', false).prop('disabled', false);
            this.$input.serviceLevel3.prop('checked', false).prop('disabled', false);
            this.$input.serviceLevel4.prop('checked', false).prop('disabled', false);

            this.$input.submitToExternalSysTem.prop('checked', false);
            this.$input.showCapcha.prop('checked', false);

            this.$input.group.select2('val', '').trigger('change');
            this.$input.group.select2('enable');
            this.$input.app.select2('val', '').trigger('change');

            var __industry = this.industrySelect.getData();
            this.$input.code.val($(__industry.element).data('pattern'));

            if (this.hasPattern()) {
                this.industrySelect.disable();
            } else {
                this.industrySelect.enable();
            }
            this.$input.expirationDate.val('');
            if (this.$input.expirationDate.data('datepicker')) {
                this.$input.expirationDate.data('datepicker').update();
            }

            this.$input.prodType.val("INTERNAL");
            this.$input.hours.val('');
            this.$input.issuedInfo.val('');
            this.$input.nationalId.val('');
            this.$input.procedureNationalId.val('');
            this.$input.localID.val('');
            this.$input.numberOfRecord.val('');
            this.$input.appSearchField.val('');
            this.$input.urlMinistry.val('');
            this.$input.subject.val('').focus();
            this.clearFile();
            this.checkRole();
        },
        setData: function (data) {
            this.setOwnerData(data);
            var __data = data || {};
            this.procedure = __data.uuid;
            this.$input.subject.val(__data.subject);
            this.$input.code.val(__data.code);
            this.$input.hours.val(__data.hours);
            this.$input.urlMinistry.val(__data.urlMinistry || '');
            this.$input.appSearchField.val(__data.appSearchField || '');
            $(String.format('input[type="radio"][name="publishSource"][value={0}]', __data.publishSource)).prop('checked', true);
            this.$input.publishedOnDVCQG.prop('checked', __data.publishedOnDVCQG);
            this.$input.issuedInfo.val(__data.issuedInfo || '');
            this.$input.expirationDate.val(__data.expirationDate > 0 ? (new Date(__data.expirationDate)).format('d/m/Y') : '');

            if (this.$input.expirationDate.data('datepicker')) {
                this.$input.expirationDate.data('datepicker').update();
            }

            this.$input.nationalId.val(__data.nationalID || '');
            this.$input.procedureNationalId.val(__data.nationalProcedureID || '');
            this.$input.localID.val(__data.localID || '');
            this.$input.numberOfRecord.val(__data.numberOfRecord || 0);

            var optionIndustry, industryData;
            if (__data.hasOwnProperty('industrySign') && !iNet.isEmpty(__data.industrySign)) {
                //console.log('[data]--newVersion--', __data);
                optionIndustry = this.$input.industry.find(String.format('option[value="{0}"]', __data.industrySign));
                industryData = {id: __data.industrySign, text: __data.industry, element: optionIndustry};
            } else {// compatible with old version
                //console.log('[data]--oldVersion--', __data);
                optionIndustry = this.$input.industry.find(String.format('option[data-name="{0}"]', __data.industry));
                //console.log(optionIndustry, optionIndustry.attr('value'));
                industryData = {
                    id: optionIndustry.attr('value'),
                    text: __data.industry || 'Chưa xác định',
                    element: optionIndustry
                };
            }
            //console.log('[industryData]', industryData);
            this.industrySelect.setData(industryData);

            this.$input.prodType.val(__data.type);
            this.$input.serviceLevel1.prop('checked', this.convertStringToBoolean(__data.expenseL1));
            this.$input.serviceLevel2.prop('checked', this.convertStringToBoolean(__data.expenseL2));
            this.$input.serviceLevel3.prop('checked', this.convertStringToBoolean(__data.expenseL3));
            this.$input.serviceLevel4.prop('checked', this.convertStringToBoolean(__data.expenseL4));
            this.$serviceContainer.find('input[type="checkbox"]:checked:last').trigger('change');

            this.$input.submitToExternalSysTem.prop('checked', !!__data.submitToExternalSysTem);
            this.$input.publishedOnDVCQG.prop('checked', __data.publishedOnDVCQG);
            this.$input.showCapcha.prop('checked', !!__data.showCapcha);
            this.$input.app.select2('val', __data.application || '');

            this.setProcessTimeType(__data.processTimeType);

            var __groups = [];
            var __groupIds = (__data.group || "").split(';').filter(function (v) {
                if (v) {
                    return v;
                }
            });
            if (__groupIds.length > 0) {
                ProcedureCommonService.getGroups().forEach(function (group) {
                    if (__groupIds.indexOf(group.id) > -1) {
                        __groups.push(group);
                    }
                });
            }
            this.$input.group.select2('data', __groups).trigger('change');
            this.redactorContent.setCode(__data.html || '');

            this.clearFile();
            this.fillFiles(__data.attachments || []);
            this.check();
            this.checkRole();

            this.$input.subject.focus();
        },
        getData: function () {
            var __industry = this.industrySelect.getData() || {};
            var __data = {
                application: this.$input.app.select2('val'),
                code: this.$input.code.val(),
                group: this.getGroups().join(';'),
                issuedInfo: this.$input.issuedInfo.val(),
                industry: __industry.text || '',
                industrySign: __industry.id || '',
                prodType: this.$input.prodType.val() || '',
                expenseL1: !!this.$input.serviceLevel1.prop('checked'),
                expenseL2: !!this.$input.serviceLevel2.prop('checked'),
                expenseL3: !!this.$input.serviceLevel3.prop('checked'),
                expenseL4: !!this.$input.serviceLevel4.prop('checked'),
                submitToExternalSysTem: !!this.$input.submitToExternalSysTem.prop('checked'),
                showCapcha: !!this.$input.showCapcha.prop('checked'),
                html: this.redactorContent.getCode(),
                publishedOnDVCQG: this.$input.publishedOnDVCQG.is(':checked'),
                subject: this.$input.subject.val().trim(),
                processTimeType: this.$input.processTimeType.val(),
                publishSource: $('input[type="radio"][name="publishSource"]:checked').val()
            };
            if (this.expirationDate && !iNet.isEmpty(this.expirationDate.getDate())) {
                __data.expirationDate = this.expirationDate.getDate().valueOf();
            }
            var __ownerData = this.getOwnerData() || {};
            if (!iNet.isEmpty(__ownerData.uuid)) {
                __data.procedure = __ownerData.uuid;
            }
            return __data;
        },
        reload: function () {
            var __ownerData = this.getOwnerData() || {};
            if (!iNet.isEmpty(__ownerData.uuid)) {
                this.loadById(__ownerData.uuid);
            }
        },
        loadById: function (uuid) {
            $.getJSON(iNet.getUrl('tthcc/proceduredraft/view'), {procedure: uuid}, function (result) {
                var __result = result || {};
                if (__result.type !== 'ERROR') {
                    this.setData(__result);
                } else {
                    this.notifyError('Thủ tục hành chính', 'Có lỗi khi tải dữ liệu');
                }
            }.bind(this), {mask: this.getMask(), msg: iNet.resources.ajaxLoading.loading});
        },
        clearFile: function () {
            this.$fileLabel.removeClass('selected').data('title', this.resource.procedure.clickHere);
            this.$fileLabel.find('span[data-title]').attr('data-title', '...');
            this.$file.val('');
            this.fillFiles([]);
        },
        setFiles: function (files, label) {
            var __files = files || [];
            if (__files.length < 1) {
                return;
            }
            var __fileNames = __files.map(function (file) {
                return file.name;
            });
            label.addClass('selected').attr('data-title', this.resource.procedure.clickHere);
            if (__files.length === 1) {
                label.find('span[data-title]').attr('data-title', __fileNames[0]);
            } else {
                label.find('span[data-title]').attr('data-title', String.format('{0} ' + this.resource.procedure.file + ': {1} ', __fileNames.length, __fileNames.join(', ')));
            }
        },
        fillFiles: function (files) {
            this.$filesContainer.empty();
            var __files = files || [];
            if (__files.length > 0) {
                var __htmls = [];
                //var __action = '[<a data-file-action="delete" class="remove" href="javascript:;"><i class="icon-trash red"></i></a>] ';
                __files.forEach(function (file) {
                    __htmls.push(String.format('<li data-id="{0}"><i class="fa fa-paperclip"></i> <a data-file-action="download" href="javascript:;"><i class="{1}"></i>{2}</a></li>', file.contentID, iNet.FileFormat.getFileIcon(file.filename), file.filename));
                });
                this.$filesContainer.html(__htmls.join(''));
                this.$filesContainer.show();
            }
            this.resize();
        },
        createFileDeleteDialog: function () {
            if (!this._confirmFileDeleteDialog) {
                this._confirmFileDeleteDialog = new iNet.ui.dialog.ModalDialog({
                    id: 'procedure-modal-confirm-file-delete',
                    title: this.resource.constant.del_title,
                    buttons: [{
                        text: iNet.resources.message.button.ok,
                        cls: 'btn-danger',
                        icon: 'icon-ok icon-white',
                        fn: function () {
                            var __data = this.getData();
                            var __scope = __data.scope;
                            var __element = __data.element;
                            var __uuid = __element.attr('data-id');
                            if (!iNet.isEmpty(__uuid)) {
                                $.postJSON(iNet.getUrl('tthcc/proceduredraftfile/delete'), {
                                    procedure: __data.procedure,
                                    files: __uuid
                                }, function () {
                                    this.hide();
                                    __element.remove();
                                    if (__scope) {
                                        __scope.resize();
                                    }
                                }.bind(this), {mask: this.getMask(), msg: 'Đang xóa...'})
                            }
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
            return this._confirmFileDeleteDialog;
        },
        save: function () {
            if (this.check()) {
                var __data = this.getData();
                var loading;
                var __url = !iNet.isEmpty(__data.procedure) ? this.url.update : this.url.save;
                this.$form.ajaxSubmit({
                    url: __url,
                    data: __data,
                    beforeSubmit: function (arr, form, options) {
                        loading = new iNet.ui.form.LoadingItem({
                            maskBody: this.$form,
                            msg: iNet.resources.ajaxLoading.saving
                        });
                    }.bind(this),
                    success: function (result) {
                        if (loading) {
                            loading.destroy();
                        }
                        var __result = iNet.apply(result || {}, {edit: true});
                        if (__result.type === "ERROR") {
                            if (__data.errors[0].code === "EXISTS") {
                                this.notifyError('Thủ tục hành chính', 'Thủ tục đã tồn tại, vui lòng kiểm tra lại');
                            } else {
                                this.notifyError('Thủ tục hành chính', 'Có lỗi xảy ra khi lưu dữ liệu');
                            }
                        } else if (!iNet.isEmpty(__result.uuid)) {
                            this.notifySuccess('Thủ tục hành chính', 'Thông tin TTHC đã được lưu');
                            this.setData(__result);
                            this.fireEvent('saved', __result);
                        }

                    }.bind(this)
                });
            }
        },
        createConfirmExportUsedDialog: function () {
            if (!this._confirmExportUsed) {
                this._confirmExportUsed = new iNet.ui.dialog.ModalDialog({
                    id: 'modal-procedure-confirm-export-used',
                    title: 'Biểu mẫu kết xuất ?',
                    buttons: [{
                        text: 'Đồng ý',
                        cls: 'btn-primary',
                        icon: 'icon-ok icon-white',
                        fn: function () {
                            var __dialog = this;
                            var __data = __dialog.getData();
                            var __profile = __data.profile;
                            var __procedure = __data.procedure;
                            var __contentID = __data.contentID;
                            var __exportUsed = __data.exportUsed;
                            var __fn = __data.fn || iNet.emptyFn;
                            if (!iNet.isEmpty(__contentID)) {
                                $.postJSON(iNet.getUrl('glbgate/prodmaterial/exportused'), {
                                    profile: __profile,
                                    procedure: __procedure,
                                    contentID: __contentID,
                                    exportUsed: __exportUsed
                                }, function (result) {
                                    var __result = result || {};
                                    if (__result.uuid !== 'FAIL') {
                                        __fn(__result);
                                        __dialog.hide();

                                    }
                                }, {mask: this.getMask(), msg: 'Đang xử lý...'});
                            }
                        }
                    }, {
                        text: 'Đóng',
                        icon: 'icon-remove',
                        fn: function () {
                            this.hide();
                        }
                    }
                    ]
                });

            }
            return this._confirmExportUsed;
        },
        setProcessTimeType: function (type) {
            type = type || 'working_day';
            this.$input.processTimeType.val(type).trigger('change');
        },
        onChangeProcessTimeType: function () {
            var __processTimeType = this.$input.processTimeType.val();
            var __label = String.format('Thời gian xử lý {0}', ProcedureCommonService.getUnitTimeByType(__processTimeType));
            this.$input.lblProcessTimeType.text(__label);
            switch (__processTimeType) {
                case 'working_day':
                    this.$input.hours.removeAttr('disabled');
                    break;
                case 'day':
                    this.$input.hours.removeAttr('disabled');
                    break;
                default:
                    this.$input.hours.prop('disabled', true);
            }
        }
    });
});
