import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('flex items-center gap-2 rounded-md bg-site-button px-2 py-1 font-site-heading font-semibold tracking-wide text-site-active-foreground outline-2 outline-site-border-hover transition-all duration-100 ease-springy hover:bg-site-button-hover hover:outline active:scale-105 active:outline', className)} {...props} />
}
