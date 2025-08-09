import clsx from 'clsx';
import CopyOnClick from '@/components/elements/CopyOnClick';
import styles from './style.module.css';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    children: React.ReactNode;
    className?: string;
}

const StatBlock = ({ title, copyOnClick, className, children }: StatBlockProps) => {
    return (
        <CopyOnClick text={copyOnClick}>
            <div 
                className={clsx(
                    styles.stat_block,
                    'bg-black',
                    'border border-green-500/20',
                    'transition-colors duration-200',
                    'hover:border-green-500/40',
                    'cursor-pointer',
                    'rounded-lg',
                    'p-4',
                    className
                )}
            >
                <div className='flex flex-col justify-center overflow-hidden w-full space-y-1'>
                    <p className='text-xs md:text-sm text-zinc-400 font-medium'>{title}</p>
                    <div className='text-[32px] font-extrabold leading-[98%] tracking-[-0.07rem]  w-full truncate'>
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};

export default StatBlock;