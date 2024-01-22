export interface TreeNode {
  id: string;
  children: TreeNode[];
  isExpanded?: boolean;
  isParent?: boolean
}

export interface DropInfo {
  targetId: string;
  action?: string;
}
export const demoData: TreeNode[] = [
  {
    id: 'item-2.0',
    children: [],
  },
  {
    id: 'item-2.1',
    children: [],
  },
]
export const demoTreeData: TreeNode[] = [
  {
    id: 'item-1.0',
    children: [],
    isParent: true,
  },
  {
    id: 'item-1.1',
    isParent: true,
    children: [
      {
        id: 'item-1.1.1',
        children: [],
      },
      {
        id: 'item-1.1.2',
        children: [],
      },
    ],
  },
  {
    id: 'item-1.2',
    isParent: true,
    children: [
      {
        id: 'item-1.2.1',
        children: [],
      },
      {
        id: 'item-1.2.2',
        children: [],
      },
      {
        id: 'item-1.2.3',
        children: [],
      },
    ],
  },
  {
    id: 'item-1.3',
    isParent: true,
    children: [],
  },
];