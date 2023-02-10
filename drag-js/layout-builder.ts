// import {Renderer2} from "@angular/core";
export declare abstract class Renderer2 {
  abstract createElement(name: string, namespace?: string | null): any;
  abstract appendChild(parent: any, newChild: any): void;
}

declare let iNet: any;
declare let html2canvas: any;
export class LayoutBuilder {
  layout: any;
  container: any;
  sidebar: any;
  router: any;
  component: any;
  control: any;
  color: string;
  renderer: Renderer2;

  constructor(component) {
    this.component = component;
    this.layout = $(component?.bodyLayout?.nativeElement);
    this.container = $(component?.containerLayout?.nativeElement);
    this.sidebar = $(component?.sidebarLayout?.nativeElement);
    this.router = component.router;
    this.initComponent();
  }

  initComponent() {
    this.containerSortable();
    this.columnSortable();
    this.layoutDraggable();
    this.controlDraggable();
    this.bindEvents();
  }

  initViewChart(renderer: Renderer2) {
    this.containerSortable();
    this.columnSortable();
    this.renderer = renderer
    this.addActionChart(); // add new action on chart old
    this.setClassChart(); // custom css chart old
  }

  containerSortable() {
    this.container.sortable({
      connectWith: '.column',
      handle: ".drag"
    });
  }

  columnSortable() {
    this.container.find('.column').sortable({
      connectWith: '.column',
      handle: ".drag"
    });
  }

  layoutDraggable() {
    this.sidebar.find('.lyrow').draggable({
      connectToSortable: this.container,
      helper: "clone",
      containment: "false",
      handle: ".drag",
      start: (e, ui) => {
        ui.helper.width('auto');
        ui.helper.height('auto');
        ui.helper.find('.name-layout').addClass('hide');
      },
      drag: (e, ui) => {
        ui.helper.width('auto');
        ui.helper.height('auto');
        ui.helper.find('.name-layout').addClass('hide');
      },
      stop: (e, ui) => {
        this.columnSortable();
      }
    });
  }

  controlDraggable() {
    var self = this;
    this.sidebar.find('.box').draggable({
      connectToSortable: ".column",
      helper: "clone",
      handle: ".drag",
      start: (e, ui) => {
        let __chart = ui.helper.find('.view.icloud-biolap.biolap-design').children()
        ui.helper.height('auto');
        ui.helper.width('auto');
        ui.helper.attr('data-uuid', iNet.generateId());
        __chart.attr('data-id', ui.helper.attr('data-uuid'));
        __chart.attr('width', 'auto');
      },
      drag: (e, ui) => {
        let __chart = ui.helper.find('.view.icloud-biolap.biolap-design').children()
        ui.helper.height('auto');
        ui.helper.width('auto');
        ui.helper.attr('data-uuid', iNet.generateId());
        __chart.attr('data-id', ui.helper.attr('data-uuid'));
        __chart.attr('width', 'auto');
      },
      stop: (e, ui) => {
        // self.component.updateElement(ui.helper.attr('data-uuid'), $(ui.helper.find('.view.icloud-biolap.biolap-design')).children().prop("tagName").toLowerCase(), ui.helper.attr('data-uuid-chart'));
        self.component.updateElement(ui.helper.attr('data-uuid-chart'));
      }
    });
  }

  isChartContainer(uuid: string) {
    let chartCurrent = $('.container-layout .lyrow').find('.box.box-element[data-uuid-chart]');
    let arrIdChart = Array.from(chartCurrent).map((_domChart) => {
      return $(_domChart).attr('data-uuid-chart');
    });
    return arrIdChart.includes(uuid);
  }

  addActionChart() {
    if (this.container.children().length > 0) {
      let arrDropdown = this.component.containerLayout.nativeElement.querySelectorAll('.dropdown-menu.dropdown-menu-right')
      arrDropdown.forEach((__dom) => {
        this.newAction(__dom, '.dropdown-item.viewfull.control', "Xem biểu đồ toàn màn hình");
      })
    }
  }

