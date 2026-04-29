import { Link, type LinkProps } from "react-router-dom";

interface BaseButtonProps {
  className?: string;
  disabled?: boolean;
  bgColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  hoverTextColor?: string;
}

interface NativeButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: never;
}

interface LinkButtonProps extends BaseButtonProps, LinkProps {
  to: string;
}

type ButtonProps = NativeButtonProps | LinkButtonProps;

const Button: React.FC<ButtonProps> = ({
  className = "",
  disabled = false,
  bgColor,
  hoverBgColor,
  textColor,
  hoverTextColor,
  ...props
}) => {
  const defaultBgColor = "bg-main";
  const defaultHoverBgColor = "hover:bg-apply";
  const defaultTextColor = "text-white";
  const defaultHoverTextColor = "hover:text-white";

  const finalBgColor = bgColor || defaultBgColor;
  const finalHoverBgColor = hoverBgColor || defaultHoverBgColor;
  const finalTextColor = textColor || defaultTextColor;
  const finalHoverTextColor = hoverTextColor || defaultHoverTextColor;

  const hasCustomBorderRadius = /(^|\s)rounded(-\w+)?/.test(className);

  const baseStyles = `${finalBgColor} ${finalTextColor} px-5 py-3 font-normal ${finalHoverBgColor} ${finalHoverTextColor} transition-colors duration-200 ${
    hasCustomBorderRadius ? "" : "rounded-lg"
  }`;

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const combinedStyles = `${baseStyles} ${className} ${
    disabled ? disabledStyles : ""
  }`;

  if ("to" in props && typeof props.to === "string") {
    const { to, children, onClick, ...rest } = props as LinkButtonProps;
    return (
      <Link to={to} className={combinedStyles} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  } else {
    const {
      type = "button",
      children,
      onClick,
      ...rest
    } = props as NativeButtonProps;
    return (
      <button
        type={type}
        className={combinedStyles}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }
};

export default Button;
