// Simple Admin Creation - No Password Hashing
async function createAdminSimple() {
    console.log('👑 Create Admin User (Plain Text Password)');
    console.log('==========================================\n');
    
    const adminData = {
        name: 'Admin User',
        email: 'admin@trendblog.com',
        password: 'admin123', // Plain text - backend will hash it
        role: 'admin'
    };
    
    console.log('Trying to create admin user...');
    console.log('Email: admin@trendblog.com');
    console.log('Password: admin123 (plain text)\n');
    
    // Try different endpoints
    const endpoints = [
        '/api/auth/admin/register',
        '/api/auth/create-admin',
        '/api/auth/register-admin',
        '/api/admin/create',
        '/api/auth/register' // Regular register might work
    ];
    
    for (let endpoint of endpoints) {
        console.log(`Trying: POST ${endpoint}`);
        
        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adminData)
            });
            
            console.log(`Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ SUCCESS! Admin user created.');
                console.log('User:', data.user);
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    console.log('Token stored in localStorage');
                }
                return true;
            } else {
                const error = await response.text();
                console.log('Failed or endpoint not available\n');
            }
        } catch (error) {
            console.log('Endpoint not available\n');
        }
    }
    
    console.log('❌ No admin creation endpoints worked.');
    console.log('\n💡 Next: Try creating a regular user first...');
    return false;
}

// Run this first
// createAdminSimple();