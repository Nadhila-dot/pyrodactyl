import PageContentBlock, { PageContentBlockProps } from '@/components/elements/PageContentBlock';
import { ServerContext } from '@/state/server';

interface Props extends PageContentBlockProps {
    title: string;
}

const ServerContentBlock: React.FC<Props> = ({ title, children, ...props }) => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);

    return (
        <div className={`!backdrop-blur-3xl !backdrop-blur-[20px] h-full max-w-full`}>
            <PageContentBlock
                title={`${title} - ${name}`}
                className={` ${props.className ?? ''}`}
                {...props}
            >
                <div className={``}>
                    {children}
                </div>
            </PageContentBlock>
        </div>
    );
};

export default ServerContentBlock;