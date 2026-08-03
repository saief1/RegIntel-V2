import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Table.module.css'

type TableProps = HTMLAttributes<HTMLTableElement>

/** Structural table primitives — no sorting/pagination/data-fetching logic, just token-based styling. */
export function Table({ className, ...rest }: TableProps) {
  return (
    <div className={styles.scroller}>
      <table className={cx(styles.table, className)} {...rest} />
    </div>
  )
}

export function TableHead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cx(styles.head, className)} {...rest} />
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cx(styles.body, className)} {...rest} />
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cx(styles.row, className)} {...rest} />
}

export function TableHeaderCell({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cx(styles.headerCell, className)} {...rest} />
}

export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx(styles.cell, className)} {...rest} />
}
