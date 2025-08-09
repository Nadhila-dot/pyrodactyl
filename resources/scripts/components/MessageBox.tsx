import { type ReactNode } from 'react';
import { 
    IconAlertCircle, 
    IconCheck, 
    IconInfoCircle, 
    IconAlertTriangle,
    IconBulb
} from '@tabler/icons-react';
import clsx from 'clsx';

import Code from './elements/Code';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error' | 'danger';

interface Props {
    children: ReactNode;
    type?: FlashMessageType;
    className?: string;
}

const typeStyles = {
    success: {
        bg: 'bg-emerald-500/10',
        border: 'border-l-4 border-emerald-500',
        icon: <IconCheck className="w-5 h-5 text-emerald-400" />,
    },
    info: {
        bg: 'bg-blue-500/10',
        border: 'border-l-4 border-blue-500',
        icon: <IconInfoCircle className="w-5 h-5 text-blue-400" />,
    },
    warning: {
        bg: 'bg-amber-500/10',
        border: 'border-l-4 border-amber-500',
        icon: <IconAlertTriangle className="w-5 h-5 text-amber-400" />,
    },
    error: {
        bg: 'bg-rose-500/10',
        border: 'border-l-4 border-rose-500',
        icon: <IconAlertCircle className="w-5 h-5 text-rose-400" />,
    },
    danger: {
        bg: 'bg-red-500/10',
        border: 'border-l-4 border-red-500',
        icon: <IconAlertCircle className="w-5 h-5 text-red-400" />,
    },
    default: {
        bg: 'bg-gray-800/50',
        border: 'border-l-4 border-gray-500',
        icon: <IconBulb className="w-5 h-5 text-gray-400" />,
    },
};

const MessageBox = ({ 
    children, 
    type = 'default',
    className,
}: Props) => {
    const style = typeStyles[type] || typeStyles.default;

    return (
        <div
            className={clsx(
                'flex items-center px-4 py-3 rounded-md shadow-sm mb-6',
                style.bg,
                style.border,
                className
            )}
        >
            <div className="flex-shrink-0 mr-3">
                {style.icon}
            </div>
            <div className="text-sm text-gray-100">
                {typeof children === 'string' ? <Code>{children}</Code> : children}
            </div>
        </div>
    );
};

MessageBox.displayName = 'MessageBox';
export default MessageBox;