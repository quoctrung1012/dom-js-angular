import {Component, Inject} from '@angular/core';
import {demoData, demoTreeData, DropInfo, TreeNode} from "./data";
import {DOCUMENT, Location} from "@angular/common";
import {ArrayDataSource} from "@angular/cdk/collections";
import {NestedTreeControl} from "@angular/cdk/tree";
import {CdkDrag, CdkDragDrop, CdkDragMove} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-tree-list-cdk',
  templateUrl: './tree-list-cdk.component.html',
  styleUrls: ['./tree-list-cdk.component.scss']
})
export class TreeListCdkComponent {
  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  listNodes: TreeNode[] = demoData;
  treeNodes: TreeNode[] = demoTreeData;
  dataSource = new ArrayDataSource<TreeNode>(this.treeNodes);
  // ids for connected drop lists tree
  dropTreeTargetIds: any[] = [];
  nodeTreeLookup: any = {};
  dropActionTodo: DropInfo = {action: '', targetId: ''};
// ids for connected drop lists
  dropListTargetIds: any[] = [];
  nodeListLookup: any = {};
  mainId = {
    tree: 'tree',
    list: 'list',
  }

  constructor(@Inject(DOCUMENT) private document: Document,
              private location: Location) {
    this.prepareDragDropTree(this.treeNodes);
    this.prepareDragDropList(this.listNodes);
  }

  onBack() {
    this.location.back();
  }

  prepareDragDropTree(nodes: TreeNode[]) {
    nodes.forEach(node => {
      this.dropTreeTargetIds.push(node.id);
      this.nodeTreeLookup[node.id] = node;
      this.prepareDragDropTree(node.children);
    });
  }

  prepareDragDropList(nodes: TreeNode[]) {
    nodes.forEach(node => {
      this.dropListTargetIds.push(node.id);
      this.nodeListLookup[node.id] = node;
      this.prepareDragDropList(node.children);
    });
  }


  dragMoved(event: CdkDragMove) {
    const ele = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);

