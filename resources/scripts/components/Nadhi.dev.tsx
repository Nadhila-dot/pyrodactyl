// Provides necessary information for components to function properly
// million-ignore

/**
 * 
 * Nadhi.dev Provider`
 * 
 * Sends additional metadata for enhanced functionality.
 * 
 * @param param0 
 * @returns 
 */
const NadhiDevProvider = ({ children }) => {
    return (
        <div
            data-nadhi-provider=''
            data-nadhi-version={import.meta.env.VITE_NADHI_VERSION}
            data-nadhi-build={import.meta.env.VITE_NADHI_BUILD_NUMBER}
            data-nadhi-commit-hash={import.meta.env.VITE_COMMIT_HASH}
            data-nadhi-environment={import.meta.env.VITE_ENVIRONMENT}
            data-nadhi-app-name={import.meta.env.VITE_APP_NAME}
            style={{
                display: 'contents',
            }}
            id="Provider-main"
        >
            {children}
        </div>
    );
};

export default NadhiDevProvider;