import type { ComponentPropsWithRef } from "react";

type ButtonProps = ComponentPropsWithRef<'button'> & {
    variant?: 'primary' | 'secondary'
}

// Keep button styles in one place so the team can redesign them later. [SD]
const styles = {
    primary: 'bg-blue-800 text-white hover:bg-blue-900',
    secondary: 'boarder border-slate-500 bg-white text-slate-900 hover:bg-slate-100',
}

export function Button({
    variant = 'primary',
    type = 'button',
    className = '',
    ...props
}: ButtonProps) 
{
    return(
    <button {...props}
        type={type}
        className={`rounded-md px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${styles[variant]} ${className}`}
    />
  )
}