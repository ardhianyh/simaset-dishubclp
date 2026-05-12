import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full mb-0 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join(" ")
  if (React.isValidElement(node)) {
    return getNodeText((node.props as { children?: React.ReactNode }).children)
  }
  return ""
}

const ITEM_DISPLAY_NAME = SelectPrimitive.Item.displayName
const GROUP_DISPLAY_NAME = SelectPrimitive.Group.displayName

type ElementWithDisplayName = React.JSXElementConstructor<unknown> & {
  displayName?: string
}

function getDisplayName(element: React.ReactElement): string | undefined {
  const type = element.type
  if (typeof type === "string") return undefined
  return (type as ElementWithDisplayName).displayName
}

type FilterResult = { node: React.ReactNode; itemCount: number }

function filterTree(
  nodes: React.ReactNode,
  query: string
): FilterResult {
  if (!query) {
    let total = 0
    React.Children.forEach(nodes, (child) => {
      if (React.isValidElement(child) && getDisplayName(child) === ITEM_DISPLAY_NAME) {
        total++
      } else if (React.isValidElement(child)) {
        const childProps = child.props as { children?: React.ReactNode }
        total += filterTree(childProps.children, "").itemCount
      }
    })
    return { node: nodes, itemCount: total }
  }

  const out: React.ReactNode[] = []
  let itemCount = 0

  React.Children.forEach(nodes, (child, index) => {
    if (!React.isValidElement(child)) {
      out.push(child)
      return
    }
    const displayName = getDisplayName(child)
    const childProps = child.props as {
      children?: React.ReactNode
      searchValue?: string
    }

    if (displayName === ITEM_DISPLAY_NAME) {
      const haystack = (
        childProps.searchValue ?? getNodeText(childProps.children)
      ).toLowerCase()
      if (haystack.includes(query)) {
        out.push(child)
        itemCount++
      }
      return
    }

    if (displayName === GROUP_DISPLAY_NAME) {
      const inner = filterTree(childProps.children, query)
      if (inner.itemCount > 0) {
        out.push(
          React.cloneElement(
            child,
            { key: child.key ?? `group-${index}` },
            inner.node
          )
        )
        itemCount += inner.itemCount
      }
      return
    }

    out.push(child)
  })

  return { node: out, itemCount }
}

type SelectContentProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> & {
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      children,
      position = "popper",
      searchable = true,
      searchPlaceholder = "Cari...",
      emptyMessage = "Tidak ada hasil",
      ...props
    },
    ref
  ) => {
    const [search, setSearch] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)
    const query = search.trim().toLowerCase()

    const { node: filteredChildren, itemCount } = React.useMemo(
      () => filterTree(children, query),
      [children, query]
    )

    const showEmpty = searchable && query.length > 0 && itemCount === 0

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "relative z-50 flex max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[8rem] flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          position={position}
          {...props}
        >
          {searchable && (
            <div
              className="sticky top-0 z-10 border-b border-border bg-popover p-1.5"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === "Escape") {
                      if (search) {
                        e.preventDefault()
                        setSearch("")
                      }
                    }
                  }}
                  placeholder={searchPlaceholder}
                  className="h-8 w-full rounded-sm border border-input bg-transparent pl-7 pr-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <SelectPrimitive.Viewport
            className={cn(
              "overflow-y-auto p-1 [scrollbar-gutter:stable] [scrollbar-width:thin]",
              position === "popper" &&
                "w-full min-w-[var(--radix-select-trigger-width)]"
            )}
          >
            {filteredChildren}
            {showEmpty && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    )
  }
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

type SelectItemProps = React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Item
> & {
  searchValue?: string
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, searchValue: _searchValue, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
