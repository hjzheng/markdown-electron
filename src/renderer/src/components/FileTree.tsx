import React from 'react';
import { Tree } from 'antd';
import type { DirectoryTreeProps } from 'antd/es/tree';
import useWindowSize from '../utils/resize'
import { findTreeNode } from '../utils/utils'

interface IProps {
  data: any[]
  onSelect?: (keys: React.Key[], info: any) => void
  onLoadData?: (data) => Promise<void>
  selectFile?: string
  expandedKeys?: string[]
  onExpand?: (keys: React.Key[], info: any) => void
}

const FileTree = ({data, onLoadData, onSelect, selectFile, onExpand, expandedKeys}: IProps) => {

  const { height } = useWindowSize()

  const select: DirectoryTreeProps['onSelect'] = (keys, info) => {
    onSelect && onSelect(keys, info)
  };


  const loadData = async ({ children, ...attr }: any) => {

    const res = await window.api.requestSubFolder(attr.path)

    const node = findTreeNode(data, attr.path)

    if (node) {
      if (!children) {
        // @ts-ignore
        node.children = [...res.children]
      }
    }

    onLoadData && onLoadData(data)
  }

  return (
    <div>
      <Tree
        showLine
        height={height - 60}
        loadData={loadData}
        onSelect={select}
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        selectedKeys={selectFile ? [selectFile] : []}
        treeData={data}
      />
    </div>
  );
};

export default FileTree;