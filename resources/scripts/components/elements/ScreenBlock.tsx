import { Link } from 'react-router-dom';
import GHOST from '@/assets/images/ghost.svg'
import { Separator } from '@radix-ui/react-context-menu';
import NIG from '@/assets/images/error.png'

const ScreenBlock = ({ title, message }) => {
    return (
        <>
            <div className='w-full h-full flex gap-12 items-center p-8 max-w-3xl mx-auto'>
                <div className='flex flex-col gap-8 max-w-sm text-left'>
                    <h1 className='text-[32px] font-extrabold leading-[98%] tracking-[-0.11rem]'>{title}</h1>
                    <p className=''>{message}</p>
                </div>
            </div>
        </>
    );
};



const ServerError = ({ title, message }) => {
    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center p-8 max-w-5xl mx-auto gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
                <img
                    src={GHOST}
                    alt="Error"
                    className="w-full h-full text-red-500"
                    style={{ filter: 'brightness(0) invert(1)' }}

                />
            </div>
            <div className="h-48 hidden md:flex">
                <div className="h-full w-px bg-gray-700" />
            </div>
            <div className="flex-1 flex flex-col gap-6 max-w-2xl">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-emerald-500">{title}</h1>
                    <div className="w-20 h-0.5 bg-emerald-500" />
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                    {message}
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.reload();
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                        Try Again
                    </a>
                    <Link
                        to="/"
                        className="px-5 py-2.5 border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg font-medium transition-colors duration-200 text-sm"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};


const NotFound = () => {
    return (
        <div className='w-full h-full flex flex-col md:flex-row gap-12 items-center justify-center p-8 max-w-4xl mx-auto'>
            <div className='flex flex-col gap-6 max-w-md text-center md:text-left'>
                <h1 className='text-3xl md:text-4xl font-bold leading-tight'>Page Not Found</h1>
                <p className='text-gray-300'>
                    We couldn't find the page you're looking for. You may have lost access, or the page
                    may have been removed. Here are some helpful links instead:
                </p>
                <div className='flex flex-col items-center md:items-start gap-3 mt-4'>
                    <Link 
                        to={'/'} 
                        className='px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200'
                    >
                        Return to Dashboard
                    </Link>
                    
                </div>
            </div>
            <div className='relative w-64 h-64'>
                <img
                    src={GHOST}
                    alt='Ghost'
                    className='w-full h-full text-white'
                    style={{ filter: 'brightness(0) invert(1)' }}
                />
            </div>
        </div>
    );
};

export { ServerError, NotFound };
export default ScreenBlock;
