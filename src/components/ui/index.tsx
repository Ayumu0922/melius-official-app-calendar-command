import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

interface ChildrenProps {
  children: ReactNode;
}

interface DataProps {
  dataId: string;
  roleName?: string;
}

interface ButtonProps
  extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'type'>,
    DataProps {
  label?: string;
  selected?: boolean;
  variant?: 'default' | 'primary' | 'ghost';
  className?: string;
  children: ReactNode;
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, DataProps {
  label: string;
  icon?: ReactNode;
}

type PanelProps = HTMLAttributes<HTMLDivElement> &
  ChildrenProps &
  DataProps & {
  className?: string;
};

export function AppSurface({ children, ...props }: HTMLAttributes<HTMLDivElement> & ChildrenProps) {
  return (
    <div
      {...props}
      data-melius-ui-id="app-surface"
      data-melius-ui-role="workspace"
      className="app-surface"
    >
      {children}
    </div>
  );
}

export function GlassPanel({ dataId, roleName, children, className = '', ...props }: PanelProps) {
  return (
    <div
      {...props}
      data-melius-ui-id={dataId}
      data-melius-ui-role={roleName}
      className={className ? `glass-panel ${className}` : 'glass-panel'}
    >
      {children}
    </div>
  );
}

export function IconButton({
  dataId,
  roleName,
  label,
  selected,
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      data-melius-ui-id={dataId}
      data-melius-ui-role={roleName}
      data-active={selected ? 'true' : 'false'}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={className ? `icon-button ${className}` : 'icon-button'}
    >
      {children}
    </button>
  );
}

export function TextButton({
  dataId,
  roleName,
  selected,
  variant = 'default',
  children,
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      data-melius-ui-id={dataId}
      data-melius-ui-role={roleName}
      data-active={selected ? 'true' : 'false'}
      data-variant={variant}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className="text-button"
    >
      {children}
    </button>
  );
}

export function SegmentButton({
  dataId,
  roleName,
  selected,
  children,
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      data-melius-ui-id={dataId}
      data-melius-ui-role={roleName}
      data-active={selected ? 'true' : 'false'}
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className="segment-button"
    >
      {children}
    </button>
  );
}

export function SearchInput({ dataId, roleName, label, icon, ...props }: TextInputProps) {
  return (
    <label data-melius-ui-id={dataId} data-melius-ui-role={roleName} className="search-input">
      <span className="sr-only">{label}</span>
      {icon ? <span className="search-input__icon">{icon}</span> : null}
      <input {...props} aria-label={label} />
    </label>
  );
}
