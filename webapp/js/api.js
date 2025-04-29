class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function apiRequest(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    const token = localStorage.getItem('jwt');
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`/api/v1${url}`, options);

    if (!response.ok) {
        let errorMsg = 'Ошибка сервера';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;

            // Если токен невалидный - очищаем хранилище
            if (response.status === 401) {
                localStorage.removeItem('jwt');
                localStorage.removeItem('user');
            }
        } catch (e) {
            console.warn('Failed to parse error response', e);
        }
        throw new ApiError(errorMsg, response.status);
    }

    return response.json();
}

window.apiRequest = apiRequest;
window.ApiError = ApiError;