    if (!ele) {
      this.clearDragInfo();
      return;
    }
    const container = ele.classList.contains("node-item") ? ele : ele.closest(".node-item");
    if (!container) {
      this.clearDragInfo();
      return;
    }
    const targetId = container.getAttribute("data-id")
    this.dropActionTodo = {
      targetId: !!targetId ? targetId : ''
    };
    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
      // before
      this.dropActionTodo["action"] = "before";
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
      // after
      this.dropActionTodo["action"] = "after";
    } else {
      // inside
      /**
       * Disable drag-drop item child, only 2 level
       * */
      //start
      if (!!targetId) {
        const parent = this.getParentNodeId(targetId, this.treeNodes, this.mainId.tree);
        if (parent !== this.mainId.tree) return this.clearDragInfo(true);
      }
      // end
      this.dropActionTodo["action"] = "inside";
    }
    this.showDragInfo();
  }


  dropListDropped(event: CdkDragDrop<any>) {
    if (!this.dropActionTodo || !this.dropActionTodo.targetId || !this.dropActionTodo.action) return;
    const draggedItemId = event.item.data;
    const parentItemId = event.previousContainer.id;
    const targetTreeId = this.getParentNodeId(this.dropActionTodo.targetId, this.treeNodes, this.mainId.tree);
    const targetListId = this.getParentNodeId(this.dropActionTodo.targetId, this.listNodes, this.mainId.list)
    console.log(
      '\nmoving\n[' + draggedItemId + '] from list [' + parentItemId + ']',
      '\n[' + this.dropActionTodo.action + ']' +
      '\n[' + this.dropActionTodo.targetId + '] from list [' + ((targetTreeId !== null) ? targetTreeId : targetListId) + ']');

    if (parentItemId !== this.mainId.list && targetTreeId !== null && targetListId !== this.mainId.list) {
      this.onChangeDrop(EChangeDrop.TREE_TO_TREE, parentItemId, draggedItemId, targetTreeId)
    }
    if (parentItemId !== this.mainId.list && targetTreeId === null && targetListId === this.mainId.list) {
      this.onChangeDrop(EChangeDrop.TREE_TO_LIST, parentItemId, draggedItemId)
    }
    if (parentItemId !== this.mainId.list && targetTreeId === null && targetListId === null && !this.dropActionTodo.targetId) {
      this.onChangeDrop(EChangeDrop.TREE_TO_EMPTY, parentItemId, draggedItemId)
    }
    if (parentItemId === this.mainId.list && targetTreeId === null && targetListId === this.mainId.list) {
      this.onChangeDrop(EChangeDrop.LIST_TO_LIST, parentItemId, draggedItemId)
    }
    if (parentItemId === this.mainId.list && targetTreeId !== null && targetListId === null) {
      this.onChangeDrop(EChangeDrop.LIST_TO_TREE, parentItemId, draggedItemId, targetTreeId)
    }
    if (parentItemId === this.mainId.list && targetTreeId === null && targetListId === null && !this.dropActionTodo.targetId) {
      this.onChangeDrop(EChangeDrop.LIST_TO_EMPTY, parentItemId, draggedItemId)
    }

    this.clearDragInfo(true);
  }

  onChangeDrop(type: EChangeDrop, parentItemId: string, draggedItemId: string, targetId?: string) {
    let draggedItem: TreeNode;
    let oldContainer: TreeNode[] = [];
    let newContainer: TreeNode[] = [];
    let isInside: boolean = false;
    switch (type) {
      case EChangeDrop.TREE_TO_TREE:
        isInside = true;
        draggedItem = this.nodeTreeLookup[draggedItemId];
        oldContainer = parentItemId !== this.mainId.tree ? this.nodeTreeLookup[parentItemId].children : this.treeNodes;
        newContainer = !!targetId && targetId !== this.mainId.tree ? this.nodeTreeLookup[targetId].children : this.treeNodes;
        break;
      case EChangeDrop.TREE_TO_LIST:
        draggedItem = this.nodeTreeLookup[draggedItemId];
        oldContainer = parentItemId !== this.mainId.tree ? this.nodeTreeLookup[parentItemId].children : this.treeNodes;
        newContainer = this.listNodes;
        break;
      case EChangeDrop.LIST_TO_LIST:
        draggedItem = this.nodeListLookup[draggedItemId];
        oldContainer = this.listNodes;
        newContainer = this.listNodes;
        break;
      case EChangeDrop.LIST_TO_TREE:
        isInside = true;
        draggedItem = this.nodeListLookup[draggedItemId];
        oldContainer = this.listNodes;
        newContainer = !!targetId && targetId != this.mainId.tree ? this.nodeTreeLookup[targetId].children : this.treeNodes;
        break;
      case EChangeDrop.TREE_TO_EMPTY:
        draggedItem = this.nodeTreeLookup[draggedItemId];
        oldContainer = parentItemId != this.mainId.tree ? this.nodeTreeLookup[parentItemId].children : this.treeNodes;
        newContainer = this.listNodes;
        this.dropActionTodo.action = 'empty-list'
        break;
      case EChangeDrop.LIST_TO_EMPTY:
        draggedItem = this.nodeListLookup[draggedItemId];
        oldContainer = this.listNodes;
        newContainer = this.treeNodes;
        this.dropActionTodo.action = 'empty-tree'
        break;
    }

    const index: number = oldContainer.findIndex(c => c.id === draggedItemId);
    oldContainer.splice(index, 1);
    switch (this.dropActionTodo.action) {
      case 'before':
      case 'after':
        const targetIndex = newContainer.findIndex(c => c.id === this.dropActionTodo.targetId);
        if (this.dropActionTodo.action == 'before') {
          newContainer.splice(targetIndex, 0, draggedItem);
        } else {
          newContainer.splice(targetIndex + 1, 0, draggedItem);
        }
        break;
      case 'inside':
        if (isInside) {
          this.nodeTreeLookup[this.dropActionTodo.targetId].children.push(draggedItem)
          this.nodeTreeLookup[this.dropActionTodo.targetId].isExpanded = true;
        }
        if (type === EChangeDrop.TREE_TO_LIST || type === EChangeDrop.LIST_TO_LIST) {
          oldContainer.splice(index, 0, draggedItem)
        }
        break;
      case 'empty-list':
        newContainer.splice(0, 0, draggedItem);
        break;
      case 'empty-tree':
        newContainer.splice(0, 0, {...draggedItem});
        break;
    }
    if (
      type === EChangeDrop.TREE_TO_TREE ||
      type === EChangeDrop.LIST_TO_TREE ||
      type === EChangeDrop.LIST_TO_EMPTY ||
      type === EChangeDrop.TREE_TO_LIST
    ) {
      this.dataSource = new ArrayDataSource<TreeNode>(this.treeNodes);
    }
    this.prepareDragDropTree(this.treeNodes);
    this.prepareDragDropList(this.listNodes);

  }

  getParentNodeId(id: string, nodesToSearch: TreeNode[], parentId: string): string | null {
    for (let node of nodesToSearch) {
      if (node.id == id) return parentId;
      let ret = this.getParentNodeId(id, node.children, node.id);
      if (ret) return ret;
    }
    return null;
  }

  showDragInfo() {
    this.clearDragInfo();
    let dom;
    if (this.dropActionTodo && !!this.dropActionTodo.targetId) {
      dom = this.document.getElementById("node-" + this.dropActionTodo.targetId);
      if (!!dom) dom.classList.add("drop-" + this.dropActionTodo.action);
    } else {
      if (this.treeNodes.length === 0) {
        dom = this.document.getElementById("node-tree-empty");
        if (!!dom) dom.classList.add("drop-inside");
      }
      if (this.listNodes.length === 0) {
        dom = this.document.getElementById("node-list-empty");
        if (!!dom) dom.classList.add("drop-inside")
      }
    }
  }

  clearDragInfo(dropped = false) {
    if (dropped) {
      this.dropActionTodo = {action: '', targetId: ''};
    }
    this.document
      .querySelectorAll(".drop-before")
      .forEach(element => element.classList.remove("drop-before"));
    this.document
      .querySelectorAll(".drop-after")
      .forEach(element => element.classList.remove("drop-after"));
    this.document
      .querySelectorAll(".drop-inside")
      .forEach(element => element.classList.remove("drop-inside"));
  }
}

enum EChangeDrop {
  TREE_TO_TREE = "TREE_TO_TREE",
  TREE_TO_LIST = "TREE_TO_LIST",
  LIST_TO_LIST = "LIST_TO_LIST",
  LIST_TO_TREE = "LIST_TO_TREE",
  TREE_TO_EMPTY = "TREE_TO_EMPTY",
  LIST_TO_EMPTY = "LIST_TO_EMPTY"
}
