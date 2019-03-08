function getToken() {
    const token = localStorage.getItem('token')
    return `JWT ${token}`;
}

async function apiRequest(url, method, body) {
    const token = getToken()
    const res = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })
    if (res.status === 401)
        return window.location = '/login.html'
    const json = await res.json()
    return json;
}