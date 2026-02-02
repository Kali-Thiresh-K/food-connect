const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            email: 'testuser' + Date.now() + '@example.com',
            password: 'password123',
            fullName: 'Test User',
            role: 'donor'
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
        console.error('Status:', err.response ? err.response.status : 'No Response');
    }
}

testRegister();
