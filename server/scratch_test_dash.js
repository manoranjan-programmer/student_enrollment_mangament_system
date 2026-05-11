const API_URL = 'http://localhost:5050';

async function test() {
    try {
        console.log('Logging in as AD Faculty 1...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'ad001@college.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) {
            console.error('No token received');
            return;
        }

        console.log('Fetching dashboard data...');
        const dashRes = await fetch(`${API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashData = await dashRes.json();
        console.log('Faculty Department:', dashData.faculty.department);
        console.log('Courses count:', dashData.courses.length);
        console.log('Courses details:', JSON.stringify(dashData.courses, null, 2));

    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

test();
