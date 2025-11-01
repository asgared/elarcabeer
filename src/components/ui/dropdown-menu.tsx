"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type MutableRefObject, // <-- Importante
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {cn} from "@/lib/utils";

type DropdownMenuContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  // --- CORRECCIÓN 1: Ambos 'Ref' deben ser 'Mutable' ---
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within a <DropdownMenu.Root />`);
  }
  return context;
}

type DropdownMenuRootProps = {
  children: ReactNode;
};

function DropdownMenuRoot({children}: DropdownMenuRootProps) {
  const [isOpen, setIsOpen] = useState(false);
  // --- CORRECCIÓN 2: Los 'useRef' deben ser 'null' ---
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (contentRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const value = useMemo<DropdownMenuContextValue>(
    () => ({
      isOpen,
      toggle: () => setIsOpen((prev) => !prev),
      close: () => setIsOpen(false),
      triggerRef,
      contentRef,
    }),
    [isOpen],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative inline-flex">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps = {
  children: ReactElement;
  asChild?: boolean;
};

function setRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      (ref as React.MutableRefObject<T>).current = value;
    } catch {
      
    }
  }
}

function DropdownMenuTrigger({children, asChild = false}: DropdownMenuTriggerProps) {
  const {isOpen, toggle, triggerRef} = useDropdownMenuContext("DropdownMenu.Trigger");

  const child = asChild ? children : cloneElement(children, {});

  if (!isValidElement(child)) {
    throw new Error("DropdownMenu.Trigger requires a single React element child.");
  }

  // --- CORRECCIÓN 3: La función 'handleClick' ---
  const handleClick: MouseEventHandler = (event) => {
    // Forzamos un 'cast' a 'any' para evitar el error 'unknown'
    const anyChild = child as any;
    if (anyChild.props && typeof anyChild.props.onClick === "function") {
      anyChild.props.onClick(event);
    }
    
    if (!event.defaultPrevented) {
      toggle();
    }
  };

  const mergedRef = (node: HTMLElement | null) => {
    triggerRef.current = node; // Esto ahora es válido
    setRef((child as ReactElement & {ref?: React.Ref<HTMLElement>}).ref, node);
  };

  return cloneElement(child as React.ReactElement, {
    ref: mergedRef,
    "aria-expanded": isOpen,
    "aria-haspopup": "menu",
    onClick: handleClick,
  });
}

type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
  sideOffset?: number;
};

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({align = "start", sideOffset = 8, className, style, ...props}, forwardedRef) => {
    const {isOpen, close, contentRef, triggerRef} = useDropdownMenuContext("DropdownMenu.Content");

    useEffect(() => {
      if (!isOpen) return;

      const handleFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget) {
          return;
        }
        if (contentRef.current?.contains(nextTarget)) return;
        if (triggerRef.current?.contains(nextTarget)) return;
        close();
      };

      const node = contentRef.current;
      node?.addEventListener("focusout", handleFocusOut);
      return () => node?.removeEventListener("focusout", handleFocusOut);
    }, [close, contentRef, isOpen, triggerRef]);

    if (!isOpen) {
      return null;
    }

    const mergedRef = (node: HTMLDivElement | null) => {
      contentRef.current = node; // Esto ahora es válido
      setRef(forwardedRef, node);
    };

    return (
      <div
        ref={mergedRef}
        role="menu"
        style={{marginTop: sideOffset, ...style}}
        className={cn(
          "absolute top-full z-50 min-w-[8rem] rounded-lg border border-white/10 bg-background/95 p-1 text-sm text-white shadow-lg backdrop-blur focus:outline-none",
          align === "end" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      />
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

type DropdownMenuItemProps = HTMLAttributes<HTMLButtonElement> & {
  inset?: boolean;
};

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({className, inset, onClick, children, ...props}, ref) => {
    const {close} = useDropdownMenuContext("DropdownMenu.Item");

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        close();
      }
    };

    return (
      <button
        type="button"
        role="menuitem"
        ref={ref}
        onClick={handleClick}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors focus:outline-none",
          "hover:bg-white/10 focus:bg-white/10",
          inset ? "pl-8" : undefined,
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

function DropdownMenuPortal({children}: {children: ReactNode}) {
  return <>{children}</>;
}

export const DropdownMenu = {
  Root: DropdownMenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Portal: DropdownMenuPortal,
};

export type {DropdownMenuContentProps, DropdownMenuItemProps, DropdownMenuRootProps, DropdownMenuTriggerProps};