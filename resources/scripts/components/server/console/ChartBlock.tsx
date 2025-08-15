import clsx from 'clsx';
import styles from '@/components/server/console/style.module.css';
// Use shadcn card here
// Icb to make something else.
// Try me mate.
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

// eslint-disable-next-line react/display-name
export default ({ title, legend, children }: ChartBlockProps) => (
    <Card className={clsx(styles.chart_container, 'group p-8! bg-black')}>
        <CardHeader className="flex flex-row items-center justify-between mb-4 p-0 pb-4">
            <CardTitle className="font-extrabold text-sm">{title}</CardTitle>
            {legend && <div className="text-sm flex items-center">{legend}</div>}
        </CardHeader>
        <CardContent className="z-10 overflow-hidden rounded-lg p-0">
            {children}
        </CardContent>
    </Card>
);