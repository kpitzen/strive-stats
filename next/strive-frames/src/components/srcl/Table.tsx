import React from 'react';
import styles from './Table.module.scss';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, ...props }: TableProps) {
  return (
    <table className={styles.root} {...props}>
      {children}
    </table>
  );
} 