  newAction(__dom: any, cssClass: string, textAction: string) {
    let __findViewfull = __dom.querySelectorAll(cssClass).length === 0;
    if (__findViewfull) {
      let arrClass = cssClass.split('.').filter(_css => !!_css).join(' ');
      let __domAdd = __dom.firstChild.cloneNode(true);
      __domAdd.innerHTML = textAction;
      __domAdd.className = arrClass;
      this.renderer.appendChild(__dom, __domAdd)
    }
  }

  findIdChart() {
    return Array.from(this.container.find('.box.box-element')).map((_item) => {
      return $(_item).attr('data-uuid-chart')
    })
  }

  bindEvents() {
    var self = this;
    var fullscreen = $('#view-full-screen')
    this.container.on('click', '.remove.control', function (e) {
      const element = $(this).parent();
      self.component.deleteControl(element.attr('data-uuid'), element.attr('data-uuid-chart'));
      element.remove();
    });
    this.container.on('click', '.remove.layout', function (e) {
      let arrCharts = Array.from($(this).parent().find(`.box[data-uuid-chart]`));
      let arrID = arrCharts.map((__chart) => {
        return $(__chart).attr('data-uuid-chart');
      })
      self.component.deleteLayout(arrID)
      $(this).parent().remove();
    });
    this.container.on('click', '.download.control', function (e) {
      let __domChart = $(this).closest('.box.box-element').find('.view.icloud-biolap.biolap-design').children();
      let __tagName = __domChart.prop('tagName').toLowerCase();
      self.downloadImage(__tagName, __domChart.attr('data-id'))
    });
    this.container.on('click', '.configuration.properties', function (e) {
      let element = $(this).parents('[data-control]');
      self.component.showProperties(element.attr('data-control'), element.attr('data-uuid'));
    });
    // this.container.on('click', '.preview.biolap-design', function (e) {
    this.container.on('click', '.box.box-element', function (e) {
      e.preventDefault();
      $('.selected-element').removeClass('selected-element');
      const element = $(this);
      element.addClass('selected-element');
      self.component.showProperties(element.attr('data-control'), element.attr('data-uuid'));
    });
    this.container.on('input', 'input.header-input', function (e) {
      $(this).attr('value', `${$(this).val()}`);
    });
    this.container.on('click', '.viewfull.control', function (e) {
      let __domChart = $(this).closest('.box.box-element').find('.view.icloud-biolap.biolap-design');
      let __domClone = __domChart.clone();
      let __domViewfull = fullscreen.find('.chart-viewfull')
      if (__domViewfull.children().length > 0) {
        fullscreen.find('.chart-viewfull').empty();
      }
      fullscreen.find('.chart-viewfull').append(__domClone);
      fullscreen.show();
    });
    fullscreen.on('click', '.hidden-btn.control', function (e) {
      fullscreen.hide();
      fullscreen.find('.chart-viewfull').empty();
    })
  }

  arrayIdChart() {
    let arrId = [], arrVal = [];
    let arrHeader = Array.from(this.container.find('.lyrow .view .header-dashboard .header-input'))
    let arrChart = Array.from(this.container.find('.lyrow .box.box-element .view.icloud-biolap').children());
    arrId = arrChart.map((__item) => {
      return $(__item).attr('data-id');
    });
    arrVal = arrHeader.map((__item) => {
      return $(__item).val();
    })
    return arrId.concat(arrVal)
  }

