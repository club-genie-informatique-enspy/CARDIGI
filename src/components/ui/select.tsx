"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange }: any) => {
    return (
        <div className="relative inline-block w-full">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
                }
                return child;
            })}
        </div>
    );
};

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string; onValueChange?: (v: string) => void }
>(({ className, children, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    >
        {children}
    </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value }: any) => {
    return <span>{value || placeholder}</span>;
}

const SelectContent = ({ children, value, onValueChange }: any) => {
    return (
        <div className="hidden">
            {/* This is a very simplified mock. In a real scenario, this would be a dropdown.
          For the sake of fixing the build, we'll use a native select hidden or visible.
          Actually, let's just make SelectContent return a visible select if we want it to work.
      */}
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            >
                {children}
            </select>
        </div>
    );
}

// Re-implementing a more functional mock for Select
const RealSelect = ({ children, value, onValueChange }: any) => {
    const childrenArray = React.Children.toArray(children);

    // Find options inside SelectContent -> SelectItem
    const options: any[] = [];
    childrenArray.forEach((child: any) => {
        if (child.type === SelectContent) {
            React.Children.forEach(child.props.children, (item: any) => {
                if (item && item.type === SelectItem) {
                    options.push({ value: item.props.value, label: item.props.children });
                }
            });
        }
    });

    const trigger = childrenArray.find((c: any) => c.type === SelectTrigger) as any;

    if (!trigger) return null;

    const triggerChildrenArray = React.Children.toArray(trigger.props.children);
    const selectValue = triggerChildrenArray.find((c: any) => c.type === SelectValue) as any;
    const placeholder = selectValue?.props?.placeholder || "Select...";
    const currentLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div className="relative group">
            {React.cloneElement(trigger, {
                children: (
                    <>
                        <span>{currentLabel}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6" /></svg>
                    </>
                )
            })}
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={trigger.props.required}
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

const SelectItem = ({ children, value }: any) => {
    return null; // Used by RealSelect to extract options
}

export { RealSelect as Select, SelectValue, SelectTrigger, SelectContent, SelectItem }
