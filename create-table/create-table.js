$(function () {
  var arrayAttr = [
    {
      "name": "position",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Position",
      "op": "EQUAL"
    },
    {
      "name": "contactposition",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Chức vụ",
      "op": "EQUAL"
    },
    {
      "name": "contactFullName",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Người đại diện",
      "op": "EQUAL"
    },
    {
      "name": "contactWebsite",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Địa chỉ website",
      "op": "EQUAL"
    },
    {
      "name": "contactEmail",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Địa chỉ email",
      "op": "EQUAL"
    },
    {
      "name": "contactFax",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Số Fax",
      "op": "EQUAL"
    },
    {
      "name": "contactPhone",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Số điện thoại",
      "op": "EQUAL"
    },
    {
      "name": "contactAddress",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Địa chỉ",
      "op": "EQUAL"
    },
    {
      "name": "no",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Số thứ tự",
      "op": "EQUAL"
    },
    {
      "name": "name",
      "type": "STRING",
      "in": "",
      "required": false,
      "defval": "",
      "description": "Tên đơn vị",
      "op": "EQUAL"
    }
  ];
  var $formColumns = $('#form-columns')
  var $formTable = $('#table-render');
  var $search = $('#search-txt-column');
  var $button = {
    $sendJsonTable: $('#btn-submit-data'),
    $searchColumn: $('#btn-search-column'),
  }

  resetTable(false);
  setDataAttr(JSON.parse(JSON.stringify(arrayAttr)));
  appendHeaderCheckbox();
  searchColumns();
  // appendHtmlAttrs(convertListAttrs(getDataAttr()))
  // EventListener
  $button.$sendJsonTable.on('click', function () {

    var arrayJsonData = [], jsonSend;
    var arraySort = getArraySelectSort() || [],
      arraySearch = getArraySelectSearch() || [],
      arraySelect = getArraySelectColumn() || [];
    // var headerColumn;
    var tableRender = document.getElementById('table-render')
    if (arraySelect && arraySelect.length > 0) {
      tableRender.querySelectorAll('th').forEach(function (headerCell, index) {
        arrayJsonData.push(sendJsonData(headerCell, index, arraySort, arraySearch))
      })
      jsonSend = JSON.stringify(arrayJsonData)
      console.log('data send', jsonSend)
    } else {
      console.error('chưa tạo bảng')
    }
  })

  $search.on('keyup', function (e) {
    if (e.key === 'Enter') {
      searchColumns()
    } else {
      e.preventDefault()
    }
  })

  $button.$searchColumn.on('click', function () {
    searchColumns();
  })

  var $selectActionAll = {
    $columnAll: $('#select-all-column'),
    $sortAll: $('#select-all-sort'),
    $searchAll: $('#select-all-search'),
  }

  $selectActionAll.$columnAll.on('click', function () {
    buildCheckboxAll(getArraySelectColumn, setArraySelectColumn, $selectActionAll.$columnAll, true)
  })

  $selectActionAll.$sortAll.on('click', function () {
    buildCheckboxAll(getArraySelectSort, setArraySelectSort, $selectActionAll.$sortAll, false)
  })

  $selectActionAll.$searchAll.on('click', function () {
    buildCheckboxAll(getArraySelectSearch, setArraySelectSearch, $selectActionAll.$searchAll, false)
  })

  function buildCheckboxAll(getFnArray, setFnArray, $idCheckbox, isColumn) {
    if (getFnArray().length < getDataAttr().length) {
      isColumn ? buildTable(getDataAttr()) : '';
      setFnArray(JSON.parse(JSON.stringify(getDataAttr())) || []);
    } else {
      isColumn ? buildTable([]) : '';
      setFnArray([]);
    }
    checkAll(getFnArray, getDataAttr, $idCheckbox);
    searchColumns();
  }

  function appendHeaderCheckbox() {
    var html =
      '<table id="table-attr" class="w-100 table-hover table-bordered">' +
      '<thead><tr>' +
      '<th id="select-all-column" class="text-center select-checkbox-table">Name Column ' +
      '<span><i class="fa fa-times font-italic" aria-hidden="true"></i></span>' +
      '</th>' +
      '<th id="select-all-sort" class="text-center select-checkbox-table">Sort ' +
      '<span><i class="fa fa-times font-italic" aria-hidden="true"></i></span>' +
      '</th>' +
      '<th id="select-all-search" class="text-center select-checkbox-table">Search ' +
      '<span><i class="fa fa-times font-italic" aria-hidden="true"></i></span>' +
      '</th></tr></thead></table>'
    $formColumns.parent().prepend(html)
  }

  // func action

  String = {
    format: function (format) {
      var args = iNet.toArray(arguments, 1);
      return format.replace(/\{(\d+)\}/g, function (m, i) {
        return args[i];
      });
    },
  }

  function calcWidth(widthTable, widthItem) {
    return Math.round(Number(widthItem) * 1000 / Number(widthTable + 1));
  }

  function diffArray(array1, array2, attr) {
    var arrayTemp1 = JSON.parse(JSON.stringify(array1)) || [];
    var arrayTemp2 = JSON.parse(JSON.stringify(array2)) || [];
    var arrayResult = [];
    arrayTemp1.forEach(function (_item1) {
      arrayTemp2.forEach(function (_item2) {
        if (_item1[attr] === _item2[attr]) {
          arrayResult.push(_item2);
        }
      })
    })
    return arrayResult;
  }

  function findItemSelect(idColumn) {
    return getDataAttr().find(function (_item) {
      return _item.name === idColumn;
    })
  }

  function arraySelectColumn(idColumn, arrayFn) {
    if (idColumn && idColumn !== '') {
      var arrayTemp = arrayFn() || [];
      var index = arrayTemp.findIndex(function (_item) {
        return idColumn === _item.name;
      })
      if (arrayTemp.length > 0) {
        if (index >= 0) {
          arrayTemp.splice(index, 1);
        } else {

          arrayTemp.push(findItemSelect(idColumn));
        }
      } else {
        arrayTemp.push(findItemSelect(idColumn));
      }
    }
    return arrayTemp || [];
  }

  function appendHeadTable(arrayColumn) {
    var arrayColumns = JSON.parse(JSON.stringify(arrayColumn)) || [];
    var html = '', item = {}, arrayHtml = [];
    for (var i = 0; i < arrayColumns.length; i++) {
      item = arrayColumns[i];
      html = String.format('<th class="text-center" id="th-{0}" data-id="{1}"><span contenteditable="true">{2}</span></th>', item.name, item.name, item.description)
      arrayHtml.push(html);
    }
    return '<thead><tr>' + arrayHtml.join('') + '</tr></thead>'
  }

  function appendBodyTable(arrayColumn) {
    var arrayColumns = JSON.parse(JSON.stringify(arrayColumn)) || [];
    var html = '', item = {}, arrayHtml = [];
    for (var j = 0; j < arrayColumns.length; j++) {
      item = arrayColumns[j];
      html = String.format('<td>Ex: {0}</td>', item.description)
      arrayHtml.push(html);
    }
    return '<tbody>' + arrayHtml.join('') + '</tbody>'
  }

  function resetTable(isCheck) {
    if (!isCheck) {
      setArraySelectColumn([]);
      setArraySelectSort([])
      setArraySelectSearch([])
    }
    $formTable.html('<div class="d-flex align-items-center justify-content-center" style="height: 100px; font-size: 17px; ">Chưa tạo bảng</div>')
  }

  function convertListAttrs(array) {
    var arrayColumns = JSON.parse(JSON.stringify(array)) || [];
    var arrayHtml = [], html = '', htmlName = '', htmlColumn = '', htmlSort = '', htmlSearch = '',
      arrayCheckColumn = [], arrayCheckSort = [], arrayCheckSearch = [];
    var arraySelectColumn = getArraySelectColumn() || [];
    var arraySelectSort = getArraySelectSort() || [];
    var arraySelectSearch = getArraySelectSearch() || [];

    arrayCheckColumn = diffArray(arrayColumns, arraySelectColumn, 'name') || [];
    arrayCheckSort = diffArray(arrayColumns, arraySelectSort, 'name') || [];
    arrayCheckSearch = diffArray(arrayColumns, arraySelectSearch, 'name') || [];

    arrayColumns.forEach(function (item) {
      htmlName = htmlNameColumn(item)
      if (arrayCheckColumn.length > 0 || arrayCheckSort.length > 0 || arrayCheckSearch.length > 0) {
        htmlColumn = checkSelects(item, arrayCheckColumn, 'select-', 'select-attr', '2');
        htmlSort = checkSelects(item, arrayCheckSort, 'sort-', 'select-sort', '2');
        htmlSearch = checkSelects(item, arrayCheckSearch, 'search-', 'select-search', '3');
      } else {
        htmlColumn = checkSelects(item, [], 'select-', 'select-attr', '2');
        htmlSort = checkSelects(item, [], 'sort-', 'select-sort', '2');
        htmlSearch = checkSelects(item, [], 'search-', 'select-search', '3');
      }

      html = convertHtmlAttr(htmlName, htmlColumn, htmlSort, htmlSearch)
      arrayHtml.push(html)
    })
    return arrayHtml.join('');
  }

  function checkSelects(item, arrayCheck, type, nameClass, numCol) {
    var itemCheck = {}, html = '';
    if (arrayCheck.length > 0) {
      for (var i = 0; i < arrayCheck.length; i++) {
        if (arrayCheck[i].name === item.name) {
          itemCheck = arrayCheck[i];
          break;
        }
      }
      if (itemCheck) {
        itemCheck.name === item.name ?
          html = htmlSelectCheckbox(item, type, nameClass, 'checked', numCol) :
          html = htmlSelectCheckbox(item, type, nameClass, '', numCol);
      }
    } else {
      html = htmlSelectCheckbox(item, type, nameClass, '', numCol);
    }
    return html;
  }

  function htmlNameColumn(item) {
    return String.format('<label class="form-check-label col-sm-5 p-0" for="select-{0}" style="word-break: break-word;">{1}</label>', item.name, item.description)
  }

  function htmlSelectCheckbox(item, type, nameClass, isCheck, numCol) {
    return String.format('<div class="form-check col-sm-{5} p-0 d-flex justify-content-center">' +
      '<input class="form-check-input {0}" type="checkbox" data-id="{1}" id="{2}{3}" {4}></div>', nameClass, item.name, type, item.name, isCheck, numCol);
  }

  function convertHtmlAttr(nameLabel, selectColumn, selectSort, selectSearch) {
    return String.format('<div class="form-group d-flex">{0}{1}{2}{3}</div>', nameLabel, selectColumn, selectSort, selectSearch);
  }

  function searchColumns() {
    setKeywordSelect($search.val());
    var keywordSearch = getKeywordSelect() || '';
    var arrayColumns = getDataAttr() || [];
    var arrayResult = [];
    if (keywordSearch !== '') {
      arrayResult = arrayColumns.filter(function (_item) {
        return convertStr(_item.description).includes(convertStr(keywordSearch));
      }) || [];
    } else {
      arrayResult = arrayColumns || []
    }
    appendHtmlAttrs(convertListAttrs(arrayResult));
  }

  function appendHtmlAttrs(data) {
    $formColumns.html(data);
    var $selectAction = {
      $column: $('.select-attr'),
      $sort: $('.select-sort'),
      $search: $('.select-search'),
    }

    $selectAction.$column.on('click', function (event) {
      var arrayColumn = arraySelectColumn(event.target.dataset.id, getArraySelectColumn) || [];
      setArraySelectColumn(arrayColumn);
      buildTable(arrayColumn);
      checkAll(getArraySelectColumn, getDataAttr, $selectActionAll.$columnAll);
    })

    $selectAction.$sort.on('click', function (event) {
      var arraySort = arraySelectColumn(event.target.dataset.id, getArraySelectSort) || [];
      setArraySelectSort(arraySort);
      checkAll(getArraySelectSort, getDataAttr, $selectActionAll.$sortAll);
    })

    $selectAction.$search.on('click', function (event) {
      var arraySearch = arraySelectColumn(event.target.dataset.id, getArraySelectSearch) || [];
      setArraySelectSearch(arraySearch);
      checkAll(getArraySelectSearch, getDataAttr, $selectActionAll.$searchAll);
    })
  }

  function buildTable(arrayColumn) {
    $formTable.html(appendHeadTable(arrayColumn) + appendBodyTable(arrayColumn));
    if (arrayColumn.length === 0) {
      resetTable(true);
    }
    createDragTable();
  }

  function checkAll(arrayColumn, arrayDataAttr, $selectAction) {
    if (arrayColumn().length < arrayDataAttr().length) {
      $selectAction.find('span').html('<i class="fa fa-times font-italic" aria-hidden="true"></i>')
    } else {
      $selectAction.find('span').html('<i class="fa fa-check font-italic color-success" aria-hidden="true"></i>')
    }
  }

  function convertStr(str) {
    return str.toLowerCase().removeAccents();
  }

  // Drag Table

  function swap(nodeA, nodeB) {
    var parentA = nodeA.parentNode;
    var siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    nodeB.parentNode.insertBefore(nodeA, nodeB);
    parentA.insertBefore(nodeB, siblingA);
  }

  function isOnLeft(nodeA, nodeB) {
    var rectA = nodeA.getBoundingClientRect();
    var rectB = nodeB.getBoundingClientRect();

    return rectA.left + rectA.width / 2 < rectB.left + rectB.width / 2;
  }

  function cloneTable() {
    var tableRender = document.getElementById('table-render')
    var rect = tableRender.getBoundingClientRect();
    var list = document.createElement('div');
    list.classList.add('clone-list');
    list.style.position = 'absolute';
    list.style.left = rect.left + 'px';
    list.style.top = rect.top + 'px';
    tableRender.parentNode.insertBefore(list, tableRender);
    tableRender.style.visibility = 'hidden';
    var originalCells = Array.prototype.slice.call(tableRender.querySelectorAll('tbody td'));
    var originalHeaderCells = Array.prototype.slice.call(tableRender.querySelectorAll('th'));
    var numColumns = originalHeaderCells.length;
    originalHeaderCells.forEach(function (headerCell, headerIndex) {
      var width = parseInt(window.getComputedStyle(headerCell).width);
      var item = document.createElement('div');
      item.classList.add('draggable');

      var newTable = document.createElement('table');
      newTable.setAttribute('class', 'clone-table');
      newTable.style.width = width + 'px';

      var th = headerCell.cloneNode(true);
      var newRow = document.createElement('tr');
      newRow.appendChild(th);
      newTable.appendChild(newRow);

      var cells = originalCells.filter(function (c, idx) {
        return (idx - headerIndex) % numColumns === 0;
      });
      cells.forEach(function (cell) {
        var newCell = cell.cloneNode(true);
        newCell.style.width = width + 'px';
        newRow = document.createElement('tr');
        newRow.appendChild(newCell);
        newTable.appendChild(newRow);
      });

      item.appendChild(newTable);
      list.appendChild(item);
    });
    setListRender(list);
  }

  function mouseDownHandler(e) {
    e.target.classList.remove('table-th')
    var tableRender = document.getElementById('table-render');
    var dragIndex = Array.prototype.slice.call(tableRender.querySelectorAll('th')).indexOf(e.target);
    var clientX = 0, clientY = 0;
    if (dragIndex >= 0) {
      setDraggingColumnIndex(dragIndex)
      clientX = e.clientX - e.target.offsetLeft;
      clientY = e.clientY - e.target.offsetTop;
      setClientPos({clientX: clientX, clientY: clientY})
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
  }

  function mouseMoveHandler(e) {
    var dragIndex = getDraggingColumnIndex();
    var placeholder, prevEle, nextEle, list, draggingEle, draggingElement, clientX = 0, clientY = 0;
    if (!getIsDraggingStarted()) {
      setIsDraggingStarted(true)
      cloneTable();
      list = getListRender()
      draggingEle = Array.prototype.slice.call(list.children)[dragIndex];
      if (draggingEle) {
        setDraggingEle(draggingEle)
        draggingEle.classList.add('dragging');
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
        placeholder.style.width = draggingEle.offsetWidth + 'px';
        setPlaceholder(placeholder);
      }
    }
    draggingElement = getDraggingEle();
    if (draggingElement) {
      draggingElement.style.position = 'absolute';
      clientX = getClientPos().clientX;
      clientY = getClientPos().clientY;
      draggingElement.style.top = (draggingElement.offsetTop + e.clientY - clientY) + 'px';
      draggingElement.style.left = (draggingElement.offsetLeft + e.clientX - clientX) + 'px';
      setClientPos({clientX: e.clientX, clientY: e.clientY})
      placeholder = getPlaceholder();
      prevEle = draggingElement.previousElementSibling;
      nextEle = placeholder.nextElementSibling;
      if (prevEle && isOnLeft(draggingElement, prevEle)) {
        swap(placeholder, draggingElement);
        swap(placeholder, prevEle);
        return;
      }
      if (nextEle && isOnLeft(nextEle, draggingElement)) {
        swap(nextEle, placeholder);
        swap(nextEle, draggingElement);
      }
      setPlaceholder(placeholder);
    }
  }

  function mouseUpHandler() {
    var tableRender = document.getElementById('table-render');
    var dragIndex = getDraggingColumnIndex();
    var placeholder = getPlaceholder();
    var list, draggingEle;
    if (placeholder && placeholder.parentNode) {
      placeholder && placeholder.parentNode.removeChild(placeholder);
    }
    draggingEle = getDraggingEle();
    if (draggingEle) {
      draggingEle.classList.remove('dragging');
      draggingEle.style.removeProperty('top');
      draggingEle.style.removeProperty('left');
      draggingEle.style.removeProperty('position');
      list = getListRender();
      var endColumnIndex = Array.prototype.slice.call(list.children).indexOf(draggingEle);
      setIsDraggingStarted(false)
      if (list && list.parentNode) {
        list.parentNode.removeChild(list);
      }
      tableRender.querySelectorAll('tr').forEach(function (row) {
        var cells = Array.prototype.slice.call(row.querySelectorAll('th, td'));
        if (dragIndex > endColumnIndex) {
          cells[endColumnIndex].parentNode.insertBefore(
            cells[dragIndex],
            cells[endColumnIndex]);
        } else {
          if (cells[endColumnIndex] && cells[endColumnIndex].parentNode) {
            cells[endColumnIndex].parentNode.insertBefore(
              cells[dragIndex],
              cells[endColumnIndex].nextSibling)
          }
        }
      });
      $formTable.find('tr th').addClass('table-th');
    }
    tableRender.style.removeProperty('visibility');
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }

  function createDragTable() {
    var table = document.getElementById('table-render');
    table.querySelectorAll('th').forEach(function (headerCell) {
      headerCell.classList.add('table-th')
      headerCell.classList.add('draggable')
      headerCell.addEventListener('mousedown', mouseDownHandler);
    });
    createResizableTable(table);
  }

  // Resizer Table

  function createResizableTable(tableResize) {
    var cols = tableResize.querySelectorAll('th');
    Array.prototype.forEach.call(cols, function (col) {
      col.style.width = col.offsetWidth + 'px';
      var resizer = document.createElement('div');
      resizer.classList.add('resizer');
      resizer.style.height = tableResize.offsetHeight + 'px';
      col.appendChild(resizer);
      createResizableColumn(col, resizer);
    });
  }

  function createResizableColumn(col, resizer) {
    var x = 0;
    var w = 0;

    function mouseResizableDownHandler(e) {
      x = e.clientX;
      var styles = window.getComputedStyle(col);
      w = parseInt(styles.width, 10);
      document.addEventListener('mousemove', mouseResizableMoveHandler);
      document.addEventListener('mouseup', mouseResizableUpHandler);
      resizer.classList.add('resizing');
    }

    function mouseResizableMoveHandler(e) {
      var dx = e.clientX - x;
      col.style.width = (w + dx) + 'px';
    }

    function mouseResizableUpHandler() {
      resizer.classList.remove('resizing');
      document.removeEventListener('mousemove', mouseResizableMoveHandler);
      document.removeEventListener('mouseup', mouseResizableUpHandler);
    }

    resizer.addEventListener('mousedown', mouseResizableDownHandler);
  }

  function sendJsonData(headerCell, index, arraySort, arraySearch) {
    var displayValue = '', item = {};
    var widthTable = $formTable.width();
    displayValue = $('#' + headerCell.id).find('span').text();
    // item = {
    //   field: headerCell.dataset.id,
    //   display: displayValue, order: index,
    // };
    // width, sort, search of column =>
    item = {
      field: headerCell.dataset.id,
      display: displayValue, order: index,
      sortable: false, searchable: false,
      width: calcWidth(widthTable, headerCell.offsetWidth)
    };
    if (arraySort && arraySort.length > 0) {
      arraySort.forEach(function (_itemSort) {
        if (_itemSort.name === headerCell.dataset.id) {
          item['sortable'] = true;
        }
      });
    }
    if (arraySearch && arraySort.length > 0) {
      arraySearch.forEach(function (_itemSearch) {
        if (_itemSearch.name === headerCell.dataset.id) {
          item['searchable'] = true;
        }
      });
    }
    return item
  }
})
