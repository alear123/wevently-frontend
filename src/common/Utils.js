
export const getUserEmailByToken = (tok) => {
    try {
        const base64Url = tok.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload).sub;
    } catch (error) {

        return null;
    }
};

export const getLoggedUser = () => {
    try {
        const base64Url = localStorage.getItem("token").split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return {
            "email": JSON.parse(jsonPayload).sub,
            "rol": JSON.parse(jsonPayload).rol
        };
    } catch (error) {

        return null;
    }
};