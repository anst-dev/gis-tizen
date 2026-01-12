/**
 * HttpService - Centralized HTTP Client
 * Pattern giống với services/httpService.ts trong nawasco-web-gis
 */

const API_BASE_URL = 'http://118.70.151.182:1223';

/**
 * Class HttpService xử lý tất cả HTTP requests
 */
class HttpService {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.timeout = 30000;
        this.defaultHeaders = {
            'accept': '*/*',
            'accept-language': 'vi,en-US;q=0.9,en-GB;q=0.8,en;q=0.7',
            'Referer': 'http://gis.nawasco.com.vn/'
        };
    }

    /**
     * Tạo full URL từ endpoint
     * @param {string} endpoint - API endpoint
     * @returns {string} - Full URL
     */
    buildUrl(endpoint) {
        // Nếu endpoint đã là full URL, return luôn
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
            return endpoint;
        }
        // Đảm bảo không có double slash
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${base}${path}`;
    }

    /**
     * Merge headers với default headers
     * @param {Object} customHeaders - Custom headers
     * @returns {Object} - Merged headers
     */
    mergeHeaders(customHeaders = {}) {
        return {
            ...this.defaultHeaders,
            ...customHeaders
        };
    }

    /**
     * Xử lý response từ fetch
     * @param {Response} response - Fetch response
     * @returns {Promise} - Parsed response data
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = new Error(`HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.statusText = response.statusText;
            throw error;
        }

        // Kiểm tra content-type để parse đúng
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    }

    /**
     * HTTP GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} - Response data
     */
    async get(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.mergeHeaders(options.headers);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            console.error(`[HttpService] GET ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * HTTP POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Request options
     * @returns {Promise} - Response data
     */
    async post(endpoint, data, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.mergeHeaders({
            'Content-Type': 'application/json',
            ...options.headers
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            console.error(`[HttpService] POST ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * HTTP PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Request options
     * @returns {Promise} - Response data
     */
    async put(endpoint, data, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.mergeHeaders({
            'Content-Type': 'application/json',
            ...options.headers
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data),
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            console.error(`[HttpService] PUT ${endpoint} failed:`, error);
            throw error;
        }
    }

    /**
     * HTTP DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} - Response data
     */
    async delete(endpoint, options = {}) {
        const url = this.buildUrl(endpoint);
        const headers = this.mergeHeaders(options.headers);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'DELETE',
                headers,
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            console.error(`[HttpService] DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }
}

// Export singleton instance
const httpService = new HttpService(API_BASE_URL);

export default httpService;
export { HttpService, API_BASE_URL };
