import styled from 'styled-components';
import React, { useEffect, useState } from 'react';

/**
 * Main Page doesn't include the sidebar
 * 
 * This component is used to display the main content of the application.
 * It can have a background image set from local storage.
 */

const StyledMainPage = styled.div<{ bgImage?: string }>`
    display: flex;
    flex-direction: column;
    flex: 1;
    height: fit-content;
    min-height: 100%;
    position: relative;
    width: 100%;
    background: ${({ bgImage }) =>
        bgImage
            ? `
                radial-gradient(circle at center, rgba(0,0,0,0) 10%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.95) 100%),
                linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
                url(${bgImage}) center center / cover no-repeat
              `
            : 'transparent'};
    transition: background 0.3s;
    padding-top: 3rem; /* Similar to mt-5 in Bootstrap */
    padding-left: 1rem; /* Similar to mb-5 in Bootstrap */
    padding-right: 1rem; /* Similar to mb-5 in Bootstrap */
`;
StyledMainPage.displayName = 'MainPage';

const MainPage: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [bgImage, setBgImage] = useState<string | null>(null);

    useEffect(() => {
        const imgUrl = localStorage.getItem('IMG_MAIN_PAGE');
        if (imgUrl) setBgImage(imgUrl);
    }, []);

    return <StyledMainPage bgImage={bgImage}>{children}</StyledMainPage>;
};

export default MainPage;