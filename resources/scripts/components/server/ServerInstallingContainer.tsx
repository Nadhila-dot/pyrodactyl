import React from "react";

const ServerInstallingContainer: React.FC = () => (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
        <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/kr9P8-lFBHM?autoplay=1&mute=1&controls=0&loop=1&playlist=kr9P8-lFBHM"
            title="Server Installing Background"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
            <img
                src="https://media.tenor.com/d2j7YdyhtmsAAAAi/shikanoko-dance-shikanoko-meme.gif"
                alt="Installing"
                className="rounded-lg w-24 h-24"
            />
            <div className="flex flex-col mt-4 text-center">
                <label className="text-neutral-100 text-lg font-bold">Server's getting ready!</label>
                <label className="text-neutral-500 text-md font-semibold mt-1">
                    Your server should be ready soon, until then please wait patiently. You wouldn't rush a bride would you?
                </label>
            </div>
        </div>
    </div>
);

export default ServerInstallingContainer;