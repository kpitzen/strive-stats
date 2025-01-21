import React from 'react';
import styles from './TableColumn.module.scss';

interface TableColumnProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableColumn({ children, ...props }: TableColumnProps) {
  const Tag = props.scope ? 'th' : 'td';
  return (
    <Tag className={styles.root} {...props}>
      {children}
    </Tag>
  );
} 