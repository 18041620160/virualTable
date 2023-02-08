import React, { Component } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Table } from "antd";
import styles from './index.less';
import _ from 'lodash';
const itemHeight = 54; // 根据table tr的高度设置
let selectIds: any = [];
let flag = false;
function VirTable(props: any) {
  const [range, setRange] = useState([0, 10]);
  const [visibleCount, setVisibleCount] = useState<number>(Math.ceil(props.scroll?.y / itemHeight) + 2);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const tableRef = useRef<any>();

  const onSelect = (record, selected) => {
    if (!selected) {
      _.remove(selectedRowKeys, function (x) {
        return x === record[props.rowKey] || record.key;
      })
      sessionStorage.setItem('selectId', selectedRowKeys);
    }
  }
  const onSelectAll = (selected, selectedRows) => {
    flag = true;
    sessionStorage.setItem('isSelect', selected ? '1' : '0');
    console.log(selected, selectedRows);
    if (selected) {
      const selectId = props.dataSource.map(item => item[props.rowKey] || item.key);
      console.log(props.dataSource.map(item => item[props.rowKey] || item.key), '123')
      setSelectedRowKeys(selectId);
      sessionStorage.setItem('selectId', selectId);
      props.rowSelection.onChange(selectId, props.dataSource)
    } else {
      setSelectedRowKeys([]);
      props.rowSelection.onChange([], []);
      sessionStorage.setItem('selectId', '');
    }
  }
  const onChange = (selectedRowKeys: string[]) => {
    if (flag) {
      flag = false;
      return;
    }
    if (selectIds.length > 0) {
      selectIds = sessionStorage.getItem('selectId')?.split(',');
    }
    selectIds.push(...selectedRowKeys);
    selectIds = Array.from(new Set(selectIds));
    sessionStorage.setItem('selectId', selectIds);
    setSelectedRowKeys(selectIds);
    props.rowSelection.onChange(selectIds, props.dataSource.filter(item => selectIds.includes(item[props.rowKey] || item.key)));
  }
  const scrollEvent = useCallback((e) => {
    const isSelect = Number(sessionStorage.getItem('isSelect'));
    if (isSelect) {
      setSelectedRowKeys(props.dataSource.map(item => item[props.rowKey] || item.key));
    }
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
    console.log(123)
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
        pagination: false,
        rowSelection: {
          selectedRowKeys,
          onSelect: props.rowSelection.onSelect ? props.rowSelection.onSelect : onSelect,
          onSelectAll: props.rowSelection.onSelectAll ? props.rowSelection.onSelectAll : onSelectAll,
          onChange: onChange,
        }
        ,
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
