import React, { Component } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table } from "antd";
import styles from './index.less';
import _ from 'lodash';
const visibleHeight = 360;
const itemHeight = 54; // 根据table tr的高度设置

function VirTable(props: any) {
  console.log(props, '1234')
  const [range, setRange] = useState([0, 10]);
  const [visibleCount, setVisibleCount] = useState<number>(Math.ceil(props.scroll?.y / itemHeight) + 2);
  const tableRef = useRef<any>();

  const scrollEvent = useCallback((e) => {
    const startIdx = Math.floor(e.target.scrollTop / itemHeight);
    const endIdx = startIdx + visibleCount;
    setRange([startIdx, endIdx]);
    const offset = startIdx * itemHeight;
    tableRef.current.style.top = offset + "px";
  }, []);
  useEffect(() => {
  }, [])
  const renderList = useMemo(() => {
    const [start, end] = range;
    return props.dataSource.slice(start, end)
  }, [range])
  useEffect(() => {
    console.log(props, 'props')
    const parentNode = document.querySelector('.ant-table-body');
    const contentNode = document.querySelector('.ant-table-body table');
    const totalCount = props.dataSource.length;
    tableRef.current = contentNode;
    const placeholderWrapper = document.createElement('div');
    if (parentNode) {
      placeholderWrapper.style.height = itemHeight * totalCount + 'px'
      parentNode!.appendChild(placeholderWrapper);
      (parentNode as HTMLDivElement)!.style.position = 'relative';
      (contentNode as HTMLDivElement)!.style.position = 'absolute';
      (contentNode as HTMLDivElement)!.style.top = 0;
      (contentNode as HTMLDivElement)!.style.left = 0;
      (parentNode as HTMLDivElement).addEventListener('scroll', scrollEvent)
    }
    return () => {
      parentNode && (parentNode as HTMLDivElement).removeChild(placeholderWrapper);
      parentNode && (parentNode as HTMLDivElement).removeEventListener('scroll', scrollEvent)
    }
  }, [scrollEvent]);
  return (
    <div className={styles.virtualTable}>
      <Table {...{
        ...props,
        dataSource: renderList,
      }} />
    </div>
  );
}

function enhanceVirTableComponent(WrappedComponent: any) {
  class NewVirTableComponent extends Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  return NewVirTableComponent;
}
const newVirTable = enhanceVirTableComponent(VirTable);
function VirtualTable<T>(props: T) {
  const instance = new newVirTable(props);
  const result = instance.render();
  return result;
}
export default VirtualTable;