  editDesign(isView: boolean) {
    this.container.removeClass('view-dashboard');
    let _dropdown = this.container.find('.custom .dropdown-btn');
    let _removeControl = this.container.find('.remove.control.biolap-design');
    let _removeLayout = this.container.find('.remove.layout.biolap-design');
    let _dragLayout = this.container.find('.drag.biolap-design');
    let _headers = this.container.find('.lyrow .header-dashboard');
    if (isView) {
      _dropdown.removeClass('hide');
      _removeControl.addClass('hide');
      _removeLayout.addClass('hide');
      _dragLayout.addClass('hide');
    } else {
      _dropdown.addClass('hide');
      _removeControl.removeClass('hide');
      _removeLayout.removeClass('hide');
      _dragLayout.removeClass('hide');
    }
    Array.from(_headers).forEach(function (__header) {
      let __domHeader = $(__header);
      if (__domHeader.children().is('input.header-input') && isView) {
        let __valHeader = __domHeader.children().val();
        __domHeader.children().replaceWith(`<div class="header-view form-control form-control-sm">${__valHeader}</div>`);
      }
      if (__domHeader.children().is('div.header-view') && !isView) {
        let __valHeader = __domHeader.children().text();
        __domHeader.children().replaceWith(`<input value="${__valHeader}" type="text" class="header-input form-control form-control-sm">`)
      }
    })
  }

  viewDesign() {
    this.container.find('.lyrow .drag').remove();
    this.container.find('.lyrow .remove').remove();
    this.container.find('.lyrow .dropdown-btn').removeClass('hide');
    this.container.find('.lyrow .preview.biolap-design').remove();
    this.container.addClass('view-dashboard');
    let __childrenChart = this.container.find('.lyrow .view.icloud-biolap [width="auto"]').children();
    let arrChart = Array.from(__childrenChart);
    arrChart.forEach((__chart) => {
      if (!$(__chart).hasClass('echarts-for-react')) {
        $(__chart).addClass('superset-for-react')
      }
    })
    let _headers = this.container.find('.lyrow .header-dashboard');
    Array.from(_headers).forEach(function (__header) {
      let __domHeader = $(__header);
      if (__domHeader.children().is('input.header-input')) {
        let __valHeader = __domHeader.children().val();
        __domHeader.children().replaceWith(`<div class="header-view form-control form-control-sm">${__valHeader}</div>`);
      }
    });
  }

  setClassChart() {
    let __chart = this.container.find('.lyrow .view.icloud-biolap').children();
    let __childChart = __chart.children();
    if (!__chart.is('[width]')) {
      __chart.attr('width', 'auto')
    }
    if (__childChart.length > 0 && !__childChart.hasClass('echarts-for-react')) {
      __childChart.addClass('superset-for-react');
    }
  }

  downloadImage(typeChart, id) {
    if (!this.component.querySelector(`${typeChart}[data-id="${id}"]`)) {
      return;
    }
    let __domChartParent = this.component.querySelector(`${typeChart}[data-id="${id}"]`);
    let __svg = __domChartParent.querySelector('svg');
    let __canvas = __domChartParent.querySelector('canvas');
    let __domChart = null;
    if (!!__svg) {
      __domChart = __svg.parentNode;
    }
    if (!!__canvas) {
      __domChart = __canvas.parentNode;
    }
    this.component?.dashboardService.showLoading();
    html2canvas(__domChart).then(canvas => {
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.download = `${typeChart}_${(new Date() as any).format('d_m_Y')}.png`;
      a.href = canvas.toDataURL();
      a.click();
      a.remove();
    }).finally(() =>{
      this.component?.dashboardService.hideLoading();
    });
  }

  disableDraggable(uuid: string, isDisable?: boolean) {
    let domChart = this.container.find(`.box[data-uuid-chart=${uuid}]`);
    if (domChart.length > 0) {
      this.sidebar.find(`.box[data-uuid-chart=${uuid}]`).draggable({disabled: isDisable});
    }
  }

  editLayout() {
    this.layout.removeClass('devpreview sourcepreview');
    this.layout.addClass('edit');
  }

  sourcePreviewLayout() {
    this.layout.removeClass('edit');
    this.layout.addClass('devpreview sourcepreview');
    $(this).addClass('active');
  }

  cleanHtml(elm) {
    $(elm).parent().append($(elm).children().html());
  }
}
