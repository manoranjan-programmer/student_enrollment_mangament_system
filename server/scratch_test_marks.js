const API_URL = 'http://localhost:5050';

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'ad001@college.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login result:', loginRes.status, loginData.message || 'Success');

        if (!token) {
            console.error('No token received');
            return;
        }

        console.log('Attempting to upload marks for Student 38, Course 81...');
        const uploadRes = await fetch(`${API_URL}/marks`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                student_id: 38,
                course_id: 81,
                marks: 85,
                internal_marks: 30
            })
        });
        const uploadData = await uploadRes.json();
        console.log('Upload result:', uploadRes.status, uploadData);

        console.log('Checking enrolled students for Course 81...');
        const enrolledRes = await fetch(`${API_URL}/courses/81/enrolled-students`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const enrolledData = await enrolledRes.data || await enrolledRes.json();
        const student = enrolledData.find(s => s.id === 38);
        console.log('Student data after upload:', student);

    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

test();
