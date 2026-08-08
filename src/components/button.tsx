import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('flex items-center gap-2 rounded-md bg-site-button px-2 py-1 font-site-heading font-semibold tracking-wide text-site-active-foreground outline-none transition-[background-color,transform,box-shadow] duration-100 ease-springy hover:bg-site-button-hover active:scale-[1.03] focus-visible:ring-2 focus-visible:ring-site-ring focus-visible:ring-offset-2 focus-visible:ring-offset-site-page', className)} {...props} />
}
