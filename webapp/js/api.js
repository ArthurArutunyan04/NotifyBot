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

    console.log("Making request to:", url, "with options:", options);

    try {
        const response = await fetch(`/api/v1${url}`, options);
        console.log("Response status:", response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error:", errorData);
            throw new ApiError(errorData.message || 'Request failed', response.status);
        }

        return response.json();
    } catch (error) {
        console.error("Network error:", error);
        throw new ApiError('Network error', 500);
    }
}

window.apiRequest = apiRequest;
window.ApiError = ApiError;