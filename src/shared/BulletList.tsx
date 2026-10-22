import type { ComponentProps } from "react"

type BulletListProps = Omit<ComponentProps<"ul">, "children"> & { items?: string[] }

export function BulletList({ items, ...props }: BulletListProps) {
  return items?.length ? (
    <ul {...props}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  ) : null
}
