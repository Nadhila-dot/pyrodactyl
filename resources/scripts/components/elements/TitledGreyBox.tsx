import { memo } from 'react';
import isEqual from 'react-fast-compare';

import { cn } from '@/lib/utils';

interface Props {
    title?: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ title, children, className }: Props) => (
    <div
        className={cn(
            'relative rounded-xl overflow-hidden shadow-md border-[1px] border-[#ffffff07] bg-black p-8',
            className,
        )}
    >
        {title && (
            <div>
                {typeof title === 'string' ? (
                    <p className={`text-xl font-extrabold tracking-tight mb-4`}>{title}</p>
                ) : (
                    title
                )}
            </div>
        )}
        <div className='w-full h-full'>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
