import React from 'react';
import styles from './TableRow.module.scss';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export function TableRow({ children, ...props }: TableRowProps) {
  return (
    <tr className={styles.root} {...props}>
      {children}
    </tr>
  );
} 