import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const ContentBox = ({ title, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className='p-8 bg-black border border-emerald-500/30 shadow-lg rounded-xl hover:border-green-500/50 transition-colors' {...props}>
                    {title && <h2 className='font-extrabold mb-4 text-2xl'>{title}</h2>}
                    {showFlashes && <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} />}
                    <div>
                        <SpinnerOverlay visible={showLoadingOverlay || false} />
                        {children}
                    </div>
                </div>
            </TooltipTrigger>
            
        </Tooltip>
    </TooltipProvider>
);

export default ContentBox;