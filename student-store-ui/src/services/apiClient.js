import axios from "axios"

class ApiClient {
    constructor(remoteHostUrl) {
        this.remoteHostUrl = remoteHostUrl
        this.token = null
        this.tokenKey = "student_store_token"
    }
    setToken(token) {
        this.token = token
        localStorage.setItem(this.tokenKey, token)
    }
    getTokenKey() {
        return this.tokenKey
    }

    async request({endpoint, method = `GET`, data = {}}) {
        const url = `${this.remoteHostUrl}/${endpoint}`
        const headers = {
            "Content-Type": "application/json"
        }
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`
        }

        try {
            const res = await axios({ url, method, data, headers })
            return {data: res.data, error: null}
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.error?.message
            return {data: null, error: message || String(error)}
        }
    }

    async loginUser(credentials) { 
        return await this.request({ endpoint: "auth/login", method: "POST", data: credentials }) 
    }
    async signupUser(credentials) { 
        return await this.request({ endpoint: "auth/register", method: "POST", data: credentials }) 
    }
    async fetchProductList() {
        return await this.request({ endpoint: "store", method: "GET"}) 
    }
    async createOrder(orderList) {
        return await this.request({ endpoint: "orders", method: "POST", data: orderList}) 
    }
    async fetchUserFromToken() { 
        return await this.request({ endpoint: "auth/me", method: "GET"}) 
    }
    async logOutUser() {
        this.setToken(null)
        localStorage.removeItem(this.tokenKey)
    }
    async fetchOrders() {
        return await this.request({ endpoint: "orders", method: "GET"}) 
    }
}

export default new ApiClient(process.env.REACT_APP_REMOTE_HOST_URL || "http://localhost:3001")